import { randomUUID } from 'node:crypto';
import express, { type NextFunction, type Request, type Response, type Router } from 'express';
import { z } from 'zod';
import {
  ContradictionReport,
  JudgeGateVerdict,
  JudgeReport,
  judgeableMunichControls,
  ValidationEntry,
  type Deliverable,
} from '@ag/schema/cockpit';
import {
  itemSchemas,
  mutateCollection,
  readCollection,
  readState,
  writeCollection,
  type ItemCollectionName,
} from './store';
import { chokepointsClient } from './chokepoints';
import { ChokepointsApiError, type AnalysisDoc, type ChokepointsClient } from '@ag/chokepoints';
import {
  InvalidSlugError,
  isContentType,
  listContent,
  readContent,
  readContentSource,
} from './content';
import { listReferences, readReference } from './reference';
import { ContradictionError, runContradiction } from './llm/contradiction';
import { JudgeError, runJudge } from './llm/judge';
import { resolveGateValidation } from './validate';
import { resolvePublish, touchPublishPending, writePublishFlag } from './publish';
import {
  addUploads,
  getUpload,
  listUploads,
  removeUpload,
  UploadMeta,
  uploadHandler,
  uploadPath,
} from './uploads';

// Content folder (reader/URL) → deliverable type key (quality_gates.json / deliverables). ADR 0068.
const CONTENT_TO_DELIVERABLE_TYPE = {
  atlas: 'atlas_fiche',
  dossiers: 'dossier',
  notes: 'note',
} as const;

