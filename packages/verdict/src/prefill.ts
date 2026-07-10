import { cviDimensions } from '@ag/cvi';
import type { CviAssessment, CviDimensionKey, DimensionScore } from '@ag/cvi';
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

  // --- CVI assessment → Threats + Weakness + PESTEL ------------------------------------------
  // All 8 dimensions are consumed, each routed to the frame where it actually bears on the decision.
  // Scores are 0–5, HIGHER = MORE VULNERABLE, so a high `resilience` score is a *weakness*, not a
  // strength. Any dimension may be absent (no engine input → omitted, never fabricated), so every
  // lookup is guarded: `dimensions` is a Partial record.
  if (cvi?.dimensions) {
    const THRESHOLD = 3;

    // A producer dimension can reach 5/5 out of IGNORANCE rather than measurement: `engine_substitution`
    // scores an object nobody ever examined `5 - 0 = 5`, and `concentration` reads that number straight
    // (ag-back handoff `787d92d14eb2`). The producer flags it — `confidence: 'bas'` and an explicit
    // `uncertainties` entry — and dropping either turns an absence of data into a max-severity fact.
    // So: a low-confidence dimension is a HYPOTHESIS, and its uncertainties travel with its statement.
    const isHypothesis = (ds: DimensionScore) => ds.confidence === 'bas';
    const uncertaintyOf = (ds: DimensionScore) => ds.uncertainties.join(' · ');
    const qualify = (ds: DimensionScore, statement: string) => {
      const unc = uncertaintyOf(ds);
      return unc ? `${statement} [${unc}]` : statement;
    };

    // External pressure the enterprise does not control → SWOT threat.
    const threatDims: CviDimensionKey[] = [
      'menace',
      'capacite_perturbation',
      'concentration',
      'exposition',
    ];
    for (const dim of threatDims) {
      const ds = cvi.dimensions[dim];
      if (ds && ds.score >= THRESHOLD) {
        swot.push({
          ...swotItem(
            'threat',
            qualify(ds, `${cviDimensions[dim].label} ${ds.score}/5 : ${ds.rationale}`),
            'cvi',
            `cvi:${dim}`,
          ),
          is_hypothesis: isHypothesis(ds),
        });
      }
    }

    // A high `resilience` score means slow to bypass/repair/absorb — an internal weakness, not a threat.
    const res = cvi.dimensions.resilience;
    if (res && res.score >= THRESHOLD) {
      swot.push({
        ...swotItem(
          'weakness',
          qualify(res, `${cviDimensions.resilience.label} ${res.score}/5 : ${res.rationale}`),
          'cvi',
          'cvi:resilience',
        ),
        is_hypothesis: isHypothesis(res),
      });
    }

    // Bypass cost is an economic constraint on every routing option.
    const cost = cvi.dimensions.cout_contournement;
    if (cost && cost.score >= THRESHOLD) {
      pestel.push({
        ...pestelFactor(
          'economic',
          `${cviDimensions.cout_contournement.label} ${cost.score}/5 : ${cost.rationale}`,
          'Le coût de contournement fixe le prix plancher de toute option de routage alternative.',
          'cvi',
          'cvi:cout_contournement',
        ),
        uncertainty: uncertaintyOf(cost),
      });
    }

    const legal = cvi.dimensions.gouvernance;
    if (legal && legal.score >= THRESHOLD) {
      pestel.push({
        ...pestelFactor(
          'legal',
          `Gouvernance du corridor ${legal.score}/5 : ${legal.rationale}`,
          'Qui peut sécuriser/coordonner conditionne la faisabilité des options de contournement.',
          'cvi',
          'cvi:gouvernance',
        ),
        uncertainty: uncertaintyOf(legal),
      });
    }

    // Uncertainty does not argue for or against an option — it argues for buying information first.
    // It is therefore carried as an explicit `uncertainty`, not as a threat statement.
    const unc = cvi.dimensions.incertitude;
    if (unc && unc.score >= THRESHOLD) {
      pestel.push({
        ...pestelFactor(
          'political',
          `${cviDimensions.incertitude.label} ${unc.score}/5 : ${unc.rationale}`,
          'Une incertitude élevée plaide pour un test/une levée de doute avant tout engagement lourd.',
          'cvi',
          'cvi:incertitude',
        ),
        uncertainty: uncertaintyOf(unc) || unc.rationale,
      });
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
    ctx.analytics.forEach((a, i) => {
      const label = [a.result_type, a.score != null ? `score ${a.score}` : null, a.summary]
        .filter(Boolean)
        .join(' · ');
      if (label) {
        // Index-suffix the ref so multiple analytics of the same result_type don't collide.
        swot.push(
          swotItem('threat', `Analytique corridor : ${label}`, 'analytics', `analytics:${a.result_type ?? 'result'}:${i}`),
        );
      }
    });
  }

  // --- Typed engine blocks (/analysis) → Threats ---------------------------------------------
  // Only the engines whose output changes a decision are surfaced. `weaponizability` says the corridor
  // can be turned into a lever; `exposed_trade_loss` sizes the damage; `network_centrality` flags an
  // articulation point — a node whose removal disconnects the graph. The rest stay in the packet for
  // the analyst to consult, without manufacturing a candidate for every row.
  for (const block of packet.corridor_analysis?.engines ?? []) {
    if (!DECISION_ENGINES.has(block.key)) continue;
    block.rows.forEach((row, i) => {
      const label = summariseEngineRow(block.key, row);
      if (!label) return;
      swot.push(swotItem('threat', label, 'analysis', `analysis:${block.key}:${i}`));
    });
  }

  // --- Derived candidate edges (/derived/relations) → Threats ---------------------------------
  // Cascade paths out of this corridor, pending human validation. An `external_candidate` target is a
  // COVERAGE GAP (an object the corpus lacks), which is itself worth flagging to the analyst.
  for (const edge of packet.corridor_relations?.edges ?? []) {
    const target = edge.to_label ?? edge.to;
    const gap = edge.to_status === 'external_candidate' ? ' [hors corpus — couverture à compléter]' : '';
    const strength = edge.strength_score != null ? ` (force ${edge.strength_score})` : '';
    swot.push(
      swotItem(
        'threat',
        `Propagation candidate — ${edge.relation_type.replace(/_/g, ' ')} → ${target}${strength}${gap}`,
        'relation',
        `relation:${edge.relation_type}:${edge.to}`,
      ),
    );
  }

  // --- Global ENA resilience → PESTEL political -----------------------------------------------
  // This describes the WHOLE systemic graph, not this corridor. A `brittle` regime means the system
  // has too much order and too little reserve: a local shock propagates instead of being absorbed.
  const sysres = packet.system_resilience;
  if (sysres?.regime) {
    const robustness = sysres.robustness != null ? ` (robustesse ${sysres.robustness.toFixed(3)})` : '';
    pestel.push(
      pestelFactor(
        'political',
        `Régime systémique global : ${sysres.regime}${robustness}`,
        sysres.regime === 'brittle'
          ? 'Un système cassant absorbe mal un choc local : la perturbation se propage au lieu de s’amortir.'
          : 'Le régime du graphe systémique conditionne la propagation d’un choc local.',
        'system_resilience',
        `system_resilience:${sysres.scope ?? 'GLOBAL'}`,
      ),
    );
  }

  return { pestel, swot, options };
}

