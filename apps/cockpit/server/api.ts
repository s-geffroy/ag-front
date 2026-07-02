import express, { type NextFunction, type Request, type Response, type Router } from 'express';
import { z } from 'zod';
import { ContradictionReport } from '@ag/schema/cockpit';
import {
  itemSchemas,
  mutateCollection,
  readState,
  writeCollection,
  type ItemCollectionName,
} from './store';
import { chokepointsClient } from './chokepoints';
import type { ChokepointsClient } from '@ag/chokepoints';
import {
  InvalidSlugError,
  isContentType,
  listContent,
  readContent,
  readContentSource,
} from './content';
import { listReferences, readReference } from './reference';
import { ContradictionError, runContradiction } from './llm/contradiction';
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

  // --- Read-API "Explorateur" (internal, Tailscale-only) -----------------------------------------
  // Server-side proxy over EVERY Chokepoints Read API endpoint so the cockpit console can consult the
  // full read surface. Namespaced under /explore to avoid the /chokepoints/:id route above. Uses the
  // read_tainted token from env (restricted records never reach a public surface — ADR 0013). Text
  // endpoints (JSONL export) are handled separately; the rest return JSON.
  const explore = express.Router();
  const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
  const num = (v: unknown): number | undefined => {
    const n = typeof v === 'string' ? Number(v) : NaN;
    return Number.isFinite(n) ? n : undefined;
  };
  const proxy =
    (handler: (c: ChokepointsClient, req: Request) => Promise<unknown>) =>
    async (req: Request, res: Response) => {
      const client = chokepointsClient();
      if (!client) {
        res.status(503).json({ error: 'chokepoints_api_unconfigured' });
        return;
      }
      try {
        res.json(await handler(client, req));
      } catch (err) {
        // Never echo upstream URLs/messages (may embed the tailnet host); log server-side.
        console.error('[cockpit] explore upstream error', req.path, err);
        // Propagate an upstream 4xx (e.g. 404 = record absent / endpoint not yet shipped) distinctly
        // so the UI doesn't mask a genuine outage as "not found". Everything else → 502.
        const m = err instanceof Error ? err.message : '';
        const up = /→ HTTP (\d{3})/.exec(m);
        const code = up ? Number(up[1]) : 0;
        res.status(code >= 400 && code < 500 ? code : 502).json({ error: 'upstream' });
      }
    };

  // Collection + reference endpoints (no path param).
  explore.get('/health', proxy((c) => c.getHealth()));
  explore.get('/actors', proxy((c) => c.listActors()));
  explore.get('/relations', proxy((c) => c.listRelations()));
  explore.get('/sources', proxy((c) => c.listSources()));
  explore.get('/vocabularies', proxy((c) => c.getVocabularies()));
  explore.get('/strategic-systems', proxy((c) => c.listStrategicSystems()));
  explore.get('/strategic-systems/:id', proxy((c, req) => c.getStrategicSystem(req.params.id)));
  explore.get('/episodes', proxy((c) => c.listEpisodes()));
  explore.get('/episodes/:key', proxy((c, req) => c.getEpisode(req.params.key)));
  explore.get('/alerts', proxy((c, req) => c.listAlerts({ review_status: str(req.query.status), limit: 200 })));
  explore.get('/analytics/results', proxy((c, req) => c.listAnalyticsResults({ engine_id: str(req.query.engine_id), limit: 200 })));
  explore.get('/analytics/engine-runs', proxy((c, req) => c.listEngineRuns(str(req.query.engine_id))));
  explore.get('/chokepoint-analyses', proxy((c) => c.listChokepointAnalyses()));
  explore.get('/chokepoint-analyses/:id', proxy((c, req) => c.getChokepointAnalysisDetail(req.params.id)));

  // /chokepoints/* — literal-second-segment routes MUST precede the :id ones.
  explore.get('/chokepoints/search', proxy((c, req) => c.searchChokepoints({ q: str(req.query.q) ?? '', limit: 50 })));
  explore.get('/chokepoints/nearby', proxy((c, req) => c.nearbyChokepoints({ lat: num(req.query.lat) ?? 0, lon: num(req.query.lon) ?? 0, radius_km: num(req.query.radius_km), limit: 50 })));
  explore.get('/chokepoints/by-flow/:flow', proxy((c, req) => c.chokepointsByFlow(req.params.flow)));
  explore.get('/chokepoints/by-risk/:risk', proxy((c, req) => c.chokepointsByRisk(req.params.risk)));
  explore.get('/chokepoints/by-system/:system', proxy((c, req) => c.chokepointsBySystem(req.params.system)));
  explore.get('/chokepoints/:id/fiche', proxy((c, req) => c.getChokepointFiche(req.params.id)));
  explore.get('/chokepoints/:id/actors', proxy((c, req) => c.getChokepointActors(req.params.id)));
  explore.get('/chokepoints/:id/analysis', proxy((c, req) => c.getChokepointAnalysis(req.params.id)));
  explore.get('/chokepoints/:id/event-signals', proxy((c, req) => c.getChokepointEventSignals(req.params.id, 100)));
  explore.get('/chokepoints/:id/perception-signals', proxy((c, req) => c.getChokepointPerceptionSignals(req.params.id, 100)));
  // CVI assessment: endpoint not yet in v0.2.0 → client throws → proxy returns 502; the UI treats it
  // as "not shipped yet" (see producer brief). Kept so it lights up the moment the producer ships it.
  explore.get('/chokepoints/:id/cvi-assessment', proxy((c, req) => c.getChokepointCviAssessment(req.params.id)));

  // JSONL export — raw text stream (not JSON).
  explore.get('/exports/jsonl', async (_req: Request, res: Response) => {
    const client = chokepointsClient();
    if (!client) {
      res.status(503).json({ error: 'chokepoints_api_unconfigured' });
      return;
    }
    try {
      res.type('application/x-ndjson').send(await client.exportJsonl());
    } catch (err) {
      console.error('[cockpit] explore jsonl upstream error', err);
      res.status(502).json({ error: 'upstream' });
    }
  });

  r.use('/explore', explore);

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

  // --- Internal reference library (Outils → Référence) -------------------------------------------
  // Read-only methodology docs (tailnet-only, never built by the public site). Distinct from the
  // editorial pipeline above: no publication gate, no public link, no contradiction pass.
  r.get('/reference', (_req: Request, res: Response) => {
    res.json(listReferences());
  });

  r.get('/reference/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doc = await readReference(req.params.slug);
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

  // --- Editorial contradiction / red team (ADR 0039) ---------------------------------------------
  // Run an adversarial LLM pass over a document. The result is a CANDIDATE pending human validation:
  // it never mutates the canonical content and never auto-clears the `contradiction_done` gate. One
  // report per document (keyed by `${type}/${slug}`); a new run replaces the previous report.
  r.post(
    '/contradictions/:type/:slug/run',
    async (req: Request, res: Response, next: NextFunction) => {
      const { type, slug } = req.params;
      if (!isContentType(type)) {
        res.status(404).json({ error: 'unknown content type' });
        return;
      }
      try {
        const src = await readContentSource(type, slug);
        if (!src) {
          res.status(404).json({ error: 'not found' });
          return;
        }
        const { analysis, model } = await runContradiction({
          contentType: type,
          title: src.title,
          body: src.body,
        });
        const report = ContradictionReport.parse({
          ...analysis,
          doc_id: `${type}/${slug}`,
          content_type: type,
          slug,
          title: src.title,
          model,
          status: 'pending',
          generated_at: new Date().toISOString(),
        });
        await mutateCollection('contradictions', (list) => {
          const arr = list as z.infer<typeof ContradictionReport>[];
          return [...arr.filter((r) => r.doc_id !== report.doc_id), report];
        });
        res.status(201).json(report);
      } catch (err) {
        if (err instanceof InvalidSlugError) {
          res.status(400).json({ error: 'invalid slug' });
          return;
        }
        if (err instanceof ContradictionError) {
          // Don't echo upstream/LLM messages to the client; log server-side instead.
          console.error('[cockpit] contradiction run failed', err);
          res.status(502).json({ error: 'contradiction_failed' });
          return;
        }
        next(err);
      }
    },
  );

  // Mark a document's contradiction report as reviewed (or back to pending). Human acknowledgement
  // only — this is NOT the `contradiction_done` quality gate, which stays a separate manual decision.
  r.put(
    '/contradictions/:type/:slug/review',
    async (req: Request, res: Response, next: NextFunction) => {
      const { type, slug } = req.params;
      const docId = `${type}/${slug}`;
      const body = z.object({ status: z.enum(['pending', 'reviewed']) }).safeParse(req.body);
      if (!body.success) {
        res.status(400).json({ error: 'validation', issues: body.error.issues });
        return;
      }
      try {
        let updated: z.infer<typeof ContradictionReport> | undefined;
        await mutateCollection('contradictions', (list) => {
          const arr = list as z.infer<typeof ContradictionReport>[];
          return arr.map((r) => {
            if (r.doc_id !== docId) return r;
            updated = {
              ...r,
              status: body.data.status,
              reviewed_at: body.data.status === 'reviewed' ? new Date().toISOString() : undefined,
            };
            return updated;
          });
        });
        if (!updated) {
          res.status(404).json({ error: 'not found' });
          return;
        }
        res.json(updated);
      } catch (err) {
        respond(err, res, next);
      }
    },
  );

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
