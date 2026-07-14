"""Crop the brand logo into a centered square favicon / apple-touch icon."""
from __future__ import annotations

import os
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "src", "assets", "logo", "logo.png")


def is_content(px: tuple[int, int, int, int]) -> bool:
    r, g, b, a = px
    if a < 20:
        return False
    # near-black canvas — not logo content
    if r < 18 and g < 18 and b < 18:
        return False
    return True


def content_bbox(im: Image.Image) -> tuple[int, int, int, int]:
    w, h = im.size
    pixels = im.load()
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            if is_content(pixels[x, y]):
                found = True
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    if not found:
        raise SystemExit("No logo content found")
    return min_x, min_y, max_x, max_y


def make_square(im: Image.Image, pad_ratio: float = 0.10) -> Image.Image:
    min_x, min_y, max_x, max_y = content_bbox(im)
    cw = max_x - min_x + 1
    ch = max_y - min_y + 1
    print(
        f"bbox=({min_x},{min_y})-({max_x},{max_y}) content={cw}x{ch} "
        f"margins LRTB=({min_x},{im.width-1-max_x},{min_y},{im.height-1-max_y})"
    )

    side = int(max(cw, ch) * (1 + 2 * pad_ratio))
    side += side % 2  # even

    cx = (min_x + max_x) / 2
    cy = (min_y + max_y) / 2
    left = int(round(cx - side / 2))
    top = int(round(cy - side / 2))

    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 255))
    src_left = max(0, left)
    src_top = max(0, top)
    src_right = min(im.width, left + side)
    src_bottom = min(im.height, top + side)
    region = im.crop((src_left, src_top, src_right, src_bottom))
    canvas.paste(region, (src_left - left, src_top - top))
    print(f"square={side}")
    return canvas


def export(im: Image.Image, path: str, size: int) -> None:
    out = im.resize((size, size), Image.Resampling.LANCZOS)
    out.save(path, format="PNG", optimize=True)
    print(f"wrote {path} ({size}x{size})")


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    # Small pad so the tall badge fills the square without looking top-heavy in tabs.
    square = make_square(src, pad_ratio=0.04)

    export(square, os.path.join(ROOT, "public", "favicon.png"), 128)
    export(square, os.path.join(ROOT, "public", "apple-touch-icon.png"), 180)

    brand = os.path.join(ROOT, "public", "brand")
    os.makedirs(brand, exist_ok=True)
    export(square, os.path.join(brand, "favicon-512.png"), 512)


if __name__ == "__main__":
    main()
