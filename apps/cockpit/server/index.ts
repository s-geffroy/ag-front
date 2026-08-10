import express, { type ErrorRequestHandler } from 'express';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiRouter } from './api';

const here = dirname(fileURLToPath(import.meta.url));

// Bind to loopback by default; Tailscale serve fronts it with tailnet-only HTTPS (ADR 0005).
const HOST = process.env.HOST ?? '127.0.0.1';
const PORT = Number(process.env.PORT ?? 8787);

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use('/api', createApiRouter());
// Any unmatched /api/* request must fail as JSON 404 — never fall through to the SPA HTML below
// (a stale server returning index.html makes the client's res.json() throw a cryptic SyntaxError).
app.use('/api', (_req, res) => res.status(404).json({ error: 'unknown api route' }));

// Plaquette review at maximum fidelity (ADR 0073).
//
// The reviewer must see the page a prospect would see, not a re-render of it. So the cockpit mounts
// the BUILT public page at its own real path, `/plaquette`, together with `/_astro` — the built site's
// absolute asset URLs then resolve unchanged, and the download links inside the page work too.
//
// Two mounts, tried in order, because the publication gate physically moves the page out of `dist/`
// when it is unpublished (see apps/public/integrations/plaquette.mjs). Both directories hold the same
// bytes; only their location encodes whether the deck is live.
//
// No path collision: the cockpit SPA is Vite-built and serves its own assets from `/assets`, never
// `/_astro`, and it has no `/plaquette` route. These mounts precede the SPA catch-all, so they win.
//
// Links from the previewed page to other public routes (`/offres`, `/contact`) fall through to the
// cockpit SPA. That is a known and accepted edge of the preview: what is under review is the plaquette
// page and the deck it links to, not the surrounding site.
// Resolved PER REQUEST, not at boot. Publishing moves the page between these two directories while
// the server is running, so a boot-time `existsSync` pins the cockpit to whichever state happened to
// exist at startup — and then every publish silently 404s until someone restarts the service.
const plaquetteDirs = [
  resolve(here, '../../public/dist/plaquette'),
  resolve(here, '../../public/.plaquette-preview'),
];
const plaquetteHandlers = plaquetteDirs.map((d) => express.static(d, { fallthrough: true }));
app.use('/plaquette', (req, res, next) => {
  let i = 0;
  const tryNext = (): void => {
    while (i < plaquetteDirs.length && !existsSync(plaquetteDirs[i]!)) i += 1;
    if (i >= plaquetteDirs.length) {
      next();
      return;
    }
    plaquetteHandlers[i++]!(req, res, tryNext);
  };
  tryNext();
});

const publicAstroAssets = resolve(here, '../../public/dist/_astro');
app.use('/_astro', (req, res, next) => {
  if (!existsSync(publicAstroAssets)) {
    next();
    return;
  }
  express.static(publicAstroAssets)(req, res, next);
});

// In production, also serve the built SPA. In dev, dist is absent and Vite serves the front end.
const dist = resolve(here, '../dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(resolve(dist, 'index.html')));
}

// Terminal error handler: handlers call next(err); never leak a stack trace to the client.
const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[cockpit] unhandled error', err);
  if (!res.headersSent) res.status(500).json({ error: 'internal' });
};
app.use(onError);

app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`[cockpit] listening on http://${HOST}:${PORT}`);
});
