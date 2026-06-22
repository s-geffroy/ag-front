---
name: thinking-leverage-points
description: Use when deciding where to intervene to reduce dependence on a chokepoint — rank candidate measures (stockpiles/buffers → routing → rules/policy → goals/energy-mix → paradigm) by Meadows' hierarchy and pick the highest feasible leverage.
license: Adapted from cc-thinking-skills (MIT) — see LICENSE.txt
---

# Leverage Points (Meadows' Hierarchy)

## Overview

Donella Meadows' "Places to Intervene in a System" ranks intervention points by their power to change
behaviour. Most effort goes into low-leverage moves (stockpiles, quotas, parameters) when
higher-leverage points (routing, rules, goals, paradigm) shift behaviour with far less force.

**Core principle:** higher in the hierarchy = more leverage, but more resistance. To reduce a flow's
dependence on a chokepoint, find the **highest leverage point you can actually move** — not the easiest.

This skill is an **analytical lens** for reasoning about chokepoint mitigation and substitution. It
structures the question "where should pressure be applied?"; it does not, by itself, assert that any
mitigation works — that needs sourced, human-validated evidence.

## When to use

- A flow is over-exposed to one chokepoint and you are weighing what would actually reduce that exposure.
- Cataloguing a chokepoint's `substitution / bypass` options and want to rank them by real effect.
- Repeated low-level measures (bigger stockpiles, tweaked quotas) keep failing to reduce dependence.

## When NOT to use

- You have not yet identified the binding constraint — use [[thinking-theory-of-constraints]] first;
  you cannot rank interventions on a flow you have not mapped.
- A single low-level measure genuinely is the answer (a real buffer shortfall) — just record it; don't
  manufacture a paradigm shift.
- You are asserting an intervention's effect as fact without a source. The ranking is **analysis**;
  effects remain candidates pending human validation.

## The hierarchy, applied to chokepoint dependence (low → high leverage)

### 12 · Parameters & quotas — LOWEST
Numbers: tariff/toll levels, quota volumes, days-of-cover targets.
```
Raise the strategic-stock target from 60 to 90 days. Buys time during a closure; dependence on the
chokepoint is unchanged once stocks draw down. Leverage: very low — masks exposure.
```

### 11 · Buffers — stockpiles & floating storage
Stabilising stocks ahead of the chokepoint.
```
Larger SPR / floating storage absorbs a spike but does not move the flow off the strait.
Bigger buffer = more slack, slower signal. Leverage: low.
```

### 10 · Stock-and-flow structure — routing & terminals
Physical architecture of the flow: which routes, terminals, and pipelines connect origin to market.
```
Bring a bypass pipeline or an alternative terminal online (Habshan–Fujairah, a new LNG berth).
Re-routes load off the chokepoint within the existing trade. Leverage: medium — real, structural,
but capital-heavy and slow.
```

### 9 · Delays — lead times
Time lags: pipeline build time, vessel re-routing lead time, terminal ramp-up.
```
Shorten the time to swing volume onto an alternative route. Many "we have no option" problems are
really "the option takes 18 months". Leverage: medium.
```

### 8 · Balancing loops — automatic stabilisers
Negative feedback that counteracts disruption.
```
Coordinated stock releases, surge-routing agreements, insurance/escort mechanisms that trigger on a
closure. Strengthening them dampens the shock. Leverage: medium-high.
```

### 7 · Reinforcing loops — amplifiers
Positive feedback that compounds.
```
A diversification loop: each new alternative route lowers cost/risk of the next, which attracts more
volume off the chokepoint. Controlling the gain controls the trajectory. Leverage: high.
```

### 6 · Information flows — visibility
Surfacing a signal that was hidden.
```
Publish real-time transit/closure and divert-capacity data where buyers can act on it. A market that
can see exposure re-routes pre-emptively, without any rule change. Leverage: high.
```

