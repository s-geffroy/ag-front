import { describe, it, expect } from 'vitest';
import { Deliverable } from './cockpit/index';
import { Corridor, Provenance } from './content/index';

describe('cockpit/Deliverable', () => {
  it('parses a minimal P0 deliverable', () => {
    const d = Deliverable.parse({
      id: 'deliv_red_sea_suez_dossier',
      title: 'Dossier Mer Rouge / Suez',
      description: 'Conditions du retour de crédibilité commerciale.',
      type: 'dossier',
      pillar: 'production',
      status: 'production',
      priority: 'P0',
      progress: 40,
      deadline: '2026-09-15',
      next_action: 'Compléter les sources assurance maritime',
      impact: 'preuve_90_jours',
      offer: 'public',
      quality_gate_status: 'at_risk',
      gates: {
        sources_ok: false,
        llm_draft_done: true,
        contradiction_done: false,
        compliance_done: false,
        human_review_done: false,
      },
    });
    expect(d.priority).toBe('P0');
    expect(d.gates.cvi_justified).toBeUndefined();
  });

  it('rejects an out-of-range progress', () => {
    expect(() =>
      Deliverable.parse({
        id: 'x',
        title: 'x',
        description: 'x',
        type: 'note',
        pillar: 'production',
        status: 'backlog',
        priority: 'P2',
        progress: 140,
        deadline: '2026-09-15',
        next_action: 'x',
        impact: 'x',
        offer: 'public',
        quality_gate_status: 'not_started',
        gates: {
          sources_ok: false,
          llm_draft_done: false,
          contradiction_done: false,
          compliance_done: false,
          human_review_done: false,
        },
      }),
    ).toThrow();
  });
});

describe('content/Provenance', () => {
  it('defaults seeds to validation_status "candidate"', () => {
    const p = Provenance.parse({ confidence: 'moyen' });
    expect(p.validation_status).toBe('candidate');
    expect(p.sources).toEqual([]);
  });
});

describe('content/Corridor', () => {
  it('parses a corridor carrying a qualitative CVI assessment', () => {
    const c = Corridor.parse({
      id: 'red-sea-suez',
      name_fr: 'Mer Rouge / Suez / Bab el-Mandeb',
      family: 'maritime',
      priority: 'P0',
      verdict: 'Chokepoint économique, assurantiel et géopolitique.',
      definition: 'Système maritime reliant la Méditerranée au golfe d’Aden.',
      cvi: { scale: 'qualitative', global_level: 'eleve' },
      provenance: { confidence: 'eleve' },
    });
    expect(c.cvi?.scale).toBe('qualitative');
    expect(c.provenance.validation_status).toBe('candidate');
  });
});
