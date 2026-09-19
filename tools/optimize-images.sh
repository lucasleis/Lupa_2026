#!/usr/bin/env bash
set -euo pipefail

source_dir="${1:?Usage: $0 DIRECTORY [MAX_WIDTH] [QUALITY]}"
max_width="${2:-900}"
quality="${3:-80}"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "Error: cwebp no está instalado. Instalá el paquete webp y reintentá." >&2
  exit 1
fi

shopt -s nullglob
for source in "$source_dir"/*.png; do
  target="${source%.png}.webp"
  width="$(python3 - "$source" <<'PY'
import struct
import sys

with open(sys.argv[1], "rb") as image:
    image.seek(16)
    print(struct.unpack(">I", image.read(4))[0])
PY
)"

  if (( width > max_width )); then
    cwebp -resize "$max_width" 0 -q "$quality" "$source" -o "$target"
  else
    cwebp -q "$quality" "$source" -o "$target"
  fi
done
