/**
 * Le flux au fil de l'eau : un sujet, un message.
 *
 * CE QUE CES TESTS PROTÈGENT AVANT TOUT. `cluster_id` ne survit pas à une passe amont — 0 identifiant
 * commun sur 15 entre deux passes du même corridor le même jour, mesuré puis documenté chez eux. Un
 * registre indexé dessus re-notifierait tous les sujets QUATRE FOIS PAR JOUR, ce qui transforme le
 * canal en bruit et le bruit en canal muté. L'identité est donc `topic_id`, avec repli par URL, et
 * jamais `cluster_id`.
 */

import { describe, expect, it } from 'vitest';
import { parsePick } from './promote.js';
import {
  MAX_REMINDERS,
  DEFAULT_MAX_PER_RUN,
  buildStreamMessage,
  feedIsUsable,
  maxPerRunFrom,
  meetsThreshold,
  planStream,
  priorityOf,
  purgeLedger,
  revertKey,
  streamKey,
  tierOf,
  toStreamCluster,
  type Ledger,
  type StreamCluster,
} from './stream.js';

const NOW = '2026-08-21T10:00:00.000Z';

function article(outlet: string, n = 1) {
  return {
    title: `Titre ${outlet} ${n}`,
    url: `https://${outlet}/article-${n}`,
    outlet,
    observedOn: '2026-08-20',
  };
}

/** n médias distincts, un article chacun. */
function cluster(over: Partial<StreamCluster> & { outlets?: number } = {}): StreamCluster {
  const outlets = over.outlets ?? 6;
  const { outlets: _drop, ...rest } = over;
  return {
    clusterId: 'c-1',
    topicId: 't-1',
    corridorIds: ['p0_maritime_strait_strait_of_hormuz'],
    headline: 'Le trafic tombe à six navires',
    articles: Array.from({ length: outlets }, (_, i) => article(`media${i}.com`, i)),
    firstSeen: '2026-08-19',
    lastSeen: '2026-08-20',
    ...rest,
  };
}

describe("streamKey — l'identité ne peut pas être cluster_id", () => {
  it('prend topic_id quand il est là', () => {
    expect(streamKey(cluster({ topicId: 't-42' }))).toBe('topic:t-42');
  });

  it('donne la MÊME clé à deux passes du même sujet, malgré des cluster_id différents', () => {
    const passeA = cluster({ clusterId: 'uuid-de-la-passe-A', topicId: undefined });
    const passeB = cluster({ clusterId: 'uuid-de-la-passe-B', topicId: undefined });
    expect(streamKey(passeA)).toBe(streamKey(passeB));
    expect(streamKey(passeA)).not.toContain('uuid-de-la-passe');
  });

  it('trie les URL, car leur ordre change sans que le sujet change', () => {
    const a = cluster({ topicId: undefined, articles: [article('b.com'), article('a.com')] });
    const b = cluster({ topicId: undefined, articles: [article('a.com'), article('b.com')] });
    expect(streamKey(a)).toBe(streamKey(b));
  });

  it("rend null quand rien n'identifie le sujet — un sujet non identifiable ne doit JAMAIS être notifié", () => {
    expect(streamKey(cluster({ topicId: undefined, articles: [] }))).toBeNull();
    expect(
      streamKey(
        cluster({
          topicId: undefined,
          articles: [{ title: 't', url: 'ftp://ailleurs/x', outlet: 'x' }],
        }),
      ),
    ).toBeNull();
  });
});

describe('priorityOf — la classe se lit, elle ne se devine pas depuis un identifiant', () => {
  const classes = new Map([
    ['p0_maritime_strait_strait_of_hormuz', 'P0'],
    ['p1_maritime_strait_lombok_strait', 'P1'],
  ]);

  it('retient la classe la plus forte parmi les corridors touchés', () => {
    const c = cluster({
      corridorIds: ['p1_maritime_strait_lombok_strait', 'p0_maritime_strait_strait_of_hormuz'],
    });
    expect(priorityOf(c, classes)).toBe('P0');
  });

  it('rend null quand la classe est inconnue, au lieu de la déduire du préfixe', () => {
    expect(
      priorityOf(cluster({ corridorIds: ['p0_objet_absent_du_recensement'] }), new Map()),
    ).toBeNull();
  });
});

