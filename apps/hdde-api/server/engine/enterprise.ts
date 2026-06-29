// Enterprise layer (ADR 0036): score each first-class actor (supplier/customer/site/partner) on the
// 9 dimensions from its structured attributes, derive a per-actor posture, and roll everything up into
// an enterprise synthesis (concentration analysis, populated dependency-control matrix, overall
// verdict). All outputs are CANDIDATES pending analyst validation — never facts (ADR 0027).

import type { DomainPack, DimensionScore, Verdict, Confidence } from './types';
import { initialScores } from './scoring';
import { deriveVerdict } from './verdict';
import { buildDiagnostic, type DiagnosticCore } from './diagnostic';

export interface EntityLike {
  id: string;
  entity_type: string;
  name: string;
  country?: string | null;
  role?: string | null;
  what_it_enables?: string | null;
  criticality?: number;
  substitutability?: string;
  tier2_visibility?: string;
  jurisdiction_risk?: number;
  time_to_impact?: number;
  single_source?: boolean;
  share_pct?: number | null;
}

export interface EntityResult {
  id: string;
  name: string;
  entity_type: string;
  country?: string;
  operational_verdict: Verdict;
  confidence: Confidence;
  top_risk: string;
  scores: DimensionScore[];
}

const SUBST_RISK: Record<string, number> = { no: 5, partial: 3, unknown: 4, yes: 1 };
// Tier-2 invisibility on a 0..5 blindness scale (yes = fully visible = 0).
const VIS_RISK: Record<string, number> = { no: 5, unknown: 4, partial: 2, yes: 0 };
// "Unproven substitution" blindness: claiming an actor is replaceable (yes) without proof is the
// strongest overconfidence signal; declaring it NOT replaceable is a KNOWN dependency, not a hidden one.
const SUBST_UNPROVEN: Record<string, number> = { yes: 4, partial: 3, unknown: 4, no: 1 };
const PARTNER_TYPES = new Set(['logistics_provider', 'bank', 'insurer', 'regulator', 'partner']);
const clamp05 = (n: number): number => Math.max(0, Math.min(5, Math.round(n)));

/** Revenue/spend share (0–100) → a 0–5 concentration-dependency score. */
function shareToScore(share: number): number {
  if (share >= 40) return 5;
  if (share >= 25) return 4;
  if (share >= 15) return 3;
  if (share >= 8) return 2;
  if (share > 0) return 1;
  return 0;
}

/** Score one entity on the pack dimensions from its structured attributes. */
export function scoreEntity(pack: DomainPack, e: EntityLike): EntityResult {
  const scores = initialScores(pack);
  const set = (id: string, value: number, rationale: string) => {
    if (scores[id])
      scores[id] = { ...scores[id], value: clamp05(value), confidence: 'medium', rationale };
  };

  const crit = e.criticality ?? 0;
  const shareScore = e.share_pct != null ? shareToScore(e.share_pct) : 0;
  const depBase = e.entity_type === 'customer' ? Math.max(crit, shareScore) : crit;

  set(
    'supplier_dependency_score',
    e.single_source ? Math.max(depBase, 4) : depBase,
    e.entity_type === 'customer'
      ? `Concentration de revenu (${e.share_pct ?? '?'}%).`
      : e.single_source
        ? 'Acteur critique en source unique.'
        : 'Dépendance à cet acteur visible.',
  );
  set(
    'substitution_weakness_score',
    SUBST_RISK[e.substitutability ?? 'unknown'] ?? 4,
    'Substituabilité déclarée.',
  );
  // Hidden dependency = DIVERGENCE: exposure × blindness, not a relabel of tier-2 visibility (ADR 0040).
  // A critical actor that is fully visible AND proven-replaceable is a KNOWN dependency (low hidden score);
  // a critical actor that is invisible/overconfidently-replaceable is where the real risk hides.
  const tier2Blind = VIS_RISK[e.tier2_visibility ?? 'unknown'] ?? 4;
  const substUnproven = SUBST_UNPROVEN[e.substitutability ?? 'unknown'] ?? 4;
  const blindnessFactor = (tier2Blind + substUnproven) / 10; // 0..1
  set(
    'hidden_dependency_score',
    depBase * blindnessFactor,
    `Divergence : exposition ${clamp05(depBase)}/5 × cécité (rang-2 ${tier2Blind}/5, substitution non prouvée ${substUnproven}/5).`,
  );
  set(
    'jurisdictional_exposure_score',
    e.jurisdiction_risk ?? 0,
    `Exposition juridictionnelle (${e.country || 'n/c'}).`,
  );
  set('time_to_impact_score', e.time_to_impact ?? 0, 'Pression temporelle déclarée.');
  set('flow_criticality_score', depBase, 'Criticité du flux rendu possible.');
  if (PARTNER_TYPES.has(e.entity_type))
    set('gatekeeper_pressure_score', crit, 'Pouvoir de gatekeeper.');

  const { verdict, confidence } = deriveVerdict(pack, scores);
  const labelOf = (id: string) => pack.dimensions.find((d) => d.id === id)?.label_fr ?? id;
  const top = Object.values(scores)
    .filter((s) => s.dimension_id !== 'evidence_quality_score')
    .sort((a, b) => b.value - a.value)[0];

  return {
    id: e.id,
    name: e.name,
    entity_type: e.entity_type,
    country: e.country ?? undefined,
    operational_verdict: verdict,
    confidence,
    top_risk: top ? `${labelOf(top.dimension_id)} (${top.value}/5)` : '—',
    scores: Object.values(scores),
  };
}

