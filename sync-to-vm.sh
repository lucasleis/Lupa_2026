#!/usr/bin/env bash
set -euo pipefail

gateway="$(ip route show default | awk '{print $3; exit}')"
if [[ -z "${gateway}" ]]; then
  echo "No se pudo detectar el gateway de WSL" >&2
  exit 1
fi

rsync -az \
  --exclude='.git/' \
  --exclude='vendor/' \
  --exclude='system/vendor/' \
  --exclude='_archivo/' \
  -e "ssh -o StrictHostKeyChecking=no -o BatchMode=yes -p 2222" \
  ./ "root@${gateway}:/var/www/html/buscandoconlupa/"

echo "Sincronización completada hacia ${gateway}:2222"
