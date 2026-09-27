"""Ubah render mentah menjadi file lomba A4 300 dpi (2480 x 3508 px, JPG & PNG, masing-masing < 5 MB)
dan versi Instagram 4:5 (1080 x 1350 px)."""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "output")
A4 = (2480, 3508)
LIMIT = 5 * 1024 * 1024

raw = os.path.join(OUT, "_raw-a4.png")
im = Image.open(raw).convert("RGB")
if im.size != A4:  # koreksi pembulatan subpiksel (maks. 1 px)
    im = im.resize(A4, Image.LANCZOS)

jpg = os.path.join(OUT, "poster-17-tahun-eximbank-A4.jpg")
png = os.path.join(OUT, "poster-17-tahun-eximbank-A4.png")
im.save(jpg, "JPEG", quality=95, subsampling=0, optimize=True, dpi=(300, 300))
im.save(png, "PNG", optimize=True, dpi=(300, 300))
os.remove(raw)

for f in (jpg, png):
    size = os.path.getsize(f)
    print(f"{os.path.basename(f)}: {Image.open(f).size} px, {size/1e6:.2f} MB", "OK" if size < LIMIT else "MELEBIHI 5 MB!")
    assert size < LIMIT

raw_ig = os.path.join(OUT, "_raw-ig.png")
if os.path.exists(raw_ig):
    ig_path = os.path.join(OUT, "instagram-4x5.jpg")
    Image.open(raw_ig).convert("RGB").resize((1080, 1350), Image.LANCZOS).save(
        ig_path, "JPEG", quality=95, subsampling=0, optimize=True)
    os.remove(raw_ig)
    print(f"instagram-4x5.jpg: {Image.open(ig_path).size} px, {os.path.getsize(ig_path)/1e6:.2f} MB")