// Body of POST /deliverables/:id/validate. `validated_by` is required (nominative act, ADR 0046) —
// the client supplies it (defaulted from config.operator, confirmed per action), never the server.
const ValidateBody = z.object({
  target_kind: z.enum(['gate', 'munich', 'cvi']),
  target_id: z.string(),
  decision: z.enum(['validated', 'rejected']),
  reserve: z.string().optional(),
  validated_by: z.string().min(1),
  judge_verdict_snapshot: JudgeGateVerdict.optional(),
});

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
  // read_tainted token from env (restricted records never reach a public surface — ADR 0013), which is
  // why /chokepoints/:id/perception-signals works here and nowhere else. Text endpoints (JSONL export,
  // raw Markdown) go through `proxyText`; the rest return JSON.
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
        // Propagate an upstream 4xx (404 = record absent, 403 = wrong scope) distinctly, so the UI
        // never masks a genuine outage as "not found" — nor a 403 as an empty dataset. Else → 502.
        const status = err instanceof ChokepointsApiError ? err.status : 0;
        res.status(status >= 400 && status < 500 ? status : 502).json({ error: 'upstream' });
      }
    };

  // Collection + reference endpoints (no path param).
  explore.get(
    '/health',
    proxy((c) => c.getHealth()),
  );
  explore.get(
    '/actors',
    proxy((c) => c.listActors()),
  );
  explore.get(
    '/relations',
    proxy((c) => c.listRelations()),
  );
  explore.get(
    '/sources',
    proxy((c) => c.listSources()),
  );
  explore.get(
    '/vocabularies',
    proxy((c) => c.getVocabularies()),
  );
  explore.get(
    '/strategic-systems',
    proxy((c) => c.listStrategicSystems()),
  );
  explore.get(
    '/strategic-systems/:id',
    proxy((c, req) => c.getStrategicSystem(req.params.id)),
  );
  explore.get(
    '/episodes',
    proxy((c) => c.listEpisodes()),
  );
  explore.get(
    '/episodes/:key',
    proxy((c, req) => c.getEpisode(req.params.key)),
  );
  explore.get(
    '/alerts',
    proxy((c, req) => c.listAlerts({ review_status: str(req.query.status), limit: 200 })),
  );
  explore.get(
    '/analytics/results',
    proxy((c, req) => c.listAnalyticsResults({ engine_id: str(req.query.engine_id), limit: 200 })),
  );
  explore.get(
    '/analytics/engine-runs',
    proxy((c, req) => c.listEngineRuns(str(req.query.engine_id))),
  );
  explore.get(
    '/chokepoint-analyses',
    proxy((c) => c.listChokepointAnalyses()),
  );
  explore.get(
    '/chokepoint-analyses/:id',
    proxy((c, req) => c.getChokepointAnalysisDetail(req.params.id)),
  );
  // Global-scope engine: one ENA row over the WHOLE relation graph, not per-corridor (ADR 0057).
  explore.get(
    '/analytics/system-resilience',
    proxy((c) => c.getSystemResilience()),
  );
  // SFIM prescription layer (ADR 0054). The SFUs are authored in the ag-back workbench, not computed.
  explore.get(
    '/strategic-flows',
    proxy((c) => c.listStrategicFlows()),
  );
  explore.get(
    '/strategic-flows/:id/verdict',
    proxy((c, req) => c.getStrategicFlowVerdict(req.params.id)),
  );
  explore.get(
    '/strategic-flows/:id/fiche',
    proxy((c, req) => c.getStrategicFlowFiche(req.params.id)),
  );
  // Derived candidate graph (ADR 0065) — NOT canonical, distinct from /relations.
  explore.get(
    '/derived/relations',
    proxy((c, req) =>
      c.listDerivedRelations({
        relation_type: str(req.query.relation_type),
        to_status: str(req.query.to_status),
        from_object_id: str(req.query.from_object_id),
        limit: num(req.query.limit) ?? 500,
      }),
    ),
  );
  explore.get(
    '/exports/geojson',
    proxy((c) => c.exportGeoJson()),
  );

  // /chokepoints/* — literal-second-segment routes MUST precede the :id ones.
  explore.get(
    '/chokepoints/search',
    proxy((c, req) => c.searchChokepoints({ q: str(req.query.q) ?? '', limit: 50 })),
  );
  explore.get(
    '/chokepoints/nearby',
    proxy((c, req) =>
      c.nearbyChokepoints({
        lat: num(req.query.lat) ?? 0,
        lon: num(req.query.lon) ?? 0,
        radius_km: num(req.query.radius_km),
        limit: 50,
      }),
    ),
  );
  explore.get(
    '/chokepoints/by-flow/:flow',
    proxy((c, req) => c.chokepointsByFlow(req.params.flow)),
  );
  explore.get(
    '/chokepoints/by-risk/:risk',
    proxy((c, req) => c.chokepointsByRisk(req.params.risk)),
  );
  explore.get(
    '/chokepoints/by-system/:system',
    proxy((c, req) => c.chokepointsBySystem(req.params.system)),
  );
  explore.get(
    '/chokepoints/:id/fiche',
    proxy((c, req) => c.getChokepointFiche(req.params.id)),
  );
  explore.get(
    '/chokepoints/:id/actors',
    proxy((c, req) => c.getChokepointActors(req.params.id)),
  );
  explore.get(
    '/chokepoints/:id/analysis',
    proxy((c, req) => c.getChokepointAnalysis(req.params.id)),
  );
  explore.get(
    '/chokepoints/:id/event-signals',
    proxy((c, req) => c.getChokepointEventSignals(req.params.id, 100)),
  );
  explore.get(
    '/chokepoints/:id/perception-signals',
    proxy((c, req) => c.getChokepointPerceptionSignals(req.params.id, 100)),
  );
  // 8 named 0–5 dimensions; a dimension with no engine input is omitted, never fabricated. The 0–100
  // aggregate is gated on a documented methodology and is never served (ADR 0049).
  explore.get(
    '/chokepoints/:id/cvi-assessment',
    proxy((c, req) => c.getChokepointCviAssessment(req.params.id)),
  );

  // Text endpoints (NDJSON stream, raw Markdown). Same taint gate, different content type.
  const proxyText =
    (contentType: string, handler: (c: ChokepointsClient, req: Request) => Promise<string>) =>
    async (req: Request, res: Response) => {
      const client = chokepointsClient();
      if (!client) {
        res.status(503).json({ error: 'chokepoints_api_unconfigured' });
        return;
      }
      try {
        res.type(contentType).send(await handler(client, req));
      } catch (err) {
        console.error('[cockpit] explore text upstream error', req.path, err);
        const status = err instanceof ChokepointsApiError ? err.status : 0;
        res.status(status >= 400 && status < 500 ? status : 502).json({ error: 'upstream' });
      }
    };

  explore.get(
    '/exports/jsonl',
    proxyText('application/x-ndjson', (c) => c.exportJsonl()),
  );
  explore.get(
    '/derived/relation-graph',
    proxyText('text/markdown', (c) => c.getDerivedRelationGraph()),
  );
  // `doc` is interpolated into the upstream path unencoded by the client, so allowlist it here rather
  // than forwarding arbitrary user input into a URL.
  const ANALYSIS_DOCS: readonly AnalysisDoc[] = [
    'synthesis',
    'theory-of-constraints',
    'leverage-points',
  ];
  explore.get(
    '/chokepoint-analyses/:id/:doc',
    (req: Request, res: Response, next: NextFunction) => {
      if (!ANALYSIS_DOCS.includes(req.params.doc as AnalysisDoc)) {
        res.status(404).json({ error: 'unknown_doc' });
        return;
      }
      next();
    },
    proxyText('text/markdown', (c, req) =>
      c.getChokepointAnalysisDoc(req.params.id, req.params.doc as AnalysisDoc),
    ),
  );

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

  // --- Editorial LLM judge / pré-validation (ADR 0068) -------------------------------------------
  // Run a per-gate CANDIDATE verdict pass over a document. Complement to the red team: it PREPARES the
  // human's decision (pass/fail/uncertain per gate), it never takes it. The result never mutates the
  // canonical content and never auto-clears a gate — a human clicks and a journal entry is written
  // (see /deliverables/:id/validate). One report per document; a new run replaces the previous one.
  r.post('/judgements/:type/:slug/run', async (req: Request, res: Response, next: NextFunction) => {
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
      // Build the gate list: the type's rubric gates (quality_gates.json) + the judgeable Munich
      // controls only (6/9/10 are excluded — a model can't verify them from the text, ADR 0068).
      const delivType = CONTENT_TO_DELIVERABLE_TYPE[type];
      const qg = await readCollection('quality_gates');
      const rubric = qg.find((s) => s.type === delivType)?.required_gates ?? [];
      const gates = [
        ...rubric.map((g) => ({
          kind: 'rubric' as const,
          id: g.id,
          label: g.label,
          description: g.description,
        })),
        ...judgeableMunichControls.map((c) => ({
          kind: 'munich' as const,
          id: String(c.n),
          label: c.duty,
          description: c.control,
        })),
      ];
      const { analysis, model } = await runJudge({
        contentType: type,
        title: src.title,
        body: src.body,
        gates,
      });
      const report = JudgeReport.parse({
        ...analysis,
        doc_id: `${type}/${slug}`,
        content_type: type,
        slug,
        title: src.title,
        model,
        status: 'pending',
        generated_at: new Date().toISOString(),
      });
      await mutateCollection('judgements', (list) => {
        const arr = list as z.infer<typeof JudgeReport>[];
        return [...arr.filter((r) => r.doc_id !== report.doc_id), report];
      });
      res.status(201).json(report);
    } catch (err) {
      if (err instanceof InvalidSlugError) {
        res.status(400).json({ error: 'invalid slug' });
        return;
      }
      if (err instanceof JudgeError) {
        console.error('[cockpit] judge run failed', err);
        res.status(502).json({ error: 'judge_failed' });
        return;
      }
      next(err);
    }
  });

  // Mark a document's judge report as reviewed (or back to pending). Human acknowledgement only —
  // NOT a gate validation, which goes through /deliverables/:id/validate.
  r.put(
    '/judgements/:type/:slug/review',
    async (req: Request, res: Response, next: NextFunction) => {
      const { type, slug } = req.params;
      const docId = `${type}/${slug}`;
      const body = z.object({ status: z.enum(['pending', 'reviewed']) }).safeParse(req.body);
      if (!body.success) {
        res.status(400).json({ error: 'validation', issues: body.error.issues });
        return;
      }
      try {
        let updated: z.infer<typeof JudgeReport> | undefined;
        await mutateCollection('judgements', (list) => {
          const arr = list as z.infer<typeof JudgeReport>[];
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

  // --- Nominative gate validation + append-only journal (ADR 0046 / 0068) ------------------------
  // The single human act that turns a candidate into a fact: ticks ONE gate (or Munich control) on a
  // deliverable AND records who/when/reserve in the append-only validation journal. The journal is
  // written FIRST so a gate is never ticked without a nominative record. `compliance_done` is refused
  // unless all 10 Munich controls are already `ok`. One click per gate — the client sends one target.
  r.post('/deliverables/:id/validate', async (req: Request, res: Response, next: NextFunction) => {
    const body = ValidateBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: 'validation', issues: body.error.issues });
      return;
    }
    const { target_kind, target_id, decision, reserve, validated_by, judge_verdict_snapshot } =
      body.data;

    try {
      const deliverables = await readCollection('deliverables');
      const current = deliverables.find((d) => d.id === req.params.id);
      if (!current) {
        res.status(404).json({ error: 'not found' });
        return;
      }

      const resolved = resolveGateValidation(current, { target_kind, target_id, decision });
      if (!resolved.ok) {
        res.status(resolved.status).json({ error: resolved.error, target_id });
        return;
      }
      const { isMunich, before, after } = resolved;

      // 1) Append the nominative journal entry FIRST (never a ticked gate without a record).
      const entry = ValidationEntry.parse({
        id: `val_${randomUUID()}`,
        deliverable_id: current.id,
        target_kind,
        target_id,
        decision,
        reserve: reserve ?? '',
        before,
        after,
        judge_verdict_snapshot,
        validated_by,
        validated_at: new Date().toISOString(),
      });
      await mutateCollection('validation_journal', (list) => {
        const arr = list as z.infer<typeof ValidationEntry>[];
        return [...arr, entry];
      });

      // 2) Reflect the decision on the deliverable (tick on validate, un-tick on reject).
      let deliverable = current;
      await mutateCollection('deliverables', (list) => {
        const arr = list as Deliverable[];
        return arr.map((d) => {
          if (d.id !== current.id) return d;
          deliverable = isMunich
            ? { ...d, munich: { ...(d.munich ?? {}), [target_id]: after as 'ok' | 'todo' } }
            : { ...d, gates: { ...d.gates, [target_id]: after as boolean } };
          return deliverable;
        });
      });

      res.status(201).json({ entry, deliverable });
    } catch (err) {
      respond(err, res, next);
    }
  });

  // --- One-click publish (ADR 0069) --------------------------------------------------------------
  // Flip the PUBLIC content file's publication flag (published/draft), gated on all validation gates of
  // the linked deliverable, and journal the act (target_kind 'publication'). Touches a sentinel the host
  // watcher polls to rebuild + ship. Never edits the body; the cockpit never runs the build itself.
  r.post('/publish/:type/:slug', async (req: Request, res: Response, next: NextFunction) => {
    const { type, slug } = req.params;
    if (!isContentType(type)) {
      res.status(404).json({ error: 'unknown content type' });
      return;
    }
    const body = z
      .object({
        decision: z.enum(['publish', 'unpublish']),
        validated_by: z.string().min(1),
        reserve: z.string().optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: 'validation', issues: body.error.issues });
      return;
    }
    try {
      const deliverables = await readCollection('deliverables');
      const resolved = resolvePublish(deliverables, type, slug, body.data.decision);
      if (!resolved.ok) {
        res.status(resolved.status).json({ error: resolved.error, missing: resolved.missing });
        return;
      }
      const publish = body.data.decision === 'publish';
      const { before, after } = await writePublishFlag(type, slug, publish);
      await touchPublishPending();
      const entry = ValidationEntry.parse({
        id: `val_${randomUUID()}`,
        deliverable_id: resolved.deliverableId ?? `${type}/${slug}`,
        target_kind: 'publication',
        target_id: `${type}/${slug}`,
        decision: publish ? 'validated' : 'rejected',
        reserve: body.data.reserve ?? '',
        before,
        after,
        validated_by: body.data.validated_by,
        validated_at: new Date().toISOString(),
      });
      await mutateCollection('validation_journal', (list) => {
        const arr = list as z.infer<typeof ValidationEntry>[];
        return [...arr, entry];
      });
      res.status(201).json({ published: after, entry, pending_rebuild: true });
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
