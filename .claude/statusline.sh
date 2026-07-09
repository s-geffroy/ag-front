#!/usr/bin/env bash
# Statusline Claude Code (app-geo) : tag projet · modèle · branche · workspace · contexte · cache · quota 5h/7d (rythme tokens/temps)
set -uo pipefail

# ── Couleurs ──
RST=$'\033[0m'; DIM=$'\033[38;5;245m'
GRN=$'\033[32m'; YLW=$'\033[33m'; ORG=$'\033[38;5;208m'; RED=$'\033[31m'
CYN=$'\033[1;36m'; MAG=$'\033[1;35m'
SEP=" ${DIM}│${RST} "

# ── Lecture du JSON sur stdin (un seul appel jq) ──
input=$(cat)
IFS='|' read -r model used_pct ctx_size inp_tok cache_create cache_read \
  project_dir cwd rl5_pct rl5_reset rl7_pct rl7_reset \
  <<< "$(printf '%s' "$input" | jq -r '[
    (.model.display_name // .model.id // "?"),
    (.context_window.used_percentage // ""),
    (.context_window.context_window_size // 200000),
    (.context_window.current_usage.input_tokens // 0),
    (.context_window.current_usage.cache_creation_input_tokens // 0),
    (.context_window.current_usage.cache_read_input_tokens // 0),
    (.workspace.project_dir // .cwd // ""),
    (.workspace.current_dir // .cwd // ""),
    (.rate_limits.five_hour.used_percentage // ""),
    (.rate_limits.five_hour.resets_at // 0),
    (.rate_limits.seven_day.used_percentage // ""),
    (.rate_limits.seven_day.resets_at // 0)
  ] | join("|")' 2>/dev/null)"

# ── Retire le suffixe « (1M context) » du nom de modèle ──
model="${model/ (1M context)/}"

# ── Couleur par seuil : vert <50, jaune <80, rouge ≥80 ──
col() { local p=${1:-0}; if [ "$p" -ge 80 ]; then printf '%s' "$RED"
        elif [ "$p" -ge 50 ]; then printf '%s' "$YLW"; else printf '%s' "$GRN"; fi; }

# ── Durées des fenêtres quota (s) ──
W5=18000    # 5 h
W7=604800   # 7 j

# ── resets_at (epoch OU ISO8601) → epoch, ou vide (même parsing que fin()) ──
to_ts() {
  local v="$1"; { [ -z "$v" ] || [ "$v" = "0" ] || [ "$v" = "null" ]; } && return
  if [[ "$v" =~ ^[0-9]+$ ]]; then printf '%s' "$v"; else date -d "$v" +%s 2>/dev/null; fi
}

# ── Couleur selon le rythme tokens/temps : vert <0.8, jaune 0.8-1.0, orange 1.0-1.2, rouge >1.2 (maths entières) ──
col_rythme() { # $1=tokens_pct(int) $2=temps_pct(int)
  local tk=$1 tm=$2
  [ "$tk" -le 0 ] && { printf '%s' "$GRN"; return; }   # rien consommé → vert
  [ "$tm" -le 0 ] && { printf '%s' "$RED"; return; }   # temps ~0 mais tokens>0 → brûle
  if   [ $((tk*10)) -lt $((tm*8))  ]; then printf '%s' "$GRN"   # ratio < 0.8
  elif [ $((tk*10)) -lt $((tm*10)) ]; then printf '%s' "$YLW"   # 0.8 ≤ ratio < 1.0
  elif [ $((tk*10)) -le $((tm*12)) ]; then printf '%s' "$ORG"   # 1.0 ≤ ratio ≤ 1.2
  else                                     printf '%s' "$RED"   # ratio > 1.2
  fi
}

# ── Contexte (%) + tokens ──
ctx=0
if [ -n "$used_pct" ] && [ "$used_pct" != "null" ]; then
  ctx=$(printf '%.0f' "$used_pct")
elif [ "${ctx_size:-0}" -gt 0 ]; then
  ctx=$(( (inp_tok + cache_create + cache_read) * 100 / ctx_size ))
fi
used_k=$(( (inp_tok + cache_create + cache_read) / 1000 ))
size_k=$(( ctx_size / 1000 ))

# ── Cache hit : cache_read / (cache_read + input_tokens) ──
cache=0; tot=$(( cache_read + inp_tok ))
[ "$tot" -gt 0 ] && cache=$(( cache_read * 100 / tot ))

# ── Branche git (lecture directe de .git/HEAD, pas de fork) ──
branch=""
if [ -n "$project_dir" ] && [ -f "$project_dir/.git/HEAD" ]; then
  h=$(<"$project_dir/.git/HEAD")
  if [[ "$h" == ref:* ]]; then branch="${h#ref: refs/heads/}"; else branch="${h:0:7}"; fi
fi

# ── Workspace du monorepo (apps/<x> ou packages/<x>) d'après le cwd ──
ws=""
if [ -n "$project_dir" ] && [ -n "$cwd" ]; then
  rel="${cwd#"$project_dir"/}"
  case "$rel" in
    apps/*)     ws="${rel#apps/}";         ws="${ws%%/*}" ;;
    packages/*) ws="pkg:${rel#packages/}"; ws="${ws%%/*}" ;;
  esac
fi

# ── Fin de fenêtre quota (resets_at = epoch Unix OU ISO8601) → "jour HH:MM" ──
fin() {
  local v="$1"; { [ -z "$v" ] || [ "$v" = "0" ] || [ "$v" = "null" ]; } && return
  local ts; if [[ "$v" =~ ^[0-9]+$ ]]; then ts="$v"; else ts=$(date -d "$v" +%s 2>/dev/null || echo 0); fi
  [ "${ts:-0}" -gt 0 ] && TZ='Europe/Paris' date -d "@$ts" '+%a %H:%M' 2>/dev/null
}

# ── Bloc quota générique : label · % · fin ──
quota() { # $1=label $2=tokens_pct $3=reset $4=window_s
  if [ -n "$2" ] && [ "$2" != "null" ]; then
    local tk; tk=$(printf '%.0f' "$2")
    local ts; ts=$(to_ts "$3"); local now; now=$(date +%s)
    local c val
    if [ -n "$ts" ] && [ "$ts" -gt 0 ] && [ "$4" -gt 0 ]; then
      local rem=$(( ts - now )); [ "$rem" -lt 0 ] && rem=0; [ "$rem" -gt "$4" ] && rem="$4"
      local tm=$(( (($4 - rem) * 100) / $4 ))         # temps écoulé %
      c=$(col_rythme "$tk" "$tm"); val=$(printf '%s%%/%s%%' "$tk" "$tm")
    else
      c=$(col "$tk"); val=$(printf '%s%%' "$tk")       # repli : pas de reset → seuil absolu
    fi
    printf '%s%s%s%s:%s%s' "$c" "$1" "$RST" "$DIM" "$val" "$RST"  # label coloré (rythme), ":" + valeurs en dim
    local f; f=$(fin "$3"); [ -n "$f" ] && printf ' %s(-> %s)%s' "$DIM" "$f" "$RST"
  else
    printf '%s%s:-- (active /usage)%s' "$DIM" "$1" "$RST"
  fi
}

# ── Rendu ──
L=" ${CYN}🐼ag-front${RST}${SEP}${CYN}${model}${RST}"
[ -n "$branch" ] && L+=" ${MAG}${branch}${RST}"
[ -n "$ws" ]     && L+=" ${DIM}·${RST} ${YLW}${ws}${RST}"
L+="${SEP}$(col "$ctx")ctx${RST}${DIM}:${ctx}%${RST} ${DIM}${used_k}k/${size_k}k${RST}"
L+=" ${DIM}cache:${RST}$(col "$((100 - cache))")${cache}%${RST}"
L+="${SEP}$(quota 5h "$rl5_pct" "$rl5_reset" "$W5")"
L+="${SEP}$(quota 7d "$rl7_pct" "$rl7_reset" "$W7")"
printf '%s\n' "$L"
