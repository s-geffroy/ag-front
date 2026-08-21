import { describe, expect, it } from 'vitest';
import { HOMEPAGE_MAX_AGE_DAYS } from './veille';
import { NEWS_SIGNAL_MAX_AGE_DAYS } from './atlas-data';
import {
  ACTUALITE_MAX_AGE_DAYS,
  actualiteFeed,
  veilleCandidates,
  type ActualiteCandidate,
} from './actualite';

const now = new Date('2026-08-21T12:00:00.000Z');

const cand = (o: Partial<ActualiteCandidate> = {}): ActualiteCandidate => ({
  kind: 'note',
  href: '/notes/x',
  title: 'Un titre',
  line: 'Une phrase.',
  at: '2026-08-20T00:00:00.000Z',
  ...o,
});

describe('actualiteFeed — un seul fil, veille et publications mêlées', () => {
  it('est vide quand il n’y a rien', () => {
    expect(actualiteFeed([], now)).toEqual([]);
  });

  it('mêle les sources et ordonne par date, jamais par origine', () => {
    // Le point du périmètre unifié : une note publiée ce matin passe devant une promotion d'hier.
    // Si le tri groupait par `kind`, la veille resterait en tête à jamais et le fil ne serait
    // qu'une bande de veille avec des invités.
    const feed = actualiteFeed(
      [
        cand({ kind: 'veille', href: '/atlas/chokepoints/hormuz', at: '2026-08-20T09:00:00.000Z' }),
        cand({ kind: 'note', href: '/notes/frais', at: '2026-08-21T08:00:00.000Z' }),
        cand({ kind: 'dossier', href: '/dossiers/entre-deux', at: '2026-08-20T18:00:00.000Z' }),
      ],
      now,
    );
    expect(feed.map((e) => e.href)).toEqual([
      '/notes/frais',
      '/dossiers/entre-deux',
      '/atlas/chokepoints/hormuz',
    ]);
  });

  it('tombe vers le vide, jamais vers le périmé', () => {
    // La règle que ce module hérite de veille.ts : sur la page la plus vue du site, une absence est
    // honnête, un bloc périmé est une affirmation — et une affirmation est ce qui se met à mentir
    // quand plus personne ne l'alimente.
    expect(actualiteFeed([cand({ at: '2026-06-20T00:00:00.000Z' })], now)).toEqual([]);
  });

  it('utilise 21 jours, inclusif à la borne', () => {
    expect(ACTUALITE_MAX_AGE_DAYS).toBe(21);
    expect(actualiteFeed([cand({ at: '2026-07-31T12:00:00.000Z' })], now)).toHaveLength(1); // 21 j
    expect(actualiteFeed([cand({ at: '2026-07-31T11:00:00.000Z' })], now)).toEqual([]); // 21 j + 1 h
  });

  it('filtre ENTRÉE PAR ENTRÉE, pas tout ou rien', () => {
    // Le défaut de homepageVeille, qui testait l'âge du plus récent puis coupait sans revérifier :
    // elle pouvait afficher un item de mars à côté d'un item d'hier, sous un titre « Actualité ».
    const feed = actualiteFeed(
      [cand({ href: '/notes/frais' }), cand({ href: '/notes/mars', at: '2026-03-02T00:00:00.000Z' })],
      now,
    );
    expect(feed.map((e) => e.href)).toEqual(['/notes/frais']);
  });

  it('écarte une entrée sans date utilisable', () => {
    // Écart ASSUMÉ vis-à-vis de loadVeille, qui garde une estampille cassée en la triant en dernier :
    // là-bas la liste est exhaustive et la date est un ornement ; ici la date EST le prédicat, et une
    // entrée non datable ne peut pas être déclarée fraîche. Elle reste visible sur /veille et /notes.
    expect(actualiteFeed([cand({ at: 'pas-une-date' })], now)).toEqual([]);
    expect(actualiteFeed([cand({ at: null })], now)).toEqual([]);
    expect(actualiteFeed([cand({ at: undefined })], now)).toEqual([]);
  });

  it('écarte une date future', () => {
    // Une fiche à `updated: 2027-…` — coquille ou publication programmée — se punaiserait en tête du
    // fil pour toujours : un signal qui ne s'éteint jamais cesse d'en être un.
    expect(actualiteFeed([cand({ at: '2027-01-01T00:00:00.000Z' })], now)).toEqual([]);
  });

  it('coupe à quatre entrées par défaut, les plus récentes', () => {
    const feed = actualiteFeed(
      ['15', '16', '17', '18', '19', '20'].map((d) =>
        cand({ href: `/notes/${d}`, at: `2026-08-${d}T00:00:00.000Z` }),
      ),
      now,
    );
    expect(feed.map((e) => e.href)).toEqual([
      '/notes/20',
      '/notes/19',
      '/notes/18',
      '/notes/17',
    ]);
  });

  it('départage les ex æquo de façon déterministe', () => {
    // Les dates de contenu sont à la journée près, donc souvent égales ; l'ordre d'entrée vient de
    // getCollection, donc du système de fichiers. Sans départage, deux builds du même dépôt
    // pourraient produire deux pages différentes.
    const même = '2026-08-20T00:00:00.000Z';
    const entrées: ActualiteCandidate[] = [
      cand({ kind: 'note', href: '/notes/b', at: même }),
      cand({ kind: 'veille', href: '/atlas/chokepoints/hormuz', at: même }),
      cand({ kind: 'note', href: '/notes/a', at: même }),
      cand({ kind: 'dossier', href: '/dossiers/d', at: même }),
      cand({ kind: 'fiche', href: '/atlas/f', at: même }),
    ];
    const attendu = ['/dossiers/d', '/atlas/f', '/notes/a', '/notes/b'];
    expect(actualiteFeed(entrées, now).map((e) => e.href)).toEqual(attendu);
    expect(actualiteFeed(entrées.slice().reverse(), now).map((e) => e.href)).toEqual(attendu);
  });

  it('ne garde qu’une ligne par cible, la plus fraîche', () => {
    // Ormuz porte deux promotions valides (11 et 21 août) : les deux sont de vraies actualités, mais
    // sur un fil de quatre lignes elles donneraient la moitié de la page au même corridor et
    // évinceraient ce qui bouge ailleurs. L'exhaustivité est le travail de /veille et de la fiche.
    const feed = actualiteFeed(
      [
        cand({ kind: 'veille', href: '/atlas/chokepoints/hormuz', at: '2026-08-11T20:18:00.000Z' }),
        cand({ kind: 'veille', href: '/atlas/chokepoints/hormuz', at: '2026-08-21T10:44:00.000Z' }),
        cand({ kind: 'veille', href: '/atlas/chokepoints/panama', at: '2026-08-21T11:08:00.000Z' }),
      ],
      now,
    );
    expect(feed.map((e) => e.href)).toEqual([
      '/atlas/chokepoints/panama',
      '/atlas/chokepoints/hormuz',
    ]);
    expect(feed[1].at.toISOString()).toBe('2026-08-21T10:44:00.000Z');
  });

  it('rend des dates, pas des chaînes — le composant formate, il ne parse pas', () => {
    const [e] = actualiteFeed([cand()], now);
    expect(e.at).toBeInstanceOf(Date);
    expect(e.at.toISOString()).toBe('2026-08-20T00:00:00.000Z');
  });

  it('accepte une limite explicite', () => {
    const feed = actualiteFeed([cand({ href: '/a' }), cand({ href: '/b', at: '2026-08-19T00:00:00.000Z' })], now, {
      limit: 1,
    });
    expect(feed.map((e) => e.href)).toEqual(['/a']);
  });
});

