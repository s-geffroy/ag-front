---
name: thinking-theory-of-constraints
description: Use when analysing a chokepoint or a flow network where one node dominates throughput — identify the binding chokepoint, what to subordinate to it, the bypass that elevates it, and the next constraint it shifts to downstream.
license: Adapted from cc-thinking-skills (MIT) — see LICENSE.txt
---

# Theory of Constraints (Goldratt's Five Focusing Steps)

## Overview

A flow is only as strong as its weakest link. Strengthening any other link does nothing for
throughput until the binding constraint is addressed.

**Core principle:** in any route or supply network, **one** node sets the ceiling. Effort spent
anywhere else is wasted motion until that node is relieved — and once it is, the ceiling moves to
the *next* node. This is the grammar of a chokepoint.

This skill is an **analytical lens** for reasoning about chokepoint objects, their flows, and their
relations. It does not improve measurement accuracy on its own — it structures the analysis so the
binding constraint, its substitutes, and its downstream shift are made explicit and sourced.

## When to use

- Characterising a chokepoint: *what flow does it bind, and how hard?*
- Comparing a chokepoint against its substitution/bypass alternatives.
- Mapping `systemic relations`: which chokepoint becomes binding once another is relieved or closed.
- Prioritising attention across a corridor with several candidate chokepoints.

## When NOT to use

- A single object with no flow network behind it — there is no "constraint to move".
- You are asserting a *fact* about capacity or closure without a validated source. ToC structures the
  reasoning; it never manufactures evidence. Seeds remain **candidates pending human validation**.
- You need navigational or legal precision. Geometry and capacity here are **schematic** unless a
  validated source says otherwise.

## The Five Focusing Steps

### Step 1 — Identify the constraint

Find the single node that binds the flow: highest utilisation relative to capacity, no viable
near-term substitute, largest realised impact if disrupted.

```
Flow: Persian Gulf crude → world markets
Candidate constraints: Strait of Hormuz, Bab-el-Mandeb, Suez/SUMED
Binding constraint: Strait of Hormuz — ~all Gulf seaborne crude transits it; no full bypass at volume.
```

### Step 2 — Exploit the constraint

Get the most flow through the binding node **without new capacity** — operational measures only.

```
Hormuz exploited: convoy scheduling, escort/insurance arrangements, tidal/draught optimisation,
de-conflicting traffic. Throughput defended at constant physical capacity.
Record as: operational mitigations, distinct from structural bypass.
```

### Step 3 — Subordinate everything else

Pace the rest of the network to the constraint; do not locally optimise upstream/downstream nodes in
a way the constraint cannot absorb.

```
Upstream loading terminals and downstream refining are paced to what Hormuz can pass.
Over-building loading capacity that Hormuz cannot clear buys nothing — it just grows the queue
(stockpiles, floating storage) ahead of the constraint.
```

### Step 4 — Elevate the constraint

Only after exploitation is exhausted, **add capacity or routes** — this is the chokepoint's
`substitution / bypass` field.

```
Hormuz elevated by bypass infrastructure:
- East–West (Petroline) pipeline to the Red Sea (Yanbu)
- Habshan–Fujairah pipeline to the Gulf of Oman (bypasses the strait entirely)
Each bypass has its own capacity ceiling and its own exposure — record as candidate substitutes,
with sourced capacity, not as equivalents.
```

### Step 5 — Prevent inertia: the constraint moves

Once the binding node is relieved, the ceiling shifts. The new binding node is a **systemic
relation** of the first, not a separate unrelated object.

```
Route crude around Hormuz via the Red Sea → Bab-el-Mandeb and the Suez Canal / SUMED become
the binding constraints. Relieving one chokepoint promotes its neighbour.
Capture this as a `systemic relation`: Hormuz --(bypass shifts load to)--> Bab-el-Mandeb / Suez.
```

## Analysis template

```markdown
## Flow under analysis
[Commodity / cargo / data flow, origin → destination, volume basis, source]

## 1. Binding constraint
[Node + why binding: utilisation, absence of substitute, realised impact — each sourced]

## 2. Exploit (no new capacity)
[Operational measures that defend throughput at constant capacity]

## 3. Subordinate
[What the rest of the network must pace to; where queues/stockpiles build]

## 4. Elevate (substitution / bypass)
[Candidate bypasses, each with sourced capacity ceiling + its own exposure]

## 5. Next constraint (systemic relation)
[Which node binds once this one is relieved; record the relation explicitly]

## Evidence status
[Validated sources vs. candidate seeds — priority (P0…) only where human-validated]
```

## Common patterns

| Pattern | Reasoning |
|---|---|
| **The phantom bypass** | A "substitute" route is logged as relieving a chokepoint, but its own capacity is far below the flow. It elevates nothing at volume — record the ceiling, don't imply equivalence. |
| **Optimising a non-constraint** | Investing in a node that isn't binding (extra terminal capacity, faster loading) while the strait is unchanged — throughput is unmoved; the queue just relocates. |
| **The moved constraint** | Mitigation "solves" a chokepoint on paper but the load lands on a neighbour. If the analysis stops at step 4, the systemic relation is missed. |

## Verification checklist

- [ ] Named **one** binding constraint, with sourced reason (utilisation / no substitute / impact)
- [ ] Separated *exploit* (operational, constant capacity) from *elevate* (new capacity / bypass)
- [ ] Stated what subordinates to the constraint and where queues/stockpiles accumulate
- [ ] Listed substitution/bypass candidates with **sourced** capacity ceilings, not assumed equivalence
- [ ] Identified the **next** binding constraint and recorded it as a `systemic relation`
- [ ] Marked evidence status: validated source vs. candidate seed; no unsourced priority promotion

## Data-integrity guardrails

This skill produces **derived analysis** over canonical records. It MUST NOT mutate canonical data.
Constraint rankings, bypass capacities, and systemic relations are **candidates** until backed by a
sourced, human-validated record; priority promotion (P0…) follows the same rule as everywhere in the
project. Capacities and geometry are **schematic** unless a validated source states otherwise — never
imply navigational or legal precision. See [[thinking-leverage-points]] for *where* to intervene once
the binding constraint is identified.

## Key questions

- "Which single node sets the ceiling on this flow — and what sources say so?"
- "Am I optimising the constraint, or a node that doesn't bind?"
- "Is this 'bypass' actually at volume, or just nominal?"
- "If this chokepoint is relieved, which neighbour binds next?"

> "A chain is only as strong as its weakest link." — E. M. Goldratt, *The Goal*
