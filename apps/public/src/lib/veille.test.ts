import { beforeEach, describe, expect, it, vi } from 'vitest';

const store: Record<string, unknown> = {};
vi.mock('../data/promoted-news.json', () => ({ default: store }));

const { loadVeille, veilleIsPublic, lastReviewedAt, HOMEPAGE_MAX_AGE_DAYS } =
  await import('./veille');

const item = (o: Record<string, unknown> = {}) => ({
  articles: [{ title: 'Un titre', url: 'https://example.org/a', outlet: 'Reuters' }],
  affected_chokepoints: [{ chokepoint_id: 'hormuz', canonical_name: 'Détroit d’Ormuz' }],
  first_seen: '',
  last_seen: '',
  generated_at: '',
  editorial_note: 'Ce que cela change pour un décideur.',
  promoted_by: 'Sylvain Geffroy',
  promoted_at: '2026-08-10T10:00:00.000Z',
  taint_class: 'cleared_only',
  cluster_id: 'c1',
  run_id: '',
  ...o,
});

function setStore(next: Record<string, unknown>) {
  for (const k of Object.keys(store)) delete store[k];
  Object.assign(store, next);
}

beforeEach(() => setStore({}));

describe('loadVeille', () => {
  it('is empty on an empty store — the state the site has been in since day one', () => {
    expect(loadVeille()).toEqual([]);
    expect(veilleIsPublic()).toBe(false);
    expect(lastReviewedAt()).toBeNull();
  });

  it('flattens corridors and sorts newest first', () => {
    setStore({
      hormuz: [item({ cluster_id: 'vieux', promoted_at: '2026-08-01T00:00:00.000Z' })],
      suez: [item({ cluster_id: 'récent', promoted_at: '2026-08-09T00:00:00.000Z' })],
    });
    expect(loadVeille().map((e) => e.item.cluster_id)).toEqual(['récent', 'vieux']);
    expect(veilleIsPublic()).toBe(true);
  });

  it('names the corridor from the cluster’s own list, keyed by the STORE key', () => {
    // The payload can name several corridors; the one that matters is the bucket it was promoted
    // into, otherwise an item would be labelled with a neighbour's name.
    setStore({
      hormuz: [
        item({
          affected_chokepoints: [
            { chokepoint_id: 'suez', canonical_name: 'Canal de Suez' },
            { chokepoint_id: 'hormuz', canonical_name: 'Détroit d’Ormuz' },
          ],
        }),
      ],
    });
    expect(loadVeille()[0].corridorName).toBe('Détroit d’Ormuz');
  });

  it('falls back to the id rather than inventing a name', () => {
    setStore({ inconnu: [item({ affected_chokepoints: [] })] });
    expect(loadVeille()[0].corridorName).toBe('inconnu');
  });

  it('drops what does not parse and what is not cleared', () => {
    setStore({
      hormuz: [
        item(),
        { garbage: true },
        item({ cluster_id: 'tainted', taint_class: 'all_sources' }),
      ],
    });
    expect(loadVeille().map((e) => e.item.cluster_id)).toEqual(['c1']);
  });

  it('keeps an item whose stamp is unusable, but sorts it last', () => {
    // A promotion that happened must stay visible; a malformed date is not grounds for erasing it.
    setStore({
      hormuz: [
        item({ cluster_id: 'cassé', promoted_at: 'pas-une-date' }),
        item({ cluster_id: 'ok' }),
      ],
    });
    expect(loadVeille().map((e) => e.item.cluster_id)).toEqual(['ok', 'cassé']);
  });
});

describe('HOMEPAGE_MAX_AGE_DAYS', () => {
  it('vaut 21 jours', () => {
    // La règle qui le CONSOMME vit maintenant dans lib/actualite.ts (fil unifié), et son test
    // vérifie que les trois constantes de fraîcheur du site n'ont pas divergé. Ici on tient
    // seulement la valeur arbitrée, à côté de la docstring qui dit d'où elle vient.
    expect(HOMEPAGE_MAX_AGE_DAYS).toBe(21);
  });
});

describe('ADR 0074 — la prose du modèle ne doit atteindre aucune surface publique', () => {
  // Garde de source, volontairement grossière : les composants .astro ne se testent pas au rendu ici,
  // mais la règle qui compte est vérifiable au texte. `headline` et `summary_text` restent au store
  // comme trace de ce qui a été PROPOSÉ ; les rendre remettrait un artefact de second ordre à la
  // place la plus visible, validé par quelqu'un n'ayant lu que des titres. C'est le défaut retiré.
  const surfaces = [
    '../components/atlas/PromotedNewsBlock.astro',
    '../components/ActualiteBlock.astro',
    // L'adaptateur veille → fil d'actualité : c'est lui qui choisit le champ publié.
    '../lib/actualite.ts',
    // La page compose le fil ; elle ne doit pas contourner l'adaptateur pour lire l'item brut.
    '../pages/index.astro',
    '../pages/veille/[...page].astro',
    '../pages/veille/rss.xml.js',
  ];

  it.each(surfaces)('%s ne lit ni headline ni summary_text', async (rel) => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const src = readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
    // On ignore les commentaires, qui parlent légitimement de ces champs pour dire de ne pas les rendre.
    const code = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*(\/\/|\*).*$/gm, '')
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
    expect(code).not.toMatch(/\bheadline\b/);
    expect(code).not.toMatch(/\bsummary_text\b/);
  });
});
