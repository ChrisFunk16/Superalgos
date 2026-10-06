#!/usr/bin/env bash
# Komplette Produktion: Ton → Bilder (4K) → Master + Web-Fassung + Poster
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
echo "== Ton =="; python3 audio/soundtrack.py --no-analysis
echo "== Bilder (3840×2160) – drei Browser-Prozesse parallel =="; rm -rf out/frames4k; mkdir -p out/frames4k
DUR=$(python3 -c "import json;print(int(json.load(open('timeline.json'))['meta']['duration']))"); A=$((DUR/3)); B=$((2*DUR/3))
for r in "0 $A" "$A $B" "$B $DUR"; do set -- $r; node render.mjs --scale 2 --from $1 --to $2 --fps 30 --out out/frames4k --workers 2 > out/render4k-$1.log 2>&1 & done
wait
bash tools/encode.sh