export interface ConcentrationSummary {
  supplier_count: number;
  customer_count: number;
  site_count: number;
  single_source_supplier_count: number;
  tier2_blind_spots: number;
  customer_top_share_pct: number | null;
  customer_hhi: number | null;
  supplier_top_country: string | null;
  supplier_top_country_count: number;
  notes: string[];
}

function analyseConcentration(entities: EntityLike[]): {
  concentration: ConcentrationSummary;
  redFlags: { id: string; severity: number; message: string }[];
} {
  const suppliers = entities.filter((e) => e.entity_type === 'supplier');
  const customers = entities.filter((e) => e.entity_type === 'customer');
  const sites = entities.filter((e) => e.entity_type === 'site');

  const singleSource = suppliers.filter((s) => s.single_source).length;
  const tier2Blind = suppliers.filter((s) =>
    ['no', 'unknown'].includes(s.tier2_visibility ?? ''),
  ).length;

  const customerShares = customers.map((c) => c.share_pct ?? 0).filter((v) => v > 0);
  const customerTop = customerShares.length ? Math.max(...customerShares) : null;
  const customerHhi = customerShares.length
    ? Math.round(customerShares.reduce((s, v) => s + v * v, 0))
    : null;

  // Supplier geographic concentration: country with the most suppliers.
  const byCountry = new Map<string, number>();
  for (const s of suppliers) {
    const c = (s.country || '').trim();
    if (c) byCountry.set(c, (byCountry.get(c) ?? 0) + 1);
  }
  let topCountry: string | null = null;
  let topCountryCount = 0;
  for (const [c, n] of byCountry)
    if (n > topCountryCount) ((topCountry = c), (topCountryCount = n));

  const notes: string[] = [];
  const redFlags: { id: string; severity: number; message: string }[] = [];
  if (customerTop != null && customerTop >= 30) {
    notes.push(`Concentration client : un client pèse ${customerTop}% du revenu.`);
    redFlags.push({
      id: 'customer_concentration',
      severity: customerTop >= 50 ? 5 : 4,
      message: `Concentration client élevée (top client ${customerTop}%).`,
    });
  }
  if (topCountry && topCountryCount >= 3) {
    notes.push(`Concentration géographique : ${topCountryCount} fournisseurs en ${topCountry}.`);
    redFlags.push({
      id: 'geographic_concentration',
      severity: 4,
      message: `Concentration géographique fournisseurs (${topCountryCount} en ${topCountry}).`,
    });
  }
  if (singleSource > 0) {
    notes.push(`${singleSource} fournisseur(s) en source unique.`);
    redFlags.push({
      id: 'single_source_suppliers',
      severity: 4,
      message: `${singleSource} fournisseur(s) en source unique (point de rupture).`,
    });
  }
  if (tier2Blind > 0) {
    notes.push(`${tier2Blind} fournisseur(s) avec dépendances de rang 2 non documentées.`);
    redFlags.push({
      id: 'tier2_unknown',
      severity: 4,
      message: `${tier2Blind} fournisseur(s) à dépendance rang 2 inconnue.`,
    });
  }

  return {
    concentration: {
      supplier_count: suppliers.length,
      customer_count: customers.length,
      site_count: sites.length,
      single_source_supplier_count: singleSource,
      tier2_blind_spots: tier2Blind,
      customer_top_share_pct: customerTop,
      customer_hhi: customerHhi,
      supplier_top_country: topCountry,
      supplier_top_country_count: topCountryCount,
      notes,
    },
    redFlags,
  };
}

