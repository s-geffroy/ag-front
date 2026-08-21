/**
 * Ce que le brouillon reçoit — et ce qu'il recevait pas.
 *
 * MESURÉ LE 2026-08-21 sur un vrai regroupement d'Ormuz : la couverture était portée par des médias
 * qatariens, américains, australiens et singapouriens — quatre pays DÉCLARÉS par l'amont depuis le
 * 1.3.0. Le prompt, lui, lisait « Pays identifiés : aucun identifiable », parce que la route passait
 * `countries: []` et `countryUnknown: 0` en dur. Un signal qui distingue « le monde en parle » de
 * « trois revues spécialisées » était calculé en amont, servi par l'API, et jeté à l'entrée.
 */

import { describe, expect, it } from 'vitest';
import { MARK_OPEN } from './prompts';
import { buildUserPrompt, draftContextFrom, hedgeWarning } from './note-draft';

const cluster = {
  cluster_id: 'c-1',
  headline: 'Attaques signalées contre des navires dans le détroit d’Ormuz',
  event_category: 'security_incident',
  salience_score: 0.9,
  article_count: 9,
  first_seen: '2026-08-19',
  last_seen: '2026-08-21',
  countries: [
    { code: 'QA', outlets: 2 },
    { code: 'US', outlets: 2 },
    { code: 'AU', outlets: 1 },
  ],
  outlets_without_country: 1,
  articles: [
    { title: 'Seafarer killed in latest Hormuz strike', url: 'https://a.com/1', outlet: 'a.com' },
    { title: 'Seafarer killed in latest Hormuz strike', url: 'https://b.com/1', outlet: 'b.com' },
    { title: 'Oil prices spike after fresh strikes', url: 'https://c.com/1', outlet: 'c.com' },
  ],
} as never;

describe('draftContextFrom — les signaux déclarés arrivent jusqu’au prompt', () => {
  const ctx = draftContextFrom(cluster, 'Détroit d’Ormuz', ['état opérationnel déclaré: degraded']);

  it('porte les PAYS DÉCLARÉS par l’amont, qui étaient passés en dur à vide', () => {
    expect(ctx.countries).toEqual(['QA', 'US', 'AU']);
  });

  it('porte les médias sans pays déclaré, comptés en MÉDIAS et jamais confondus avec zéro', () => {
    expect(ctx.countryUnknown).toBe(1);
  });

  it('classe les titres par nombre de rédactions, la reprise devant', () => {
    expect(ctx.titles[0]).toBe('Seafarer killed in latest Hormuz strike');
    expect(ctx.titles).toHaveLength(2);
  });

  it('compte les rédactions distinctes, pas les articles', () => {
    expect(ctx.outlets).toBe(3);
    expect(ctx.articles).toBe(9);
  });

  it('rend la fenêtre d’OBSERVATION telle quelle, sans la présenter comme des dates de publication', () => {
    expect(ctx.window).toBe('2026-08-19 → 2026-08-21');
  });
});

describe('buildUserPrompt — ce que le modèle lit vraiment', () => {
  it('énonce les pays comme un PLANCHER, avec leurs codes', () => {
    const prompt = buildUserPrompt(draftContextFrom(cluster, 'Détroit d’Ormuz', []), 'MARQUEUR');
    expect(prompt).toContain('au moins 3 (QA, US, AU)');
    expect(prompt).toContain('PLANCHER');
  });

  it('encadre toujours les titres du marqueur aléatoire — ce sont des données du web ouvert', () => {
    const prompt = buildUserPrompt(draftContextFrom(cluster, 'Ormuz', []), 'MARQUEUR');
    expect(prompt).toContain(MARK_OPEN('MARQUEUR'));
  });
});

describe('le prompt système dit la vérité sur ce qui arrive à la phrase', () => {
  it('n’affirme plus que le serveur refusera une note proche du brouillon (ADR 0079 amendé)', async () => {
    const { SYSTEM_PROMPT } = await import('./note-draft');
    expect(SYSTEM_PROMPT).not.toContain('le serveur la refusera');
  });

  it('porte le test de substitution — la faute réellement observée deux fois sur deux', async () => {
    const { SYSTEM_PROMPT } = await import('./note-draft');
    expect(SYSTEM_PROMPT).toContain('SUBSTITUTION');
  });
});

describe('hedgeWarning — un brouillon au conditionnel se signale, il ne se cache pas', () => {
  it('repère le verbe principal au conditionnel, la faute mesurée trois fois sur quatre', () => {
    expect(
      hedgeWarning(
        "Les attaques pourraient pousser les assureurs à réévaluer les clauses d'équipage.",
      ),
    ).toContain('conditionnel');
    expect(hedgeWarning('Cette réduction risquerait de retarder les chargeurs.')).toBeTruthy();
    expect(hedgeWarning('Les chargeurs devraient envisager un autre itinéraire.')).toBeTruthy();
    expect(hedgeWarning('Une hausse impactant potentiellement les chaînes.')).toBeTruthy();
  });

  it('laisse passer une phrase qui ÉTABLIT au lieu de supposer', () => {
    expect(
      hedgeWarning(
        "L'arrêt se double d'une relance d'arbitrage : l'horizon de reprise se compte en trimestres.",
      ),
    ).toBeNull();
  });

  it('ne se déclenche pas sur un « pourrait » enfoui dans une subordonnée citée', () => {
    expect(
      hedgeWarning('Le régime déclaré reste dégradé, sans date de levée annoncée.'),
    ).toBeNull();
  });
});
