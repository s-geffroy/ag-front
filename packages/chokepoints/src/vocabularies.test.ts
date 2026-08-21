import { describe, it, expect } from 'vitest';
import { VocabulariesOut } from './schema';

/**
 * RÉGRESSION MESURÉE, PAS SUPPOSÉE. Le 2026-08-21, `VocabulariesOut.parse` échouait sur la charge
 * utile de production : `flow_type_families`, `sfim_tier_crosswalk` et `_index` ne sont plus des
 * listes. Le proxy du cockpit rendait donc 502 sur cet endpoint, et aucune garde ne pouvait le voir —
 * la réponse est un dict non typé au contrat, il n'y a pas de propriété de schéma à comparer.
 *
 * Les trois formes ci-dessous sont transcrites de la réponse réelle, pas inventées.
 */
describe('/vocabularies : trois formes coexistent sous `controlled`', () => {
  const live = {
    controlled: {
      // la forme ordinaire
      alert_levels: ['critical', 'elevated', 'none', 'watch'],
      // table terme → famille (2.x)
      flow_type_families: { Afghanistan_transit: 'trade_corridor', Balkan_rail: 'trade_corridor' },
      // table palier → classes (2.x)
      sfim_tier_crosswalk: {
        tier_1: ['S1_institutional', 'S2_operator_authority'],
        tier_2: ['S3_sector_reference', 'S4_academic'],
      },
      // table de tables, jamais annoncée
      _index: { actor_types: { navy: 'navy', state: 'state' } },
    },
    control_dimensions: [],
    actor_profile_types: [],
    alert_types: [],
    architecture_labels: [],
  };

  it('la charge utile de production parse', () => {
    const r = VocabulariesOut.safeParse(live);
    expect(r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)).toEqual(
      [],
    );
  });

  it('une liste de termes reste une liste', () => {
    const v = VocabulariesOut.parse(live);
    expect(v.controlled.alert_levels).toEqual(['critical', 'elevated', 'none', 'watch']);
  });

  it('une table conserve ses valeurs — et non ses seules clefs', () => {
    const v = VocabulariesOut.parse(live);
    // Le défaut d'avant 1.9.0 : `sorted()` sur un dictionnaire servait la liste de ses clefs, soit un
    // contenu vide qui avait l'air d'un contenu. Ce test échouerait si nous le reproduisions ici.
    expect(v.controlled.sfim_tier_crosswalk).toEqual(live.controlled.sfim_tier_crosswalk);
    expect(v.controlled.flow_type_families).toEqual(live.controlled.flow_type_families);
  });
});
