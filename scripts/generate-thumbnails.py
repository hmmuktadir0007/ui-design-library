"""Generate responsive 480px-wide WebP thumbnails for gallery cards without altering original PNGs."""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "public" / "images"
OUT_DIR = SRC_DIR / "thumbs"
THUMB_WIDTH = 480
WEBP_QUALITY = 82


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    pngs = sorted(SRC_DIR.glob("style-*.png"))
    if len(pngs) != 50:
        raise SystemExit(f"Expected 50 source PNGs in {SRC_DIR}, found {len(pngs)}")

    png_bytes = 0
    webp_bytes = 0
    for src in pngs:
        png_bytes += src.stat().st_size
        out = OUT_DIR / f"{src.stem}.webp"
        with Image.open(src) as img:
            w, h = img.size
            new_h = round(h * (THUMB_WIDTH / w))
            thumb = img.convert("RGB").resize((THUMB_WIDTH, new_h), Image.Resampling.LANCZOS)
            thumb.save(out, format="WEBP", quality=WEBP_QUALITY, method=6)
        webp_bytes += out.stat().st_size

    saved_pct = (1 - webp_bytes / png_bytes) * 100
    print(
        f"Generated {len(pngs)} WebP thumbnails ({THUMB_WIDTH}px wide) in {OUT_DIR.relative_to(ROOT)}: "
        f"{png_bytes / 1024:.1f} kB PNG -> {webp_bytes / 1024:.1f} kB WebP ({saved_pct:.1f}% smaller)"
    )


if __name__ == "__main__":
    main()
