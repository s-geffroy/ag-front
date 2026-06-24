# 0031 — Public site visual identity = "carte d'état-major" (admiralty chart)

**Status:** Accepted · 2026-06-24 · supersedes [ADR 0030](0030-public-visual-identity.md);
consumes ADR 0008 tokens

## Context

ADR 0030 gave `apps/public` a clean editorial identity adapted from _The Economist's Espresso_ (warm
newsprint, signal-red, structural navy, CVI meter, corridor rail). It was correct but **stayed in the
newsprint register** — a recognisable _Espresso_ clone rather than something native to the product. The
founder asked to **rework the UI entirely** so it is _belle, esthétique, facile à utiliser et
fonctionnelle_, drawing on web references (Espresso, FT/Bloomberg, intelligence platforms à la
Stratfor/Seerist) — while keeping the B2B brief: sober, cold, decision-first, _"la carte sert
l'arbitrage, pas la décoration."_ This was scoped as an assumed **rupture**, not an evolution.

## Decision

Adopt an **"admiralty chart / intelligence-cartography" identity** — a language native to a product
about corridors, chokepoints and flows. Same token architecture as ADR 0030 (so the reskin flips ~25
CSS variables in `src/styles/global.css`, mapped to semantic Tailwind names in `tailwind.config.ts`;
**`@ag/tokens` and the cockpit untouched** per ADR 0008).

- **Palette** — light _"chart paper"_ (cold off-white canvas, blue-black ink, deep teal-navy as
  structural/graticule ink) and a first-class dark _"night-navigation / radar console"_ (deep blue-black
  ground, luminous chart-cyan structural ink). **One decisive accent**, a precise signal **vermilion**
  (the colour of the binding constraint), kept over blue — blue is reserved for the structural layer.
  The **CVI ramp (`--cvi-1..4`, vert→ambre→orange→rouge) is preserved**, re-tuned for contrast on both
  cold grounds; it still doubles as the chokepoint-map legend.
- **Type** — a four-family editorial system: **Fraunces** (variable, display/headings, high character),
  **Newsreader** (variable, long-form reading body — B2B dossiers run 15–25 p.), **Inter** kept for UI
  chrome (nav, buttons, tables), **IBM Plex Mono** for the _instrument layer_ (coordinates, CVI scores,
  datelines, sources). Latin subset + variable files keep the added weight modest.
- **Motifs (functional, never decorative)** — a theme-aware `.bg-graticule` coordinate grid (CSS
  gradient, zero requests) used sparingly (hero, doctrine band, footer — **never over reading columns**),
  and a `ChartFrame.astro` component drawing corner crop-marks with `currentColor`. The signature
  instruments evolve in this language: `CviMeter` → a **framed calibrated gauge** (hairline frame, four
  graduated cells, mono `n/4` read); `CorridorChain` → a **plotted route** (dashed bearing line, diamond
  waypoints, mono sequence numbers, accent terminal node). **Both keep their existing prop APIs**, so all
  call-sites are untouched.
- **Leaflet map** — the only file with real logic. Marker/line/popup colours are no longer hardcoded
  hex; they are **read at runtime from the CSS variables** (`getComputedStyle`), mirroring the static
  legend (P0→`--cvi-4`, P1→`--cvi-3`, P2→`--navy`, P3→`--st-none`; popup meta → `--muted` via a CSS
  class). The existing `MutationObserver` now re-colours markers and lines (not just the basemap) when
  the theme flips.

## Consequences

- The identity is now native to the product (chart, not newspaper) and clearly distinct from the prior
  newsprint, while honouring the cold/decisional brief and the no-decoration rule.
- Reskinning the whole site stays a token-level operation; only `atlas/carte.astro` needed real code.
- **Cost**: four font families (vs two) — mitigated by latin-subset variable files. Source Serif 4 was
  dropped (replaced by Fraunces). Build verified: `astro check` 0 errors; production build 34 pages.
- **Verified light + dark** with `agent-browser` (home, atlas/carte incl. live theme-toggle recolour,
  méthode-CVI gauge, a dossier in Newsreader). Screenshots are a throwaway QA artifact (not committed).
- Reduced-motion is respected (chart-tick/hover transitions disabled under `prefers-reduced-motion`).
- Future content/components keep reusing `CviMeter`, `CorridorChain`, `ChartFrame`, `.eyebrow`,
  `.section-rule`, `.verdict`, `.card-link`, `.bg-graticule` and `btn-*` rather than styling ad hoc.
- **Watch item**: the CVI amber (`--cvi-2`) on cold paper and orange/red on blue-black are the contrast
  edge cases — re-tuned here, to be re-checked if the grounds shift. No free "admiralty" tileset exists;
  the CARTO light/dark basemaps are kept (an optional paper/radar CSS tile filter remains a future polish).
