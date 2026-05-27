#!/bin/zsh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

if [ ! -d node_modules ]; then
  npm install
fi

PORT="${PORT:-3000}"
LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"

while lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

echo ""
echo "== eevex server =="
echo "Local:   http://localhost:${PORT}"
if [ -n "$LAN_IP" ]; then
  echo "Rede:    http://${LAN_IP}:${PORT}"
else
  echo "Rede:    IP LAN nao encontrado automaticamente."
fi
echo ""

npm run dev -- --hostname 0.0.0.0 --port "$PORT"
