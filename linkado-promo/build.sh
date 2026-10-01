#!/usr/bin/env bash
# Komplette Produktion: Ton → Bilder (4K) → Master + Web-Fassung + Poster
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
echo "== Ton =="; python3 audio/soundtrack.py --no-analysis
echo "== Bilder (3840×2160) – drei Browser-Prozesse parallel =="; rm -rf out/frames4k; mkdir -p out/frames4k
for r in "0 22" "22 44" "44 64"; do set -- $r; node render.mjs --scale 2 --from $1 --to $2 --fps 30 --out out/frames4k --workers 2 > out/render4k-$1.log 2>&1 & done
wait
VID="-c:v libx264 -preset slow -crf 17 -tune animation -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709"
AUD="-c:a aac -b:a 256k -ar 48000"
echo "== 4K-Master =="
ffmpeg -y -loglevel error -framerate 30 -i out/frames4k/%05d.png -i audio/soundtrack.wav \
  -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" $VID $AUD -movflags +faststart -shortest out/linkado-werbefilm-4k.mp4
echo "== 1080p-Webfassung (aus den 4K-Bildern, Lanczos) =="
ffmpeg -y -loglevel error -framerate 30 -i out/frames4k/%05d.png -i audio/soundtrack.wav \
  -vf "scale=1920:1080:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p" $VID $AUD -movflags +faststart -shortest out/linkado-werbefilm-1080p.mp4
echo "== Poster =="
ffmpeg -y -loglevel error -i out/frames4k/01919.png -vf "scale=1920:1080:flags=lanczos" out/poster.png
ls -la out/*.mp4 out/poster.png