### 5 · Rules — policy & legal regime
What is allowed, required, or rejected at the boundary.
```
Sanctions, transit treaties, the legal regime of the strait (innocent/transit passage), flag rules,
diversification mandates. Change the rule and a whole class of flow behaviour changes. Leverage: high.
```

### 4 · Self-organisation — adaptive capacity
The system's ability to reshape its own routing.
```
A market/fleet that can dynamically re-charter and re-route (flexible LNG cargoes, swing producers)
adapts to a closure instead of breaking. Leverage: very high.
```

### 3 · Goals — what the flow optimises for
The objective the whole system serves.
```
Shift the goal from "cheapest tonne-mile" to "bounded exposure to any single chokepoint". Different
goal → different routes, contracts, and inventory entirely. Leverage: very high.
```

### 2 · Paradigm — shared assumptions
The mindset upstream of goals and structure.
```
"Secure the chokepoint" vs "make the commodity substitutable". Electrification / energy-mix shift
makes a given oil chokepoint progressively irrelevant. Leverage: transformational.
```

### 1 · Transcending paradigms — HIGHEST
Holding that no framing is permanent: knowing when "this strait is irreplaceable" stopped being true.

## Applying it

```markdown
## Flow & chokepoint
[Flow + the binding chokepoint it depends on — from a Theory-of-Constraints pass]

## Current interventions, mapped
| Measure on the table | Hierarchy level | Leverage |
|---|---|---|
| [e.g. raise stock cover] | 12 parameters | very low |
| [e.g. bypass pipeline]   | 10 structure  | medium |

## Move up
For each low-leverage measure: "what is the higher-leverage version?"

## Feasibility vs. leverage
[Higher leverage = more cost/resistance. What can actually be moved now, and how.]

## Chosen leverage point
[Highest feasible point + the resistance to expect]

## Evidence status
[Validated sources vs. candidate seeds; effects are candidates until human-validated]
```

## Common patterns

| Pattern | Reasoning |
|---|---|
| **The stockpile trap** | Endlessly raising days-of-cover (L12/11) when the real fix is a structural reroute (L10) or a goal change (L3). Buffers buy time, never independence. |
| **The information unlock** | A market over-reacts to a chokepoint because exposure/divert-capacity is invisible (L6). Surfacing it corrects behaviour with no new infrastructure. |
| **The goal inversion** | Optimising "cheapest route" reliably re-concentrates flow onto the chokepoint. The leverage is in the goal (L3), not in any single route. |
| **The paradigm shift** | While effort goes into securing a chokepoint (L12–L5), substitution of the commodity (L2) is quietly making it irrelevant. |

## Verification checklist

- [ ] Mapped each candidate measure to a hierarchy level (parameters → paradigm)
- [ ] Asked "what's the higher-leverage version?" for each low-level measure
- [ ] Weighed leverage **against** feasibility/resistance, not leverage alone
- [ ] Selected the highest *feasible* leverage point, with the resistance named
- [ ] Marked evidence status: effects are candidates until sourced and human-validated

## Data-integrity guardrails

This skill produces **derived analysis** over canonical records and MUST NOT mutate canonical data.
Leverage rankings and intervention effects are **candidates** until backed by a sourced,
human-validated record; priority promotion (P0…) follows the project rule. Bypass capacities and
geometry are **schematic** unless a validated source says otherwise — never imply navigational or
legal precision. Run [[thinking-theory-of-constraints]] first to locate the binding constraint, then
use this skill to decide where to intervene.

## Key questions

- "What level of leverage is each proposed measure operating at?"
- "Why hasn't raising the buffer reduced the dependence?"
- "What information, if surfaced, would change behaviour with no new infrastructure?"
- "What rule, goal, or paradigm would make this chokepoint matter less?"

> "People who intervene at the level of paradigm hit a leverage point that totally transforms systems
> … there are no cheap tickets to mastery." — Donella Meadows
