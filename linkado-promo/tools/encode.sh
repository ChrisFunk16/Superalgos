#!/usr/bin/env bash
# Kodiert aus out/frames4k/ und audio/soundtrack.wav: 4K-Master, 1080p-Webfassung und Poster (letztes Bild).
# Einzeln aufrufbar, wenn nur ein Teil der Bilder neu gerendert wurde (z. B. node render.mjs --scale 2 --from 3.9 --to 17.9 --out out/frames4k).
set -euo pipefail
cd "$(dirname "$0")/.."
DUR=$(python3 -c "import json;print(int(json.load(open('timeline.json'))['meta']['duration']))")
N=$(ls out/frames4k | wc -l); [ "$N" -eq $((DUR*30)) ] || { echo "FEHLER: $N Bilder statt $((DUR*30))"; exit 1; }
VID="-c:v libx264 -preset slow -crf 17 -tune animation -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709"
AUD="-c:a aac -b:a 256k -ar 48000"
echo "== 4K-Master =="
ffmpeg -y -loglevel error -framerate 30 -i out/frames4k/%05d.png -i audio/soundtrack.wav \
  -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" $VID $AUD -movflags +faststart -shortest out/linkado-werbefilm-4k.mp4
echo "== 1080p-Webfassung (aus den 4K-Bildern, Lanczos) =="
ffmpeg -y -loglevel error -framerate 30 -i out/frames4k/%05d.png -i audio/soundtrack.wav \
  -vf "scale=1920:1080:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p" $VID $AUD -movflags +faststart -shortest out/linkado-werbefilm-1080p.mp4
echo "== Poster =="
ffmpeg -y -loglevel error -i out/frames4k/$(printf '%05d' $((DUR*30-1))).png -vf "scale=1920:1080:flags=lanczos" out/poster.png
ls -la out/*.mp4 out/poster.png
