import express, { type NextFunction, type Request, type Response, type Router } from 'express';
import { z } from 'zod';
import {
  itemSchemas,
  mutateCollection,
  readState,
  writeCollection,
  type ItemCollectionName,
} from './store';
import { chokepointsClient } from './chokepoints';
import { InvalidSlugError, isContentType, readContent } from './content';

/**
 * Read + narrow-write API over the E-light JSON model. No auth: the cockpit is reachable only on
 * the tailnet (Tailscale serve), never public (ADR 0005). Inputs are still zod-validated and the
 * collection name is allowlisted, so a bad/hostile payload can't corrupt data or traverse the FS.
 */
export function createApiRouter(): Router {
  const r = express.Router();

  r.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  r.get('/state', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await readState());
    } catch (err) {
      next(err);
    }
  });

  // Internal chokepoints exploration (read_tainted, Tailscale-only). Server-side proxy keeps the token
  // off the client and restricted data off the public surface.
  r.get('/chokepoints', async (req: Request, res: Response, next: NextFunction) => {
    const client = chokepointsClient();
    if (!client) {
      res.status(503).json({ error: 'chokepoints_api_unconfigured' });
      return;
    }
    try {
      const priority = typeof req.query.priority === 'string' ? req.query.priority : undefined;
      res.json(await client.listChokepoints({ priority_class: priority, limit: 500 }));
    } catch (err) {
      next(err);
    }
  });

  r.get('/chokepoints/:id', async (req: Request, res: Response) => {
    const client = chokepointsClient();
    if (!client) {
      res.status(503).json({ error: 'chokepoints_api_unconfigured' });
      return;
    }
    try {
      res.json(await client.getChokepoint(req.params.id));
    } catch (err) {
      // Don't echo upstream URLs/messages to the client; log server-side instead.
      console.error('[cockpit] chokepoint detail upstream error', err);
      res.status(502).json({ error: 'upstream' });
    }
  });

  // Read a candidate editorial artifact (atlas / dossier / note) so it can be reviewed in the
  // cockpit before publication. Read-only; type allowlisted and slug format-checked in readContent.
  r.get('/content/:type/:slug', async (req: Request, res: Response, next: NextFunction) => {
    const { type, slug } = req.params;
    if (!isContentType(type)) {
      res.status(404).json({ error: 'unknown content type' });
      return;
    }
    try {
      const doc = await readContent(type, slug);
      if (!doc) {
        res.status(404).json({ error: 'not found' });
        return;
      }
      res.json(doc);
    } catch (err) {
      if (err instanceof InvalidSlugError) {
        res.status(400).json({ error: 'invalid slug' });
        return;
      }
      next(err);
    }
  });

  // Whole-scorecard write (metric values are edited together).
  r.put('/metrics', async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await writeCollection('metrics', req.body));
    } catch (err) {
      respond(err, res, next);
    }
  });

  // Update a single item by id in an id-addressable collection.
  r.put('/:collection/:id', async (req: Request, res: Response, next: NextFunction) => {
    const name = req.params.collection;
    if (!isItemCollection(name)) {
      res.status(404).json({ error: `unknown collection "${name}"` });
      return;
    }
    try {
      const item = itemSchemas[name].parse(req.body) as { id: string };
      if (item.id !== req.params.id) {
        res.status(400).json({ error: 'body id does not match URL id' });
        return;
      }
      // Atomic read-modify-write under a file lock — safe against a concurrent lead-api write.
      let found = false;
      await mutateCollection(name, (list) => {
        const arr = list as { id: string }[];
        const idx = arr.findIndex((x) => x.id === item.id);
        if (idx === -1) return arr;
        found = true;
        const next = arr.slice();
        next[idx] = item;
        return next;
      });
      if (!found) {
        res.status(404).json({ error: 'not found' });
        return;
      }
      res.json(item);
    } catch (err) {
      respond(err, res, next);
    }
  });

  return r;
}

function isItemCollection(name: string): name is ItemCollectionName {
  return Object.prototype.hasOwnProperty.call(itemSchemas, name);
}

function respond(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof z.ZodError) {
    res.status(400).json({ error: 'validation', issues: err.issues });
    return;
  }
  next(err as Error);
}
