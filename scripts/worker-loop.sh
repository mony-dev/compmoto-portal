#!/bin/sh
set -e
echo "[sync-worker] started"

mkdir -p /app/tmp /app/logs || true

# ✅ ให้ app (uid 1001) เขียนได้ แม้ไฟล์เคยเป็น root
chmod 1777 /app/tmp || true
chmod 777 /app/logs || true

# ถ้ามีไฟล์อยู่แล้ว ให้แก้สิทธิ์ด้วย
[ -f /app/tmp/sync-status.json ] && chmod 666 /app/tmp/sync-status.json || true

while true; do
  node scripts/run-sync.mjs || true
  sleep "${SYNC_INTERVAL_SECONDS:-30}"
done


