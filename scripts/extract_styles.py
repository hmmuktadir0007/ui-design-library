"""Extract the 50 UI styles from data/ui-styles.pptx (text) and data/ui-styles.pdf (visuals).

Outputs (all overwritten on each run, so re-running is idempotent):
  src/data/styles.json          50 style records
  public/images/style-NN.png    mockup crops rendered from the PDF
  data/contact-sheet.png        grid of all 50 crops for visual review
  data/extraction-report.json   warnings, corrections, per-style sources

Usage: python scripts/extract_styles.py
"""
import difflib
import hashlib
import json
import re
import unicodedata
from pathlib import Path

import pymupdf
from PIL import Image, ImageDraw, ImageFont
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE

ROOT = Path(__file__).resolve().parent.parent
PPTX = ROOT / "data" / "ui-styles.pptx"
PDF = ROOT / "data" / "ui-styles.pdf"
OUT_JSON = ROOT / "src" / "data" / "styles.json"
IMG_DIR = ROOT / "public" / "images"
CONTACT = ROOT / "data" / "contact-sheet.png"
REPORT = ROOT / "data" / "extraction-report.json"

FIRST_STYLE_PAGE = 3  # PDF page of style 1 (1-based)
STYLE_COUNT = 50
RENDER_ZOOM = 3  # 216 dpi -> ~969px wide crops: 2x a 480px card, comparable to the embedded mockup bitmaps
# Inner mockup canvas of the "SPEC_MOCKUP_CANVAS" window, in PDF points (page is 720x405).
# Excludes the window title bar and all left-column slide text. Checked against all 50 slides.
CROP_RECT = (368, 103, 691, 362)

CATEGORIES = [
    "Morphism & Depth",
    "Minimal & Typographic",
    "Modern SaaS & Dashboards",
    "Bold, Retro & Expressive",
    "Atmospheric & Futuristic",
    "Art & Heritage Movements",
]

# Line-start labels on the left column. Order matters: first match wins.
LABELS = [
    ("ignore", r"(DESIGN PARADIGMS REFERENCE|UI DESIGN STYLES & LANGUAGES|SYSTEM STATUS|STYLE CLASSIFICATION|HISTORICAL ERA|SPEC CLASS)"),
    ("category", r"CATEGORY(\s+TAB)?"),
    ("whereToUse", r"WHERE TO USE(\s*(//|/)\s*USE CASES)?"),
    ("howToUse", r"HOW TO USE"),
    ("palette", r"BEST COLOR PALETTE"),
    ("aiPrompt", r"AI PROMPT"),
    ("cssSnippet", r"CUSTOM CSS(\s+SPECIFICATION)?"),
]
LABEL_RES = [(f, re.compile(r"^\s*(//|/\*)?\s*" + p + r"\b", re.I)) for f, p in LABELS]
COLOR_RE = re.compile(r"#[0-9A-Fa-f]{3,8}\b|rgba?\([^)]*\)|rgba[^\s]*")
VALID_COLOR_RE = re.compile(
    r"^(#[0-9A-Fa-f]{3}|#[0-9A-Fa-f]{4}|#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{8}"
    r"|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\))$"
)

# Swatches whose printed value is not a usable CSS colour. Resolved only where the slide's own
# CSS snippet states the exact colour; every entry is listed in the report as a manual correction.
PALETTE_FIXES = {
    10: {"rgba/0.22": ("rgba(255,255,255,0.22)", "Swatch 'Liquid Fill' printed as 'rgba/0.22'; slide CSS uses background: rgba(255,255,255,0.22).")},
    31: {"rgba(128..)": ("rgba(120, 120, 128, 0.28)", "Swatch 'Spatial Glass' printed truncated as 'rgba(128..)'; slide CSS uses background: rgba(120, 120, 128, 0.28).")},
}


def norm(s: str) -> str:
    return unicodedata.normalize("NFC", s).replace(" ", " ").replace("\v", "\n")


