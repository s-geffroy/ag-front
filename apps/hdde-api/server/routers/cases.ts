// All case-scoped routes (api_contract.md). A shared loadCase middleware enforces ownership isolation
// (an analyst sees only their cases; owner_admin sees all — ADR 0033).
import { Router, type Response, type NextFunction } from 'express';
import {
  CaseInput,
  CasePatch,
  InterviewAnswerInput,
  EvidenceInput,
  RedTeamRunInput,
  CaseEntityInput,
  CaseEntityPatch,
} from '@ag/schema/hdde';
import { z } from 'zod';
import { requireAuth, isAdmin, type AuthedRequest } from '../auth/middleware';
import { getPack } from '../pack';
import { buildEnterpriseDiagnostic, bumpVerdict } from '../engine';
import type { EngineAnswer, EntityLike, DimensionEvidence, Verdict } from '../engine';
import { deriveFlowVulnerability, fetchCorridorCvi } from '../integrations/cvi';
import { suggestChokepoints } from '../integrations/chokepoints';
import { runPersona, RedTeamError } from '../llm/openai';
import { computeCost } from '../llm/pricing';
import { renderExports } from '../exports/render';
import { diffPackets } from '../lib/diff';
import { config } from '../config';
import * as repo from '../db/repo';

export const casesRouter = Router();
casesRouter.use(requireAuth);

// Express 4 does NOT forward rejected promises from async handlers to the error middleware, so an
// unexpected throw would hang the request instead of returning a 500. Wrap async handlers to route
// their rejections to next() → onError (owasp-security / A10).
type AsyncHandler = (req: CaseRequest, res: Response, next: NextFunction) => Promise<unknown>;
const wrap =
  (fn: AsyncHandler) => (req: CaseRequest, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

interface CaseRequest extends AuthedRequest {
  caseRow?: Record<string, unknown>;
}

function loadCase(req: CaseRequest, res: Response, next: NextFunction): void {
  const row = repo.getCase(req.params.id);
  if (!row) {
    res.status(404).json({ error: 'case_not_found' });
    return;
  }
  if (row.owner_id !== req.user!.id && !isAdmin(req)) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }
  req.caseRow = row;
  next();
}

/** Critical-flow type answered in the interview (drives chokepoints enrichment). */
function flowTypeFromAnswers(rows: Record<string, unknown>[]): string | undefined {
  const a = rows.find((r) => r.question_id === 'critical_flow_type');
  const token = (a?.normalized_answer as string | null) ?? (a?.raw_answer as string | undefined);
  return token ? String(token).trim().toLowerCase() : undefined;
}

function toEngineAnswers(rows: Record<string, unknown>[]): EngineAnswer[] {
  return rows.map((r) => ({
    question_id: String(r.question_id),
    raw_answer: String(r.raw_answer ?? ''),
    normalized_answer: (r.normalized_answer as string | null) ?? null,
    answer_type: r.answer_type as EngineAnswer['answer_type'],
    evidence_quality: Number(r.evidence_quality ?? 0),
  }));
}

// ----------------------------------------------------------------- cases
casesRouter.post('/', (req: AuthedRequest, res) => {
  const parsed = CaseInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid', issues: parsed.error.flatten() });
    return;
  }
  res.status(201).json(repo.createCase(req.user!.id, parsed.data));
});

casesRouter.get('/', (req: AuthedRequest, res) => {
  res.json(repo.listCases(req.user!.id, isAdmin(req)));
});

casesRouter.get('/:id', loadCase, (req: CaseRequest, res) => {
  res.json(req.caseRow);
});

casesRouter.patch('/:id', loadCase, (req: CaseRequest, res) => {
  const parsed = CasePatch.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid', issues: parsed.error.flatten() });
    return;
  }
  res.json(repo.patchCase(req.params.id, parsed.data));
});

// ----------------------------------------------------------------- interview
casesRouter.get('/:id/interview/answers', loadCase, (req, res) => {
  res.json(repo.listAnswers(req.params.id));
});

casesRouter.post('/:id/interview/answers', loadCase, (req, res) => {
  const parsed = InterviewAnswerInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid', issues: parsed.error.flatten() });
    return;
  }
  res.status(201).json(repo.upsertAnswer(req.params.id, parsed.data));
});

// ----------------------------------------------------------------- enterprise entities (roster)
casesRouter.get('/:id/entities', loadCase, (req, res) => {
  res.json(repo.listEntities(req.params.id));
});

casesRouter.post('/:id/entities', loadCase, (req, res) => {
  const parsed = CaseEntityInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid', issues: parsed.error.flatten() });
    return;
  }
  res.status(201).json(repo.createEntity(req.params.id, parsed.data));
});

