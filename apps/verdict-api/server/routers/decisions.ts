// Decision dossiers router — the VERDICT cockpit API. Mirrors the hdde-api cases router patterns
// (ownership middleware, wrap(), zod safeParse on every body). Scoring + audit run through @ag/verdict.
import { Router, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import {
  DEFAULT_WEIGHTS,
  computeRawScore,
  computeAdjustedScore,
  auditDecision,
  buildCandidates,
} from '@ag/verdict';
import {
  DecisionVerdict,
  DecisionConfidence,
  OptionType,
  PestelCategory,
  SwotQuadrant,
  CriteriaValues,
  WeightProfile,
  TruthTest,
  RedFlag,
} from '@ag/schema/verdict';
import { requireAuth, isAdmin, type AuthedRequest } from '../auth/middleware';
import {
  createDecision, getDecision, listDecisions, patchDecision,
  upsertOption, listOptions, deleteOption,
  upsertScore, listScores,
  createPestel, listPestel, createSwot, listSwot, setItemStatus, deleteItem,
  createAuditSnapshot, latestAudit, buildAuditInput,
  listSuggestions, ingestCandidates,
  createSuggestion, reviewSuggestion, recordLlmUsage, usageSinceForUser,
} from '../db/repo';
import { fetchLatestPacket } from '../integrations/hdde';
import { runRedTeam, RedTeamError, llmAvailable, type RedTeamRunResult } from '../llm/openai';
import type { RedTeamRole, VerdictRedTeamContext } from '../llm/verdict-prompts';
import { computeCost } from '../llm/pricing';
import { renderDecisionExports } from '../exports/render';
import { config } from '../config';

export const decisionsRouter = Router();
decisionsRouter.use(requireAuth);

/** Wrap an async handler so thrown errors reach the error middleware instead of hanging the request. */
function wrap(fn: (req: AuthedRequest, res: Response) => Promise<void> | void) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

/** Ownership guard: load :id and 403 unless the caller owns it (admins see all). */
function loadDecision(req: AuthedRequest, res: Response, next: NextFunction): void {
  const decision = getDecision(req.params.id);
  if (!decision) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  if (decision.owner_id !== req.user!.id && !isAdmin(req)) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }
  (req as AuthedRequest & { decision?: unknown }).decision = decision;
  next();
}

function badRequest(res: Response, issues: unknown): void {
  res.status(400).json({ error: 'invalid', issues });
}

// ----------------------------------------------------------------- decisions CRUD
const CreateDecision = z.object({
  title: z.string().trim().min(1).max(300),
  client_name: z.string().max(300).nullable().optional(),
  sector: z.string().max(200).optional(),
  situation: z.string().max(5000).optional(),
});

decisionsRouter.post('/', wrap((req, res) => {
  const parsed = CreateDecision.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.issues);
  res.status(201).json(createDecision(req.user!.id, parsed.data));
}));

decisionsRouter.get('/', wrap((req, res) => {
  res.json(listDecisions(req.user!.id, isAdmin(req)));
}));

// Patchable decision fields (the "verdict page"). JSON-typed fields validated then serialised.
const PatchDecision = z.object({
  title: z.string().min(1).max(300).optional(),
  client_name: z.string().max(300).nullable().optional(),
  sector: z.string().max(200).optional(),
  status: z.enum(['draft', 'in_review', 'arbitrated', 'archived']).optional(),
  situation: z.string().max(5000).optional(),
  proposed_verdict: DecisionVerdict.nullable().optional(),
  final_verdict: DecisionVerdict.nullable().optional(),
  selected_option_id: z.string().max(120).nullable().optional(),
  confidence: DecisionConfidence.nullable().optional(),
  stop_threshold: z.string().max(1000).nullable().optional(),
  review_date: z.string().max(40).nullable().optional(),
  human_validation: z.boolean().optional(),
  why_faire_not_tester: z.string().max(2000).nullable().optional(),
  defer_reason: z.string().max(2000).nullable().optional(),
  reopening_signal: z.string().max(2000).nullable().optional(),
  abandonment_disposition: z.string().max(2000).nullable().optional(),
  truth_test: TruthTest.nullable().optional(),
  red_flags: z.array(RedFlag).optional(),
});

