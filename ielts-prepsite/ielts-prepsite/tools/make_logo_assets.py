#!/usr/bin/env python3
"""Turn the logo PNG (any size, white background) into the web assets in /assets.
Usage:  python3 tools/make_logo_assets.py path/to/logo.png
Needs:  pip install pillow numpy
Makes:  logo.png (light theme), logo-dark.png (dark theme), icon.png, favicon.png, apple-touch-icon.png
"""
import sys, os
import numpy as np
from PIL import Image, ImageDraw

src = sys.argv[1] if len(sys.argv) > 1 else "logo-source.png"
out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets")
os.makedirs(out, exist_ok=True)

a = np.array(Image.open(src).convert("RGBA")).astype(float)
rgb = a[..., :3]
# 1) white background -> transparent. Opacity grows as the pixel gets darker/more colourful.
alpha = np.clip((255 - rgb.min(axis=2)) / (255 - 70), 0, 1) * (a[..., 3] / 255)
# 2) classify each pixel as "red" or "navy" so edges stay clean on any background
is_red = (rgb[..., 0] - rgb[..., 2] > 50)

# brand colours sampled from the logo
solid = alpha > .95
NAVY = np.median(rgb[solid & ~is_red], axis=0)
RED = np.median(rgb[solid & is_red], axis=0)

def paint(navy, red):
    img = np.zeros(a.shape, dtype=np.uint8)
    img[..., :3] = np.where(is_red[..., None], np.array(red), np.array(navy))
    img[..., 3] = (alpha * 255).astype(np.uint8)
    return Image.fromarray(img, "RGBA")

def trim(im, pad=4):
    bb = im.getchannel("A").point(lambda v: 255 if v > 12 else 0).getbbox()
    l, t, r, b = bb
    return im.crop((max(0, l - pad), max(0, t - pad), r + pad, b + pad))

light = paint(NAVY, RED)
dark = paint((237, 240, 250), (255, 90, 96))

full = trim(light)
w = 640
full.resize((w, round(full.height * w / full.width)), Image.LANCZOS).save(os.path.join(out, "logo.png"), optimize=True)
fd = trim(dark)
fd.resize((w, round(fd.height * w / fd.width)), Image.LANCZOS).save(os.path.join(out, "logo-dark.png"), optimize=True)

# icon only: everything left of the divider line (first gap in the columns)
cols = (np.array(full.getchannel("A")) > 12).any(axis=0)
x = 0
while x < len(cols) and not cols[x]: x += 1
while x < len(cols) and cols[x]: x += 1          # end of the icon
icon = trim(full.crop((0, 0, x, full.height)), 2)
side = max(icon.size)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.paste(icon, ((side - icon.width) // 2, (side - icon.height) // 2), icon)
sq.resize((256, 256), Image.LANCZOS).save(os.path.join(out, "icon.png"), optimize=True)

def badge(size):
    # white rounded square so the icon is visible on light and dark browser tabs
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle((0, 0, size - 1, size - 1), radius=size // 5, fill=(255, 255, 255, 255))
    inner = int(size * .78)
    ic = sq.resize((inner, inner), Image.LANCZOS)
    im.paste(ic, ((size - inner) // 2, (size - inner) // 2), ic)
    return im
badge(64).save(os.path.join(out, "favicon.png"), optimize=True)
badge(180).save(os.path.join(out, "apple-touch-icon.png"), optimize=True)
print("navy", NAVY.astype(int), "red", RED.astype(int))
for f in sorted(os.listdir(out)): print(f, os.path.getsize(os.path.join(out, f)) // 1024, "KB", Image.open(os.path.join(out, f)).size)
