import { describe, it, expect, beforeAll } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadPack, scoreEntity, buildEnterpriseDiagnostic } from '../server/engine';
import type { DomainPack, EntityLike } from '../server/engine';

const packDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'domain_packs',
  'enterprise_hidden_dependency_discovery',
);

let pack: DomainPack;
beforeAll(() => {
  pack = loadPack(packDir);
});

const roster: EntityLike[] = [
  {
    id: 's1',
    entity_type: 'supplier',
    name: 'Shenzhen Precision Components',
    country: 'China',
    what_it_enables: 'Modules électroniques critiques',
    criticality: 5,
    substitutability: 'no',
    tier2_visibility: 'no',
    jurisdiction_risk: 4,
    time_to_impact: 4,
    single_source: true,
  },
  {
    id: 's2',
    entity_type: 'supplier',
    name: 'Guangzhou Castings',
    country: 'China',
    criticality: 3,
    substitutability: 'partial',
    tier2_visibility: 'unknown',
    jurisdiction_risk: 4,
    time_to_impact: 2,
    single_source: false,
  },
  {
    id: 's3',
    entity_type: 'supplier',
    name: 'Ningbo Wiring',
    country: 'China',
    criticality: 2,
    substitutability: 'partial',
    tier2_visibility: 'no',
  },
  {
    id: 'c1',
    entity_type: 'customer',
    name: 'BigAuto OEM',
    country: 'Germany',
    criticality: 4,
    substitutability: 'partial',
    share_pct: 45,
  },
  {
    id: 'site1',
    entity_type: 'site',
    name: 'Usine Bietigheim',
    country: 'Germany',
    criticality: 4,
  },
];

describe('per-actor scoring', () => {
  it('scores a critical single-source supplier as high dependency / act-or-prepare', () => {
    const r = scoreEntity(pack, roster[0]);
    const dep = r.scores.find((s) => s.dimension_id === 'supplier_dependency_score')!.value;
    const subst = r.scores.find((s) => s.dimension_id === 'substitution_weakness_score')!.value;
    expect(dep).toBeGreaterThanOrEqual(4);
    expect(subst).toBe(5);
    expect(['prepare', 'act', 'escalate']).toContain(r.operational_verdict);
    expect(r.top_risk).toMatch(/\d\/5/);
  });

  it('treats a dominant customer as a concentration dependency', () => {
    const r = scoreEntity(pack, roster[3]);
    const dep = r.scores.find((s) => s.dimension_id === 'supplier_dependency_score')!.value;
    expect(dep).toBeGreaterThanOrEqual(4); // 45% share → score 5
  });
});

describe('enterprise synthesis', () => {
  it('builds per-actor results, concentration metrics, and a populated matrix', () => {
    const diag = buildEnterpriseDiagnostic(pack, [], roster);
    expect(diag.entities.length).toBe(5);
    expect(diag.matrix_rows.length).toBe(5); // matrix is no longer empty
    expect(diag.concentration.supplier_count).toBe(3);
    expect(diag.concentration.customer_count).toBe(1);
    expect(diag.concentration.single_source_supplier_count).toBe(1);
    expect(diag.concentration.customer_top_share_pct).toBe(45);
    expect(diag.concentration.supplier_top_country).toBe('China');
    expect(diag.concentration.supplier_top_country_count).toBe(3);
    // Concentration red flags surfaced.
    const flagIds = diag.red_flags.map((f) => f.id);
    expect(flagIds).toContain('customer_concentration');
    expect(flagIds).toContain('geographic_concentration');
    expect(flagIds).toContain('single_source_suppliers');
    // Enterprise verdict is at least as severe as the worst actor.
    expect(['prepare', 'act', 'escalate']).toContain(diag.operational_verdict);
  });

  it('is conservative with an empty roster', () => {
    const diag = buildEnterpriseDiagnostic(pack, [], []);
    expect(diag.entities).toEqual([]);
    expect(diag.concentration.supplier_count).toBe(0);
    expect(diag.operational_verdict).toBe('monitor');
  });
});
