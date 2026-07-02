import { cviDimensions } from '@ag/cvi';
import type { CviAssessment, CviDimensionKey } from '@ag/cvi';
import type { PacketPayload } from '@ag/schema/hdde';
import type { PestelFactor, SwotItem, DecisionOption } from '@ag/schema/verdict';

/** Geopolitical pre-fill — the novel value of our VERDICT: turn an HDDE diagnostic packet (+ CVI +
 * chokepoints) into CANDIDATE PESTEL/SWOT/option seeds for the E and R stages. Every candidate
 * carries provenance and status='candidate'; the analyst validates (doctrine: candidate ≠ fact,
 * ADR 0027). Pure & deterministic so the API ingest step is reproducible and testable. */

/** Minimal read-scope chokepoint context (subset of the HDDE chokepoints integration shape). */
export interface ChokepointSuggestion {
  id: string;
  name: string;
  note?: string;
}

export interface PrefillInput {
  packet: PacketPayload;
  cvi?: CviAssessment;
  chokepoints?: ChokepointSuggestion[];
}

export interface PrefillResult {
  pestel: PestelFactor[];
  swot: SwotItem[];
  options: DecisionOption[];
}

// Dimensions whose elevated HDDE score signals an internal weakness.
const WEAKNESS_DIMENSIONS = new Set([
  'supplier_dependency_score',
  'hidden_dependency_score',
  'flow_criticality_score',
  'substitution_weakness_score',
]);

// Heuristic: a single customer concentrating ≥30% of revenue is an external threat.
const CUSTOMER_CONCENTRATION_THRESHOLD_PCT = 30;

class IdGen {
  private counters = new Map<string, number>();
  next(kind: string): string {
    const n = (this.counters.get(kind) ?? 0) + 1;
    this.counters.set(kind, n);
    return `${kind}_${n}`;
  }
}

