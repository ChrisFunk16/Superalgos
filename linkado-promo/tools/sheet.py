#!/usr/bin/env python3
"""Kontaktbogen aus PNG-Standbildern: python3 tools/sheet.py <ordner> <ausgabe.png> [spalten=3] [breite=640]"""
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont
d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
w = int(sys.argv[4]) if len(sys.argv) > 4 else 640
files = sorted(glob.glob(os.path.join(d, '*.png')))
if len(sys.argv) > 5: files = files[int(sys.argv[5]):int(sys.argv[6])]
if not files: sys.exit('keine Bilder')
im0 = Image.open(files[0]); h = int(w * im0.height / im0.width)
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * h), (30, 30, 30))
dr = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h), Image.LANCZOS)
    sheet.paste(im, ((i % cols) * w, (i // cols) * h))
    dr.rectangle([(i % cols) * w, (i // cols) * h, (i % cols) * w + 150, (i // cols) * h + 26], fill=(0, 0, 0))
    dr.text(((i % cols) * w + 6, (i // cols) * h + 6), os.path.basename(f).replace('.png', ''), fill=(0, 255, 0))
sheet.save(out); print(out, sheet.size)
