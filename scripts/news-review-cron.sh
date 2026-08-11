#!/usr/bin/env bash
# Weekly news-promotion review reminder (ADR 0071 / 0074).
#
# WHY THIS EXISTS. The news pipeline — read API → cockpit promotion → public Atlas block — has been
# complete since ADR 0071 and had never been used once: `promoted-news.json` sat at `{}` while the API
# served fresh clusters every day. During the five months of the Hormuz crisis our public Atlas said
# nothing, with eleven clusters a week waiting in the feed. Nothing was missing technically. What was
# missing was a rhythm, and a rhythm nobody schedules does not happen.
#
# WHAT IT DOES NOT DO. It does not promote anything, and it does not quote a single headline. The
# promotion is a human act by design: ADR 0074 made `editorial_note` schema-required precisely because
# judging a cluster on its title is the failure mode we removed. Pasting headlines into Slack would
# rebuild the comfort of not reading, one channel to the left. This says HOW MUCH and WHERE. Reading
# happens in the cockpit.
#
# It is also a dead-man's switch: it posts every week, including a quiet one. Silence means the cron
# or the host is dead, not that there was no news.
#
# Cron (host, deploy user):
#   0 9 * * 1 /usr/bin/flock -n /tmp/news_review.lock \
#     /home/deploy/app-geo/scripts/news-review-cron.sh \
#     >> /home/deploy/app-geo/scripts/news-review.log 2>&1
set -euo pipefail
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE="docker compose -f $ROOT/docker/docker-compose.yml"
LABEL="Revue hebdomadaire des actualités"
COCKPIT_URL="${COCKPIT_URL:-https://srv1100990.tail880531.ts.net/outils/exploration}"

# shellcheck source=lib/slack.sh
. "$ROOT/scripts/lib/slack.sh"
if [ -f "$ROOT/scripts/consumer/.env" ]; then
  set -a; . "$ROOT/scripts/consumer/.env"; set +a
fi

out="$($COMPOSE run --rm tools npx tsx scripts/news-digest.mjs 2>&1)" || {
  slack_notify ":rotating_light:" "$LABEL — le digest a échoué" "*Hôte:* $(hostname)" \
    "$(printf '%s' "$out" | tail -20)"
  echo "$out"; exit 1
}
echo "$out"

json="$(printf '%s' "$out" | grep -o 'DIGEST_JSON=.*' | sed 's/^DIGEST_JSON=//' || true)"
[ -n "$json" ] || { slack_notify ":rotating_light:" "$LABEL — digest illisible" "" "$(printf '%s' "$out" | tail -20)"; exit 1; }

read -r status fresh promoted days < <(printf '%s' "$json" | python3 -c '
import json,sys
d=json.load(sys.stdin)
p=d["promoted"]
print(d["status"], d["fresh"], p["items"], p["daysSinceChange"] if p["daysSinceChange"] is not None else -1)
')

corridors="$(printf '%s' "$json" | python3 -c '
import json,sys
d=json.load(sys.stdin)
print("\n".join(f"• {n} — `{cid}`" for cid,n in d["corridors"][:6]) or "• aucun corridor concerné")
')"
notes="$(printf '%s' "$json" | python3 -c '
import json,sys
# The contract requires run_notes to travel: a tidy cluster list without them LOOKS like the period
# news when it is a capped sample.
print("\n".join("- "+n for n in json.load(sys.stdin)["run_notes"][:5]))
')"

case "$status" in
  never_ran)
    slack_notify ":rotating_light:" "$LABEL — aucune agrégation n'a jamais tourné" \
      "*Attention:* \`count: 0\` sans \`run_id\` ne veut pas dire « pas d'actualité », mais « le pipeline amont n'a pas tourné »." \
      "$notes"
    exit 0 ;;
  unreachable)
    slack_notify ":rotating_light:" "$LABEL — flux d'actualités injoignable" "*Hôte:* $(hostname)" "$notes"
    exit 0 ;;
esac

# Real newlines, not the two-character sequence: slack_json_escape turns real newlines into JSON
# "\n", whereas a literal backslash-n would reach Slack and render as the text "\n".
fields="*Clusters frais (7 j):* ${fresh}
*Promus en public:* ${promoted}"
[ "$days" -ge 0 ] && fields="${fields}
*Dernier changement du store:* il y a ${days} j"
fields="${fields}
*Où promouvoir:* ${COCKPIT_URL}

