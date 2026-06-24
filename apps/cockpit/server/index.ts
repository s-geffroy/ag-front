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
