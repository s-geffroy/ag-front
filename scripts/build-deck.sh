#!/usr/bin/env bash
#
# Build a plaquette: .pptx (pptxgenjs, in `tools`) → normalise → validate → .pdf (LibreOffice, in
# `slides`) → normalise → QA renders. ADR 0073.
#
# Both containers are needed because the two halves of the job have incompatible runtimes: the
# generator is Node and lives in the everyday `tools` image; LibreOffice, poppler, qpdf and the
# vendored `pptx`/`pdf` skill scripts live in `slides`, which is ~2 GB and built on demand.
#
# Output goes to presentations/<deck>/<lang>/ — a repo convention, not an option. Those files are
# VERSIONED, hence the two normalisation steps: without them every rebuild is a binary diff.
# Normalisation precedes validation so that what gets certified is the file that actually ships.
#
# Usage:
#   scripts/build-deck.sh                                   # commercial, fr+en, today's date
#   scripts/build-deck.sh --lang fr --date 2026-08-10
#   scripts/build-deck.sh --pptx-only                       # skip `slides` entirely (fast loop)
#   scripts/build-deck.sh --substitution-qa                 # ALSO render as a client without our fonts
#
# Publishing is NOT done here. `manifest.json#published` is carried across rebuilds untouched; the
# cockpit page /commercial/plaquette is what flips it, under human validation (ADR 0046/0069).
set -euo pipefail
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker compose -f $ROOT/docker/docker-compose.yml"
SKILL_PPTX="/workspace/.claude/skills/pptx/scripts"

DECK=commercial
LANG_ARG=all
DATE="$(date +%F)"
PPTX_ONLY=0
SUBSTITUTION_QA=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --deck)             DECK="$2"; shift 2 ;;
    --lang)             LANG_ARG="$2"; shift 2 ;;
    --date)             DATE="$2"; shift 2 ;;
    --pptx-only)        PPTX_ONLY=1; shift ;;
    --substitution-qa)  SUBSTITUTION_QA=1; shift ;;
    -h|--help)          sed -n '2,26p' "${BASH_SOURCE[0]}"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

case "$LANG_ARG" in
  fr) LANGS=(fr) ;;
  en) LANGS=(en) ;;
  all) LANGS=(fr en) ;;
  *) echo "--lang must be fr, en or all (got '$LANG_ARG')" >&2; exit 2 ;;
esac

OUT_REL="presentations/$DECK"
OUT_ABS="$ROOT/$OUT_REL"

echo "==> [1/7] generating .pptx (tools)"
# The generator refuses to write a deck that links to unpublished content — see @ag/deck.
$COMPOSE run --rm tools \
  npm --workspace @ag/deck run build:deck -- --deck "$DECK" --lang "$LANG_ARG" --date "$DATE"

if [[ $PPTX_ONLY -eq 1 ]]; then
  echo "==> --pptx-only: stopping before conversion. The PDFs on disk are now STALE."
  exit 0
fi

for L in "${LANGS[@]}"; do
  PPTX="$OUT_REL/$L/$DECK.$L.pptx"

  echo "==> [2/7] normalising the .pptx — $L"
  # BEFORE validation, deliberately. Normalisation rewrites the ZIP container, so validating the
  # pre-normalised file would certify an artifact that is not the one anybody receives.
  $COMPOSE run --rm -w "/workspace/$OUT_REL/$L" slides \
    python3 /workspace/scripts/deck-normalise.py --date "$DATE" --pptx "$DECK.$L.pptx"

  echo "==> [3/7] validating the OOXML that ships — $L"
  # validate.py resolves `from helpers import …` relatively, so it must run from its own directory.
  $COMPOSE run --rm -w "$SKILL_PPTX/office" slides \
    python3 validate.py "/workspace/$PPTX"

  echo "==> [4/7] converting to PDF — $L"
  # Via the skill's wrapper, not bare soffice: it provisions a throwaway user profile, without which
  # a non-root container aborts with "User installation could not be completed" and converts nothing.
  $COMPOSE run --rm -w "/workspace/$OUT_REL/$L" slides \
    python3 "$SKILL_PPTX/office/soffice.py" --headless --convert-to pdf "$DECK.$L.pptx"

  echo "==> [5/7] normalising the .pdf — $L"
  # LibreOffice stamps /CreationDate, /ModDate and a random trailer /ID; presentations/ is versioned,
  # so an un-normalised PDF means a binary diff on every rebuild that changes nothing.
  $COMPOSE run --rm -w "/workspace/$OUT_REL/$L" slides \
    python3 /workspace/scripts/deck-normalise.py \
      --date "$DATE" \
      --title "Applied Geopolitics — $DECK ($L)" \
      --pdf "$DECK.$L.pdf"

  echo "==> [6/7] QA renders + text extraction — $L"
  $COMPOSE run --rm -w "/workspace/$OUT_REL/$L" slides bash -c "
    set -euo pipefail
    mkdir -p /workspace/$OUT_REL/preview
    rm -f /workspace/$OUT_REL/preview/$L-slide-*.jpg
    pdftoppm -jpeg -r 100 '$DECK.$L.pdf' /workspace/$OUT_REL/preview/$L-slide
    python3 - <<'PY'
import pdfplumber
# A slide that extracts as (nearly) empty is a rendering failure the eye can miss on a thumbnail —
# a missing font, a text box positioned off-canvas. Report it; do not silently pass.
with pdfplumber.open('$DECK.$L.pdf') as pdf:
    thin = [i for i, p in enumerate(pdf.pages, 1) if len((p.extract_text() or '').strip()) < 20]
    print(f'[qa] $L: {len(pdf.pages)} pages, {len(thin)} with almost no extractable text {thin}')
PY
  "
done

if [[ $SUBSTITUTION_QA -eq 1 ]]; then
  echo "==> [7/7] substitution QA — rendering as a client WITHOUT the house fonts"
  for L in "${LANGS[@]}"; do
    $COMPOSE run --rm -w "/workspace/$OUT_REL/$L" \
      -e FONTCONFIG_FILE=/etc/fonts/fontconfig-substitution-qa.xml slides bash -c "
      set -euo pipefail
      python3 '$SKILL_PPTX/office/soffice.py' --headless --convert-to pdf \
        --outdir /tmp/subqa '$DECK.$L.pptx' >/dev/null
      mkdir -p /workspace/$OUT_REL/preview
      rm -f /workspace/$OUT_REL/preview/$L-subst-*.jpg
      pdftoppm -jpeg -r 100 /tmp/subqa/'$DECK.$L.pdf' /workspace/$OUT_REL/preview/$L-subst
    "
  done
  echo "    compare preview/<lang>-slide-*.jpg with preview/<lang>-subst-*.jpg — this is an eyeball"
  echo "    check, not a test: it decides whether a text box needs more slack, nothing more."
else
  echo "==> [7/7] substitution QA skipped (pass --substitution-qa)"
fi

echo
echo "Done. $OUT_ABS"
echo "  Review in the cockpit:  https://srv1100990.tail880531.ts.net/commercial/plaquette"
echo "  Publishing is a cockpit act, then: scripts/redeploy-public.sh"
