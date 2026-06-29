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
        menace: { score: 4, rationale: 'acteur étatique hostile' },
        concentration: { score: 2, rationale: 'quelques alternatives' },
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

  it('every emitted candidate is a non-validated candidate with provenance', () => {
    const r = buildCandidates({ packet: packet() });
    const all = [...r.pestel, ...r.swot, ...r.options];
    expect(all.length).toBeGreaterThan(0);
    expect(all.every((c) => c.status === 'candidate' && c.source_kind !== 'manual')).toBe(true);
  });
});
