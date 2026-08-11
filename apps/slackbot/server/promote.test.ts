import { describe, expect, it } from 'vitest';
import {
  buildPromoteModal,
  clusterLabel,
  isAllowedChannel,
  NOTE_BLOCK_ID,
  outcomeFromCockpit,
  parseSubmission,
  validatedBy,
  CLUSTER_BLOCK_ID,
  CLUSTER_ACTION_ID,
  NOTE_ACTION_ID,
  PROMOTE_ACTION_PATTERN,
  promoteActionId,
  distinctStories,
  ageLabel,
  daysSince,
  windowLabel,
  type ClusterChoice,
} from './promote';

const cluster: ClusterChoice = {
  clusterId: 'c1',
  eventCategory: 'access_restriction',
  articleCount: 3,
  articles: [
    {
      title: 'Iran ties Hormuz reopening to US concessions',
      url: 'https://x.test/a',
      outlet: 'Reuters',
    },
    { title: 'Traffic dwindles', url: 'https://x.test/b', outlet: 'Reuters' },
  ],
};

describe('isAllowedChannel — l’autorisation EST le canal privé', () => {
  it('accepte le canal configuré, refuse tout autre', () => {
    expect(isAllowedChannel('C123', 'C123')).toBe(true);
    expect(isAllowedChannel('C999', 'C123')).toBe(false);
  });

  it('refuse TOUT quand la configuration manque, jamais l’inverse', () => {
    // Un défaut de configuration doit fermer la porte, pas l’ouvrir : un bouton transféré dans un
    // autre canal n’est pas une approbation.
    expect(isAllowedChannel('C123', undefined)).toBe(false);
    expect(isAllowedChannel('C123', '   ')).toBe(false);
    expect(isAllowedChannel(undefined, 'C123')).toBe(false);
  });
});

describe('validatedBy', () => {
  it('inscrit le passage par Slack dans le journal nominatif', () => {
    expect(validatedBy('Sylvain Geffroy')).toBe('Sylvain Geffroy (via Slack)');
    expect(validatedBy('  Sylvain Geffroy  ')).toBe('Sylvain Geffroy (via Slack)');
  });
});

describe('clusterLabel — jamais la prose du modèle', () => {
  it('décrit le regroupement par ses faits, pas par son titre généré', () => {
    const l = clusterLabel(cluster);
    expect(l).toContain('access restriction');
    expect(l).toContain('3 art.'); // abrégé pour laisser tenir la fenêtre d'observation sous les 75 caractères de Slack
  });

  it('respecte la limite de 75 caractères de Slack', () => {
    const long = clusterLabel({
      ...cluster,
      eventCategory: 'x'.repeat(80),
      articles: [{ title: 'y'.repeat(80), url: 'https://x.test/a', outlet: 'z'.repeat(80) }],
    });
    expect(long.length).toBeLessThanOrEqual(75);
  });
});

describe('buildPromoteModal', () => {
  const modal = buildPromoteModal('hormuz', [cluster], '2026-08-11');

  it('porte le corridor et les deux champs attendus', () => {
    expect(modal.private_metadata).toBe('hormuz');
    const ids = modal.blocks.map((b) => (b as { block_id?: string }).block_id);
    expect(ids).toContain(CLUSTER_BLOCK_ID);
    expect(ids).toContain(NOTE_BLOCK_ID);
  });

  it('met les titres des ÉDITEURS en liens cliquables — lire est à une tape', () => {
    const json = JSON.stringify(modal);
    expect(json).toContain('https://x.test/a');
    expect(json).toContain('Iran ties Hormuz reopening');
  });

  it('n’expose jamais headline ni summary_text', () => {
    // ClusterChoice ne les porte même pas : la garde est dans le type, ce test la constate.
    expect(JSON.stringify(modal)).not.toMatch(/headline|summary_text/);
  });
});

describe('parseSubmission', () => {
  const view = (note: string, clusterId = 'c1') => ({
    private_metadata: 'hormuz',
    state: {
      values: {
        [CLUSTER_BLOCK_ID]: { [CLUSTER_ACTION_ID]: { selected_option: { value: clusterId } } },
        [NOTE_BLOCK_ID]: { [NOTE_ACTION_ID]: { value: note } },
      },
    },
  });

  it('relit le choix et la phrase', () => {
    expect(parseSubmission(view('  Le passage devient négociable.  '))).toEqual({
      corridorId: 'hormuz',
      clusterId: 'c1',
      note: 'Le passage devient négociable.',
    });
  });

  it('refuse une soumission sans corridor ou sans regroupement', () => {
    expect(() => parseSubmission({ ...view('x'), private_metadata: '' })).toThrow();
    expect(() => parseSubmission(view('x', ''))).toThrow();
  });
});