def shape_lines(shape):
    """All text lines of a shape, recursing into groups, in document order."""
    if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
        for child in shape.shapes:
            yield from shape_lines(child)
    elif shape.has_text_frame:
        for line in norm(shape.text_frame.text).split("\n"):
            if line.strip():
                yield line.strip()


def is_mockup(shape) -> bool:
    return any("SPEC_MOCKUP_CANVAS" in line for line in shape_lines(shape))


def categorize(raw: str):
    r = raw.lower()
    if "morphism" in r and "depth" in r:
        return CATEGORIES[0]
    if "minimal" in r:
        return CATEGORIES[1]
    if "saas" in r or "dashboard" in r:
        return CATEGORIES[2]
    if "bold" in r or "retro" in r or "expressive" in r:
        return CATEGORIES[3]
    if "atmospheric" in r or "futuristic" in r:
        return CATEGORIES[4]
    if "art" in r and "heritage" in r:
        return CATEGORIES[5]
    return None


def strip_label(field: str, line: str, m) -> str:
    """Return inline content after a label, or '' when the rest is only a sub-heading."""
    rest = line[m.end():].strip()
    if field in ("aiPrompt", "cssSnippet", "palette", "ignore"):
        return ""  # their label lines only carry sub-headings ("// CLAUDE • CHATGPT • GEMINI", "*/")
    if field == "category":
        rest = rest.lstrip(":/ ").strip()
        return rest
    if rest.startswith(":"):
        return rest[1:].strip()
    if rest.startswith("/"):
        sub = rest.lstrip("/ ").strip()
        # "// USE CASES" style sub-headings are all caps; mixed case means real content
        return "" if sub == sub.upper() else sub
    return rest


def shape_frames(shape):
    """Lines of each text frame (one list per frame), recursing into groups."""
    if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
        for child in shape.shapes:
            yield from shape_frames(child)
    elif shape.has_text_frame:
        lines = [ln.strip() for ln in norm(shape.text_frame.text).split("\n") if ln.strip()]
        if lines:
            yield lines


def parse_slide(slide):
    """Returns (title, fields). fields['paletteFrames'] keeps palette lines grouped per swatch text frame."""
    fields = {k: [] for k, _ in LABELS}
    fields["paletteFrames"] = []
    title = None
    current = None
    for shape in slide.shapes:
        if is_mockup(shape):
            continue
        for frame in shape_frames(shape):
            frame_buf = None
            for line in frame:
                if title is None and re.match(r"^\d+\.\s", line):
                    title = line
                    current = "ignore"
                    continue
                for field, rx in LABEL_RES:
                    m = rx.match(line)
                    if m:
                        current = field
                        frame_buf = None
                        inline = strip_label(field, line, m)
                        if inline:
                            fields[field].append(inline)
                        break
                else:
                    if current:
                        fields[current].append(line)
                    if current == "palette":
                        if frame_buf is None:
                            frame_buf = []
                            fields["paletteFrames"].append(frame_buf)
                        frame_buf.append(line)
    return title, fields


def palette_pairs(frames):
    """(value, name|None) per colour token, in slide order. Frames without any token are returned separately.

    Handles the deck's encodings: 'value⏎name', 'name⏎value' (style 5), 'value (name), value (name)' and bare values.
    """
    pairs, unvalued = [], []
    for lines in frames:
        text = "\n".join(lines)
        tokens = list(COLOR_RE.finditer(text))
        if not tokens:
            unvalued.append(" ".join(lines))
        elif len(tokens) == 1:
            rest = (text[: tokens[0].start()] + " " + text[tokens[0].end():]).strip(" \n()")
            pairs.append((tokens[0].group(), re.sub(r"\s+", " ", rest) or None))
        else:
            for t in tokens:
                m = re.match(r"\s*\(([^)]*)\)", text[t.end():])
                pairs.append((t.group(), m.group(1).strip() if m else None))
    return pairs, unvalued


TITLE_RE = re.compile(r"^\d+\.\s*(?P<name>[^:]+?)\s*(?::\s*(?P<sub>.+?))?\s*(?:\((?P<era>[^()]*\d[^()]*)\))?$")


