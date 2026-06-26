// Express app factory (no side effects) so tests can mount it without binding a port.
import express, { type ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { PACKAGE_ROOT } from './config';
import { getDb } from './db/index';
import { getPack } from './pack';
import { authRouter } from './routers/auth';
import { packRouter } from './routers/pack';
import { casesRouter } from './routers/cases';
import { usageRouter } from './routers/usage';

export function createApp(): express.Express {
  // Fail fast if the domain pack or DB can't initialise.
  getDb();
  const pack = getPack();

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true); // behind Caddy

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });

  app.use(express.json({ limit: '256kb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', pack: pack.id, pack_version: pack.version });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/pack', packRouter);
  app.use('/api/cases', casesRouter);
  app.use('/api/usage', usageRouter);

  // Serve the built SPA when present (production). In dev the Vite server runs separately.
  const spaDir = join(PACKAGE_ROOT, '..', 'hdde-web', 'dist');
  if (existsSync(spaDir)) {
    app.use(express.static(spaDir));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(join(spaDir, 'index.html'));
    });
  }

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error('[hdde-api] unhandled error', err);
    if (!res.headersSent) res.status(500).json({ error: 'server_error' });
  };
  app.use(onError);

  return app;
}