/** Engine blocks whose rows change a decision. Everything else stays in the packet, unconverted. */
const DECISION_ENGINES = new Set([
  'weaponizability',
  'exposed_trade_loss',
  'network_centrality',
  'control_concentration',
]);

/**
 * Turn one engine row into a decision-relevant statement, or `null` when it says nothing useful.
 *
 * A zero score is a real answer ("this corridor is not weaponizable"), not a threat — emitting a
 * candidate for it would bury the analyst in noise. Column names mirror the producer's engine output
 * exactly; a rename upstream makes these return `null` rather than fabricate.
 */
function summariseEngineRow(key: string, row: Record<string, unknown>): string | null {
  const n = (k: string): number | null => (typeof row[k] === 'number' ? (row[k] as number) : null);
  const s = (k: string): string | null => (typeof row[k] === 'string' ? (row[k] as string) : null);
  const usd = (v: number) => `${Math.round(v).toLocaleString('fr-FR')} USD`;

  switch (key) {
    case 'weaponizability': {
      // leverage_score ∈ [0,1]: an actor's ability to turn the corridor into a lever.
      const lev = n('leverage_score');
      if (lev == null || lev <= 0) return null;
      const actor = s('top_actor_id');
      const sub = n('substitution_factor');
      return (
        `Corridor instrumentalisable — levier ${lev.toFixed(3)}` +
        (actor ? ` par ${actor}` : '') +
        (sub != null ? ` (facteur de substitution ${sub})` : '')
      );
    }
    case 'exposed_trade_loss': {
      const exposed = n('exposed_value_usd');
      if (exposed == null || exposed <= 0) return null;
      const atRisk = n('expected_value_at_risk_usd');
      const days = n('closure_days');
      return (
        `Valeur commerciale exposée : ${usd(exposed)}` +
        (atRisk != null ? ` · espérance de perte ${usd(atRisk)}` : '') +
        (days != null ? ` (scénario de fermeture ${days} j)` : '')
      );
    }
    case 'network_centrality': {
      // An articulation point is a node whose removal disconnects the graph — the strongest structural
      // warning this engine emits. Raw centrality, on its own, is not decision-relevant.
      if (row.articulation_point !== true) return null;
      const lost = n('reachable_nodes_lost');
      const cascade = n('cascade_impact_if_removed');
      return (
        `Point d'articulation du graphe : sa perte déconnecte le réseau` +
        (lost ? ` (${lost} nœuds deviennent inatteignables)` : '') +
        (cascade ? ` · impact de cascade ${cascade.toFixed(4)}` : '')
      );
    }
    case 'control_concentration': {
      // HHI ∈ (0,1]; ≥0.25 is the conventional "concentrated" threshold, 1 = a single controller.
      const hhi = n('hhi');
      if (hhi == null || hhi < 0.25) return null;
      const actor = s('top_actor_id');
      const share = n('top_actor_share');
      const count = n('actor_count');
      return (
        `Contrôle concentré (HHI ${hhi.toFixed(3)}${count != null ? `, ${count} acteur(s)` : ''})` +
        (actor ? ` — dominant : ${actor}` : '') +
        (share != null ? ` (${Math.round(share * 100)} %)` : '')
      );
    }
    default:
      return null;
  }
}
