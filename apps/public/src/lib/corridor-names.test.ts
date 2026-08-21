import { describe, expect, it } from 'vitest';
import { CORRIDOR_NAME_FR, CORRIDOR_NAME_FR_PENDING, corridorNameFr } from './corridor-names';

describe('corridorNameFr — notre nom quand nous l’avons décidé, le leur sinon', () => {
  it('rend le nom français décidé', () => {
    expect(corridorNameFr('p0_maritime_strait_strait_of_hormuz', 'Strait of Hormuz')).toBe(
      'Détroit d’Ormuz',
    );
  });

  it('rend le nom de la base quand nous n’avons rien décidé — jamais une traduction fabriquée', () => {
    // Une absence de la table est honnête : c'est le nom que porte la donnée. Traduire à la volée
    // produirait un libellé que la base n'a pas, affiché là où va le nom canonique.
    expect(corridorNameFr('p9_inconnu', 'Some New Chokepoint')).toBe('Some New Chokepoint');
  });
});

describe('le rayon EN ATTENTE ne s’affiche pas', () => {
  it('aucune entrée en attente n’est rendue par corridorNameFr', () => {
    // C'est la garde qui compte. Ces libellés demandent un arbitrage — dire « goulet » ou
    // « chokepoint », qualifier une filière d'« occidentale » — et un candidat ne s'affiche pas.
    // Valider, c'est DÉPLACER la ligne vers CORRIDOR_NAME_FR ; ce test rend le raccourci impossible.
    for (const [id, proposition] of Object.entries(CORRIDOR_NAME_FR_PENDING)) {
      expect(corridorNameFr(id, 'NOM DE LA BASE')).toBe('NOM DE LA BASE');
      expect(corridorNameFr(id, 'NOM DE LA BASE')).not.toBe(proposition);
    }
  });

  it('les deux rayons sont disjoints', () => {
    const rendus = new Set(Object.keys(CORRIDOR_NAME_FR));
    for (const id of Object.keys(CORRIDOR_NAME_FR_PENDING)) expect(rendus.has(id)).toBe(false);
  });

  it('les propositions, s’il y en a, sont non vides', () => {
    // Le rayon est vide depuis l'arbitrage du 2026-08-21 : ce cas passe donc à vide, et c'est
    // voulu. La garde reste armée pour la prochaine entrée — une garde qu'on retire parce qu'elle
    // n'a plus rien à garder est une garde qu'on remet trop tard.
    for (const v of Object.values(CORRIDOR_NAME_FR_PENDING))
      expect(v.trim().length).toBeGreaterThan(0);
  });
});

describe('la table ne contient rien qui ressemble à un identifiant fabriqué', () => {
  it('toutes les clés ont la forme servie par la base', () => {
    // Dix-neuf des trente-trois clés de la première version étaient fausses : formées d'après le nom
    // anglais, pas relevées sur la donnée. La forme ne suffit pas à les valider — c'est ag:anchors
    // qui les confronte à l'API au build — mais elle écarte les fautes de frappe.
    for (const id of [...Object.keys(CORRIDOR_NAME_FR), ...Object.keys(CORRIDOR_NAME_FR_PENDING)]) {
      expect(id).toMatch(/^p\d_[a-z0-9_]+$/);
    }
  });

  it('aucun libellé rendu ne laisse d’anglais NON VOULU', () => {
    // « Chokepoint » est arbitré : nous le gardons en français, comme la méthode CVI et les
    // libellés de famille du site le font déjà. Ce test interdit l'anglais RÉSIDUEL — celui qu'on
    // laisse par oubli — pas l'anglicisme choisi. La liste ne retient que des mots SANS ambiguïté :
    // « Conversion » en a été retiré, il s'écrit à l'identique en français et faisait rougir
    // « Conversion occidentale de combustible nucléaire », qui est pourtant du français.
    for (const nom of Object.values(CORRIDOR_NAME_FR)) {
      expect(nom).not.toMatch(
        /\b(Strait|Canal of|Route of|System|Cluster|Network|Monopoly|Settlement|Clearing|Enrichment)\b/,
      );
    }
  });

  it('« chokepoint » est écrit tel quel là où le nom le porte', () => {
    // La décision du 2026-08-21, rendue vérifiable : ces deux objets s'appellent un chokepoint dans
    // la base, et l'escamoter en français aurait été trancher le vocabulaire par omission.
    const portant = Object.values(CORRIDOR_NAME_FR).filter((n) => /Chokepoint/.test(n));
    expect(portant).toHaveLength(2);
    for (const n of portant) expect(n).not.toMatch(/goulet|point de passage/i);
  });
});