casesRouter.patch('/:id/entities/:eid', loadCase, (req, res) => {
  const parsed = CaseEntityPatch.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid', issues: parsed.error.flatten() });
    return;
  }
  const entity = repo.getEntity(req.params.eid);
  if (!entity || entity.case_id !== req.params.id) {
    res.status(404).json({ error: 'entity_not_found' });
    return;
  }
  res.json(repo.patchEntity(req.params.eid, parsed.data));
});

casesRouter.delete('/:id/entities/:eid', loadCase, (req, res) => {
  const entity = repo.getEntity(req.params.eid);
  if (!entity || entity.case_id !== req.params.id) {
    res.status(404).json({ error: 'entity_not_found' });
    return;
  }
  repo.deleteEntity(req.params.eid);
  res.json({ ok: true });
});

// ----------------------------------------------------------------- evidence
casesRouter.get('/:id/evidence', loadCase, (req, res) => {
  res.json(repo.listEvidence(req.params.id));
});

casesRouter.post('/:id/evidence', loadCase, (req, res) => {
  const parsed = EvidenceInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid', issues: parsed.error.flatten() });
    return;
  }
  res.status(201).json(repo.createEvidence(req.params.id, parsed.data));
});

const LinkInput = z.object({
  target_kind: z.enum(['answer', 'dimension', 'pattern']),
  target_ref: z.string().min(1).max(200),
});
casesRouter.post('/:id/evidence/:eid/links', loadCase, (req, res) => {
  const parsed = LinkInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid' });
    return;
  }
  // The evidence must belong to this case — never link evidence across cases (ownership integrity).
  const ev = repo.getEvidence(req.params.eid);
  if (!ev || ev.case_id !== req.params.id) {
    res.status(404).json({ error: 'evidence_not_found' });
    return;
  }
  res
    .status(201)
    .json(
      repo.createEvidenceLink(
        req.params.id,
        req.params.eid,
        parsed.data.target_kind,
        parsed.data.target_ref,
      ),
    );
});

// ----------------------------------------------------------------- diagnostic packets
casesRouter.post('/:id/diagnostic-packets', loadCase, wrap(async (req: CaseRequest, res) => {
  const pack = getPack();
  const answerRows = repo.listAnswers(req.params.id);
  const answers = toEngineAnswers(answerRows);
  const entityRows = repo.listEntities(req.params.id);

  // Resolve the evidence registry into per-dimension evidence so linking proof actually moves the
  // scores/confidence (ADR 0040 follow-up): dimension-targeted links joined to their evidence items.
  const evById = new Map(repo.listEvidence(req.params.id).map((e) => [String(e.id), e]));
  const dimensionEvidence: Record<string, DimensionEvidence[]> = {};
  for (const l of repo.listEvidenceLinks(req.params.id)) {
    if (l.target_kind !== 'dimension') continue;
    const e = evById.get(String(l.evidence_id));
    if (!e) continue;
    (dimensionEvidence[String(l.target_ref)] ??= []).push({
      id: String(e.id),
      reliability: Number(e.reliability) || 0,
      status: String(e.status),
    });
  }

  // Enterprise diagnostic: interview core + per-actor scoring + concentration synthesis (ADR 0036).
  // Pass the visible actor so the divergence narrative names it, and the evidence map (ADR 0040).
  const core = buildEnterpriseDiagnostic(
    pack,
    answers,
    entityRows as unknown as EntityLike[],
    {
      visible_actor_name: (req.caseRow!.critical_actor_name as string | null) ?? null,
      visible_actor_type: (req.caseRow!.critical_actor_type as string | null) ?? null,
    },
    dimensionEvidence,
  );

  // Red-team feedback (ADR 0040 follow-up): an ACCEPTED suggestion can move the verdict — the analyst's
  // acceptance IS the human validation (ADR 0034). Raising takes precedence over lowering (conservative).
  const accepted = repo.listSuggestions(req.params.id).filter((s) => s.status === 'accepted');
  let raise = false;
  let lower = false;
  const redteamReasons: string[] = [];
  for (const s of accepted) {
    const json =
      typeof s.suggestion_json === 'string'
        ? (JSON.parse(s.suggestion_json) as Record<string, unknown>)
        : (s.suggestion_json as Record<string, unknown>);
    const vp = json?.verdict_pressure as
      | { could_raise_verdict?: boolean; could_lower_verdict?: boolean; reason?: string }
      | undefined;
    if (vp?.could_raise_verdict) {
      raise = true;
      redteamReasons.push(vp.reason || 'Pression à la hausse acceptée par l’analyste.');
    } else if (vp?.could_lower_verdict) {
      lower = true;
    }
  }
  const delta = raise ? 1 : lower ? -1 : 0;
  const adjustedVerdict = bumpVerdict(core.operational_verdict as Verdict, delta);

  // CVI enrichment (local, derived candidate — ADR 0035).
  const flowScore =
    core.scores.find((s) => s.dimension_id === 'flow_criticality_score')?.value ?? 0;

  // Chokepoint candidates for the critical flow (read scope, ADR 0035) — persisted in the packet so
  // VERDICT prefills from the single HDDE contract (ADR 0042). Graceful: empty when the API is off.
  const flowType = flowTypeFromAnswers(answerRows);
  const chk = await suggestChokepoints(flowType);
  const chokepoints = chk.candidates.map((k) => ({
    id: k.id,
    name: k.canonical_name,
    note: [k.family, k.priority_class].filter(Boolean).join(' · ') || undefined,
  }));

  // Per-corridor multi-dimension CVI for the most relevant chokepoint (read scope, ADR 0035). Candidate
  // pending validation; null when the API doesn't serve one — VERDICT then just skips the CVI branch.
  const corridorCvi = chk.candidates[0] ? await fetchCorridorCvi(chk.candidates[0].id) : null;

  const packetPayload = {
    ...core,
    operational_verdict: adjustedVerdict,
    redteam_adjustment: {
      applied: delta !== 0,
      from: core.operational_verdict,
      to: adjustedVerdict,
      reasons: redteamReasons,
    },
    cvi: deriveFlowVulnerability(flowScore),
    chokepoints,
    ...(corridorCvi ? { corridor_cvi: corridorCvi } : {}),
  };

  const snapshot = {
    answers: answerRows,
    entities: entityRows,
    generated_at: new Date().toISOString(),
  };
  const packet = repo.createPacket(req.params.id, packetPayload, pack.packHash, snapshot);
  res.status(201).json(packet);
}));