describe('meetsThreshold — les P0 alertent tôt, le reste doit être porté', () => {
  it('P0 : deux médias suffisent, un seul ne suffit pas', () => {
    expect(meetsThreshold(cluster({ outlets: 2 }), 'P0')).toBe(true);
    expect(meetsThreshold(cluster({ outlets: 1 }), 'P0')).toBe(false);
  });

  it('P0 : un sujet jugé saillant passe même très peu repris — c’est le cas « six navires »', () => {
    expect(meetsThreshold(cluster({ outlets: 1, salience: 0.9 }), 'P0')).toBe(true);
  });

  it('hors P0 : cinq médias, ou trois si le sujet est jugé saillant', () => {
    expect(meetsThreshold(cluster({ outlets: 5 }), 'P1')).toBe(true);
    expect(meetsThreshold(cluster({ outlets: 4 }), 'P1')).toBe(false);
    expect(meetsThreshold(cluster({ outlets: 3, salience: 0.9 }), 'P1')).toBe(true);
    expect(meetsThreshold(cluster({ outlets: 2, salience: 0.9 }), 'P1')).toBe(false);
  });

  it('classe inconnue : le seuil le plus exigeant — mais planStream ne l’annoncera pas pour autant', () => {
    expect(meetsThreshold(cluster({ outlets: 4 }), null)).toBe(false);
    expect(meetsThreshold(cluster({ outlets: 5 }), null)).toBe(true);
  });
});

describe('tierOf — les paliers disent l’emballement, pas le tiède', () => {
  it('compte le palier franchi', () => {
    expect(tierOf(4)).toBe(0);
    expect(tierOf(5)).toBe(1);
    expect(tierOf(19)).toBe(1);
    expect(tierOf(20)).toBe(2);
    expect(tierOf(199)).toBe(4);
  });
});

describe('planStream — annoncer une fois, rappeler à l’emballement', () => {
  const classes = new Map([['p0_maritime_strait_strait_of_hormuz', 'P0']]);

  it('annonce un sujet neuf éligible et l’inscrit au registre', () => {
    const plan = planStream({ clusters: [cluster()], ledger: {}, classes, now: NOW });
    expect(plan.notify).toHaveLength(1);
    expect(plan.remind).toHaveLength(0);
    expect(plan.ledger['topic:t-1']?.firstNotifiedAt).toBe(NOW);
  });

  it('LE TEST QUI COMPTE : la passe suivante, avec un cluster_id neuf, n’annonce RIEN', () => {
    const first = planStream({ clusters: [cluster()], ledger: {}, classes, now: NOW });
    const second = planStream({
      clusters: [cluster({ clusterId: 'uuid-tout-neuf' })],
      ledger: first.ledger,
      classes,
      now: '2026-08-21T16:00:00.000Z',
    });
    expect(second.notify).toHaveLength(0);
    expect(second.remind).toHaveLength(0);
  });

  it('rappelle une fois quand le sujet change de palier, et pas deux fois au même palier', () => {
    const first = planStream({
      clusters: [cluster({ outlets: 6 })],
      ledger: {},
      classes,
      now: NOW,
    });
    const grown = planStream({
      clusters: [cluster({ outlets: 25 })],
      ledger: first.ledger,
      classes,
      now: NOW,
    });
    expect(grown.remind).toHaveLength(1);
    const again = planStream({
      clusters: [cluster({ outlets: 30 })],
      ledger: grown.ledger,
      classes,
      now: NOW,
    });
    expect(again.remind).toHaveLength(0);
  });

  it('plafonne les rappels, pour qu’un sujet qui enfle ne prenne pas le canal', () => {
    // Départ à DEUX médias : éligible en P0, palier 0. Les quatre paliers restent donc tous à
    // franchir — sans plafond ce test compterait quatre rappels.
    let ledger: Ledger = planStream({
      clusters: [cluster({ outlets: 2 })],
      ledger: {},
      classes,
      now: NOW,
    }).ledger;
    let rappels = 0;
    for (const outlets of [5, 20, 50, 100]) {
      const plan = planStream({ clusters: [cluster({ outlets })], ledger, classes, now: NOW });
      rappels += plan.remind.length;
      ledger = plan.ledger;
    }
    expect(rappels).toBe(MAX_REMINDERS);
  });

  it("n'inscrit PAS un sujet sous le seuil — sinon il ne serait jamais annoncé le jour où il monte", () => {
    const plan = planStream({ clusters: [cluster({ outlets: 1 })], ledger: {}, classes, now: NOW });
    expect(plan.notify).toHaveLength(0);
    expect(plan.ledger).toEqual({});
    const monte = planStream({
      clusters: [cluster({ outlets: 6 })],
      ledger: plan.ledger,
      classes,
      now: NOW,
    });
    expect(monte.notify).toHaveLength(1);
  });

  it('ignore un sujet non identifiable plutôt que de le republier à chaque passe', () => {
    const plan = planStream({
      clusters: [cluster({ topicId: undefined, articles: [] })],
      ledger: {},
      classes,
      now: NOW,
    });
    expect(plan.notify).toHaveLength(0);
    expect(plan.ledger).toEqual({});
  });
});

