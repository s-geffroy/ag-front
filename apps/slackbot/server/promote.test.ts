import { outletCountry } from './country';
import { describe, expect, it } from 'vitest';
import {
  buildPromoteModal,
  buildWritingModal,
  buildWritingModalWithDraft,
  clusterLabel,
  isAllowedChannel,
  NOTE_BLOCK_ID,
  NOTE_BLOCK_ID_DRAFT,
  outcomeFromCockpit,
  pickEntry,
  parseSubmission,
  parsePick,
  validatedBy,
  NOTE_ACTION_ID,
  PROMOTE_ACTION_PATTERN,
  promoteActionId,
  distinctStories,
  ageLabel,
  daysSince,
  windowLabel,
  decodeEntities,
  PROMOTABLE_IN_MODAL,
  rankSubjects,
  subjectWeight,
  weightLine,
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

// Ce bloc gardait la règle de l'ADR 0074 : aucune prose du modèle dans l'étiquette. L'ADR 0078
// l'amende — l'intitulé revient POUR CHOISIR, marqué, et reste banni de la publication. Le test
// change donc de garde : ce n'est plus « pas de prose », c'est « le chiffre d'abord, la prose
// ensuite, et jamais dans ce qui est publié ».
describe('clusterLabel — le poids devant, l’intitulé du modèle derrière', () => {
  it('ouvre sur le nombre de médias, pas sur le titre généré', () => {
    const l = clusterLabel({ ...cluster, headline: 'Un titre écrit par le modèle' });
    expect(l).toMatch(/^\d+ méd\. · /);
    expect(l.indexOf('méd.')).toBeLessThan(l.indexOf('Un titre'));
  });

  it('retombe sur la catégorie, jamais sur un titre inventé, quand le modèle se tait', () => {
    const l = clusterLabel({ ...cluster, headline: undefined });
    expect(l).toContain('access restriction');
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

  it('porte le corridor et un bouton par sujet', () => {
    expect(modal.private_metadata).toBe('hormuz');
    expect(modal.blocks.some((b) => (b as { accessory?: unknown }).accessory)).toBe(true);
  });

  it('met les titres des ÉDITEURS en liens cliquables — lire est à une tape', () => {
    const json = JSON.stringify(modal);
    expect(json).toContain('https://x.test/a');
    expect(json).toContain('Iran ties Hormuz reopening');
  });

  it('n’expose jamais summary_text, et marque l’intitulé quand il le montre', () => {
    // ADR 0078 : `headline` est affiché POUR CHOISIR, toujours préfixé ; `summary_text` reste banni.
    const json = JSON.stringify(
      buildPromoteModal('hormuz', [{ ...cluster, headline: 'X' }], '2026-08-11'),
    );
    expect(json).not.toMatch(/summary_text/);
    // Le marquage tient en une mention de tête, pas en un préfixe répété sur chaque ligne.
    expect(json).toContain('proposés par le modèle amont');
    expect(json).not.toContain('⟨modèle⟩');
  });
});

describe('parseSubmission', () => {
  const view = (note: string, clusterId = 'c1') => ({
    private_metadata: JSON.stringify({
      corridorId: 'hormuz',
      clusterId,
      urls: ['https://x.test/a'],
      draft: 'un brouillon machine',
    }),
    state: {
      values: {
        [NOTE_BLOCK_ID]: { [NOTE_ACTION_ID]: { value: note } },
      },
    },
  });

  it('relit le choix, la phrase, les URL de repli et le brouillon montré', () => {
    expect(parseSubmission(view('  Ma phrase.  '))).toEqual({
      blockId: NOTE_BLOCK_ID,
      corridorId: 'hormuz',
      clusterId: 'c1',
      urls: ['https://x.test/a'],
      draft: 'un brouillon machine',
      // Cette fenêtre-là n'a montré aucune ligne « ce que la couverture ajoute ».
      whatItAdds: '',
      note: 'Ma phrase.',
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

describe('poids — le nombre de médias, et un plancher de pays', () => {
  const art = (outlet: string, title = 'Même dépêche') => ({
    title,
    url: `https://${outlet}/a`,
    outlet,
    observedOn: '2026-08-10',
  });

  it('compte les MÉDIAS distincts, pas les articles', () => {
    const d = distinctStories([art('a.com'), art('a.com'), art('b.com')]);
    expect(d[0].outlets).toBe(2);
    expect(d[0].republications).toBe(2); // trois articles, donc deux reprises
  });

  it('classe la plus portée en premier, quel que soit son rang dans le flux', () => {
    const d = distinctStories([
      art('solo.com', 'Entrefilet unique'),
      art('a.com'),
      art('b.com'),
      art('c.com'),
    ]);
    expect(d[0].title).toBe('Même dépêche');
    expect(d[0].outlets).toBe(3);
  });

  it("n'énonce les pays qu'en plancher, et compte les médias muets en MÉDIAS", () => {
    const d = distinctStories([art('x.co.uk'), art('y.ie'), art('z.com'), art('w.com')]);
    expect(d[0].countries).toEqual(['Irlande', 'Royaume-Uni']);
    expect(d[0].countryUnknown).toBe(2); // z.com et w.com — deux médias, pas deux articles
  });

  it('ne prête pas de pays à un gTLD ni à un ccTLD vendu comme générique', () => {
    expect(outletCountry('nbcnews.com')).toBeUndefined();
    expect(outletCountry('example.org')).toBeUndefined();
    expect(outletCountry('startup.io')).toBeUndefined(); // pas « Territoire de l’océan Indien »
    expect(outletCountry('news.co')).toBeUndefined(); // pas « Colombie »
  });

  it('lit le pays quand le domaine le déclare vraiment, second niveau compris', () => {
    expect(outletCountry('ibtimes.co.uk')).toBe('Royaume-Uni');
    expect(outletCountry('abc.net.au')).toBe('Australie');
    expect(outletCountry('theweek.in')).toBe('Inde');
    expect(outletCountry('trend.az')).toBe('Azerbaïdjan');
  });

  it('rend les entités HTML lisibles sans réécrire le titre de l’éditeur', () => {
    expect(decodeEntities('Trump says&#xA0;the US has swept')).toBe('Trump says the US has swept');
    expect(decodeEntities('Oil &amp; gas')).toBe('Oil & gas');
  });
});

describe("la fenêtre n'offre que ce qu'elle montre", () => {
  const cluster = (i: number) => ({
    clusterId: `c${i}`,
    headline: `Sujet ${i}`,
    eventCategory: 'security',
    articleCount: 3,
    firstSeen: '2026-08-10',
    lastSeen: '2026-08-11',
    articles: [
      {
        title: `Titre ${i}`,
        url: `https://x${i}.com/a`,
        outlet: `x${i}.com`,
        observedOn: '2026-08-11',
      },
    ],
  });

  const buttons = (modal: any) =>
    modal.blocks.filter((b: any) => b.accessory?.type === 'button').map((b: any) => b.accessory);

  it('pose un bouton par sujet affiché, et aucun menu à re-choisir', () => {
    const modal: any = buildPromoteModal(
      'hormuz',
      [...Array(23)].map((_, i) => cluster(i)),
      '2026-08-11',
    );
    expect(buttons(modal)).toHaveLength(PROMOTABLE_IN_MODAL);
    expect(modal.blocks.some((b: any) => b.element?.type === 'static_select')).toBe(false);
  });

  it('emporte les URL de repli, car un cluster_id ne survit pas à une passe amont', () => {
    const modal: any = buildPromoteModal('hormuz', [cluster(0)], '2026-08-11');
    const pick = parsePick(buttons(modal)[0].value);
    expect(pick.clusterId).toBe('c0');
    expect(pick.urls[0]).toContain('x0.com');
  });

  it('déclare le reste au lieu de le taire', () => {
    const modal: any = buildPromoteModal(
      'hormuz',
      [...Array(23)].map((_, i) => cluster(i)),
      '2026-08-11',
    );
    const texts = modal.blocks
      .filter((b: any) => b.type === 'context')
      .map((b: any) => b.elements[0].text);
    expect(texts.some((t: string) => t.includes('18 autre(s) sujet(s)'))).toBe(true);
  });

  it("n'annonce aucune coupe quand il n'y en a pas", () => {
    const modal: any = buildPromoteModal('hormuz', [cluster(0), cluster(1)], '2026-08-11');
    const texts = modal.blocks
      .filter((b: any) => b.type === 'context')
      .map((b: any) => b.elements[0].text);
    expect(texts.some((t: string) => t.includes('ne sont pas montrés'))).toBe(false);
  });
});

describe('sujets — classer par ce qui est porté, pas par ce qui est relayé', () => {
  const subject = (id: string, headline: string, outlets: string[], articlesPerOutlet = 1) => ({
    clusterId: id,
    headline,
    eventCategory: 'security',
    articleCount: outlets.length * articlesPerOutlet,
    firstSeen: '2026-08-08',
    lastSeen: '2026-08-11',
    articles: outlets.flatMap((o, i) =>
      [...Array(articlesPerOutlet)].map((_, k) => ({
        title: `Titre ${i}-${k}`,
        url: `https://${o}/${i}-${k}`,
        outlet: o,
        observedOn: '2026-08-10',
      })),
    ),
  });

  it('compte les rédactions distinctes, pas les articles', () => {
    const w = subjectWeight(subject('c1', 'Sujet', ['a.com', 'b.com'], 20));
    expect(w.outlets).toBe(2);
    expect(w.articles).toBe(40);
  });

  it('met devant le sujet le plus PORTÉ, même s’il a moins d’articles', () => {
    const relaye = subject('relaye', 'Dépêche relayée', ['x.com', 'y.com'], 40); // 80 articles, 2 médias
    const porte = subject(
      'porte',
      'Sujet réellement porté',
      [...Array(30)].map((_, i) => `m${i}.com`),
    ); // 30 art., 30 médias
    const r = rankSubjects([relaye, porte]);
    expect(r[0].cluster.clusterId).toBe('porte');
    expect(r[0].weight.outlets).toBe(30);
  });

  it("n'utilise PAS le nombre de pays pour classer — il n'est mesurable qu'au tiers", () => {
    const usa = subject(
      'usa',
      'Couverture américaine',
      [...Array(20)].map((_, i) => `radio${i}.com`),
    );
    const intl = subject('intl', 'Couverture internationale', ['a.co.uk', 'b.fr', 'c.de']);
    const r = rankSubjects([intl, usa]);
    // 20 médias sans pays déclaré passent devant 3 médias dans 3 pays : c'est voulu.
    expect(r[0].cluster.clusterId).toBe('usa');
    expect(r[1].weight.countries).toEqual(['Allemagne', 'France', 'Royaume-Uni']);
  });

  it('affiche le pays en plancher, avec les indéterminés à côté', () => {
    const w = subjectWeight(subject('c', 'S', ['a.co.uk', 'b.com', 'c.com']));
    expect(weightLine(w, '08/08 → 11/08')).toContain('≥ 1 pays (Royaume-Uni)');
    expect(weightLine(w, '08/08 → 11/08')).toContain('2 sans pays déclaré');
  });

  it("porte l'intitulé du modèle dans le menu, derrière le poids", () => {
    const l = clusterLabel(
      subject('c', 'L’Iran lie la réouverture du détroit', ['a.com', 'b.com']),
    );
    expect(l).toMatch(/^2 méd\. · L’Iran lie/);
  });

  it('retombe sur la catégorie quand le modèle n’a pas donné d’intitulé', () => {
    const c = subject('c', '', ['a.com']);
    expect(clusterLabel({ ...c, headline: undefined })).toContain('security');
  });
});

describe('écho et saillance sont deux mesures, pas une', () => {
  const subj = (id: string, outlets: number, salience: number) => ({
    clusterId: id,
    headline: `Sujet ${id}`,
    articleCount: outlets,
    articles: [...Array(outlets)].map((_, i) => ({
      title: `T${id}-${i}`,
      url: `https://o${id}${i}.com/a`,
      outlet: `o${id}${i}.com`,
      observedOn: '2026-08-10',
    })),
    salience,
  });

  it('signale un sujet jugé saillant que personne ne reprend', () => {
    const w = subjectWeight(subj('trafic', 3, 0.9));
    expect(w.quietButSalient).toBe(true);
    expect(weightLine(w, null)).toContain('peu repris');
  });

  it('ne le signale pas quand le sujet est largement repris', () => {
    expect(subjectWeight(subj('iran', 199, 0.9)).quietButSalient).toBe(false);
  });

  it('ne le signale pas quand l’amont ne juge pas le sujet saillant', () => {
    expect(subjectWeight(subj('bric', 1, 0.38)).quietButSalient).toBe(false);
  });

  it('ne prétend aucune saillance quand l’amont n’en fournit pas', () => {
    const w = subjectWeight({ ...subj('x', 3, 0), salience: undefined });
    expect(w.salience).toBeUndefined();
    expect(w.quietButSalient).toBe(false);
    expect(weightLine(w, null)).not.toContain('saillance');
  });

  it('réserve des places pour eux, sinon le classement par écho les coupe toujours', () => {
    const clusters = [
      ...[...Array(6)].map((_, i) => subj(`echo${i}`, 50 - i, 0.5)),
      subj('trafic', 3, 0.9),
    ];
    const modal: any = buildPromoteModal('hormuz', clusters, '2026-08-11');
    const picked = modal.blocks
      .filter((b: any) => b.accessory?.type === 'button')
      .map((b: any) => parsePick(b.accessory.value).clusterId);
    expect(picked).toHaveLength(PROMOTABLE_IN_MODAL + 1);
    expect(picked).toContain('trafic');
  });
});

describe('brouillon — pré-remplir sans vider la règle (ADR 0079)', () => {
  const pick = {
    corridorId: 'hormuz',
    clusterId: 'c1',
    urls: ['https://x.test/a'],
    title: 'Sujet',
  };

  it('emporte le brouillon dans private_metadata, pour qu’il reparte au cockpit', () => {
    const m: any = buildWritingModalWithDraft(pick, 'Sujet', { draft: 'Une phrase machine.' });
    expect(JSON.parse(m.private_metadata).draft).toBe('Une phrase machine.');
  });

  it('pré-remplit le champ et dit que c’est un brouillon à réécrire', () => {
    const m: any = buildWritingModalWithDraft(pick, 'Sujet', { draft: 'Une phrase machine.' });
    const input = m.blocks.find((b: any) => b.block_id === NOTE_BLOCK_ID_DRAFT);
    expect(input.element.initial_value).toBe('Une phrase machine.');
    expect(input.hint.text).toContain('Publiable tel quel');
  });

  it('ne pré-remplit rien quand le brouillon est vide, et retrouve la consigne normale', () => {
    const m: any = buildWritingModalWithDraft(pick, 'Sujet', { draft: '' });
    const input = m.blocks.find((b: any) => b.block_id === NOTE_BLOCK_ID);
    expect(input.element.initial_value).toBeUndefined();
    expect(input.hint.text).toContain('Votre phrase');
  });

  it('montre ce sur quoi le brouillon s’appuie et ce qu’il ne peut pas dire', () => {
    const m: any = buildWritingModalWithDraft(pick, 'Sujet', {
      draft: 'x',
      basis: ['Un titre'],
      cannot_say: ['La durée'],
    });
    const json = JSON.stringify(m);
    expect(json).toContain('Appuyé sur');
    expect(json).toContain('ne peut pas dire');
  });

  it('laisse passer le brouillon intact, et refuse toujours la recopie d’un titre', () => {
    // ADR 0079 amendé : publier le brouillon tel quel est permis. Le refus qui reste vise le TITRE —
    // redire ce qui est arrivé au lieu de dire ce que ça change n'aide aucun lecteur.
    const titleEcho = outcomeFromCockpit(422, {
      error: 'editorial_note_paraphrase',
      message: 'Votre phrase reprend un texte déjà présent.',
    });
    expect(titleEcho.ok).toBe(false);
    expect((titleEcho as { message: string }).message).toContain('reprend un texte');
  });

  it('la fenêtre d’attente s’ouvre sans brouillon, et le dit', () => {
    const m: any = buildWritingModal(pick, 'Sujet');
    expect(m.blocks.find((b: any) => b.block_id === NOTE_BLOCK_ID).hint.text).toContain('en cours');
    expect(JSON.parse(m.private_metadata).draft).toBe('');
  });
});

describe('Slack préserve l’état d’un bloc — l’identifiant doit changer', () => {
  const pick = { corridorId: 'h', clusterId: 'c', urls: [], title: 'S' };

  it('donne un identifiant NEUF au champ quand un brouillon arrive', () => {
    const attente: any = buildWritingModal(pick, 'S');
    const rempli: any = buildWritingModalWithDraft(pick, 'S', { draft: 'Une phrase.' });
    const idAttente = attente.blocks.find((b: any) => b.type === 'input').block_id;
    const idRempli = rempli.blocks.find((b: any) => b.type === 'input').block_id;
    // Même identifiant ⇒ Slack garde le bloc vide et ignore l'initial_value : le champ reste vide,
    // la soumission part sans phrase, et le cockpit répond 400.
    expect(idRempli).not.toBe(idAttente);
  });

  it('garde l’identifiant d’origine quand aucun brouillon n’est venu', () => {
    const m: any = buildWritingModalWithDraft(pick, 'S', { draft: '' });
    expect(m.blocks.find((b: any) => b.type === 'input').block_id).toBe(NOTE_BLOCK_ID);
  });

  it('relit la phrase sous l’un ou l’autre identifiant', () => {
    const meta = JSON.stringify({ corridorId: 'h', clusterId: 'c', urls: [], draft: 'd' });
    const sous = (blockId: string) =>
      parseSubmission({
        private_metadata: meta,
        state: { values: { [blockId]: { [NOTE_ACTION_ID]: { value: 'Ma phrase.' } } } },
      });
    expect(sous(NOTE_BLOCK_ID).note).toBe('Ma phrase.');
    expect(sous(NOTE_BLOCK_ID_DRAFT).note).toBe('Ma phrase.');
    // Et le refus doit s'accrocher au bloc qui existe vraiment, sinon il est invisible.
    expect(sous(NOTE_BLOCK_ID_DRAFT).blockId).toBe(NOTE_BLOCK_ID_DRAFT);
  });

  it('ne traduit plus tout 400 par « une phrase est requise »', () => {
    const surNote = outcomeFromCockpit(400, {
      error: 'validation',
      issues: [{ path: ['editorial_note'] }],
    });
    expect((surNote as { message: string }).message).toContain('phrase est requise');

    const ailleurs = outcomeFromCockpit(400, {
      error: 'validation',
      issues: [{ path: ['validated_by'] }],
    });
    expect((ailleurs as { message: string }).message).toContain('validated_by');
  });
});

describe('pickEntry — le bouton du flux vit sur un MESSAGE, plus dans une fenêtre', () => {
  it('depuis une fenêtre déjà ouverte : on empile, et le canal a été vérifié à la porte', () => {
    expect(pickEntry({ view: { id: 'V1' } }, 'C_OK')).toEqual({ ok: true, mode: 'push' });
  });

  it('depuis un message du canal autorisé : on OUVRE, car il n’y a aucune pile où empiler', () => {
    expect(pickEntry({ channel: { id: 'C_OK' } }, 'C_OK')).toEqual({ ok: true, mode: 'open' });
  });

  it('depuis un message d’un AUTRE canal : refusé — un bouton transféré n’est pas une approbation', () => {
    expect(pickEntry({ channel: { id: 'C_AILLEURS' } }, 'C_OK').ok).toBe(false);
  });

  it('sans canal ni fenêtre : refusé, jamais l’inverse', () => {
    expect(pickEntry({}, 'C_OK').ok).toBe(false);
  });
});

describe('buildWritingModalWithDraft — ce que la couverture ajoute, sous les yeux avant d’écrire', () => {
  const pick = { corridorId: 'c', clusterId: 'k', urls: ['https://a.com/1'], title: 'Sujet' };

  it('affiche la ligne « ce que cette couverture ajoute », le meilleur résumé dont dispose la personne', () => {
    const v = buildWritingModalWithDraft(pick, 'Sujet', {
      draft: 'Une phrase.',
      whatItAdds:
        'La mort d’un chef mécanicien, là où les semaines précédentes ne comptaient que des coques.',
      basis: ['un titre'],
      cannot_say: [],
    });
    expect(JSON.stringify(v.blocks)).toContain('ne comptaient que des coques');
  });

  it('la marque comme du texte de MODÈLE — c’est une prose de machine, pas un fait établi (ADR 0078)', () => {
    const v = buildWritingModalWithDraft(pick, 'Sujet', {
      draft: 'Une phrase.',
      whatItAdds: 'Quelque chose.',
    });
    const bloc = JSON.stringify(v.blocks);
    const i = bloc.indexOf('Quelque chose.');
    expect(bloc.slice(Math.max(0, i - 220), i + 220)).toMatch(/modèle/i);
  });

  it('n’ouvre aucun bloc quand la ligne est absente ou vide', () => {
    const v = buildWritingModalWithDraft(pick, 'Sujet', { draft: 'Une phrase.', whatItAdds: '  ' });
    expect(JSON.stringify(v.blocks)).not.toMatch(/couverture ajoute/i);
  });
});

describe('la prose de modèle affichée repart au cockpit, pour que le journal dise vrai', () => {
  const pick = { corridorId: 'c', clusterId: 'k', urls: ['https://a.com/1'], title: 'Sujet' };

  it('la fenêtre emporte « ce que la couverture ajoute » dans ses métadonnées', () => {
    const v = buildWritingModalWithDraft(pick, 'Sujet', {
      draft: 'Une phrase.',
      whatItAdds: 'La mort d’un chef mécanicien.',
    });
    expect(JSON.parse(v.private_metadata).whatItAdds).toBe('La mort d’un chef mécanicien.');
  });

  it('la soumission le relit — sans lui, recopier cette ligne passait pour « écrit par un humain »', () => {
    const sub = parseSubmission({
      private_metadata: JSON.stringify({ ...pick, draft: 'Un brouillon.', whatItAdds: 'Ceci.' }),
      state: {
        values: { [NOTE_BLOCK_ID_DRAFT]: { [NOTE_ACTION_ID]: { value: 'Ceci.' } } },
      },
    } as never);
    expect(sub.whatItAdds).toBe('Ceci.');
  });

  it('reste vide quand la fenêtre n’a montré aucun brouillon', () => {
    const sub = parseSubmission({
      private_metadata: JSON.stringify(pick),
      state: { values: { [NOTE_BLOCK_ID]: { [NOTE_ACTION_ID]: { value: 'Ma phrase.' } } } },
    } as never);
    expect(sub.whatItAdds).toBe('');
  });
});
