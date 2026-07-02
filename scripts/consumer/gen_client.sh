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

_sha256() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | awk '{print $1}';
  else shasum -a 256 "$1" | awk '{print $1}'; fi
}

if [ ! -f "$SPEC" ]; then
  echo "pinned spec missing: $SPEC — run sync_contract.sh first" >&2
  exit 1
fi
mkdir -p "$OUT_DIR"

# --meta none: emit just the importable package; --overwrite: idempotent regeneration;
# --config: skip the ruff post-hook that would otherwise fail on generated-code lint noise.
gen() { "$@" generate --path "$SPEC" --output-path "$OUT_DIR" --meta none --overwrite --config "$CONFIG"; }

# Pin the generator to the last 0.24.x line (compatible with pydantic 2.9.2 / httpx 0.27.2). The
# generated client's own runtime only needs httpx + attrs + python-dateutil.
GEN_VERSION="openapi-python-client==0.24.2"

if command -v uvx >/dev/null 2>&1; then
  gen uvx "$GEN_VERSION"
elif command -v pipx >/dev/null 2>&1; then
  gen pipx run "$GEN_VERSION"
elif command -v docker >/dev/null 2>&1; then
  # No official openapi-python-client image exists; run it via uvx inside the astral uv image
  # (Python + uv). --user + HOME/cache in /tmp so the generated files are owned by the host user,
  # not root. $GEN_VERSION keeps the pin identical to the uvx/pipx branches. Needs network on the
  # first run to fetch the generator into the ephemeral env.
  docker run --rm --user "$(id -u):$(id -g)" -e HOME=/tmp -e UV_CACHE_DIR=/tmp/uv-cache \
    -v "$PIN_DIR":/spec:ro -v "$OUT_DIR":/out -v "$CONFIG":/config.yaml:ro \
    ghcr.io/astral-sh/uv:python3.12-bookworm-slim \
    uvx "$GEN_VERSION" generate --path /spec/openapi.json --output-path /out --meta none --overwrite --config /config.yaml
else
  echo "need one of: uvx, pipx, or docker to run openapi-python-client" >&2
  exit 3
fi

echo "generated typed client from $SPEC into $OUT_DIR"

# Stamp the spec hash the client was generated from, so check_client.sh can detect a stale client.
_sha256 "$SPEC" > "$OUT_DIR/.spec.sha256"
