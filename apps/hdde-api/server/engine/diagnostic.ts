// Pure analytical core: turns interview answers into the diagnostic packet payload (scores, verdict,
// patterns, red flags, derived uncertainties + light actions). No DB, no I/O — the API layer persists
// and versions the result. All derived outputs are CANDIDATES pending analyst validation, never facts
// (data-integrity doctrine, ADR 0027).

import type {
  DomainPack,
  EngineAnswer,
  DimensionScore,
  DimensionEvidence,
  Verdict,
  Confidence,
} from './types';
import { scoreAnswers, divergenceSignals } from './scoring';
import { deriveVerdict } from './verdict';

export interface ProbableRealDependency {
  description: string;
  hypothesis: string;
  divergence_score: number; // = hidden_dependency_score (0..5)
  confidence: Confidence;
  basis: string[];
}

export interface CriticalFlow {
  flow_type: string;
  substitutability: string;
  time_to_impact_days: number | null;
}

/** Optional case context so the narrative can name the visible actor instead of a placeholder. */
export interface DiagnosticContext {
  visible_actor_name?: string | null;
  visible_actor_type?: string | null;
}

export interface DiagnosticCore {
  operational_verdict: Verdict;
  confidence: Confidence;
  primary_diagnosis: string;
  probable_real_dependency: ProbableRealDependency;
  critical_flow: CriticalFlow;
  matched_verdict_rules: string[];
  scores: DimensionScore[];
  activated_patterns: { id: string; label_fr: string; description_fr?: string }[];
  red_flags: { id: string; severity: number; message: string }[];
  open_uncertainties: { uncertainty: string; required_test: string }[];
  light_actions: {
    priority: number;
    action: string;
    purpose: string;
    owner_category: string;
    suggested_delay: string;
    linked_risk: string;
  }[];
  matrix_rows: unknown[];
}

const EVIDENCE_DIMENSION = 'evidence_quality_score';

// Each diagnostic pattern is backed by the dimension that quantifies it. The primary diagnosis is the
// activated pattern whose backing score is the STRONGEST — never a hardcoded winner (ADR 0040).
const PATTERN_BACKING: Record<string, string> = {
  visible_supplier_dependency: 'supplier_dependency_score',
  supply_chain_single_point_failure: 'supplier_dependency_score',
  hidden_second_tier_dependency: 'hidden_dependency_score',
  substitution_capacity_overestimated: 'substitution_weakness_score',
  jurisdictional_exposure: 'jurisdictional_exposure_score',
  sanctions_or_regulatory_exposure: 'jurisdictional_exposure_score',
  state_linked_actor_risk: 'jurisdictional_exposure_score',
  critical_flow_dependency: 'flow_criticality_score',
  chokepoint_or_corridor_exposure: 'flow_criticality_score',
  logistics_or_insurance_gatekeeper: 'gatekeeper_pressure_score',
  decision_threshold_absence: 'decision_readiness_score', // inverted below (a gap = 5 - readiness)
};
const INVERTED_BACKING = new Set(['decision_threshold_absence']);

function backingScore(patternId: string, scores: Record<string, DimensionScore>): number {
  const dim = PATTERN_BACKING[patternId];
  if (!dim) return 0;
  const v = scores[dim]?.value ?? 0;
  return INVERTED_BACKING.has(patternId) ? 5 - v : v;
}

// Tie-break on equal backing strength: prefer the most specific / "discovery-like" finding over the
// generic ones. Lower index = higher salience. Keeps the choice deterministic and meaningful.
const SALIENCE: string[] = [
  'hidden_second_tier_dependency',
  'substitution_capacity_overestimated',
  'chokepoint_or_corridor_exposure',
  'critical_flow_dependency',
  'state_linked_actor_risk',
  'sanctions_or_regulatory_exposure',
  'jurisdictional_exposure',
  'supply_chain_single_point_failure',
  'logistics_or_insurance_gatekeeper',
  'visible_supplier_dependency',
  'decision_threshold_absence',
];
const salienceRank = (id: string): number => {
  const i = SALIENCE.indexOf(id);
  return i === -1 ? SALIENCE.length : i;
};

function pickPrimaryDiagnosis(
  activated: string[],
  scores: Record<string, DimensionScore>,
): string {
  if (activated.length === 0) return 'visible_supplier_dependency';
  return [...activated]
    .map((id) => ({ id, score: backingScore(id, scores) }))
    .sort((a, b) => b.score - a.score || salienceRank(a.id) - salienceRank(b.id))[0].id;
}

const TIME_TO_DAYS: Record<string, number> = { 0: 180, 1: 120, 2: 60, 3: 21, 4: 10, 5: 1 };
const SUBSTITUTABILITY_LABEL: Record<string, string> = {
  yes: 'déclarée élevée (non prouvée)',
  probably_yes: 'déclarée probable (non prouvée)',
  uncertain: 'incertaine',
  probably_no: 'faible',
  no: 'nulle (dépendance assumée)',
  not_applicable: 'non applicable',
};

function tokenOf(answers: EngineAnswer[], qid: string): string {
  const a = answers.find((x) => x.question_id === qid);
  return String(a?.normalized_answer ?? a?.raw_answer ?? '')
    .trim()
    .toLowerCase();
}