export interface EnterpriseDiagnostic extends DiagnosticCore {
  entities: EntityResult[];
  concentration: ConcentrationSummary;
}

const PRECEDENCE: Record<Verdict, number> = { monitor: 0, prepare: 1, act: 2, escalate: 3 };

/** Full enterprise diagnostic: interview-based core + per-actor scoring + concentration synthesis. */
export function buildEnterpriseDiagnostic(
  pack: DomainPack,
  answers: Parameters<typeof buildDiagnostic>[1],
  entities: EntityLike[],
  ctx: Parameters<typeof buildDiagnostic>[2] = {},
  dimensionEvidence: Parameters<typeof buildDiagnostic>[3] = {},
): EnterpriseDiagnostic {
  const core = buildDiagnostic(pack, answers, ctx, dimensionEvidence);
  const entityResults = entities.map((e) => scoreEntity(pack, e));
  const { concentration, redFlags: concFlags } = analyseConcentration(entities);

  // Enterprise dimension scores = max(interview, worst actor) per dimension, so the headline scores
  // reflect the whole roster — not just the (often empty) case-level interview.
  const entityMax = new Map<string, number>();
  for (const r of entityResults) {
    for (const s of r.scores) {
      entityMax.set(s.dimension_id, Math.max(entityMax.get(s.dimension_id) ?? 0, s.value));
    }
  }
  const aggregatedScores = core.scores.map((s) => {
    const em = entityMax.get(s.dimension_id) ?? 0;
    if (entityResults.length === 0 || em <= s.value) return s;
    return {
      ...s,
      value: em,
      confidence: 'medium' as const,
      rationale: `Maximum sur le roster d’acteurs (${entityResults.length} acteurs).`,
    };
  });

  // Enterprise verdict = highest posture across interview, aggregated scores, and every actor.
  let verdict = deriveVerdict(
    pack,
    Object.fromEntries(aggregatedScores.map((s) => [s.dimension_id, s])),
  ).verdict;
  if (PRECEDENCE[core.operational_verdict] > PRECEDENCE[verdict])
    verdict = core.operational_verdict;
  for (const r of entityResults) {
    if (PRECEDENCE[r.operational_verdict] > PRECEDENCE[verdict]) verdict = r.operational_verdict;
  }

  // Dependency-control matrix, populated from the actor roster (was empty in the single-actor V1).
  const matrix_rows = entityResults.map((r) => {
    const top = r.scores
      .filter((s) => s.dimension_id !== 'evidence_quality_score')
      .sort((a, b) => b.value - a.value)[0];
    const e = entities.find((x) => x.id === r.id)!;
    return {
      dependency: e.what_it_enables || e.role || r.name,
      actor: r.name,
      actor_role: r.entity_type,
      mechanism: e.single_source
        ? 'source unique'
        : e.entity_type === 'customer'
          ? 'concentration revenu'
          : 'dépendance opérationnelle',
      risk_level: top?.value ?? 0,
      evidence_summary: e.country ? `Juridiction : ${e.country}` : '—',
      confidence: r.confidence,
      recommended_test: 'Documenter et tester l’alternative / la dépendance rang 2.',
    };
  });

  // Merge concentration red flags with the interview-derived ones (dedup by id).
  const seen = new Set(core.red_flags.map((f) => f.id));
  const red_flags = [...core.red_flags, ...concFlags.filter((f) => !seen.has(f.id))];

  return {
    ...core,
    operational_verdict: verdict,
    scores: aggregatedScores,
    red_flags,
    matrix_rows,
    entities: entityResults,
    concentration,
  };
}
