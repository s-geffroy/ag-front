#!/usr/bin/env bash
# La pulsation du flux d'actualités — le battement qui a remplacé le digest du lundi.
#
# CE QU'ELLE FAIT. Elle part tous les deux jours, y compris quand tout est vide, et c'est SON absence
# qui devient le signal. Le flux au fil de l'eau (scripts/news-stream-cron.sh) ne parle que quand il
# a quelque chose à dire : sans ce battement, son silence serait indistinguable d'une panne.
#
# POURQUOI UN CRON QUOTIDIEN POUR UNE CADENCE DE DEUX JOURS. C'est le script qui décide s'il est
# temps, en comparant l'horodatage de la dernière pulsation. Un pas de deux sur le quantième dans la
# crontab ne donnerait que les jours impairs, avec un trou de trois jours à chaque mois de 31.
#
# CE QU'ELLE A REMPLACÉ. `news-review-cron.sh` + `news-digest.mjs`, supprimés le 2026-08-21 : ils
# déposaient trente-six regroupements le lundi matin, un lot qu'on ne commence pas. La fonction de
# dead-man's switch est reprise ici ; le contenu, lui, ne l'est pas.
#
# Cron (hôte, utilisateur deploy) :
#   0 9 * * * /usr/bin/flock -n /tmp/news_pulse.lock \
#     /home/deploy/app-geo/scripts/news-pulse-cron.sh \
#     >> /home/deploy/app-geo/scripts/news-pulse.log 2>&1
#
# À blanc, sans rien poster ni horodater :
#   scripts/news-pulse-cron.sh --dry-run --force
set -euo pipefail
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE="docker compose -f $ROOT/docker/docker-compose.yml"

echo "── $(date -u +%FT%TZ) ──"
exec $COMPOSE run --rm tools npm --workspace @ag/slackbot run pulse -- "$@"