describe('purgeLedger — la mémoire d’outil ne grossit pas indéfiniment', () => {
  it('retire ce qui n’a plus été vu depuis la rétention amont, garde le reste', () => {
    const ledger: Ledger = {
      vieux: {
        corridorId: 'x',
        firstNotifiedAt: '2026-07-01T00:00:00.000Z',
        lastNotifiedAt: '2026-07-01T00:00:00.000Z',
        lastSeenAt: '2026-07-01T00:00:00.000Z',
        lastTier: 1,
        reminders: 0,
      },
      recent: {
        corridorId: 'x',
        firstNotifiedAt: '2026-08-20T00:00:00.000Z',
        lastNotifiedAt: '2026-08-20T00:00:00.000Z',
        lastSeenAt: '2026-08-20T00:00:00.000Z',
        lastTier: 1,
        reminders: 0,
      },
    };
    const kept = purgeLedger(ledger, new Date(NOW), 14);
    expect(Object.keys(kept)).toEqual(['recent']);
  });
});

describe('buildStreamMessage — le message EST la surface de lecture', () => {
  const msg = buildStreamMessage(cluster(), 'p0_maritime_strait_strait_of_hormuz', '2026-08-21');
  const json = JSON.stringify(msg.blocks);

  it('met les titres des éditeurs en liens cliquables, dans le message et non dans une fenêtre', () => {
    expect(json).toContain('<https://media0.com/article-0|');
  });

  it('porte un bouton que le gestionnaire EXISTANT sait relire', () => {
    const button = msg.blocks
      .flatMap((b: Record<string, unknown>) => [
        (b.accessory ?? null) as Record<string, unknown> | null,
        ...(((b.elements ?? []) as Record<string, unknown>[]) ?? []),
      ])
      .find(
        (e) => e && typeof e.value === 'string' && String(e.action_id ?? '').startsWith('pick_'),
      );
    expect(button).toBeTruthy();
    const pick = parsePick(button!.value as string);
    expect(pick.corridorId).toBe('p0_maritime_strait_strait_of_hormuz');
    expect(pick.clusterId).toBe('c-1');
    expect(pick.urls.length).toBeGreaterThan(0);
  });

  it('affiche le poids en médias distincts, la mesure qui classe', () => {
    expect(json).toContain('6 médias');
  });
});

describe('toStreamCluster — lire topic_id, que nous parsions et jetions', () => {
  it('relit l’identité durable et les corridors touchés', () => {
    const c = toStreamCluster({
      cluster_id: 'c-9',
      topic_id: 't-9',
      headline: 'x',
      salience_score: 0.5,
      affected_chokepoints: [{ chokepoint_id: 'p0_a' }, { chokepoint_id: 'p1_b' }],
      articles: [
        { title: 'a', url: 'https://a.com/1', outlet: 'a.com', observed_on: '2026-08-20' },
        { title: 'b', url: 'javascript:alert(1)', outlet: 'b.com' },
      ],
    });
    expect(c.topicId).toBe('t-9');
    expect(c.corridorIds).toEqual(['p0_a', 'p1_b']);
    expect(c.articles).toHaveLength(1);
    expect(c.articles[0]?.url).toBe('https://a.com/1');
  });
});

describe('feedIsUsable — « 0 » ne veut pas dire « calme »', () => {
  it('accepte un flux servi', () => {
    expect(feedIsUsable({ count: 3, run_id: 'r-1' })).toBe(true);
  });

  it('accepte un vide HONNÊTE : une passe a tourné et n’a rien trouvé', () => {
    expect(feedIsUsable({ count: 0, run_id: 'r-1' })).toBe(true);
  });

  it('REFUSE un zéro sans passe : le pipeline amont n’a pas tourné, ce n’est pas une semaine calme', () => {
    expect(feedIsUsable({ count: 0 })).toBe(false);
    expect(feedIsUsable(null)).toBe(false);
  });
});

describe('revertKey — un envoi raté ne doit pas consommer le sujet', () => {
  const before: Ledger = {};
  const classes = new Map([['p0_maritime_strait_strait_of_hormuz', 'P0']]);
  it('efface l’inscription d’une annonce qui n’est jamais partie', () => {
    const after = planStream({ clusters: [cluster()], ledger: before, classes, now: NOW });
    expect(after.ledger['topic:t-1']).toBeTruthy();
    const reverted = revertKey(after.ledger, before, 'topic:t-1');
    expect(reverted['topic:t-1']).toBeUndefined();
  });

  it('restaure l’état précédent quand un RAPPEL échoue, sans perdre l’annonce initiale', () => {
    const first = planStream({
      clusters: [cluster({ outlets: 6 })],
      ledger: {},
      classes,
      now: NOW,
    });
    const grown = planStream({
      clusters: [cluster({ outlets: 25 })],
      ledger: first.ledger,
      classes,
      now: NOW,
    });
    const reverted = revertKey(grown.ledger, first.ledger, 'topic:t-1');
    expect(reverted['topic:t-1']).toEqual(first.ledger['topic:t-1']);
  });
});

