import express, { type NextFunction, type Request, type Response, type Router } from 'express';
import { z } from 'zod';
import {
  itemSchemas,
  readCollection,
  readState,
  writeCollection,
  type ItemCollectionName,
} from './store';

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
      const list = (await readCollection(name)) as { id: string }[];
      const idx = list.findIndex((x) => x.id === item.id);
      if (idx === -1) {
        res.status(404).json({ error: 'not found' });
        return;
      }
      const next = list.slice();
      next[idx] = item;
      await writeCollection(name, next);
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
