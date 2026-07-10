#!/usr/bin/env bash
#
# Relever la boîte de réception ag-back (ADR 0067). LECTURE SEULE sur $INBOX.
#
# YOU MUST run this at the start of any session touching the chokepoints read API, its contract,
# or a handoff -- and before depositing anything. It answers one question per pending message:
# *is this a reply to the file, and the version of the file, it claims to answer?*
#
#   répond bien à …   in_reply_to = a msg_id of our manifest that we have NOT retracted
#   RÉPONSE PÉRIMÉE   in_reply_to = a msg_id we superseded -- they answered a question we withdrew
#   RÉPONSE ORPHELINE in_reply_to = a msg_id we never sent -- the channel is desynchronised
#   CORROMPU          sha256(file) != announced msg_id -- truncated, or being written right now
#   message spontané  in_reply_to = null -- legitimate, not a reply
#
# A pending message that is périmée, orpheline or corrompue makes this script exit non-zero, and
# YOU MUST NOT act on its content.
#
# Usage:
#   scripts/exchange/inbox.sh                              # list pending messages + verdicts
#   scripts/exchange/inbox.sh --all                        # include already-acked messages
#   scripts/exchange/inbox.sh --ack <msg_id> [--status s] [--note "…"]
#
# --status ∈ read | actioned | rejected (default: read). The ack is appended to OUR manifest.

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

MODE=list
ACK_ID=""
STATUS=read
NOTE=""
SHOW_ALL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ack) MODE=ack; ACK_ID="${2:-}"; shift 2 ;;
    --status) STATUS="${2:-}"; shift 2 ;;
    --note) NOTE="${2:-}"; shift 2 ;;
    --all) SHOW_ALL=1; shift ;;
    -h | --help) sed -n '2,20p' "${BASH_SOURCE[0]}"; exit 0 ;;
    *) die "unknown argument: $1" ;;
  esac
done

[[ -d "$INBOX" ]] || die "inbox absent: $INBOX (le montage sshfs est-il actif ?)"

# --- Degraded channel -------------------------------------------------------
# Without their manifest we cannot check any correlation. Say so, and do not
# manufacture a certainty we cannot provide: nothing here is "a reply".
if [[ ! -f "$IN_MANIFEST" ]]; then
  warn "canal distant NON CONFORME : $IN_MANIFEST est absent (protocole v$PROTOCOL_VERSION non adopté par ag-back)"
  warn "aucune corrélation réponse↔question n'est vérifiable ; aucun accusé n'est possible"
  echo
  echo "Fichiers présents dans $INBOX (non corrélés, à lire avec prudence) :"
  find "$INBOX" -maxdepth 1 -type f -printf '  %f\n' | sort || true
  [[ "$MODE" == ack ]] && die "impossible d'acquitter : le manifeste distant n'existe pas"
  exit 0
fi

chain_verify "$IN_MANIFEST" || die "chaîne du manifeste distant rompue — canal désynchronisé, ne rien consommer"

mapfile -t OUR_IDS < <(msg_ids "$OUT_MANIFEST")
mapfile -t OUR_SUPERSEDED < <(superseded_ids "$OUT_MANIFEST")
mapfile -t ACKED < <(acked_ids "$OUT_MANIFEST")

# Recompute the sha of the deposited file and compare with the announced msg_id.
# Equal => intact AND identity confirmed, in one operation.
integrity_of() {
  local id="$1" file="$2" path="$INBOX/$file"
  [[ -f "$path" ]] || { echo missing; return; }
  if [[ "$(sha_file "$path")" == "$id" ]]; then echo ok; else echo corrupt; fi
}

# The heart of the protocol: does this reply bind to something we actually still ask?
classify() {
  local in_reply_to="$1"
  if [[ -z "$in_reply_to" || "$in_reply_to" == null ]]; then
    echo spontaneous
  elif contains "$in_reply_to" "${OUR_SUPERSEDED[@]+"${OUR_SUPERSEDED[@]}"}"; then
    echo stale
  elif contains "$in_reply_to" "${OUR_IDS[@]+"${OUR_IDS[@]}"}"; then
    echo correlated
  else
    echo orphan
  fi
}

