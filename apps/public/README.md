# apps/public

Public site **www.applied-geopolitics.com** — Astro (SSG), French, SEO-oriented.

## Shape

- `src/content/` — editorial content as MD versioned in git: `notes`, `atlas`, `dossiers`
  (schemas in `src/content/config.ts`, mirroring `@ag/schema/content`). Seeds are **candidates
  pending validation**, with sources + confidence.
- `src/pages/` — landing, `atlas/`, `dossiers/`, `notes/` (+ `rss.xml`), `methode-cvi`, `offres`,
  `a-propos`, `contact`, `404`.
- `src/layouts/Base.astro` + `src/components/` — bespoke "admiralty chart" editorial identity
  (Fraunces / Newsreader / Inter / IBM Plex Mono), palette in `src/styles/global.css` +
  `tailwind.config.ts` (the public site owns its palette — it does **not** consume `@ag/tokens`; see
  ADR 0008 / 0031). CVI dimensions on the method page come from `@ag/cvi`.
- SEO: per-page title/description/canonical/OpenGraph, `@astrojs/sitemap`, `robots.txt`, `lang=fr`.

## Commands (Docker-only)

```bash
docker compose -f docker/docker-compose.yml run --rm tools npm --workspace @ag/public run build
docker compose -f docker/docker-compose.yml run --rm tools npm --workspace @ag/public run typecheck
docker compose -f docker/docker-compose.yml run --rm --service-ports tools npm --workspace @ag/public run dev
```

## Deploy

Served by Caddy (auto-HTTPS) on the VPS — see [`docs/public-deploy.md`](../../docs/public-deploy.md)
and [ADR 0010](../../docs/decisions/0010-public-deploy-caddy.md). The contact form POSTs to the
self-hosted lead endpoint (`/api/lead`, reverse-proxied by Caddy to the `lead` service; ADR 0006 / 0011),
falling back to the visitor's mail client if that request fails.
