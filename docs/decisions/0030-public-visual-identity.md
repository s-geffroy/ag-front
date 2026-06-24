# 0030 — Public site visual identity = editorial "strategic-briefing"

**Status:** Superseded by [ADR 0031](0031-public-visual-identity-admiralty-chart.md) · 2026-06-24
(originally Accepted · 2026-06-22 · refined the visual layer of ADR 0004; consumes ADR 0008 tokens)

> **Superseded.** The editorial _Espresso_ register below was a clean first identity but read as a
> newsprint clone. ADR 0031 keeps the same token architecture, signature instruments and no-decoration
> brief, but breaks to an **"admiralty chart" / intelligence-cartography** language (cold chart-paper
> light + radar-console dark, a four-family editorial type system, functional chart motifs). The
> structural facts recorded here (token isolation per ADR 0008, CVI-meter/corridor-chain as reusable
> signatures, CVI ramp doubling as the map legend) remain true.

## Context

`apps/public` shipped functional but **templated**: uniform grey rounded cards, a single navy accent
doing every job, arrow-links, and — most costly — the **CVI** (the product's core IP) rendered as a
plain text pill. The brand brief demands sobriety (serious B2B, decision-oriented, _"the map serves
arbitration, not decoration"_). The site needed a distinctive identity that stays inside that brief.
Reference chosen with the founder: **The Economist's _Espresso_** (editorial daily-briefing register).

## Decision

Adopt an **editorial strategic-briefing identity**, adapted (not cloned) from _Espresso_:

- **Palette** — warm newsprint canvas; one decisive **signal-red accent** anchored in the project's
  own vulnerability/critique red (the colour of a binding constraint), _not_ Economist vermilion;
  maritime **navy kept as structural ink** for the corridor motif. Defined in `apps/public` CSS
  variables only (`src/styles/global.css` + `tailwind.config.ts`) — **`@ag/tokens` and the cockpit are
  untouched** (ADR 0008).
- **Type** — Source Serif 4 (display) + Inter (body) + a **mono instrument layer** (system mono) for
  datelines, section tags, scores and source counts. No new font dependency.
- **Signature** — a **calibrated CVI vulnerability meter** (`CviMeter.astro`, bas→critique segmented
  ramp) reused wherever a corridor is scored, and a **corridor chain rail** (`CorridorChain.astro`)
  rendering the doctrine as an instrumented line ending in an accent node at _Décisions_. Both are
  structural/informational, satisfying the no-decorative-chrome rule.
- Hairline rules + mono section labels (Espresso dividers); near-square cards; quiet accent focus ring.

Applied across **all 17 pages** and shared components (Header masthead, Footer, EntryCard, Pill).

## Consequences

- Vulnerability is now read at a glance everywhere; decision-relevant metadata (access tier, date,
  confidence, sources, priority) is surfaced on cards and fiche headers — _belle et utile_.
- The CVI ramp doubles as the chokepoint-map priority legend, so colour means the same thing site-wide.
- Light/dark both verified; `astro check` 0 errors; production build 17 pages. Screenshots are a
  throwaway QA artifact (not committed).
- Future content/components must reuse `CviMeter`, `CorridorChain`, `.eyebrow`, `.section-rule`,
  `.verdict`, `.card-link`, and `btn-*` rather than re-styling ad hoc.
