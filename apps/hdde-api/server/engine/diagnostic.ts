// Pure analytical core: turns interview answers into the diagnostic packet payload (scores, verdict,
// patterns, red flags, derived uncertainties + light actions). No DB, no I/O — the API layer persists
// and versions the result. All derived outputs are CANDIDATES pending analyst validation, never facts
// (data-integrity doctrine, ADR 0027).

import type { DomainPack, EngineAnswer, DimensionScore, Verdict, Confidence } from './types';
import { scoreAnswers } from './scoring';
import { deriveVerdict } from './verdict';

export interface DiagnosticCore {
  operational_verdict: Verdict;
  confidence: Confidence;
  primary_diagnosis: string;
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

function pickPrimaryDiagnosis(activated: string[]): string {
  if (activated.includes('hidden_second_tier_dependency')) return 'hidden_second_tier_dependency';
  return activated[0] ?? 'visible_supplier_dependency';
}

export function buildDiagnostic(pack: DomainPack, answers: EngineAnswer[]): DiagnosticCore {
  const { scores, activatedPatterns, redFlags } = scoreAnswers(pack, answers);
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

  return {
    operational_verdict: verdict,
    confidence,
    primary_diagnosis: pickPrimaryDiagnosis(activatedPatterns),
    matched_verdict_rules: matchedRuleIds,
    scores: Object.values(scores),
    activated_patterns: resolvedPatterns,
    red_flags: redFlags.map((f) => ({ id: f.id, severity: f.severity, message: f.message_fr })),
    open_uncertainties,
    light_actions,
    matrix_rows: [],
  };
}