def build_record(prs, pdf, idx):
    """Parse one style slide. Returns (record, issues, meta); raises ValueError when the slide has no numbered title."""
    page_no = idx + 1
    title, f = parse_slide(prs.slides[idx])
    if not title:
        raise ValueError(f"Page {page_no}: no numbered title found")
    page_text = norm(pdf[idx].get_text())
    issues, corrections = [], []
    sid = int(title.split(".", 1)[0])
    tm = TITLE_RE.match(title)
    raw_cat = " ".join(f["category"])

    pairs, unvalued = palette_pairs(f["paletteFrames"])
    palette, names = [], []
    for tok, label in pairs:
        fix = PALETTE_FIXES.get(sid, {}).get(tok)
        if fix:
            palette.append(fix[0])
            corrections.append({"id": sid, "field": "palette", "from": tok, "to": fix[0], "reason": fix[1]})
        elif VALID_COLOR_RE.match(tok):
            palette.append(tok)
        else:
            issues.append(f"palette token {tok!r} is not a valid CSS colour and was left out")
            continue
        names.append(label)
    for text in unvalued:
        issues.append(f"palette swatch {text!r} has no colour value; left out (no name/value mapping created)")

    rec = {"id": sid, "name": title.split(".", 1)[1].split(":", 1)[0].strip()}
    if tm and tm.group("sub"):
        rec["subtitle"] = tm.group("sub")
    if tm and tm.group("era"):
        rec["era"] = tm.group("era")  # verbatim title parenthetical, e.g. "Google, 2014+"
    rec["categoryTab"] = categorize(raw_cat)
    rec["originalCategory"] = raw_cat
    rec["whereToUse"] = " ".join(f["whereToUse"])
    rec["howToUse"] = " ".join(f["howToUse"])
    rec["palette"] = palette
    if any(names):
        rec["paletteNames"] = names
    rec["aiPrompt"] = unquote(" ".join(f["aiPrompt"]))
    rec["cssSnippet"] = "\n".join(f["cssSnippet"])
    rec["imagePath"] = f"/images/style-{sid:02d}.png"
    rec["sourcePage"] = page_no

    for key in ("whereToUse", "howToUse", "aiPrompt", "cssSnippet"):
        if rec[key]:
            score = source_match(rec[key], page_text)
            if score < 0.95:
                issues.append(f"{key} matches PDF text at only {score:.0%}")
    meta = {"title": title, "pageText": page_text, "corrections": corrections}
    return rec, issues, meta


def unquote(s: str) -> str:
    s = s.strip()
    if len(s) >= 2 and s[0] in "\"“" and s[-1] in "\"”":
        return s[1:-1].strip()
    return s


def alnum(s: str) -> str:
    return re.sub(r"[^0-9a-z]", "", s.lower())


def source_match(field_text: str, page_text: str) -> float:
    """Share of a field's alphanumerics found, in order, in the PDF page text."""
    a, b = alnum(field_text), alnum(page_text)
    if not a:
        return 0.0
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    return sum(blk.size for blk in sm.get_matching_blocks()) / len(a)


def render_crop(page, out_path: Path) -> Image.Image:
    pix = page.get_pixmap(matrix=pymupdf.Matrix(RENDER_ZOOM, RENDER_ZOOM), clip=pymupdf.Rect(*CROP_RECT), alpha=False)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    img.save(out_path, optimize=True)  # lossless
    return img