function buildCriticalFlow(answers: EngineAnswer[]): CriticalFlow {
  const flow = tokenOf(answers, 'critical_flow_type') || 'unknown';
  const replace = tokenOf(answers, 'critical_actor_replaceability_30d');
  const time = tokenOf(answers, 'time_to_operational_impact');
  return {
    flow_type: flow,
    substitutability: SUBSTITUTABILITY_LABEL[replace] ?? 'non renseignée',
    time_to_impact_days: time in TIME_TO_DAYS ? TIME_TO_DAYS[time] : null,
  };
}

function buildProbableRealDependency(
  answers: EngineAnswer[],
  scores: Record<string, DimensionScore>,
  flow: CriticalFlow,
  ctx: DiagnosticContext,
): ProbableRealDependency {
  const s = divergenceSignals(answers, scores);
  const hidden = scores['hidden_dependency_score']?.value ?? 0;
  const actor = (ctx.visible_actor_name || '').trim() || "l'acteur visible";

  const basis: string[] = [];
  if (s.replaceability_claimed) basis.push(`« ${actor} » est déclaré remplaçable`);
  if (s.substitution_unproven >= 4) basis.push('aucune preuve de test réel de l’alternative');
  if (s.tier2_blindness >= 4) basis.push('visibilité de rang 2 absente');
  else if (s.tier2_blindness >= 2) basis.push('visibilité de rang 2 partielle');
  if (s.low_evidence >= 4) basis.push('base de preuve mince');

  const where =
    s.tier2_blindness >= 4
      ? `derrière « ${actor} » (fournisseurs/dépendances de rang 2 non documentés)`
      : flow.flow_type !== 'unknown'
        ? `dans le flux « ${flow.flow_type} » que « ${actor} » rend possible`
        : `dans la chaîne qui relie « ${actor} » à la fonction critique`;

  const hypothesis = `La dépendance réelle se loge probablement ${where}.`;
  const description =
    hidden >= 3
      ? `Écart déclaré/prouvé élevé (${hidden}/5) : ${basis.join(', ') || 'signaux de cécité multiples'}. ` +
        `${hypothesis} La résilience supposée n’est pas étayée — c’est l’angle mort à instrumenter en priorité.`
      : hidden > 0
        ? `Écart déclaré/prouvé modéré (${hidden}/5) : ${basis.join(', ') || 'cécité partielle'}. ${hypothesis}`
        : `Pas d’écart significatif détecté entre la résilience déclarée et les preuves disponibles : ` +
          `la dépendance est essentiellement visible et assumée.`;

  return {
    description,
    hypothesis,
    divergence_score: hidden,
    confidence: scores['hidden_dependency_score']?.confidence ?? 'low',
    basis,
  };
}

export function buildDiagnostic(
  pack: DomainPack,
  answers: EngineAnswer[],
  ctx: DiagnosticContext = {},
  dimensionEvidence: Record<string, DimensionEvidence[]> = {},
): DiagnosticCore {
  const { scores, activatedPatterns, redFlags } = scoreAnswers(pack, answers, dimensionEvidence);
  const { verdict, confidence, matchedRuleIds } = deriveVerdict(pack, scores);

  const patternById = new Map(pack.patterns.map((p) => [p.id, p]));
  const resolvedPatterns = activatedPatterns.map((id) => {
    const p = patternById.get(id);
    return { id, label_fr: p?.label_fr ?? id, description_fr: p?.description_fr };
  });

  // Derived uncertainties: thin evidence is itself a priority signal (method: low evidence on a
  // critical dependency ≠ low risk — reduce uncertainty first).
  const open_uncertainties: DiagnosticCore['open_uncertainties'] = [];
  const evidence = scores[EVIDENCE_DIMENSION]?.value ?? 0;
  if (evidence <= 2) {
    open_uncertainties.push({
      uncertainty: 'La base de preuve est mince sur des dépendances critiques.',
      required_test: 'Documenter et sourcer les hypothèses clés avant toute conclusion.',
    });
  }
  for (const s of Object.values(scores)) {
    if (s.dimension_id === EVIDENCE_DIMENSION) continue;
    if (s.value >= 4 && s.confidence !== 'high') {
      open_uncertainties.push({
        uncertainty: `Exposition élevée sur « ${s.dimension_id} » avec une confiance ${s.confidence}.`,
        required_test:
          'Valider par une preuve documentée (contrat, donnée logistique, source officielle).',
      });
    }
  }

  // Derived light actions: each red flag suggests a test; severity drives priority.
  const light_actions: DiagnosticCore['light_actions'] = redFlags
    .slice()
    .sort((a, b) => b.severity - a.severity)
    .map((f) => ({
      priority: f.severity,
      action: `Traiter : ${f.message_fr}`,
      purpose: 'Réduire l’incertitude ou sécuriser une option, sans décision irréversible.',
      owner_category: 'analyste',
      suggested_delay: f.severity >= 5 ? '72h' : f.severity >= 4 ? '1 semaine' : '2 semaines',
      linked_risk: f.id,
    }));

  const critical_flow = buildCriticalFlow(answers);
  return {
    operational_verdict: verdict,
    confidence,
    primary_diagnosis: pickPrimaryDiagnosis(activatedPatterns, scores),
    probable_real_dependency: buildProbableRealDependency(answers, scores, critical_flow, ctx),
    critical_flow,
    matched_verdict_rules: matchedRuleIds,
    scores: Object.values(scores),
    activated_patterns: resolvedPatterns,
    red_flags: redFlags.map((f) => ({ id: f.id, severity: f.severity, message: f.message_fr })),
    open_uncertainties,
    light_actions,
    matrix_rows: [],
  };
}