decisionsRouter.get('/:id', loadDecision, wrap((req, res) => {
  const id = req.params.id;
  res.json({
    decision: getDecision(id),
    pestel: listPestel(id),
    swot: listSwot(id),
    options: listOptions(id),
    scores: listScores(id),
    audit: latestAudit(id) ?? null,
    red_team: listSuggestions(id),
  });
}));

decisionsRouter.patch('/:id', loadDecision, wrap((req, res) => {
  const parsed = PatchDecision.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.issues);
  const { truth_test, red_flags, ...rest } = parsed.data;
  const patch: Record<string, unknown> = { ...rest };
  if (truth_test !== undefined) patch.truth_test_json = truth_test === null ? null : JSON.stringify(truth_test);
  if (red_flags !== undefined) patch.red_flags_json = JSON.stringify(red_flags);
  res.json(patchDecision(req.params.id, patch));
}));

// ----------------------------------------------------------------- weight profile
decisionsRouter.put('/:id/weight-profile', loadDecision, wrap((req, res) => {
  const parsed = WeightProfile.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.issues);
  res.json(patchDecision(req.params.id, { weight_profile_json: JSON.stringify(parsed.data) }));
}));

// ----------------------------------------------------------------- options (temps D)
const OptionBody = z.object({
  option_id: z.string().trim().min(1).max(120),
  type: OptionType,
  title: z.string().min(1).max(300),
  description: z.string().max(4000).optional(),
  critical_hypothesis: z.string().max(2000).optional(),
  main_evidence: z.string().max(2000).optional(),
  main_contradiction: z.string().max(2000).optional(),
  proof_level: z.number().int().min(0).max(5).optional(),
  canvas: z.record(z.string(), z.string()).optional(),
  status: z.enum(['candidate', 'validated', 'rejected']).optional(),
});

decisionsRouter.put('/:id/options', loadDecision, wrap((req, res) => {
  const parsed = OptionBody.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.issues);
  res.json(upsertOption(req.params.id, parsed.data));
}));

decisionsRouter.delete('/:id/options/:optionId', loadDecision, wrap((req, res) => {
  deleteOption(req.params.id, req.params.optionId);
  res.json({ ok: true });
}));

// ----------------------------------------------------------------- scoring (temps C)
const ScoreBody = z.object({
  criteria: CriteriaValues,
  penalties: z.array(z.object({ points: z.number(), reason: z.string().optional() })).optional(),
  caps: z.array(z.object({ max_score: z.number(), active: z.boolean().optional(), reason: z.string().optional() })).optional(),
  adjustment_reasons: z.array(z.string()).optional(),
});

decisionsRouter.put('/:id/options/:optionId/score', loadDecision, wrap((req, res) => {
  const parsed = ScoreBody.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.issues);
  const decision = getDecision(req.params.id)!;
  const wp = decision.weight_profile_json
    ? (JSON.parse(decision.weight_profile_json as string).weights as Record<string, number>)
    : DEFAULT_WEIGHTS;
  const raw = computeRawScore(parsed.data.criteria, wp);
  const adjusted = computeAdjustedScore(raw, parsed.data.penalties ?? [], parsed.data.caps ?? []);
  // Default adjustment_reasons to the penalty reasons when not provided explicitly.
  const reasons =
    parsed.data.adjustment_reasons ??
    (parsed.data.penalties ?? []).map((p) => p.reason).filter((r): r is string => Boolean(r));
  res.json(
    upsertScore(req.params.id, {
      option_id: req.params.optionId,
      criteria: parsed.data.criteria,
      raw_score: raw,
      adjusted_score: adjusted,
      adjustment_reasons: reasons,
    }),
  );
}));

// ----------------------------------------------------------------- PESTEL (temps E) + SWOT (temps R)
const PestelBody = z.object({
  category: PestelCategory,
  statement: z.string().min(1).max(2000),
  decisional_impact: z.string().max(2000).optional(),
  uncertainty: z.string().max(2000).optional(),
});
decisionsRouter.post('/:id/pestel', loadDecision, wrap((req, res) => {
  const parsed = PestelBody.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.issues);
  res.status(201).json(createPestel(req.params.id, { ...parsed.data, status: 'validated', source_kind: 'manual' }));
}));