# --- Acknowledge ------------------------------------------------------------
if [[ "$MODE" == ack ]]; then
  [[ -n "$ACK_ID" ]] || die "--ack attend un msg_id (empreinte entière ou préfixe non ambigu)"
  case "$STATUS" in read | actioned | rejected) ;; *) die "--status ∈ read|actioned|rejected" ;; esac

  # A 12-char prefix is what we print; accept it, and refuse anything ambiguous.
  ACK_ID="$(resolve_msg_id "$IN_MANIFEST" "$ACK_ID" "--ack")"

  file="$(file_of "$IN_MANIFEST" "$ACK_ID")"
  [[ -n "$file" ]] || die "msg_id inconnu du manifeste distant : $ACK_ID"
  [[ "$(integrity_of "$ACK_ID" "$file")" == ok ]] ||
    die "refus d'acquitter $(short "$ACK_ID") : le fichier ne redonne pas ce sha (tronqué ou en cours d'écriture)"

  if contains "$ACK_ID" "${ACKED[@]+"${ACKED[@]}"}"; then
    echo "déjà acquitté : $(short "$ACK_ID")"
    exit 0
  fi

  json="$(jq -nc \
    --arg ts "$(now_utc)" --arg id "$ACK_ID" --arg st "$STATUS" --arg note "$NOTE" \
    '{type:"ack", ts:$ts, acks:"ag-back-out", msg_id:$id, status:$st}
     + (if $note == "" then {} else {note:$note} end)')"
  manifest_append "$json"
  echo "acquitté $(short "$ACK_ID") ($STATUS) → $OUT_MANIFEST"
  exit 0
fi

# --- List -------------------------------------------------------------------
problems=0
pending=0

while IFS=$'\t' read -r seq id file subject irt; do
  if [[ "$SHOW_ALL" -eq 0 ]] && contains "$id" "${ACKED[@]+"${ACKED[@]}"}"; then
    continue
  fi
  pending=$((pending + 1))
  integrity="$(integrity_of "$id" "$file")"
  verdict="$(classify "$irt")"

  printf '\n[%04d] %s\n' "$seq" "$file"
  printf '       msg_id  %s\n' "$(short "$id")"
  printf '       sujet   %s\n' "$subject"

  case "$integrity" in
    missing) printf '       ✗ FICHIER ABSENT — annoncé au manifeste, pas sur le disque\n'; problems=$((problems + 1)); continue ;;
    corrupt) printf '       ✗ CORROMPU — sha256(fichier) ≠ msg_id ; tronqué ou en cours d’écriture\n'; problems=$((problems + 1)); continue ;;
  esac

  case "$verdict" in
    spontaneous) printf '       · message spontané (pas une réponse)\n' ;;
    correlated)  printf '       ✓ répond bien à « %s » (%s)\n' "$(subject_of "$OUT_MANIFEST" "$irt")" "$(short "$irt")" ;;
    stale)
      printf '       ✗ RÉPONSE PÉRIMÉE — répond à %s, que nous avons remplacé.\n' "$(short "$irt")"
      printf '         ag-back n’avait pas lu notre correction. NE PAS consommer ; redéposer la question.\n'
      problems=$((problems + 1))
      ;;
    orphan)
      printf '       ✗ RÉPONSE ORPHELINE — répond à %s, que nous n’avons jamais envoyé.\n' "$(short "$irt")"
      problems=$((problems + 1))
      ;;
  esac
done < <(jq -r 'select(.type=="msg") | [.seq, .msg_id, .file, .subject, (.in_reply_to // "")] | @tsv' <"$IN_MANIFEST")

echo
if [[ "$pending" -eq 0 ]]; then
  echo "inbox à jour : aucun message non acquitté."
  exit 0
fi

echo "$pending message(s) en attente. Acquitter : scripts/exchange/inbox.sh --ack <msg_id>"
if [[ "$problems" -gt 0 ]]; then
  echo "$problems message(s) NON exploitables (périmé / orphelin / corrompu) — voir ci-dessus." >&2
  exit 1
fi