def contact_sheet(records, images):
    cols, tw = 10, 260
    th = round(tw * (CROP_RECT[3] - CROP_RECT[1]) / (CROP_RECT[2] - CROP_RECT[0]))
    lh = 34
    rows = -(-len(images) // cols)
    sheet = Image.new("RGB", (cols * (tw + 10) + 10, rows * (th + lh + 10) + 10), "#111318")
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("arial.ttf", 13)
    except OSError:
        font = ImageFont.load_default()
    for i, (rec, img) in enumerate(zip(records, images)):
        x = 10 + (i % cols) * (tw + 10)
        y = 10 + (i // cols) * (th + lh + 10)
        sheet.paste(img.resize((tw, th), Image.LANCZOS), (x, y + lh))
        name = rec["name"] if len(rec["name"]) <= 34 else rec["name"][:33] + "…"
        draw.text((x, y + 2), f"{rec['id']:02d} · p{rec['sourcePage']}", fill="#8ab4ff", font=font)
        draw.text((x, y + 17), name, fill="#ffffff", font=font)
    sheet.save(CONTACT, optimize=True)


def main():
    for p in (PPTX, PDF):
        if not p.exists():
            raise SystemExit(f"Missing source file: {p}")
    prs = Presentation(PPTX)
    pdf = pymupdf.open(PDF)
    report = {
        "sources": {"pptx": PPTX.name, "pptxSlides": len(prs.slides), "pdf": PDF.name, "pdfPages": len(pdf)},
        "method": {
            "text": "PPTX text frames (left column, mockup group excluded); PDF text used only for cross-checking",
            "images": f"PDF page rendered at {RENDER_ZOOM * 72} dpi, clipped to mockup canvas {CROP_RECT} pt",
        },
        "errors": [],
        "warnings": [],
        "manualCorrections": [],
        "categoryNormalization": [],
        "styles": [],
    }
    if len(prs.slides) != len(pdf):
        report["errors"].append(f"Slide count mismatch: PPTX {len(prs.slides)} vs PDF {len(pdf)}")

    IMG_DIR.mkdir(parents=True, exist_ok=True)
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    records, images, hashes = [], [], {}

    for idx in range(FIRST_STYLE_PAGE - 1, FIRST_STYLE_PAGE - 1 + STYLE_COUNT):
        page_no = idx + 1
        try:
            rec, issues, meta = build_record(prs, pdf, idx)
        except ValueError as e:
            report["errors"].append(str(e))
            continue
        sid, raw_cat = rec["id"], rec["originalCategory"]
        if sid != page_no - FIRST_STYLE_PAGE + 1:
            report["errors"].append(f"Page {page_no}: style number {sid} does not match expected {page_no - 2}")
        if not re.search(rf"(^|\n){sid}\.\s", meta["pageText"]):
            report["errors"].append(f"Style {sid}: PDF page {page_no} does not carry the same style number")
        if rec["categoryTab"] is None:
            report["errors"].append(f"Style {sid}: unrecognised category label {raw_cat!r}")
        elif raw_cat != rec["categoryTab"]:
            report["categoryNormalization"].append({"id": sid, "raw": raw_cat, "normalized": rec["categoryTab"]})
        report["manualCorrections"] += meta["corrections"]
        for key in ("whereToUse", "howToUse", "aiPrompt", "cssSnippet"):
            if not rec[key]:
                report["errors"].append(f"Style {sid}: empty {key}")
        if "paletteNames" not in rec:
            issues.append("slide prints no swatch names; paletteNames omitted")

        img = render_crop(pdf[idx], IMG_DIR / f"style-{sid:02d}.png")
        digest = hashlib.sha256(img.tobytes()).hexdigest()
        if digest in hashes:
            report["errors"].append(f"Style {sid}: image identical to style {hashes[digest]}")
        hashes[digest] = sid

        for msg in issues:
            report["warnings"].append(f"Style {sid}: {msg}")
        report["styles"].append({"id": sid, "sourcePage": page_no, "textSource": "pptx", "imageSource": "pdf-render", "title": meta["title"], "rawCategory": raw_cat, "issues": issues})
        records.append(rec)
        images.append(img)

    records.sort(key=lambda r: r["id"])
    OUT_JSON.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    contact_sheet(records, images)
    report["summary"] = {
        "parsedStyles": len(records),
        "images": len(images),
        "errors": len(report["errors"]),
        "warnings": len(report["warnings"]),
        "manualCorrections": len(report["manualCorrections"]),
    }
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"]))
    for e in report["errors"]:
        print("ERROR", e)
    for w in report["warnings"]:
        print("WARN ", w)


if __name__ == "__main__":
    main()
