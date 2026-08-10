#!/usr/bin/env bash
#
# Nightly backup of everything this deployment cannot regenerate.
#
# WHY: until now nothing on this box was backed up. What a disk loss would destroy is not the code
# (it is on GitHub) nor the public site (rebuilt from the repo in seconds), but exactly three things:
#
#   1. the two SQLite databases — HDDE and VERDICT accounts, interviews, decisions;
#   2. their `exports/` trees — the FR/EN packets and decision notes already DELIVERED to clients;
#   3. the commercial pipeline — apps/cockpit/data/*.json and the lead ledger.
#
# All three are git-ignored by design (they hold client and prospect data). So they exist in exactly
# one place, and that place had no copy.
#
# The databases are snapshotted through the SQLite online-backup API rather than copied — see the
# header of scripts/backup-sqlite.mjs for why `cp` would silently produce an empty file here.
#
# Host script by necessity (like redeploy-*.sh and the exchange scripts): the cron, the destination
# directory and the retention policy live on the host. The sqlite work itself runs in `tools`.
#
# Usage:
#   scripts/backup.sh                 # run a backup, prune old ones
#   scripts/backup.sh --verify-only   # restore the newest archive to a temp dir and open the DBs
#
# Env:
#   BACKUP_DIR       destination (default /home/deploy/backups)
#   BACKUP_KEEP      how many archives to keep (default 14)
#   BACKUP_PING_URL  dead-man's-switch URL pinged on success (healthchecks.io style); unset → no-op
#   SLACK_WEBHOOK_URL  failure alert (via scripts/lib/slack.sh); unset → no-op

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker compose -f ${ROOT}/docker/docker-compose.yml"
BACKUP_DIR="${BACKUP_DIR:-/home/deploy/backups}"
BACKUP_KEEP="${BACKUP_KEEP:-14}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"

# shellcheck source=lib/slack.sh
. "${ROOT}/scripts/lib/slack.sh"

# Load SLACK_WEBHOOK_URL / BACKUP_PING_URL if the consumer env carries them (same file the drift cron
# uses), without letting a missing file abort the run.
if [ -f "${ROOT}/scripts/consumer/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "${ROOT}/scripts/consumer/.env"
  set +a
fi

fail() {
  local msg="$1"
  echo "ERREUR: ${msg}" >&2
  slack_notify ":floppy_disk:" "Sauvegarde app-geo en échec" "*Hôte:* $(hostname)" "${msg}" || true
  exit 1
}

# ── --verify-only : a backup nobody has restored is not a backup ──────────────────────────────────
if [ "${1:-}" = "--verify-only" ]; then
  latest="$(ls -1t "${BACKUP_DIR}"/app-geo-*.tar.gz 2>/dev/null | head -1 || true)"
  [ -n "${latest}" ] || fail "aucune archive dans ${BACKUP_DIR}"
  tmp="$(mktemp -d)"
  chmod 755 "${tmp}"
  trap 'rm -rf "${tmp}"' EXIT
  echo "▸ Restauration d'essai de ${latest}"
  tar -xzf "${latest}" -C "${tmp}"
  for db in hdde verdict; do
    f="$(find "${tmp}" -name "${db}.sqlite" -print -quit)"
    [ -n "${f}" ] || fail "${db}.sqlite absent de l'archive"
    rel="${f#"${tmp}"/}"
    # Open the RESTORED file, not the live one — that is the whole point of the exercise.
    ${COMPOSE} run --rm -v "${tmp}:/restore:ro" tools node -e "
      const Database = require('better-sqlite3');
      const db = new Database('/restore/${rel}', { readonly: true, fileMustExist: true });
      const ok = db.pragma('integrity_check', { simple: true });
      const n = db.prepare(\"SELECT count(*) AS n FROM sqlite_master WHERE type='table'\").get().n;
      db.close();
      if (ok !== 'ok') { console.error('integrity_check = ' + ok); process.exit(1); }
      if (n === 0) { console.error('aucune table'); process.exit(1); }
      console.log('  ✓ ${db}.sqlite restauré : ' + n + ' tables, integrity ok');
    " || fail "${db}.sqlite restauré est illisible"
  done
  echo "✓ Archive restaurable."
  exit 0
fi

mkdir -p "${BACKUP_DIR}"
work="$(mktemp -d)"
trap 'rm -rf "${work}"' EXIT
snap="${work}/app-geo-${STAMP}"
mkdir -p "${snap}"

echo "▸ Snapshot SQLite (API de sauvegarde en ligne)…"
${COMPOSE} run --rm -v "${work}:/backup" tools \
  node scripts/backup-sqlite.mjs "/backup/app-geo-${STAMP}" \
  || fail "snapshot SQLite en échec — voir la sortie ci-dessus"

echo "▸ Données non régénérables…"
# Exports = what clients already received. Cockpit JSON + lead ledger = the commercial pipeline.
for src in \
  "apps/hdde-api/data/exports" \
  "apps/verdict-api/data/exports" \
  "apps/cockpit/data" \
  "apps/lead-api/data"; do
  if [ -e "${ROOT}/${src}" ]; then
    mkdir -p "${snap}/$(dirname "${src}")"
    cp -a "${ROOT}/${src}" "${snap}/${src}"
  fi
done

# The secrets file. Without it a restored box cannot talk to the chokepoints API, OpenAI or SMTP.
# It is 0600 here and the archive inherits 0600 below.
[ -f "${ROOT}/docker/.env" ] && cp -a "${ROOT}/docker/.env" "${snap}/docker.env"

archive="${BACKUP_DIR}/app-geo-${STAMP}.tar.gz"
tar -czf "${archive}" -C "${work}" "app-geo-${STAMP}"
# The archive carries docker/.env and client data: never group- or world-readable.
chmod 600 "${archive}"

size="$(du -h "${archive}" | cut -f1)"
echo "✓ ${archive} (${size})"

# ── Retention ─────────────────────────────────────────────────────────────────────────────────────
mapfile -t old < <(ls -1t "${BACKUP_DIR}"/app-geo-*.tar.gz 2>/dev/null | tail -n +"$((BACKUP_KEEP + 1))")
if [ ${#old[@]} -gt 0 ]; then
  printf '▸ Purge de %d archive(s) au-delà de %s\n' "${#old[@]}" "${BACKUP_KEEP}"
  rm -f "${old[@]}"
fi

# ── Dead-man's switch ─────────────────────────────────────────────────────────────────────────────
# Pinged only on success. The point is that SILENCE is the alarm: a Slack alert cannot fire if the
# box is down, which is precisely when a missing backup matters most.
if [ -n "${BACKUP_PING_URL:-}" ]; then
  curl -sf -m 10 "${BACKUP_PING_URL}" >/dev/null || echo "warn: ping du dead-man's switch échoué" >&2
fi
