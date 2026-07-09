import { describe, it, expect } from 'vitest';
import { buildCandidates } from './prefill';
import type { PrefillInput } from './prefill';
import type { PacketPayload } from '@ag/schema/hdde';
import type { CviAssessment } from '@ag/cvi';

function packet(overrides: Partial<PacketPayload> = {}): PacketPayload {
  return {
    case_id: 'case_1',
    pack_hash: 'sha256:abc',
    operational_verdict: 'act',
    confidence: 'medium',
    primary_diagnosis: 'hidden_second_tier_dependency',
    matched_verdict_rules: [],
    scores: [
      { dimension_id: 'hidden_dependency_score', value: 4, confidence: 'medium', rationale: 'tier-2 invisible', evidence_refs: [], open_uncertainties: [] },
      { dimension_id: 'evidence_quality_score', value: 2, confidence: 'low', rationale: 'peu de preuves', evidence_refs: [], open_uncertainties: [] },
    ],
    activated_patterns: [{ id: 'hidden_second_tier_dependency', label_fr: 'Dépendance cachée de rang 2' }],
    red_flags: [{ id: 'tier2_unknown', severity: 4, message: 'Tier-2 inconnu' }],
    open_uncertainties: [],
    light_actions: [
      { priority: 1, action: 'Cartographier les fournisseurs tier-2', purpose: 'Lever l’angle mort', owner_category: 'achats', suggested_delay: '30j', linked_risk: 'rupture' },
    ],
    matrix_rows: [],
    cvi: { flow_criticality_score: 4, vulnerability_level: 'élevé', note: 'corridor critique' },
    concentration: {
      supplier_count: 5,
      customer_count: 3,
      site_count: 2,
      single_source_supplier_count: 1,
      tier2_blind_spots: 2,
      customer_top_share_pct: 40,
      customer_hhi: 0.3,
      supplier_top_country: 'CN',
      supplier_top_country_count: 3,
      notes: [],
    },
    ...overrides,
  };
}

describe('buildCandidates — geopolitical pre-fill', () => {
  it('maps red flags and weak dimensions to SWOT weaknesses', () => {
    const r = buildCandidates({ packet: packet() });
    const weaknesses = r.swot.filter((s) => s.quadrant === 'weakness');
    expect(weaknesses.some((w) => w.source_ref === 'hdde:red_flag:tier2_unknown')).toBe(true);
    expect(weaknesses.some((w) => w.source_ref === 'hdde:score:hidden_dependency_score')).toBe(true);
    expect(weaknesses.some((w) => w.source_ref === 'hdde:concentration:single_source')).toBe(true);
  });

  it('maps activated patterns and concentration to SWOT threats', () => {
    const r = buildCandidates({ packet: packet() });
    const threats = r.swot.filter((s) => s.quadrant === 'threat');
    expect(threats.some((t) => t.source_ref === 'hdde:pattern:hidden_second_tier_dependency')).toBe(true);
    expect(threats.some((t) => t.source_ref === 'hdde:concentration:customer_top_share')).toBe(true);
    expect(threats.some((t) => t.source_ref === 'hdde:concentration:supplier_country')).toBe(true);
  });

  it('turns light actions into opportunities AND option seeds', () => {
    const r = buildCandidates({ packet: packet() });
    expect(r.swot.some((s) => s.quadrant === 'opportunity' && s.source_ref === 'hdde:light_action:1')).toBe(true);
    expect(r.options).toHaveLength(1);
    expect(r.options[0].title).toBe('Cartographier les fournisseurs tier-2');
    expect(r.options[0].status).toBe('candidate');
  });

  it('emits PESTEL factors from concentration country, CVI flow criticality and chokepoints', () => {
    const r = buildCandidates({
      packet: packet(),
      chokepoints: [{ id: 'suez', name: 'Canal de Suez', note: 'tensions Mer Rouge' }],
    });
    expect(r.pestel.some((p) => p.category === 'political' && p.source_ref === 'hdde:concentration:supplier_country')).toBe(true);
    expect(r.pestel.some((p) => p.category === 'economic' && p.source_ref === 'hdde:cvi:flow_criticality')).toBe(true);
    expect(r.pestel.some((p) => p.category === 'political' && p.source_ref === 'chokepoint:suez')).toBe(true);
  });

  it('adds CVI threat dimensions when scored ≥3', () => {
    const cvi: CviAssessment = {
      scale: '0-5',
      dimensions: {
        menace: {
          score: 4,
          rationale: 'acteur étatique hostile',
          source_refs: ['gdelt'],
          uncertainties: [],
        },
        concentration: {
          score: 2,
          rationale: 'quelques alternatives',
          source_refs: [],
          uncertainties: [],
        },
      },
      methodology_documented: false,
      sources: [],
      uncertainties: [],
    };
    const r = buildCandidates({ packet: packet(), cvi } satisfies PrefillInput);
    const threats = r.swot.filter((s) => s.quadrant === 'threat');
    expect(threats.some((t) => t.source_ref === 'cvi:menace')).toBe(true);
    // concentration scored 2 (<3) → not emitted.
    expect(threats.some((t) => t.source_ref === 'cvi:concentration')).toBe(false);
  });

  it('maps corridor_context episodes + analytics to SWOT threats with provenance', () => {
    const r = buildCandidates({
      packet: packet({
        corridor_context: {
          episodes: [{ key: 'red_sea_2024', name: 'Crise mer Rouge', started_on: '2024-01-01' }],
          analytics: [{ result_type: 'criticality_score', score: 0.9, summary: 'flux critique' }],
        },
      }),
    });
    const ep = r.swot.find((s) => s.source_ref === 'episode:red_sea_2024');
    expect(ep?.quadrant).toBe('threat');
    expect(ep?.source_kind).toBe('episode');
    expect(ep?.statement).toContain('Crise mer Rouge');
    const an = r.swot.find((s) => s.source_kind === 'analytics');
    expect(an?.quadrant).toBe('threat');
    expect(an?.statement).toContain('criticality_score');
  });

  it('every emitted candidate is a non-validated candidate with provenance', () => {
    const r = buildCandidates({ packet: packet() });
    const all = [...r.pestel, ...r.swot, ...r.options];
    expect(all.length).toBeGreaterThan(0);
    expect(all.every((c) => c.status === 'candidate' && c.source_kind !== 'manual')).toBe(true);
  });
});

