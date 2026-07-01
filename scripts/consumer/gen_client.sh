#!/usr/bin/env bash
# Consumer-side typed-client generation for the Chokepoints Read API (ADR 0062).
#
# Runs on the CONSUMER VPS. Generates a typed httpx client + models from the PINNED spec
# (contract/openapi.json, managed by sync_contract.sh) — NOT from the live endpoint — so the
# client only changes on a deliberate contract bump. Rerun after accepting a drift.
#
# Environment-agnostic: prefers `uvx` (ephemeral, no install), falls back to a one-off Docker
# run, so the consumer needs neither this repo's tools image nor a local Python install.
#
#   PIN_DIR   where the pinned spec lives (default: ./contract next to this script)
#   OUT_DIR   where the generated client package is written (default: ./client)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIN_DIR="${PIN_DIR:-$SCRIPT_DIR/contract}"
OUT_DIR="${OUT_DIR:-$SCRIPT_DIR/client}"
SPEC="$PIN_DIR/openapi.json"
CONFIG="$SCRIPT_DIR/openapi-python-client.yaml"   # post_hooks: [] (skip generated-code lint)

if [ ! -f "$SPEC" ]; then
  echo "pinned spec missing: $SPEC — run sync_contract.sh first" >&2
  exit 1
fi
mkdir -p "$OUT_DIR"

# --meta none: emit just the importable package; --overwrite: idempotent regeneration;
# --config: skip the ruff post-hook that would otherwise fail on generated-code lint noise.
gen() { "$@" generate --path "$SPEC" --output-path "$OUT_DIR" --meta none --overwrite --config "$CONFIG"; }

if command -v uvx >/dev/null 2>&1; then
  gen uvx openapi-python-client
elif command -v pipx >/dev/null 2>&1; then
  gen pipx run openapi-python-client
elif command -v docker >/dev/null 2>&1; then
  docker run --rm -v "$PIN_DIR":/spec -v "$OUT_DIR":/out -v "$CONFIG":/config.yaml:ro \
    ghcr.io/openapi-generators/openapi-python-client:latest \
    generate --path /spec/openapi.json --output-path /out --meta none --overwrite --config /config.yaml
else
  echo "need one of: uvx, pipx, or docker to run openapi-python-client" >&2
  exit 3
fi

echo "generated typed client from $SPEC into $OUT_DIR"
