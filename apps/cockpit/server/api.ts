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
import {
  ChokepointsApiError,
  mayBeTruncated,
  type AnalysisDoc,
  type ChokepointsClient,
} from '@ag/chokepoints';
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
  readStatus as readPlaquetteStatus,
  resolveArtifact as resolvePlaquetteArtifact,
  resolvePlaquettePublish,
  resolvePreviewImage as resolvePlaquettePreviewImage,
  writePublishedFlag as writePlaquettePublishedFlag,
} from './plaquette';
import {
  resolvePromoteFromFeed,
  toPromotedItem,
  writePromotedNews,
  unpromoteNews,
  findParaphrase,
  paraphraseCandidates,
  noteOrigin,
  distinctTitles,
  distinctOutlets,
} from './promote-news';
import { NoteDraftError, draftEditorialNote } from './llm/note-draft';
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
/**
 * Quelques faits internes pour situer l'enjeu d'un corridor — volumes, régime, concentration.
 *
 * Volontairement COURT et défensif : chaque champ est optionnel côté amont, et ce résumé alimente un
 * prompt. Ce qui n'est pas là ne doit pas produire de phrase creuse — on omet la ligne plutôt que
 * d'écrire « inconnu », qu'un modèle pourrait transformer en affirmation.
 */
export function corridorFactSummary(fiche: Record<string, unknown>): string[] {
  const out: string[] = [];
  const flows = fiche.flows as
    | { flow_type?: string; estimated_volume?: number; volume_unit?: string }[]
    | undefined;
  for (const f of (flows ?? []).slice(0, 3)) {
    if (f.flow_type && typeof f.estimated_volume === 'number') {
      out.push(`Flux ${f.flow_type} : ${f.estimated_volume} ${f.volume_unit ?? ''}`.trim());
    }
  }
  const regime = fiche.regime as
    | { operational_state?: string; lifecycle_phase?: string }
    | undefined;
  if (regime?.operational_state) {
    out.push(
      `État opérationnel déclaré : ${regime.operational_state}${regime.lifecycle_phase ? ` (phase ${regime.lifecycle_phase})` : ''}`,
    );
  }
  const conc = fiche.concentration as
    | { score?: number; top_actor_id?: string; top_actor_share?: number }
    | undefined;
  if (typeof conc?.score === 'number') {
    out.push(
      `Concentration du contrôle : score ${conc.score}${conc.top_actor_id ? `, acteur principal ${conc.top_actor_id}` : ''}`,
    );
  }
  const cp = fiche.chokepoint as { priority_class?: string; macro_region?: string } | undefined;
  if (cp?.priority_class) out.push(`Classe de priorité : ${cp.priority_class}`);
  return out.slice(0, 8);
}

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
    proxy((c, req) => c.listEngineRuns(str(req.query.engine_id), num(req.query.limit))),
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
  // CVI "substitution slide" as a live aggregate count (ADR 0076). `scope` is a bounded enum (`core`
  // default); the producer returns population 0 for `bulk`. Derived candidate, never a fact.
  explore.get(
    '/analytics/cvi-counterfactual',
    proxy((c, req) => c.getCviCounterfactual({ scope: str(req.query.scope) })),
  );
  // Live chokepoint news, clusters grouped by event (ADR 0076). Candidates, NEVER confirmed incidents:
  // media coverage is capped at `stress` and never proves a closure. `run_notes` MUST be surfaced.
  explore.get(
    '/news',
    proxy((c, req) =>
      c.listNews({
        since: num(req.query.since),
        limit: num(req.query.limit),
        chokepoint_id: str(req.query.chokepoint_id),
        category: str(req.query.category),
      }),
    ),
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
  // Vue parc (1.7.0) : un DÉCOMPTE DE CATÉGORIES, jamais une moyenne. `objects_without_regime` est
  // servi à côté de la part parce que c'est le seul dénominateur honnête — la majeure partie du
  // noyau n'a aucune évaluation de régime.
  explore.get(
    '/analytics/state-summary',
    proxy((c) => c.getStateSummary()),
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
  // 100 était une troncature muette : l'amont rend exactement ce qu'on demande sans dire qu'il coupe
  // (handoff 0029). On demande le maximum du contrat, et on ANNONCE le doute au lieu de le taire —
  // une liste pleine peut être coupée, une liste courte ne l'est certainement pas.
  const EVENT_SIGNALS_LIMIT = 2000;
  explore.get(
    '/chokepoints/:id/event-signals',
    proxy(async (c, req) => {
      const rows = await c.getChokepointEventSignals(req.params.id, EVENT_SIGNALS_LIMIT);
      return {
        items: rows,
        count: rows.length,
        requested_limit: EVENT_SIGNALS_LIMIT,
        may_be_truncated: mayBeTruncated(rows, EVENT_SIGNALS_LIMIT),
      };
    }),
  );
  explore.get(
    '/chokepoints/:id/perception-signals',
    proxy((c, req) => c.getChokepointPerceptionSignals(req.params.id, 100)),
  );
  // Clusters really linked to one object (ADR 0076). 404 on unknown/tainted-unauthorised, like siblings.
  explore.get(
    '/chokepoints/:id/news',
    proxy((c, req) =>
      c.getChokepointNews(req.params.id, {
        since: num(req.query.since),
        limit: num(req.query.limit),
      }),
    ),
  );
  // 8 named 0–5 dimensions; a dimension with no engine input is omitted, never fabricated. The 0–100
  // aggregate is gated on a documented methodology and is never served (ADR 0049).
  explore.get(
    '/chokepoints/:id/cvi-assessment',
    proxy((c, req) => c.getChokepointCviAssessment(req.params.id)),
  );
  // 1.7.0 — l'état courant d'un objet, avec l'âge de chaque part. Rien n'y est recalculé : six
  // composantes, chacune `observed` | `stale` | `no_data`, et trois pourcentages qui ne se séparent
  // pas. NE SE TRIE PAS entre objets, la réponse le redit dans son champ `comparability`.
  explore.get(
    '/chokepoints/:id/state',
    proxy((c, req) => c.getChokepointState(req.params.id)),
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
          provenance: src.provenance,
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
        provenance: src.provenance,
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

  // --- Plaquette review & publication (ADR 0073) --------------------------------------------------
  // The commercial deck is a PUBLIC artifact, so it crosses candidate → fact the same way an editorial
  // fiche does: a nominative click, journalled, then the host watcher rebuilds. The cockpit never
  // generates the deck (scripts/build-deck.sh does) and never runs the site build.
  r.get('/plaquette', (_req: Request, res: Response) => {
    const status = readPlaquetteStatus();
    if (!status) {
      res.status(404).json({ error: 'no_manifest' });
      return;
    }
    res.json(status);
  });

  r.get('/plaquette/file/:family/:lang/:file', (req: Request, res: Response) => {
    const path = resolvePlaquetteArtifact(req.params.family, req.params.lang, req.params.file);
    if (!path) {
      res.status(404).json({ error: 'unknown artifact' });
      return;
    }
    // inline: the reviewer reads the PDF in the browser's own viewer, which is the closest thing to
    // what a prospect sees when they click the link on the public page.
    res.sendFile(path, { headers: { 'Content-Disposition': 'inline' } });
  });

  r.get('/plaquette/preview/:family/:name', (req: Request, res: Response) => {
    const path = resolvePlaquettePreviewImage(req.params.family, req.params.name);
    if (!path) {
      res.status(404).json({ error: 'unknown preview' });
      return;
    }
    res.sendFile(path);
  });

  r.post('/plaquette/:family/publish', async (req: Request, res: Response, next: NextFunction) => {
    const { family } = req.params;
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
      const status = readPlaquetteStatus();
      const resolved = resolvePlaquettePublish(status, family, body.data.decision);
      if (!resolved.ok) {
        res.status(resolved.status).json({ error: resolved.error });
        return;
      }
      const publish = body.data.decision === 'publish';
      const before = writePlaquettePublishedFlag(family, publish);
      await touchPublishPending();
      const entry = ValidationEntry.parse({
        id: `val_${randomUUID()}`,
        // No deliverable backs a plaquette; the target names itself so the trail stays readable.
        deliverable_id: `plaquette/${family}`,
        target_kind: 'publication',
        target_id: `plaquette/${family}`,
        decision: publish ? 'validated' : 'rejected',
        reserve: body.data.reserve ?? '',
        before,
        after: publish,
        validated_by: body.data.validated_by,
        validated_at: new Date().toISOString(),
      });
      await mutateCollection('validation_journal', (list) => {
        const arr = list as z.infer<typeof ValidationEntry>[];
        return [...arr, entry];
      });
      res.status(201).json({ published: publish, entry, pending_rebuild: true });
    } catch (err) {
      next(err);
    }
  });

  // --- Promote a news cluster to the public Atlas (ADR 0071) --------------------------------------
  // Human promotion of ONE cluster from the cockpit-only /news feed to the public store. Nominative
  // (validated_by), journalled (target_kind 'news_promotion'), and gated on two hard rules: the cluster
  // must be CLEARED (not license_taint) and its reliable fields come from a FRESH server re-fetch, never
  // the client body. Touches the publish sentinel so the host watcher ships it. Never runs the build.
  const CORRIDOR_ID_RE = /^[a-z0-9_]+$/i;

  // --- Brouillon de note pour une promotion (ADR 0079) -------------------------------------------
  // Rend un BROUILLON à réécrire, jamais une phrase publiable : la route de promotion ci-dessous
  // reçoit ce même texte et REFUSE une note qui s'en approche. Le cluster est relu côté serveur —
  // le corps de la requête ne porte qu'un identifiant, jamais du contenu.
  r.post(
    '/promote-news/:corridorId/draft',
    async (req: Request, res: Response, next: NextFunction) => {
      const { corridorId } = req.params;
      if (!CORRIDOR_ID_RE.test(corridorId)) {
        res.status(400).json({ error: 'invalid corridor id' });
        return;
      }
      const body = z
        .object({ cluster_id: z.string().min(1), article_urls: z.array(z.string()).optional() })
        .safeParse(req.body);
      if (!body.success) {
        res.status(400).json({ error: 'validation', issues: body.error.issues });
        return;
      }
      const client = chokepointsClient();
      if (!client) {
        res.status(503).json({ error: 'chokepoints_api_unconfigured' });
        return;
      }
      try {
        const feed = await client.getChokepointNews(corridorId, { limit: 200 });
        const resolved = resolvePromoteFromFeed(feed, {
          cluster_id: body.data.cluster_id,
          article_urls: body.data.article_urls,
        });
        if (!resolved.ok) {
          res.status(resolved.status).json({ error: resolved.error });
          return;
        }
        const c = resolved.cluster;
        // La fiche corridor situe l'enjeu. Son échec ne doit PAS empêcher le brouillon : on rédige
        // alors sur les seuls titres, et le modèle le dit dans cannot_say.
        let corridorFacts: string[] = [];
        let corridorName = corridorId;
        try {
          const fiche = (await client.getChokepointFiche(corridorId)) as Record<string, unknown>;
          corridorFacts = corridorFactSummary(fiche);
          const cp = fiche.chokepoint as { canonical_name?: string } | undefined;
          if (cp?.canonical_name) corridorName = cp.canonical_name;
        } catch (err) {
          console.error('[cockpit] fiche indisponible pour le brouillon', corridorId, err);
        }
        const titles = distinctTitles(c);
        const draft = await draftEditorialNote({
          corridorName,
          titles: titles.map((t) => t.title),
          outlets: distinctOutlets(c),
          countries: [],
          countryUnknown: 0,
          articles: c.article_count ?? (c.articles ?? []).length,
          window: `${c.first_seen ?? '?'} → ${c.last_seen ?? '?'}`,
          salience: c.salience_score ?? undefined,
          eventCategory: c.event_category ?? undefined,
          corridorFacts,
        });
        res.json(draft);
      } catch (err) {
        if (err instanceof NoteDraftError) {
          // Un brouillon absent n'empêche pas de promouvoir : on renvoie 200 avec un draft vide et
          // la raison, plutôt qu'une erreur qui ferait croire que la promotion est bloquée.
          res.json({
            analysis: '',
            draft: '',
            basis: [],
            cannot_say: [`Brouillon indisponible : ${err.message}. Écrivez la phrase directement.`],
            injection_detected: false,
            injection_evidence: '',
          });
          return;
        }
        const status = err instanceof ChokepointsApiError ? err.status : 0;
        if (status === 404) {
          res.status(404).json({ error: 'corridor_not_found' });
          return;
        }
        next(err);
      }
    },
  );

  r.post('/promote-news/:corridorId', async (req: Request, res: Response, next: NextFunction) => {
    const { corridorId } = req.params;
    if (!CORRIDOR_ID_RE.test(corridorId)) {
      res.status(400).json({ error: 'invalid corridor id' });
      return;
    }
    const body = z
      .object({
        cluster_id: z.string().optional(),
        article_urls: z.array(z.string()).optional(),
        validated_by: z.string().min(1),
        // ADR 0074 — the promoter's own framing, required. This is the gate: the model's headline is
        // a summary of article titles, and validating it while having read only those same titles is
        // the defect ag-back named in their 0026 §5 and we conceded.
        editorial_note: z.string().trim().min(1),
        // Le brouillon qui a été MIS SOUS LES YEUX de la personne (ADR 0079). Il entre dans les
        // textes que la note ne doit pas recopier — c'est ce qui empêche le pré-remplissage de
        // vider la règle. Optionnel : une promotion depuis le cockpit peut n'avoir eu aucun
        // brouillon, et son absence ne doit pas bloquer.
        draft: z.string().optional(),
        reserve: z.string().optional(),
      })
      .refine((b) => b.cluster_id || (b.article_urls && b.article_urls.length > 0), {
        message: 'cluster_id or article_urls required',
      })
      .safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: 'validation', issues: body.error.issues });
      return;
    }
    const client = chokepointsClient();
    if (!client) {
      res.status(503).json({ error: 'chokepoints_api_unconfigured' });
      return;
    }
    try {
      // Re-fetch the feed server-side — the reliable fields are taken from THIS, not the client's copy.
      const feed = await client.getChokepointNews(corridorId, { limit: 200 });
      const resolved = resolvePromoteFromFeed(feed, {
        cluster_id: body.data.cluster_id,
        article_urls: body.data.article_urls,
      });
      if (!resolved.ok) {
        res.status(resolved.status).json({ error: resolved.error });
        return;
      }
      // P2 — la note doit ajouter quelque chose (ADR 0074). Recopier le titre satisfaisait la lettre
      // de la règle en la vidant : la porte exigeait une phrase, pas une phrase de plus.
      // Le brouillon ne fait plus partie des textes interdits (ADR 0079 amendé) : le publier tel
      // quel est une décision explicite. Recopier un TITRE reste refusé — c'est un autre problème.
      const echo = findParaphrase(body.data.editorial_note, paraphraseCandidates(resolved.cluster));
      if (echo) {
        res.status(422).json({
          error: 'editorial_note_paraphrase',
          message:
            'Votre phrase reprend un texte déjà présent — dites ce que cette couverture change pour un décideur.',

          echoes: echo.source,
          score: Number(echo.score.toFixed(2)),
        });
        return;
      }

      // Trace, pas friction : la phrase publiée peut être le brouillon intact, et le magasin comme le
      // journal doivent dire laquelle des trois situations s'est produite.
      const origin = noteOrigin(body.data.editorial_note, body.data.draft);
      const item = toPromotedItem(resolved.cluster, {
        promotedBy: body.data.validated_by,
        promotedAt: new Date().toISOString(),
        editorialNote: body.data.editorial_note,
        noteOrigin: origin,
      });
      await writePromotedNews(corridorId, item);
      const entry = ValidationEntry.parse({
        id: `val_${randomUUID()}`,
        deliverable_id: `news/${corridorId}`,
        target_kind: 'news_promotion',
        target_id: item.cluster_id || `news/${corridorId}`,
        decision: 'validated',
        reserve: body.data.reserve ?? '',
        before: false,
        after: true,
        validated_by: body.data.validated_by,
        validated_at: new Date().toISOString(),
        note_origin: origin,
      });
      await mutateCollection('validation_journal', (list) => {
        const arr = list as z.infer<typeof ValidationEntry>[];
        return [...arr, entry];
      });
      res.status(201).json({
        promoted: item,
        entry,
        pending_rebuild: true,
        // Dit quand l'identifiant amont a changé entre l'ouverture de la fenêtre et la validation :
        // la promotion a bien eu lieu, mais par repli sur les URL (voir resolvePromoteFromFeed).
        matched_by: resolved.matchedBy,
      });
    } catch (err) {
      const status = err instanceof ChokepointsApiError ? err.status : 0;
      if (status === 404) {
        res.status(404).json({ error: 'corridor_not_found' });
        return;
      }
      next(err);
    }
  });

  // Unpromote (always allowed — you can always pull something offline). `key` is the itemKey.
  r.delete(
    '/promote-news/:corridorId/:key',
    async (req: Request, res: Response, next: NextFunction) => {
      const { corridorId, key } = req.params;
      if (!CORRIDOR_ID_RE.test(corridorId)) {
        res.status(400).json({ error: 'invalid corridor id' });
        return;
      }
      const body = z.object({ validated_by: z.string().min(1) }).safeParse(req.body);
      if (!body.success) {
        res.status(400).json({ error: 'validation', issues: body.error.issues });
        return;
      }
      try {
        const removed = await unpromoteNews(corridorId, key);
        if (!removed) {
          res.status(404).json({ error: 'not_promoted' });
          return;
        }
        const entry = ValidationEntry.parse({
          id: `val_${randomUUID()}`,
          deliverable_id: `news/${corridorId}`,
          target_kind: 'news_promotion',
          target_id: key,
          decision: 'rejected',
          before: true,
          after: false,
          validated_by: body.data.validated_by,
          validated_at: new Date().toISOString(),
        });
        await mutateCollection('validation_journal', (list) => {
          const arr = list as z.infer<typeof ValidationEntry>[];
          return [...arr, entry];
        });
        res.status(200).json({ unpromoted: true, entry, pending_rebuild: true });
      } catch (err) {
        next(err);
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