casesRouter.get('/:id/diagnostic-packets', loadCase, (req, res) => {
  res.json(repo.listPackets(req.params.id));
});

casesRouter.get('/:id/diagnostic-packets/:pid', loadCase, (req, res) => {
  const packet = repo.getPacket(req.params.pid);
  if (!packet || packet.case_id !== req.params.id) {
    res.status(404).json({ error: 'packet_not_found' });
    return;
  }
  res.json(packet);
});

casesRouter.post('/:id/diagnostic-packets/:pid/validate', loadCase, (req: CaseRequest, res) => {
  const packet = repo.getPacket(req.params.pid);
  if (!packet || packet.case_id !== req.params.id) {
    res.status(404).json({ error: 'packet_not_found' });
    return;
  }
  res.json(repo.validatePacket(req.params.pid, req.user!.id));
});

casesRouter.get('/:id/diagnostic-packets/:from/diff/:to', loadCase, (req, res) => {
  const from = repo.getPacket(req.params.from);
  const to = repo.getPacket(req.params.to);
  if (!from || !to || from.case_id !== req.params.id || to.case_id !== req.params.id) {
    res.status(404).json({ error: 'packet_not_found' });
    return;
  }
  res.json(
    diffPackets(
      from.packet_json as Parameters<typeof diffPackets>[0],
      to.packet_json as Parameters<typeof diffPackets>[1],
    ),
  );
});

// ----------------------------------------------------------------- exports
casesRouter.post('/:id/diagnostic-packets/:pid/exports', loadCase, (req: CaseRequest, res) => {
  const packet = repo.getPacket(req.params.pid);
  if (!packet || packet.case_id !== req.params.id) {
    res.status(404).json({ error: 'packet_not_found' });
    return;
  }
  const outputs = renderExports(req.caseRow!, {
    packet_json: packet.packet_json as Record<string, unknown>,
    pack_hash: String(packet.pack_hash),
    version_number: Number(packet.version_number),
  });
  res.status(201).json({ files: outputs.map((o) => o.filename), exports: outputs });
});

