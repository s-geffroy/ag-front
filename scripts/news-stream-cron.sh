#!/usr/bin/env bash
# Sondage du flux d'actualités au fil de l'eau — un sujet, un message.
#
# POURQUOI CETTE FORME. Le digest hebdomadaire déposait trente-six regroupements le lundi matin : un
# lot qu'on ne commence pas. Mesure au 2026-08-21 — une promotion en dix jours, le jour même du
# câblage. L'unité de validation devient le sujet. Note de conception :
# docs/design/2026-08-21-valider-les-news-au-fil-de-l-eau.md
#
# POURQUOI IL N'ALERTE PAS. Il tourne toutes les heures : une alerte Slack par échec transformerait
# une panne amont d'une journée en vingt-quatre messages, et un canal bruyant se mute — exactement le
# point de départ qu'on cherche à quitter. Le sondeur écrit donc dans son journal et rend son code de
# sortie ; c'est la PULSATION (tous les deux jours) qui porte le rôle de dead-man's switch et dira
# qu'un sondage n'a plus tourné. Le silence reste lisible, mais il l'est ailleurs.
#
# Le sondeur est idempotent : le registre (apps/cockpit/data/news-stream-ledger.json) retient ce qui
# a déjà été annoncé, par `topic_id` avec repli par URL — jamais par `cluster_id`, qui ne survit pas
# à une passe amont.
#
# Cron (hôte, utilisateur deploy) :
#   7 * * * * /usr/bin/flock -n /tmp/news_stream.lock \
#     /home/deploy/app-geo/scripts/news-stream-cron.sh \
#     >> /home/deploy/app-geo/scripts/news-stream.log 2>&1
#
# À blanc, sans rien poster ni écrire :
#   scripts/news-stream-cron.sh --dry-run
set -euo pipefail
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE="docker compose -f $ROOT/docker/docker-compose.yml"

# Les jetons Slack et l'accès à la base chokepoints viennent de docker/.env, que compose injecte dans
# le service `tools`. Rien à sourcer ici, et surtout aucun secret sur la ligne de commande.
echo "── $(date -u +%FT%TZ) ──"
exec $COMPOSE run --rm tools npm --workspace @ag/slackbot run stream -- "$@"