describe('le seuil est UN seuil', () => {
  it('vaut 21 jours partout où le site parle de fraîcheur', () => {
    // Trois constantes, une seule valeur. Ce test est ce qui casse le jour où quelqu'un en déplace
    // une sans les autres — le dépôt a déjà payé pour cette duplication.
    expect(ACTUALITE_MAX_AGE_DAYS).toBe(HOMEPAGE_MAX_AGE_DAYS);
    expect(ACTUALITE_MAX_AGE_DAYS).toBe(NEWS_SIGNAL_MAX_AGE_DAYS);
  });
});

describe('veilleCandidates — un changement de forme, aucune règle', () => {
  const entry = (o: Record<string, unknown> = {}) =>
    ({
      corridorId: 'hormuz',
      corridorName: 'Détroit d’Ormuz',
      promotedAt: new Date('2026-08-21T10:44:00.000Z'),
      item: {
        editorial_note: 'Ce que cela change pour un décideur.',
        headline: 'UN TITRE DE MODÈLE',
        summary_text: 'Un résumé de modèle.',
      },
      ...o,
    }) as never;

  it('mappe le corridor vers sa fiche, et la phrase du promoteur vers la ligne', () => {
    expect(veilleCandidates([entry()])).toEqual([
      {
        kind: 'veille',
        href: '/atlas/chokepoints/hormuz',
        title: 'Détroit d’Ormuz',
        line: 'Ce que cela change pour un décideur.',
        at: new Date('2026-08-21T10:44:00.000Z'),
      },
    ]);
  });

  it('ne laisse passer NI headline NI summary_text (ADR 0074)', () => {
    // La garde de source de veille.test.ts vérifie que le fichier ne les mentionne pas ; celle-ci
    // vérifie qu'aucune valeur ne fuit par le résultat, quel que soit le champ choisi.
    const sérialisé = JSON.stringify(veilleCandidates([entry()]));
    expect(sérialisé).not.toMatch(/UN TITRE DE MODÈLE/);
    expect(sérialisé).not.toMatch(/Un résumé de modèle/);
  });

  it('ne plante pas sur une promotion à estampille inutilisable', () => {
    // loadVeille la garde (triée en dernier) ; c'est actualiteFeed qui l'écartera, pas l'adaptateur.
    const cands = veilleCandidates([entry({ promotedAt: null })]);
    expect(cands).toHaveLength(1);
    expect(actualiteFeed(cands, now)).toEqual([]);
  });
});
