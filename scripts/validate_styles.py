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
from extract_styles import CATEGORIES, PDF, PPTX, REPORT, ROOT, VALID_COLOR_RE, norm, parse_slide, source_match  # noqa: E402

FIELDS = {"id": int, "name": str, "categoryTab": str, "whereToUse": str, "howToUse": str, "palette": list,
          "aiPrompt": str, "cssSnippet": str, "imagePath": str, "sourcePage": int}


def main():
    errors, warnings = [], []
    styles = json.loads((ROOT / "src" / "data" / "styles.json").read_text(encoding="utf-8"))

    if len(styles) != 50:
        errors.append(f"expected 50 records, found {len(styles)}")
    ids = [s.get("id") for s in styles]
    if sorted(ids) != list(range(1, 51)):
        errors.append(f"ids are not exactly 1..50 once each: {sorted(ids)}")
    if set(s.get("categoryTab") for s in styles) != set(CATEGORIES):
        errors.append("not all six categories are represented, or an unknown category is present")

    hashes = {}
    for s in styles:
        sid = s.get("id")
        for key, typ in FIELDS.items():
            if not isinstance(s.get(key), typ) or s.get(key) in ("", []):
                errors.append(f"style {sid}: missing/invalid {key}")
        if set(s) - set(FIELDS):
            errors.append(f"style {sid}: unexpected fields {set(s) - set(FIELDS)}")
        if s.get("categoryTab") not in CATEGORIES:
            errors.append(f"style {sid}: invalid category {s.get('categoryTab')!r}")
        if s.get("sourcePage") != sid + 2:
            errors.append(f"style {sid}: sourcePage {s.get('sourcePage')} != {sid + 2}")
        if s.get("imagePath") != f"/images/style-{sid:02d}.png":
            errors.append(f"style {sid}: unexpected imagePath {s.get('imagePath')}")
        for c in s.get("palette", []):
            if not VALID_COLOR_RE.match(c):
                errors.append(f"style {sid}: invalid palette colour {c!r}")
        if not 3 <= len(s.get("palette", [])) <= 6:
            errors.append(f"style {sid}: palette has {len(s['palette'])} colours")
        if s.get("cssSnippet", "").count("{") != s.get("cssSnippet", "").count("}") or s.get("cssSnippet", "").count("(") != s.get("cssSnippet", "").count(")"):
            warnings.append(f"style {sid}: CSS snippet has unbalanced brackets")

        img_path = ROOT / "public" / s.get("imagePath", "").lstrip("/")
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
        except Exception as e:  # unreadable/missing image is blocking
            errors.append(f"style {sid}: image unreadable ({e})")

    # Text must still match the sources: re-parse PPTX and cross-check against PDF text.
    if PPTX.exists() and PDF.exists():
        import pymupdf
        from pptx import Presentation
        prs, pdf = Presentation(PPTX), pymupdf.open(PDF)
        if len(pdf) != 53:
            errors.append(f"PDF has {len(pdf)} pages, expected 53")
        for s in styles:
            idx = s["sourcePage"] - 1
            title, f = parse_slide(prs.slides[idx])
            if not title or int(title.split(".", 1)[0]) != s["id"]:
                errors.append(f"style {s['id']}: PPTX slide {idx + 1} title {title!r} does not carry this id")
            if not re.search(rf"(^|\n){s['id']}\.\s", norm(pdf[idx].get_text())):
                errors.append(f"style {s['id']}: PDF page {idx + 1} does not carry this id")
            page_text = norm(pdf[idx].get_text())
            if s["cssSnippet"] != "\n".join(f["cssSnippet"]):
                errors.append(f"style {s['id']}: cssSnippet differs from PPTX source")
            for key in ("whereToUse", "howToUse", "aiPrompt", "cssSnippet"):
                score = source_match(s[key], page_text)
                if score < 0.95:
                    warnings.append(f"style {s['id']}: {key} matches PDF text at {score:.0%}")
    else:
        warnings.append("source PPTX/PDF not present; source cross-check skipped")

    report = json.loads(REPORT.read_text(encoding="utf-8")) if REPORT.exists() else None
    if report is None:
        errors.append("data/extraction-report.json missing")
    elif report["errors"]:
        errors.append(f"extraction report lists {len(report['errors'])} unresolved errors")
    else:
        warnings += [f"extraction: {w}" for w in report["warnings"]]

    for w in warnings:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    print(f"{len(styles)} styles, {len(errors)} errors, {len(warnings)} warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
