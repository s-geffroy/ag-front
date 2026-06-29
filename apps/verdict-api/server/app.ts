// Express app factory (no side effects) so tests can mount it without binding a port. Mirrors
// hdde-api/app.ts (security headers, trust proxy = 1, SPA fallback). See ADR 0041.
import express, { type ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { PACKAGE_ROOT } from './config';
import { getDb } from './db/index';
import { authRouter } from './routers/auth';
import { decisionsRouter } from './routers/decisions';

export function createApp(): express.Express {
  getDb(); // fail fast if the DB can't initialise/migrate

  const app = express();
  app.disable('x-powered-by');
  // Trust EXACTLY one proxy hop (Caddy) — `true` would let a client spoof X-Forwarded-For and defeat
  // the login rate limiter (ADR 0033 / owasp-security).
  app.set('trust proxy', 1);

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; " +
        "object-src 'none'; frame-ancestors 'none'; base-uri 'self'",
    );
    next();
  });

  app.use(express.json({ limit: '256kb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'verdict' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/decisions', decisionsRouter);

  // Serve the built SPA when present (production). In dev the Vite server runs separately.
  const spaDir = join(PACKAGE_ROOT, '..', 'verdict-web', 'dist');
  if (existsSync(spaDir)) {
    app.use(express.static(spaDir));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(join(spaDir, 'index.html'));
    });
  } else if (process.env.APP_ENV === 'production') {
    console.warn(
      `[verdict-api] SPA bundle not found at ${spaDir} — serving API only. ` +
        'Build it first: npm --workspace @ag/verdict-web run build',
    );
  }

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error('[verdict-api] unhandled error', err);
    if (!res.headersSent) res.status(500).json({ error: 'server_error' });
  };
  app.use(onError);

  return app;
}
