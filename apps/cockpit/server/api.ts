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
import { InvalidSlugError, isContentType, listContent, readContent } from './content';
import {
  addUploads,
  getUpload,
  listUploads,
  removeUpload,
  UploadMeta,
  uploadHandler,
  uploadPath,
} from './uploads';

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

  // Review index: every editorial artifact (published + candidates) with its validation state.
  r.get('/content', (_req: Request, res: Response) => {
    res.json(listContent());
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

  // --- Source deposits (uploaded evidence files) --------------------------------------------------
  r.post('/uploads', (req: Request, res: Response, next: NextFunction) => {
    uploadHandler.array('files', 10)(req, res, (err: unknown) => {
      if (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : 'upload error' });
        return;
      }
      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      if (files.length === 0) {
        res.status(400).json({ error: 'aucun fichier' });
        return;
      }
      const meta = UploadMeta.safeParse({
        deliverable_id: req.body?.deliverable_id || undefined,
        note: req.body?.note || undefined,
      });
      if (!meta.success) {
        res.status(400).json({ error: 'métadonnée invalide' });
        return;
      }
      try {
        res.status(201).json(addUploads(files, meta.data, new Date().toISOString()));
      } catch (e) {
        next(e as Error);
      }
    });
  });

  r.get('/uploads', (req: Request, res: Response) => {
    const did = typeof req.query.deliverable_id === 'string' ? req.query.deliverable_id : undefined;
    res.json(listUploads(did));
  });

  r.get('/uploads/:id/raw', (req: Request, res: Response, next: NextFunction) => {
    const entry = getUpload(req.params.id);
    if (!entry) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    // Force download (never inline): a stored HTML file can't run on the cockpit origin.
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.download(uploadPath(entry), entry.original_name, (err) => {
      if (err && !res.headersSent) next(err as Error);
    });
  });

  r.delete('/uploads/:id', (req: Request, res: Response) => {
    if (!removeUpload(req.params.id)) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    res.json({ removed: true });
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