describe('plafond par passe — le premier sondage ne doit pas vider le flux dans le canal', () => {
  const classes = new Map([['p0_maritime_strait_strait_of_hormuz', 'P0']]);
  const huit = Array.from({ length: 8 }, (_, i) =>
    cluster({ topicId: `t-${i}`, outlets: 5 + i, clusterId: `c-${i}` }),
  );

  it('n’annonce que les mieux PORTÉS, et laisse les autres à la passe suivante', () => {
    const plan = planStream({ clusters: huit, ledger: {}, classes, now: NOW, maxPerRun: 3 });
    expect(plan.notify).toHaveLength(3);
    expect(plan.notify.map((a) => a.cluster.topicId)).toEqual(['t-7', 't-6', 't-5']);
    expect(Object.keys(plan.ledger)).toHaveLength(3);
  });

  it('les sujets écartés ne sont PAS inscrits — ils reviennent à la passe suivante', () => {
    const first = planStream({ clusters: huit, ledger: {}, classes, now: NOW, maxPerRun: 3 });
    const second = planStream({
      clusters: huit,
      ledger: first.ledger,
      classes,
      now: NOW,
      maxPerRun: 3,
    });
    expect(second.notify.map((a) => a.cluster.topicId)).toEqual(['t-4', 't-3', 't-2']);
  });
});

describe('périmètre — le flux ne parle que des corridors qui nous concernent', () => {
  /**
   * MESURÉ À BLANC LE 2026-08-21, et c'est ce qui a motivé cette règle : sur les 15 corridors
   * présents dans le flux, 7 étaient des P3 « regional air cargo gateway ». Trois des cinq annonces
   * calculées étaient du bruit — « Saisie d'appareils électroniques d'Eric Swalwell à SFO », et deux
   * fois l'actualité de la PROVINCE d'Ontario attrapée par l'AÉROPORT d'Ontario. Un canal qui sert
   * cela trois fois sur cinq est mis en sourdine dans la semaine.
   */
  it("n'annonce pas un sujet dont aucun corridor n'est au périmètre, même très porté", () => {
    const bruit = cluster({
      topicId: 't-bruit',
      outlets: 40,
      corridorIds: ['p3_regional_air_cargo_gateway_ontario_ont'],
    });
    const plan = planStream({
      clusters: [bruit],
      ledger: {},
      classes: new Map([['p0_maritime_strait_strait_of_hormuz', 'P0']]),
      now: NOW,
    });
    expect(plan.notify).toHaveLength(0);
    expect(plan.ledger).toEqual({});
  });

  it('garde le sujet dès qu’UN des corridors touchés est au périmètre', () => {
    const mixte = cluster({
      topicId: 't-mixte',
      outlets: 6,
      corridorIds: [
        'p3_regional_air_cargo_gateway_ontario_ont',
        'p1_transshipment_gateway_colombo_port',
      ],
    });
    const plan = planStream({
      clusters: [mixte],
      ledger: {},
      classes: new Map([['p1_transshipment_gateway_colombo_port', 'P1']]),
      now: NOW,
    });
    expect(plan.notify).toHaveLength(1);
    expect(plan.notify[0]?.corridorId).toBe('p1_transshipment_gateway_colombo_port');
  });
});

describe('maxPerRunFrom — une variable vide ne doit pas éteindre le flux', () => {
  it('lit un nombre', () => {
    expect(maxPerRunFrom('3')).toBe(3);
  });

  it("retombe sur le défaut quand la variable est ABSENTE ou VIDE — compose passe '' et Number('') vaut 0", () => {
    expect(maxPerRunFrom(undefined)).toBe(DEFAULT_MAX_PER_RUN);
    expect(maxPerRunFrom('')).toBe(DEFAULT_MAX_PER_RUN);
    expect(maxPerRunFrom('   ')).toBe(DEFAULT_MAX_PER_RUN);
  });

  it('refuse un non-nombre et un négatif, plutôt que de se taire', () => {
    expect(maxPerRunFrom('beaucoup')).toBe(DEFAULT_MAX_PER_RUN);
    expect(maxPerRunFrom('-2')).toBe(DEFAULT_MAX_PER_RUN);
  });

  it('accepte un zéro EXPLICITE : couper le flux doit rester possible', () => {
    expect(maxPerRunFrom('0')).toBe(0);
  });
});