const SwotBody = z.object({
  quadrant: SwotQuadrant,
  statement: z.string().min(1).max(2000),
  is_hypothesis: z.boolean().optional(),
});
decisionsRouter.post('/:id/swot', loadDecision, wrap((req, res) => {
  const parsed = SwotBody.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.issues);
  res.status(201).json(createSwot(req.params.id, { ...parsed.data, status: 'validated', source_kind: 'manual' }));
}));

// Validate / reject / delete a candidate (PESTEL or SWOT).
const StatusBody = z.object({ status: z.enum(['candidate', 'validated', 'rejected']) });
const KIND_TABLE = { pestel: 'pestel_factors', swot: 'swot_items' } as const;

decisionsRouter.patch('/:id/:kind(pestel|swot)/:itemId', loadDecision, wrap((req, res) => {
  const parsed = StatusBody.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.issues);
  const table = KIND_TABLE[req.params.kind as keyof typeof KIND_TABLE];
  const row = setItemStatus(table, req.params.id, req.params.itemId, parsed.data.status);
  if (!row) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json(row);
}));

decisionsRouter.delete('/:id/:kind(pestel|swot)/:itemId', loadDecision, wrap((req, res) => {
  const table = KIND_TABLE[req.params.kind as keyof typeof KIND_TABLE];
  res.json({ ok: deleteItem(table, req.params.id, req.params.itemId) });
}));

// ----------------------------------------------------------------- audit (temps C) — run the vetoes
decisionsRouter.post('/:id/audit', loadDecision, wrap((req, res) => {
  const input = buildAuditInput(req.params.id);
  if (!input) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  const result = auditDecision(input);
  createAuditSnapshot(req.params.id, result);
  res.json(result);
}));

// ----------------------------------------------------------------- ingest (temps E/R pre-fill)
// Pull the latest HDDE diagnostic packet for a case and pre-fill PESTEL/SWOT/options as CANDIDATES
// (doctrine: candidate ≠ fact). Records the source pack hash so a later HDDE change can prompt re-ingest.
const IngestBody = z.object({ hdde_case_ref: z.string().trim().min(1).max(120) });

decisionsRouter.post('/:id/ingest', loadDecision, wrap(async (req, res) => {
  const parsed = IngestBody.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.issues);

  const fetched = await fetchLatestPacket(parsed.data.hdde_case_ref);
  if (!fetched) {
    // 502: HDDE unconfigured/unreachable, or no packet for that case. The cockpit falls back to manual.
    res.status(502).json({ error: 'hdde_unavailable_or_no_packet' });
    return;
  }

  const candidates = buildCandidates({ packet: fetched.packet });
  const counts = ingestCandidates(req.params.id, {
    pestel: candidates.pestel.map((p) => ({
      category: p.category,
      statement: p.statement,
      decisional_impact: p.decisional_impact,
      uncertainty: p.uncertainty,
      source_kind: p.source_kind,
      source_ref: p.source_ref,
      status: p.status,
    })),
    swot: candidates.swot.map((s) => ({
      quadrant: s.quadrant,
      statement: s.statement,
      is_hypothesis: s.is_hypothesis,
      source_kind: s.source_kind,
      source_ref: s.source_ref,
      status: s.status,
    })),
    options: candidates.options.map((o) => ({
      option_id: o.option_id,
      type: o.type,
      title: o.title,
      description: o.description,
      critical_hypothesis: o.critical_hypothesis,
      main_evidence: o.main_evidence,
      main_contradiction: o.main_contradiction,
      proof_level: o.proof_level,
      canvas: o.canvas,
      source_kind: o.source_kind,
      source_ref: o.source_ref,
      status: o.status,
    })),
  });

  patchDecision(req.params.id, {
    hdde_case_ref: parsed.data.hdde_case_ref,
    source_packet_id: fetched.packet_id,
    source_pack_hash: fetched.pack_hash,
    ingested_at: new Date().toISOString(),
    cvi_json: fetched.packet.cvi ? JSON.stringify(fetched.packet.cvi) : null,
  });

  res.json({ ingested: counts, source_pack_hash: fetched.pack_hash, version_number: fetched.version_number });
}));

// ----------------------------------------------------------------- red team (temps I)
const RedTeamBody = z.object({
  role: z.enum(['red_team_option', 'minimal_alternative', 'truth_test']),
  target_option_id: z.string().max(120).nullable().optional(),
});

function startOfDayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Assemble the adversarial context from the stored decision (candidates/rejected filtered out). */
function buildRedTeamContext(decisionId: string, targetOptionId: string | null): VerdictRedTeamContext {
  const d = getDecision(decisionId)!;
  const options = listOptions(decisionId);
  const scores = listScores(decisionId);
  const adjusted = new Map(scores.map((s) => [s.option_id as string, s.adjusted_score as number | null]));
  const wantId = targetOptionId ?? (d.selected_option_id as string | null);
  const target =
    options.find((o) => o.option_id === wantId) ?? options.find((o) => o.type === 'main') ?? options[0];
  const audit = latestAudit(decisionId);
  return {
    situation: (d.situation as string) ?? '',
    finalVerdict: (d.final_verdict as string) ?? (d.proposed_verdict as string) ?? null,
    selectedOptionId: (d.selected_option_id as string) ?? null,
    auditStatus: (audit?.audit_status as string) ?? null,
    targetOption: target
      ? {
          option_id: target.option_id as string,
          type: target.type as string,
          title: target.title as string,
          critical_hypothesis: target.critical_hypothesis as string,
          main_evidence: target.main_evidence as string,
          main_contradiction: target.main_contradiction as string,
          proof_level: target.proof_level as number,
          adjusted_score: adjusted.get(target.option_id as string) ?? null,
        }
      : null,
    optionsSummary: options.map(
      (o) => `${o.type}: ${o.title} (preuve ${o.proof_level}/5, ajusté ${adjusted.get(o.option_id as string) ?? 'n/a'})`,
    ),
    pestelSummary: listPestel(decisionId)
      .filter((f) => f.status !== 'rejected')
      .map((f) => `${f.category}: ${f.statement}`),
    swotSummary: listSwot(decisionId)
      .filter((s) => s.status !== 'rejected')
      .map((s) => `${s.quadrant}: ${s.statement}`),
  };
}

decisionsRouter.post('/:id/red-team/run', loadDecision, wrap(async (req, res) => {
  const parsed = RedTeamBody.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.issues);

  // Per-analyst daily budget guard (financial DoS prevention, ADR 0034) — only when LLM is live.
  if (llmAvailable()) {
    const u = usageSinceForUser(req.user!.id, startOfDayIso());
    if (config.llmMaxCallsPerUserPerDay > 0 && u.calls >= config.llmMaxCallsPerUserPerDay) {
      res.status(429).json({ error: 'daily_call_budget_exceeded' });
      return;
    }
    if (config.llmMaxCostPerUserPerDayUsd > 0 && u.costUsd >= config.llmMaxCostPerUserPerDayUsd) {
      res.status(429).json({ error: 'daily_cost_budget_exceeded' });
      return;
    }
  }

  const ctx = buildRedTeamContext(req.params.id, parsed.data.target_option_id ?? null);
  let result: RedTeamRunResult;
  try {
    result = await runRedTeam(parsed.data.role as RedTeamRole, ctx);
  } catch (e) {
    if (e instanceof RedTeamError) {
      res.status(502).json({ error: 'red_team_failed', detail: e.message });
      return;
    }
    throw e;
  }

  const row = createSuggestion(req.params.id, parsed.data.role, result.output);
  if (result.usage) {
    recordLlmUsage({
      decisionId: req.params.id,
      userId: req.user!.id,
      model: result.model,
      promptTokens: result.usage.prompt_tokens,
      completionTokens: result.usage.completion_tokens,
      costUsd: computeCost(result.model, result.usage.prompt_tokens, result.usage.completion_tokens),
    });
  }
  res.status(201).json({ ...row, suggestion_json: result.output, model: result.model });
}));

decisionsRouter.get('/:id/red-team', loadDecision, wrap((req, res) => {
  res.json(listSuggestions(req.params.id));
}));

const ReviewBody = z.object({ status: z.enum(['accepted', 'rejected']) });
decisionsRouter.patch('/:id/red-team/:sid', loadDecision, wrap((req, res) => {
  const parsed = ReviewBody.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.issues);
  const row = reviewSuggestion(req.params.id, req.params.sid, parsed.data.status, req.user!.id);
  if (!row) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json(row);
}));

// ----------------------------------------------------------------- exports (FR/EN decision note)
decisionsRouter.post('/:id/exports', loadDecision, wrap((req, res) => {
  const files = renderDecisionExports(req.params.id);
  if (!files) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({ files });
}));