/** Real payload shapes, copied from the live 0.6.0 producer (Hormuz / Panama). */
describe('derived corridor context → candidates (ADR 0057/0065)', () => {
  const dim = (score: number, rationale: string) => ({
    score,
    rationale,
    source_refs: [],
    uncertainties: [],
  });

  it('consumes all 8 CVI dimensions, routing each to the frame where it bears on the decision', () => {
    const cvi: CviAssessment = {
      scale: '0-5',
      methodology_documented: false,
      sources: [],
      uncertainties: [],
      dimensions: {
        exposition: dim(5, 'flux dépendants'),
        concentration: dim(4, 'peu d’alternatives'),
        menace: dim(4, 'acteur hostile'),
        capacite_perturbation: dim(5, 'moyens réels'),
        // `resilience` is high → SLOW to bypass → an internal weakness, not a threat.
        resilience: dim(4, 'contournement lent'),
        cout_contournement: dim(5, 'coût prohibitif'),
        gouvernance: dim(4, 'autorité contestée'),
        incertitude: { ...dim(3, 'données lacunaires'), uncertainties: ['pas de données buffer'] },
      },
    };
    const r = buildCandidates({ packet: packet(), cvi } satisfies PrefillInput);

    const refs = [...r.swot, ...r.pestel].map((x) => x.source_ref);
    for (const d of [
      'exposition',
      'concentration',
      'menace',
      'capacite_perturbation',
      'resilience',
      'cout_contournement',
      'gouvernance',
      'incertitude',
    ]) {
      expect(refs, `dimension ${d} not consumed`).toContain(`cvi:${d}`);
    }

    // A high `resilience` score means slow recovery: a weakness, never a threat.
    const res = r.swot.find((s) => s.source_ref === 'cvi:resilience');
    expect(res?.quadrant).toBe('weakness');

    // Uncertainty argues for buying information, not for/against an option.
    const unc = r.pestel.find((p) => p.source_ref === 'cvi:incertitude');
    expect(unc?.uncertainty).toBe('pas de données buffer');
  });

  /**
   * ADR 0049: the 0–100 CVI aggregate is gated on a documented methodology and never served. Guard the
   * PROPERTY — no statement is ever built from `aggregate_score` — rather than a text pattern. Producer
   * rationales legitimately contain strings like "HHI ≈51.0/100", so grepping statements for "/100"
   * fails on real data while catching nothing that matters.
   */
  it('never builds a statement from aggregate_score, even if a rogue packet carries one', () => {
    const cvi = {
      scale: '0-5',
      methodology_documented: false,
      sources: [],
      uncertainties: [],
      aggregate_score: 91,
      dimensions: { menace: dim(4, 'acteur hostile') },
    } as unknown as CviAssessment;
    const r = buildCandidates({ packet: packet(), cvi } satisfies PrefillInput);
    for (const c of [...r.swot, ...r.pestel]) {
      expect(c.statement).not.toContain('91');
      expect(c.source_ref).not.toContain('aggregate');
    }
  });

  it('tolerates the omitted `resilience` dimension without fabricating it', () => {
    const cvi: CviAssessment = {
      scale: '0-5',
      methodology_documented: false,
      sources: [],
      uncertainties: [],
      dimensions: { menace: dim(4, 'acteur hostile') },
    };
    const r = buildCandidates({ packet: packet(), cvi } satisfies PrefillInput);
    expect(r.swot.some((s) => s.source_ref === 'cvi:resilience')).toBe(false);
    expect(r.swot.some((s) => s.source_ref === 'cvi:menace')).toBe(true);
  });

  it('turns decision-relevant engine rows into threats, and ignores the rest', () => {
    const r = buildCandidates({
      packet: packet({
        corridor_analysis: {
          engines: [
            {
              key: 'weaponizability',
              columns: [],
              rows: [
                { leverage_score: 0.0962, top_actor_id: 'actor_state_iran', substitution_factor: 0.8 },
              ],
            },
            {
              key: 'exposed_trade_loss',
              columns: [],
              rows: [
                { exposed_value_usd: 2_000_000_000, expected_value_at_risk_usd: 300_000_000, closure_days: 30 },
              ],
            },
            {
              key: 'network_centrality',
              columns: [],
              rows: [{ articulation_point: true, betweenness: 0.000187, reachable_nodes_lost: 12 }],
            },
            {
              key: 'control_concentration',
              columns: [],
              rows: [{ hhi: 0.5102, actor_count: 2, top_actor_id: 'actor_state_iran', top_actor_share: 0.5714 }],
            },
            // Not a decision engine → no candidate at all.
            { key: 'evidence_quality', columns: [], rows: [{ score: 3 }] },
          ],
        },
      }),
    } satisfies PrefillInput);

    const stmts = r.swot.map((s) => s.statement).join('\n');
    expect(stmts).toContain('instrumentalisable');
    expect(stmts).toContain('actor_state_iran');
    expect(stmts).toContain("Point d'articulation");
    expect(stmts).toContain('Contrôle concentré');
    expect(stmts).toMatch(/Valeur commerciale exposée/);
    expect(r.swot.some((s) => s.source_ref?.startsWith('analysis:evidence_quality'))).toBe(false);
    expect(r.swot.filter((s) => s.source_kind === 'analysis').every((s) => s.status === 'candidate')).toBe(true);
  });

  it('emits nothing for a zero score — "not weaponizable" is an answer, not a threat', () => {
    const r = buildCandidates({
      packet: packet({
        corridor_analysis: {
          engines: [
            // Panama's real row: leverage 0, and a non-articulation centrality row.
            { key: 'weaponizability', columns: [], rows: [{ leverage_score: 0, top_actor_id: 'acp' }] },
            { key: 'network_centrality', columns: [], rows: [{ articulation_point: false, betweenness: 0 }] },
            { key: 'control_concentration', columns: [], rows: [{ hhi: 0.1, actor_count: 9 }] },
          ],
        },
      }),
    } satisfies PrefillInput);
    expect(r.swot.filter((s) => s.source_kind === 'analysis')).toEqual([]);
  });

  it('flags an out-of-corpus relation target as a coverage gap', () => {
    const r = buildCandidates({
      packet: packet({
        corridor_relations: {
          edges: [
            {
              to: 'autres_hubs_pacifique_nord',
              to_label: 'autres hubs Pacifique Nord',
              to_status: 'external_candidate',
              relation_type: 'dependency',
              strength_score: 4,
            },
            { to: 'p0_suez', to_status: 'in_corpus', relation_type: 'alternative_route' },
          ],
        },
      }),
    } satisfies PrefillInput);
    const gap = r.swot.find((s) => s.source_ref === 'relation:dependency:autres_hubs_pacifique_nord');
    expect(gap?.statement).toContain('hors corpus');
    expect(gap?.source_kind).toBe('relation');
    const inCorpus = r.swot.find((s) => s.source_ref === 'relation:alternative_route:p0_suez');
    expect(inCorpus?.statement).not.toContain('hors corpus');
  });

  it('carries the GLOBAL ENA regime as systemic context, never as a corridor score', () => {
    const r = buildCandidates({
      packet: packet({
        system_resilience: { scope: 'GLOBAL', regime: 'brittle', robustness: 0.2965, node_count: 165 },
      }),
    } satisfies PrefillInput);
    const p = r.pestel.find((x) => x.source_kind === 'system_resilience');
    expect(p?.source_ref).toBe('system_resilience:GLOBAL');
    expect(p?.statement).toContain('brittle');
    expect(p?.decisional_impact).toContain('se propage');
    expect(p?.status).toBe('candidate');
  });
});