${corridors}"

title="$LABEL — ${fresh} cluster(s) frais"
[ "$fresh" -gt 0 ] && [ "$promoted" -eq 0 ] && title="$LABEL — ${fresh} cluster(s) en attente, 0 promu"

# With a bot token we post through the app itself, because only a message the app owns can carry
# buttons whose clicks come back to it (the slackbot listens in Socket Mode). Without one, we fall
# back to the webhook: the digest still arrives, just without the one-tap path.
if [ -n "${SLACK_BOT_TOKEN:-}" ] && [ -n "${SLACK_CHANNEL_ID:-}" ]; then
  buttons="$(printf '%s' "$json" | python3 -c '
import json,sys
d=json.load(sys.stdin)
els=[]
for i,(cid,_n) in enumerate(d["corridors"][:5]):
    # The label names the corridor, never a headline: the button must not become a place to judge.
    short=cid.replace("p0_maritime_","").replace("p1_","").replace("_"," ")[:70]
    # UN action_id PAR BOUTON : Slack rejette tout le message en invalid_blocks si deux elements
    # partagent le meme identifiant. Aucun digest ne portait donc de boutons. Le corridor voyage
    # dans value ; le slackbot ecoute le motif promote_corridor(_N)?.
    # (Sans apostrophe : ce bloc vit dans un python3 -c entre quotes simples.)
    els.append({"type":"button","action_id":f"promote_corridor_{i}","value":cid,
                "text":{"type":"plain_text","text":f"Promouvoir — {short}"[:75]}})
print(json.dumps({"type":"actions","elements":els} if els else {}))
')"
  payload="$(python3 -c '
import json,sys
title,fields,notes,buttons=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4]
blocks=[{"type":"header","text":{"type":"plain_text","text":":newspaper: "+title,"emoji":True}},
        {"type":"section","text":{"type":"mrkdwn","text":fields}}]
b=json.loads(buttons or "{}")
if b: blocks.append(b)
if notes.strip(): blocks.append({"type":"section","text":{"type":"mrkdwn","text":"```\n"+notes[:2500]+"\n```"}})
print(json.dumps({"channel":sys.argv[5],"text":title,"blocks":blocks}))
' "$title" "$fields" "$notes" "$buttons" "$SLACK_CHANNEL_ID")"
  # `curl -f` ne suffit PAS ici : Slack refuse en HTTP 200 avec {"ok":false,"error":"not_in_channel"}
  # (ou invalid_auth, channel_not_found). Avec -f seul, un bot jamais invité dans le canal rendait un
  # succès silencieux — la revue « partait » chaque lundi sans arriver nulle part, et le dead-man's
  # switch n'aurait rien signalé puisqu'il se croyait vivant. On lit donc le corps (ADR 0077 : ne pas
  # rendre une absence comme un fait), et on retombe sur le webhook plutôt que de perdre la semaine.
  resp="$(curl -s -X POST https://slack.com/api/chat.postMessage \
    -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
    -H 'Content-Type: application/json; charset=utf-8' \
    --data "$payload" || echo '{"ok":false,"error":"curl_failed"}')"
  if printf '%s' "$resp" | grep -q '"ok":[[:space:]]*true'; then
    # Le permalien dans le log : c'est ce qui permet de retrouver le message quand on ne le voit pas
    # dans le client Slack (mauvais espace de travail, canal replié, notification manquée).
    ts="$(printf '%s' "$resp" | sed -n 's/.*"ts":"\([0-9.]*\)".*/\1/p')"
    [ -n "$ts" ] && curl -s -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
      "https://slack.com/api/chat.getPermalink?channel=${SLACK_CHANNEL_ID}&message_ts=${ts}" \
      | sed -n 's/.*"permalink":"\([^"]*\)".*/[news] message: \1/p' | sed 's/\\//g'
  else
    err="$(printf '%s' "$resp" | sed -n 's/.*"error":"\([^"]*\)".*/\1/p')"
    echo "warn: chat.postMessage refusé (${err:-inconnu}) — repli sur le webhook" >&2
    slack_notify ":newspaper:" "$title" "$fields" \
      "Message posté par webhook : l'app a refusé (${err:-inconnu}), donc SANS boutons de promotion."
  fi
else
  slack_notify ":newspaper:" "$title" "$fields" "$notes"
fi