describe('outcomeFromCockpit', () => {
  it('remonte le refus de paraphrase SOUS LE CHAMP, pas dans un log', () => {
    const o = outcomeFromCockpit(422, {
      error: 'editorial_note_paraphrase',
      message: 'Votre phrase reprend un texte déjà présent.',
    });
    expect(o).toEqual({
      ok: false,
      field: 'note',
      message: 'Votre phrase reprend un texte déjà présent.',
    });
  });

  it('réussit sur 2xx', () => {
    expect(outcomeFromCockpit(201, {})).toEqual({ ok: true });
  });

  it('traite les autres refus sans prétendre savoir lequel', () => {
    expect(outcomeFromCockpit(409, {})).toEqual({
      ok: false,
      field: null,
      message: 'Le cockpit a refusé (HTTP 409).',
    });
  });
});

describe('action_id — unicité dans un message', () => {
  it('suffixe chaque bouton, car Slack rejette un message où deux elements partagent un action_id', () => {
    const ids = [0, 1, 2, 3, 4].map(promoteActionId);
    expect(new Set(ids).size).toBe(5);
    expect(ids[0]).toBe('promote_corridor_0');
  });

  it('écoute les suffixés ET la forme nue, pour ne pas perdre les messages déjà postés', () => {
    expect(PROMOTE_ACTION_PATTERN.test('promote_corridor_3')).toBe(true);
    expect(PROMOTE_ACTION_PATTERN.test('promote_corridor')).toBe(true);
  });

  it("n'attrape pas une action voisine qui commencerait pareil", () => {
    expect(PROMOTE_ACTION_PATTERN.test('promote_corridor_x')).toBe(false);
    expect(PROMOTE_ACTION_PATTERN.test('promote_corridor_note')).toBe(false);
  });
});

describe('distinctStories — une dépêche reprise n’est pas quatre nouvelles', () => {
  const wire = (outlet: string) => ({
    title: 'Strait of Hormuz Remains Key Flashpoint as U.S. Weighs Next Steps with Iran',
    url: `https://${outlet}/2026/08/10/strait-of-hormuz`,
    outlet,
  });

  it('regroupe les reprises et compte leur nombre au lieu de les effacer', () => {
    const d = distinctStories([
      wire('wmal.com'),
      wire('wmac-am.com'),
      wire('wgowam.com'),
      wire('newsradio1029.com'),
      {
        title: "U.S. assesses Iran's priority shifted",
        url: 'https://nbcnews.com/x',
        outlet: 'nbcnews.com',
      },
    ]);
    expect(d).toHaveLength(2);
    expect(d[0].republications).toBe(3);
    expect(d[1].republications).toBe(0);
  });

  it("fait remonter l'article distinct qui était noyé en cinquième position", () => {
    const arts = [
      wire('a.com'),
      wire('b.com'),
      wire('c.com'),
      wire('d.com'),
      wire('e.com'),
      { title: 'Une autre histoire', url: 'https://f.com/x', outlet: 'f.com' },
    ];
    expect(
      distinctStories(arts)
        .slice(0, 4)
        .map((a) => a.title),
    ).toContain('Une autre histoire');
  });

  it('traite les entités HTML du flux comme du texte, pas comme une différence de titre', () => {
    const d = distinctStories([
      { title: 'Trump says&#xA0;the US has swept Strait of Hormuz', url: 'https://a/1' },
      { title: 'Trump says the US has swept Strait of Hormuz', url: 'https://b/1' },
    ]);
    expect(d).toHaveLength(1);
  });

  it('garde le premier média rencontré comme lien, sans en inventer un', () => {
    const d = distinctStories([wire('wmal.com'), wire('nbcnews.com')]);
    expect(d[0].url).toContain('wmal.com');
  });
});

describe("âge — on date l'observation, pas la publication", () => {
  it('compte les jours depuis la date vue dans le flux', () => {
    expect(daysSince('2026-08-08', '2026-08-11')).toBe(3);
    expect(daysSince('2026-08-11', '2026-08-11')).toBe(0);
  });

  it('dit « vu », jamais « publié » — nous n’avons pas la date de publication', () => {
    expect(ageLabel('2026-08-11', '2026-08-11')).toBe("vu aujourd'hui");
    expect(ageLabel('2026-08-10', '2026-08-11')).toBe('vu hier');
    expect(ageLabel('2026-08-08', '2026-08-11')).toBe('vu il y a 3 j');
  });

  it('rend null quand la date manque, plutôt qu’un mot vague qui passerait pour de la fraîcheur', () => {
    expect(ageLabel(undefined, '2026-08-11')).toBeNull();
    expect(ageLabel('hier', '2026-08-11')).toBeNull();
  });

  it('date une histoire par sa reprise la PLUS ANCIENNE, sans la rajeunir', () => {
    const d = distinctStories([
      { title: 'Même dépêche', url: 'https://a/1', observedOn: '2026-08-11' },
      { title: 'Même dépêche', url: 'https://b/1', observedOn: '2026-08-08' },
    ]);
    expect(d[0].observedOn).toBe('2026-08-08');
  });

  it('affiche une fenêtre, et un point unique quand les bornes se confondent', () => {
    expect(windowLabel('2026-08-08', '2026-08-11')).toBe('08/08 → 11/08');
    expect(windowLabel('2026-08-11', '2026-08-11')).toBe('11/08');
    expect(windowLabel(undefined, undefined)).toBeNull();
  });
});