// ----------------------------------------------------------------- red team
casesRouter.post(
  '/:id/red-team/run',
  loadCase,
  wrap(async (req: CaseRequest, res) => {
  const parsed = RedTeamRunInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid' });
    return;
  }
  const pack = getPack();
  const persona = pack.personas.find((p) => p.id === parsed.data.persona);
  if (!persona) {
    res.status(400).json({ error: 'unknown_persona' });
    return;
  }
  // Per-analyst daily LLM budget — refuse BEFORE spending so one account can't run unbounded paid
  // calls (financial DoS — ADR 0034). UTC day boundary.
  const dayStart = new Date().toISOString().slice(0, 10) + ' 00:00:00';
  const used = repo.usageSinceForUser(req.user!.id, dayStart);
  if (
    (config.llmMaxCallsPerUserPerDay > 0 && used.calls >= config.llmMaxCallsPerUserPerDay) ||
    (config.llmMaxCostPerUserPerDayUsd > 0 && used.cost_usd >= config.llmMaxCostPerUserPerDayUsd)
  ) {
    res.status(429).json({ error: 'llm_budget_exceeded', detail: 'Plafond LLM quotidien atteint.' });
    return;
  }
  // Latest packet (if any) provides the provisional diagnosis to attack.
  const latest = repo.listPackets(req.params.id)[0];
  const c = req.caseRow!;
  // Build the red team using the Chokepoints Read API (ADR 0035): ground objections in the corridors
  // relevant to the case's critical flow. Server-side, read scope, tainted records filtered out.
  const flowType = flowTypeFromAnswers(repo.listAnswers(req.params.id));
  const chk = await suggestChokepoints(flowType);
  const chokepointContext = chk.candidates.map(
    (k) =>
      `${k.canonical_name}${k.family ? ` (${k.family})` : ''}${k.priority_class ? ` — ${k.priority_class}` : ''}`,
  );
  // Enterprise roster summary so the red team attacks the whole company picture (ADR 0036).
  const ents = repo.listEntities(req.params.id);
  const byType = (t: string) => ents.filter((e) => e.entity_type === t);
  const rosterSummary =
    ents.length === 0
      ? ''
      : ` Roster: ${byType('supplier').length} fournisseurs, ${byType('customer').length} clients, ${byType('site').length} sites. ` +
        ents
          .slice(0, 12)
          .map((e) => `${e.name} [${e.entity_type}${e.country ? `, ${e.country}` : ''}]`)
          .join('; ');
  try {
    const { output, usage, model } = await runPersona(persona, {
      chokepointContext,
      caseSummary: `${c.title} (${c.sector}${c.hq_country ? `, HQ ${c.hq_country}` : ''}). Fonction critique: ${c.business_function_at_risk}. ${c.suspected_dependency ?? ''}${rosterSummary}`,
      provisionalDiagnosis: latest
        ? `${(latest.packet_json as Record<string, unknown>).primary_diagnosis} / posture ${latest.operational_verdict}`
        : 'Aucun packet généré.',
      acceptedEvidence: repo
        .listEvidence(req.params.id)
        .filter((e) => e.status === 'accepted' && Number(e.reliability) >= 3)
        .map((e) => `${e.title}: ${e.summary}`),
      // Weak/unverified evidence is a prime attack surface for the red team (was a dead channel).
      weakEvidence: repo
        .listEvidence(req.params.id)
        .filter((e) => e.status !== 'accepted' || Number(e.reliability) <= 2)
        .map((e) => `${e.title}: ${e.summary} (fiabilité ${e.reliability}/5, ${e.status})`),
      openUncertainties: latest
        ? (
            (latest.packet_json as Record<string, unknown>).open_uncertainties as {
              uncertainty: string;
            }[]
          ).map((u) => u.uncertainty)
        : [],
    });
    // Record token usage + cost for real OpenAI calls (facade mode has no usage → no cost).
    if (usage) {
      repo.recordLlmUsage({
        case_id: req.params.id,
        user_id: req.user!.id,
        kind: 'red_team',
        model,
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
        cost_usd: computeCost(model, usage.prompt_tokens, usage.completion_tokens),
      });
    }
    // Persisted as PENDING — a suggestion is never evidence until an analyst accepts it (ADR 0034).
    res.status(201).json(repo.createSuggestion(req.params.id, persona.id, output));
  } catch (e) {
    if (e instanceof RedTeamError) {
      res.status(502).json({ error: 'red_team_failed', detail: e.message });
      return;
    }
    throw e; // routed to onError by wrap()
  }
  }),
);

casesRouter.get('/:id/red-team/suggestions', loadCase, (req, res) => {
  res.json(repo.listSuggestions(req.params.id));
});

const ReviewInput = z.object({ status: z.enum(['accepted', 'rejected']) });
casesRouter.patch('/:id/red-team/suggestions/:sid', loadCase, (req: CaseRequest, res) => {
  const parsed = ReviewInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid' });
    return;
  }
  const suggestion = repo.getSuggestion(req.params.sid);
  if (!suggestion || suggestion.case_id !== req.params.id) {
    res.status(404).json({ error: 'suggestion_not_found' });
    return;
  }
  res.json(repo.reviewSuggestion(req.params.sid, parsed.data.status, req.user!.id));
});

// ----------------------------------------------------------------- enrichment (chokepoints)
casesRouter.get(
  '/:id/enrichment/chokepoints',
  loadCase,
  wrap(async (req, res) => {
    const flowType = typeof req.query.flow_type === 'string' ? req.query.flow_type : undefined;
    const region = typeof req.query.region === 'string' ? req.query.region : undefined;
    res.json(await suggestChokepoints(flowType, region));
  }),
);
