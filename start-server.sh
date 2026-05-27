#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"

echo ""
echo "== eevex server =="
echo "Local:   http://localhost:${PORT}"
if [ -n "${LAN_IP}" ]; then
  echo "Rede:    http://${LAN_IP}:${PORT}"
else
  echo "Rede:    IP LAN nao encontrado automaticamente."
fi
echo ""

npm run dev -- --hostname 0.0.0.0 --port "${PORT}"
