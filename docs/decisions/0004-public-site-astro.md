# 0004 — Public site stack = Astro

**Status:** Accepted · 2026-06-22 · supersedes the "open" public-stack item in `docs/PLAN.md`

## Context

`apps/public` (`www.applied-geopolitics.com`) is a **content-driven, SEO-sensitive, French-primary**
B2B site: Atlas fiches, dossiers (incl. PDF), notes, CVI method, tiered offers, lead capture. The pack
left the stack undecided; candidates were Astro (SSG), Next.js, and React+Vite (same as cockpit).

## Decision

Use **Astro** (SSG + content collections). Editorial content lives as **MD/MDX versioned in git**;
content-collection schemas derive from `@ag/schema/content`. Interactivity (e.g. an Atlas map) is added
as islands only where needed.

Rejected: **React+Vite SPA** — client-rendered, weak for SEO, the site's core asset. **Next.js** —
SSR runtime and weight unjustified for a mostly-static content site.

## Consequences

- Strong SEO/perf, cheap static hosting, content reviewable via git.
- A second framework alongside the cockpit's React — mitigated by sharing **`@ag/tokens`** and
  `@ag/schema`, not React components (see ADR 0008).
- Lead capture posts to a self-hosted endpoint (ADR 0006), not an Astro server runtime.
