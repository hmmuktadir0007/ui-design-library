"""Validate src/data/styles.json and public/images against the sources.

Exit code 1 on any blocking error; warnings are printed but do not fail.
Usage: python scripts/validate_styles.py
"""
import hashlib
import json
import re
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract_styles import (  # noqa: E402
    CATEGORIES, FIRST_STYLE_PAGE, PDF, PPTX, REPORT, ROOT, STYLE_COUNT, VALID_COLOR_RE, build_record, categorize,
)

REQUIRED = {"id": int, "name": str, "categoryTab": str, "whereToUse": str, "howToUse": str, "palette": list,
            "aiPrompt": str, "cssSnippet": str, "imagePath": str, "sourcePage": int}
OPTIONAL = {"subtitle": str, "era": str, "originalCategory": str, "paletteNames": list}


def validate(styles, public_dir: Path):
    """Structural + image checks. Returns (errors, warnings). Pure: never writes."""
    errors, warnings = [], []
    if not isinstance(styles, list):
        return ["dataset is not a JSON array"], warnings
    if len(styles) != STYLE_COUNT:
        errors.append(f"expected {STYLE_COUNT} records, found {len(styles)}")
    ids = [s.get("id") for s in styles]
    dupes = sorted({i for i in ids if ids.count(i) > 1}, key=str)
    if dupes:
        errors.append(f"duplicate ids: {dupes}")
    missing = sorted(set(range(1, STYLE_COUNT + 1)) - set(ids))
    if missing:
        errors.append(f"missing ids: {missing}")
    if {s.get("categoryTab") for s in styles} != set(CATEGORIES):
        errors.append("the six categories are not exactly represented")
    paths = [s.get("imagePath") for s in styles]
    if len(set(paths)) != len(paths):
        errors.append("duplicate imagePath references")

    hashes = {}
    for s in styles:
        sid = s.get("id")
        for key, typ in REQUIRED.items():
            if type(s.get(key)) is not typ or s.get(key) in ("", []):  # type() so bool never passes as int
                errors.append(f"style {sid}: missing/invalid {key}")
        for key, typ in OPTIONAL.items():
            if key in s and (type(s[key]) is not typ or s[key] in ("", [])):
                errors.append(f"style {sid}: optional {key} has wrong type or is empty")
        extra = set(s) - set(REQUIRED) - set(OPTIONAL)
        if extra:
            errors.append(f"style {sid}: unexpected fields {sorted(extra)}")
        if s.get("categoryTab") not in CATEGORIES:
            errors.append(f"style {sid}: invalid category {s.get('categoryTab')!r}")
        if isinstance(s.get("originalCategory"), str) and categorize(s["originalCategory"]) != s.get("categoryTab"):
            errors.append(f"style {sid}: originalCategory {s['originalCategory']!r} does not normalize to categoryTab")
        if isinstance(sid, int) and s.get("sourcePage") != sid + FIRST_STYLE_PAGE - 1:
            errors.append(f"style {sid}: sourcePage {s.get('sourcePage')} != {sid + FIRST_STYLE_PAGE - 1}")
        if isinstance(sid, int) and s.get("imagePath") != f"/images/style-{sid:02d}.png":
            errors.append(f"style {sid}: unexpected imagePath {s.get('imagePath')}")
        palette = s.get("palette") if isinstance(s.get("palette"), list) else []
        for c in palette:
            if not isinstance(c, str) or not VALID_COLOR_RE.match(c):
                errors.append(f"style {sid}: invalid palette colour {c!r}")
        if not 3 <= len(palette) <= 6:
            errors.append(f"style {sid}: palette has {len(palette)} colours")
        names = s.get("paletteNames")
        if isinstance(names, list):
            if len(names) != len(palette):
                errors.append(f"style {sid}: paletteNames has {len(names)} entries for {len(palette)} colours")
            if any(n is not None and (not isinstance(n, str) or not n.strip()) for n in names):
                errors.append(f"style {sid}: paletteNames entries must be non-empty strings or null")
        css = s.get("cssSnippet") or ""
        if css.count("(") != css.count(")"):
            warnings.append(f"style {sid}: CSS snippet has unbalanced parentheses")

        img_path = public_dir / str(s.get("imagePath", "")).lstrip("/")
        try:
            with Image.open(img_path) as im:
                im.verify()
            with Image.open(img_path) as im:
                if im.format != "PNG":
                    errors.append(f"style {sid}: image is {im.format}, not PNG")
                if im.width < 600 or im.height < 400:
                    errors.append(f"style {sid}: image too small {im.size}")
                digest = hashlib.sha256(im.convert("RGB").tobytes()).hexdigest()
                if digest in hashes:
                    errors.append(f"style {sid}: image duplicates style {hashes[digest]}")
                hashes[digest] = sid
        except Exception as e:  # missing/unreadable image is blocking
            errors.append(f"style {sid}: missing or unreadable image ({type(e).__name__})")
    return errors, warnings


def validate_against_sources(styles):
    """Every record must equal a fresh parse of the PPTX: catches any hand edit of extracted content."""
    import pymupdf
    from pptx import Presentation
    errors, warnings = [], []
    prs, pdf = Presentation(PPTX), pymupdf.open(PDF)
    if len(pdf) != 53:
        errors.append(f"PDF has {len(pdf)} pages, expected 53")
    for s in styles:
        try:
            fresh, issues, meta = build_record(prs, pdf, s["sourcePage"] - 1)
        except (ValueError, IndexError, KeyError) as e:
            errors.append(f"style {s.get('id')}: cannot re-parse source ({e})")
            continue
        if not re.search(rf"(^|\n){s['id']}\.\s", meta["pageText"]):
            errors.append(f"style {s['id']}: PDF page {s['sourcePage']} does not carry this id")
        for key in sorted(set(fresh) | set(s)):
            if fresh.get(key) != s.get(key):
                errors.append(f"style {s['id']}: {key} differs from source")
        warnings += [f"style {s['id']}: {i}" for i in issues]
    return errors, warnings


def main():
    styles = json.loads((ROOT / "src" / "data" / "styles.json").read_text(encoding="utf-8"))
    errors, warnings = validate(styles, ROOT / "public")
    if PPTX.exists() and PDF.exists():
        e, w = validate_against_sources(styles)
        errors += e
        warnings += w
    else:
        warnings.append("source PPTX/PDF not present; source-fidelity check skipped")
    if not REPORT.exists():
        errors.append("data/extraction-report.json missing")
    elif json.loads(REPORT.read_text(encoding="utf-8"))["errors"]:
        errors.append("extraction report lists unresolved errors")

    for w in warnings:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    print(f"{len(styles)} styles, {len(errors)} errors, {len(warnings)} warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