export function buildCandidates(input: PrefillInput): PrefillResult {
  const { packet, cvi, chokepoints = [] } = input;
  const ids = new IdGen();
  const pestel: PestelFactor[] = [];
  const swot: SwotItem[] = [];
  const options: DecisionOption[] = [];

  const swotItem = (
    quadrant: SwotItem['quadrant'],
    statement: string,
    source_kind: SwotItem['source_kind'],
    source_ref: string,
  ): SwotItem => ({
    id: ids.next('swot'),
    quadrant,
    statement,
    is_hypothesis: false,
    source_kind,
    source_ref,
    status: 'candidate',
  });

  const pestelFactor = (
    category: PestelFactor['category'],
    statement: string,
    decisional_impact: string,
    source_kind: PestelFactor['source_kind'],
    source_ref: string,
  ): PestelFactor => ({
    id: ids.next('pestel'),
    category,
    statement,
    decisional_impact,
    uncertainty: '',
    source_kind,
    source_ref,
    status: 'candidate',
  });

  // --- HDDE packet → SWOT -------------------------------------------------------------------
  for (const flag of packet.red_flags) {
    swot.push(swotItem('weakness', flag.message, 'hdde_packet', `hdde:red_flag:${flag.id}`));
  }
  for (const pattern of packet.activated_patterns) {
    swot.push(swotItem('threat', pattern.label_fr, 'hdde_packet', `hdde:pattern:${pattern.id}`));
  }
  for (const score of packet.scores) {
    if (WEAKNESS_DIMENSIONS.has(score.dimension_id) && score.value >= 3) {
      swot.push(
        swotItem(
          'weakness',
          `${score.dimension_id} élevé (${score.value}/5) : ${score.rationale}`,
          'hdde_packet',
          `hdde:score:${score.dimension_id}`,
        ),
      );
    }
  }
  if (packet.operational_verdict === 'act' || packet.operational_verdict === 'escalate') {
    swot.push(
      swotItem(
        'threat',
        `Posture HDDE « ${packet.operational_verdict} » : ${packet.primary_diagnosis}`,
        'hdde_packet',
        'hdde:operational_verdict',
      ),
    );
  }

  // HDDE concentration → weaknesses (internal) + threats (external geographic/customer).
  const conc = packet.concentration;
  if (conc) {
    if (conc.single_source_supplier_count > 0) {
      swot.push(
        swotItem(
          'weakness',
          `${conc.single_source_supplier_count} fournisseur(s) en source unique`,
          'hdde_packet',
          'hdde:concentration:single_source',
        ),
      );
    }
    if (conc.tier2_blind_spots > 0) {
      swot.push(
        swotItem(
          'weakness',
          `${conc.tier2_blind_spots} angle(s) mort(s) de rang 2 (tier-2)`,
          'hdde_packet',
          'hdde:concentration:tier2_blind_spots',
        ),
      );
    }
    if (conc.customer_top_share_pct !== null && conc.customer_top_share_pct >= CUSTOMER_CONCENTRATION_THRESHOLD_PCT) {
      swot.push(
        swotItem(
          'threat',
          `Concentration client : ${conc.customer_top_share_pct}% du revenu sur un client`,
          'hdde_packet',
          'hdde:concentration:customer_top_share',
        ),
      );
    }
    if (conc.supplier_top_country && conc.supplier_top_country_count > 1) {
      swot.push(
        swotItem(
          'threat',
          `Concentration géographique : ${conc.supplier_top_country_count} fournisseurs en ${conc.supplier_top_country}`,
          'hdde_packet',
          'hdde:concentration:supplier_country',
        ),
      );
      pestel.push(
        pestelFactor(
          'political',
          `Exposition juridictionnelle : fournisseurs concentrés en ${conc.supplier_top_country}`,
          "Une mesure de l'État hôte (sanctions, contrôle export) frapperait plusieurs fournisseurs à la fois.",
          'hdde_packet',
          'hdde:concentration:supplier_country',
        ),
      );
    }
  }

  // --- HDDE packet → PESTEL (Economic / Environmental via the critical flow) ----------------
  if (packet.cvi) {
    pestel.push(
      pestelFactor(
        'economic',
        `Criticité de flux ${packet.cvi.flow_criticality_score}/5 (vulnérabilité ${packet.cvi.vulnerability_level})`,
        'Détermine le coût d’une rupture du corridor et donc le seuil de bascule entre options.',
        'hdde_packet',
        'hdde:cvi:flow_criticality',
      ),
    );
  }

  // --- HDDE light_actions → Opportunities + option seeds ------------------------------------
  for (const action of packet.light_actions) {
    swot.push(swotItem('opportunity', action.action, 'hdde_packet', `hdde:light_action:${action.priority}`));
    options.push({
      option_id: ids.next('opt'),
      type: 'minimal_alternative',
      title: action.action,
      description: action.purpose,
      critical_hypothesis: '',
      main_evidence: '',
      main_contradiction: '',
      proof_level: 0,
      canvas: {
        value: action.purpose,
        beneficiaries: action.owner_category,
        adoption_validation: '',
        critical_resources_costs: '',
        sustainability_systemic_risk: action.linked_risk,
      },
      source_kind: 'hdde_packet',
      source_ref: `hdde:light_action:${action.priority}`,
      status: 'candidate',
    });
  }

  // --- CVI assessment → Threats + PESTEL ----------------------------------------------------
  if (cvi?.dimensions) {
    const threatDims: CviDimensionKey[] = ['menace', 'capacite_perturbation', 'concentration'];
    for (const dim of threatDims) {
      const ds = cvi.dimensions[dim];
      if (ds && ds.score >= 3) {
        swot.push(
          swotItem(
            'threat',
            `${cviDimensions[dim].label} ${ds.score}/5 : ${ds.rationale}`,
            'cvi',
            `cvi:${dim}`,
          ),
        );
      }
    }
    const legal = cvi.dimensions.gouvernance;
    if (legal && legal.score >= 3) {
      pestel.push(
        pestelFactor(
          'legal',
          `Gouvernance du corridor ${legal.score}/5 : ${legal.rationale}`,
          'Qui peut sécuriser/coordonner conditionne la faisabilité des options de contournement.',
          'cvi',
          'cvi:gouvernance',
        ),
      );
    }
  }

  // --- Chokepoints (read scope) → PESTEL Political/Legal + Threat ----------------------------
  for (const cp of chokepoints) {
    pestel.push(
      pestelFactor(
        'political',
        `Corridor sous contrôle : ${cp.name}${cp.note ? ` — ${cp.note}` : ''}`,
        'Le contrôle du point de passage pèse sur le coût et le délai de chaque option de routage.',
        'chokepoint',
        `chokepoint:${cp.id}`,
      ),
    );
    swot.push(swotItem('threat', `Dépendance au corridor ${cp.name}`, 'chokepoint', `chokepoint:${cp.id}`));
  }

  // --- Corridor context (episodes + analytics, read scope) → Threats -------------------------
  // Disruption precedents and derived analytics carried in the packet (ADR 0042). Candidates: a
  // documented precedent of disruption is a threat signal; analytics are framed as candidate context.
  const ctx = packet.corridor_context;
  if (ctx) {
    for (const ep of ctx.episodes) {
      const period = ep.started_on ? ` (${ep.started_on.slice(0, 10)}${ep.ended_on ? `→${ep.ended_on.slice(0, 10)}` : ''})` : '';
      swot.push(
        swotItem(
          'threat',
          `Précédent de perturbation : ${ep.name}${period}`,
          'episode',
          `episode:${ep.key}`,
        ),
      );
    }
    for (const a of ctx.analytics) {
      const label = [a.result_type, a.score != null ? `score ${a.score}` : null, a.summary]
        .filter(Boolean)
        .join(' · ');
      if (label) {
        swot.push(swotItem('threat', `Analytique corridor : ${label}`, 'analytics', `analytics:${a.result_type ?? 'result'}`));
      }
    }
  }

  return { pestel, swot, options };
}
