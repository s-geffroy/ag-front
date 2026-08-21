/**
 * Pure logic for promoting a news cluster from Slack. Kept apart from the Bolt wiring so the rules
 * that matter are testable without a workspace, a token, or a socket.
 *
 * DOCTRINE THIS FILE ENFORCES (ADR 0071 / 0074, arbitrated 2026-08-10):
 *  - Promotion is nominative. From Slack the promoter is recorded as "‹name› (via Slack)" — the
 *    journal must not lose the fact that the act came through a phone.
 *  - Authorisation is carried by the PRIVATE CHANNEL: no other allowlist. An interaction from
 *    anywhere else is dropped, because a button forwarded into another channel is not an approval.
 *  - No model prose is offered as a shortcut. The modal shows ARTICLE TITLES with their links —
 *    publishers' words, clickable — never the cluster `headline`.
 *  - The note is checked for paraphrase server-side by the cockpit (P2), and the refusal is surfaced
 *    inline on the note field, where the person is typing.
 */

import { outletCountry } from './country.js';

export const PROMOTE_ACTION_ID = 'promote_corridor';
/**
 * Slack exige un `action_id` UNIQUE PAR MESSAGE : cinq boutons portant tous `promote_corridor`
 * faisaient rejeter le digest entier en `invalid_blocks` — donc aucun bouton, jamais, depuis le
 * premier envoi. Le digest suffixe donc `_0`…`_4`, et l'écoute se fait sur le motif, pas sur la
 * chaîne exacte. Le corridor voyage dans `value`, jamais dans l'identifiant.
 */
export const PROMOTE_ACTION_PATTERN = /^promote_corridor(?:_\d+)?$/;
/** L'identifiant du n-ième bouton d'un même message. */
export function promoteActionId(index: number): string {
  return `${PROMOTE_ACTION_ID}_${index}`;
}
export const MODAL_CALLBACK_ID = 'promote_news_modal';
export const NOTE_BLOCK_ID = 'note_block';
/**
 * Le champ de saisie change d'identifiant quand le brouillon arrive — et ce n'est pas cosmétique.
 *
 * Slack PRÉSERVE l'état d'un bloc de saisie qui garde le même `block_id` à travers un
 * `views.update`, et ignore donc l'`initial_value` de la mise à jour. Le champ restait vide, la
 * soumission partait sans phrase, et le cockpit répondait 400 — que la fenêtre traduisait en
 * « Une phrase est requise », un message exact et parfaitement inutile puisque la phrase avait été
 * calculée puis jetée. Un identifiant neuf force Slack à traiter le bloc comme nouveau.
 */
export const NOTE_BLOCK_ID_DRAFT = 'note_block_draft';
export const NOTE_ACTION_ID = 'editorial_note';
export const CLUSTER_BLOCK_ID = 'cluster_block';
export const CLUSTER_ACTION_ID = 'cluster_choice';

/** Authorisation is the channel, and only the channel. */
export function isAllowedChannel(
  channelId: string | undefined,
  allowed: string | undefined,
): boolean {
  if (!allowed || !allowed.trim()) return false; // unset ⇒ refuse everything, never allow everything
  return !!channelId && channelId === allowed.trim();
}

/** "Sylvain Geffroy" + Slack ⇒ what the append-only journal will carry forever. */
export function validatedBy(operator: string): string {
  return `${operator.trim()} (via Slack)`;
}

export interface ClusterChoice {
  clusterId: string;
  /** Article titles + urls — the publishers' own words, the only text we put in front of a promoter. */
  articles: { title: string; url: string; outlet?: string; observedOn?: string }[];
  /** Bornes d'OBSERVATION du regroupement (`first_seen`/`last_seen` amont), pas de publication. */
  firstSeen?: string;
  lastSeen?: string;
  eventCategory?: string;
  articleCount?: number;
  /**
   * L'intitulé écrit par le MODÈLE amont. Affiché dans la fenêtre de sélection, marqué comme tel,
   * et jamais publié (ADR 0078 amende 0074). Recopier cette phrase dans la note est refusé par le
   * cockpit : `paraphraseCandidates` la contient déjà.
   */
  headline?: string;
  /**
   * Jugement d'importance du modèle amont (0–1). À NE PAS confondre avec l'écho : sur Ormuz, « le
   * trafic tombe à six navires » vaut 0.90 pour 3 médias, quand « l'Iran lie la réouverture » vaut
   * 0.90 pour 199. Deux mesures distinctes, jamais fondues en un score unique.
   */
  salience?: number;
}

/**
 * Regroupe les REPRISES d'une même dépêche. Un regroupement de 220 articles peut n'être que quatre
 * histoires : une dépêche d'agence relayée par des dizaines de radios locales. L'aperçu montrait
 * donc les quatre premières lignes — quatre reprises identiques — pendant que l'article qui aurait
 * servi à juger attendait en cinquième position.
 *
 * On ne SUPPRIME pas les reprises, on les COMPTE : « 216 médias reprennent la même dépêche » dit
 * quelque chose sur l'ampleur de l'écho. L'effacer rendrait une couverture massive indistinguable
 * d'un entrefilet (ADR 0077).
 */
export interface DistinctStory {
  title: string;
  url: string;
  outlet?: string;
  /** Nombre d'autres médias publiant le même titre. 0 = pas de reprise. */
  republications: number;
  /** Nombre de MÉDIAS DISTINCTS portant cette histoire — le poids réel, celui de la donnée. */
  outlets: number;
  /**
   * Pays identifiés par le domaine. C'est un PLANCHER : les gTLD (.com/.org/.net) n'en déclarent
   * aucun et forment les deux tiers du corpus. D'où l'affichage « ≥ N pays ».
   */
  countries: string[];
  /**
   * MÉDIAS DISTINCTS dont le domaine ne déclare aucun pays. Compté en médias comme `outlets`,
   * pas en articles : afficher « 16 médias · 16 sans pays » quand il y a 17 articles pour
   * 16 médias donnait une ligne dont les deux nombres ne parlaient pas de la même chose.
   */
  countryUnknown: number;
  /**
   * La PLUS ANCIENNE observation de cette histoire. `observed_on` dit quand le flux l'a vue, pas
   * quand elle a été publiée — nous n'avons pas la date de publication et nous ne la déduirons pas.
   * D'où « vu », jamais « publié » (ADR 0077).
   */
  observedOn?: string;
}

/**
 * Le flux transporte les titres avec leurs entités HTML (`Trump says&#xA0;the US has swept…`).
 * On les rend lisibles à l'affichage sans toucher au titre stocké : ce qui est promu reste le mot
 * de l'éditeur, tel qu'il nous est parvenu.
 */
export function decodeEntities(text: string): string {
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    laquo: '«',
    raquo: '»',
    hellip: '…',
    mdash: '—',
    ndash: '–',
    rsquo: '’',
    lsquo: '‘',
    ldquo: '“',
    rdquo: '”',
  };
  return (
    text
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
      .replace(/&([a-z]+);/gi, (m, n) => named[n.toLowerCase()] ?? m)
      // `&#xA0;` donne une espace insécable, invisible à l'œil mais distincte à la comparaison :
      // deux titres identiques cesseraient de se regrouper pour ce seul caractère.
      .replace(/\u00a0/g, ' ')
  );
}

function storyKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/&#x[0-9a-f]+;|&[a-z]+;/gi, ' ') // les entités HTML voyagent telles quelles dans le flux
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function distinctStories(
  articles: readonly ClusterChoice['articles'][number][],
): DistinctStory[] {
  type Acc = DistinctStory & {
    _outlets: Set<string>;
    _countries: Set<string>;
    _noCountry: Set<string>;
  };
  const byKey = new Map<string, Acc>();
  for (const a of articles) {
    const k = storyKey(a.title);
    let e = byKey.get(k);
    if (!e) {
      e = {
        title: a.title,
        url: a.url,
        outlet: a.outlet,
        republications: 0,
        outlets: 0,
        countries: [],
        countryUnknown: 0,
        observedOn: a.observedOn,
        _outlets: new Set<string>(),
        _countries: new Set<string>(),
        _noCountry: new Set<string>(),
      };
      byKey.set(k, e);
    } else {
      e.republications += 1;
      // La reprise la plus ancienne date l'histoire : une dépêche vue le 8 reste vue le 8, même si
      // une radio la relaie le 11. Prendre la plus récente rajeunirait artificiellement le sujet.
      if (a.observedOn && (!e.observedOn || a.observedOn < e.observedOn))
        e.observedOn = a.observedOn;
    }
    const dom = a.outlet?.toLowerCase();
    if (dom) e._outlets.add(dom);
    const country = outletCountry(a.outlet);
    if (country) e._countries.add(country);
    else e._noCountry.add(dom ?? a.url);
  }
  const out = [...byKey.values()].map(({ _outlets, _countries, _noCountry, ...rest }) => ({
    ...rest,
    outlets: _outlets.size,
    countries: [..._countries].sort(),
    countryUnknown: _noCountry.size,
  }));
  // Le plus PORTÉ d'abord : un sujet repris par 40 médias n'a pas à se lire après un entrefilet
  // unique parce qu'il arrivait plus loin dans le tableau. À poids égal, le plus récemment vu.
  return out.sort(
    (x, y) => y.outlets - x.outlets || (y.observedOn ?? '').localeCompare(x.observedOn ?? ''),
  );
}

/** `2026-08-08` → nombre de jours écoulés depuis, ou null si la date est absente/illisible. */
export function daysSince(observedOn: string | undefined, today: string): number | null {
  if (!observedOn || !/^\d{4}-\d{2}-\d{2}$/.test(observedOn)) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return null;
  const a = Date.parse(`${observedOn}T00:00:00Z`);
  const b = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

/**
 * « vu il y a 3 j », jamais « publié il y a 3 j ». Renvoie null plutôt qu'un mot vague quand la date
 * manque : une absence de date ne doit pas se rendre comme une fraîcheur (ADR 0077).
 */
export function ageLabel(observedOn: string | undefined, today: string): string | null {
  const d = daysSince(observedOn, today);
  if (d === null) return null;
  if (d < 0) return `vu le ${frDate(observedOn as string)}`; // date à venir : on la montre telle quelle
  if (d === 0) return "vu aujourd'hui";
  if (d === 1) return 'vu hier';
  return `vu il y a ${d} j`;
}

/** `2026-08-08` → `08/08`. Format explicite, sans dépendre de la locale du conteneur. */
export function frDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}` : iso;
}

/** « fenêtre 08/08 → 11/08 » — les bornes d'observation du regroupement, ou null si inconnues. */
export function windowLabel(firstSeen?: string, lastSeen?: string): string | null {
  if (!firstSeen && !lastSeen) return null;
  if (firstSeen && lastSeen && firstSeen !== lastSeen)
    return `${frDate(firstSeen)} → ${frDate(lastSeen)}`;
  return frDate((firstSeen || lastSeen) as string);
}

/** Le poids d'un sujet entier : ce qui le classe, et ce qu'on affiche à côté de son intitulé. */
export interface SubjectWeight {
  /** Rédactions distinctes portant le sujet. C'est le rang — une donnée, pas une estimation. */
  outlets: number;
  /** Pays identifiés par les domaines. PLANCHER : deux tiers des domaines n'en déclarent aucun. */
  countries: string[];
  /** Médias dont le domaine ne déclare aucun pays. Affiché à côté, jamais confondu avec zéro. */
  countryUnknown: number;
  /** Articles bruts, reprises comprises. Volume médiatique, pas importance. */
  articles: number;
  /** Histoires distinctes après regroupement des reprises. */
  stories: number;
  /** Saillance déclarée par l'amont, telle quelle. Undefined si elle n'est pas fournie. */
  salience?: number;
  /**
   * Jugé important par l'amont ET peu repris. C'est un SEUIL D'AFFICHAGE À NOUS, pas un fait :
   * il ne fait que rapprocher deux valeurs déclarées pour attirer l'œil.
   *
   * Pourquoi ce drapeau existe : notre propre bloc public dit que « le volume d'articles reflète le
   * cycle médiatique, pas l'importance de l'événement ». Classer uniquement par écho contredirait
   * cette phrase — et enterrerait « le trafic tombe à six navires », qui est le fait le plus
   * décisionnel du corridor et n'a que trois médias.
   */
  quietButSalient: boolean;
}

/** Seuils d'affichage, explicitement les nôtres. */
export const SALIENT_AT = 0.8;
export const LOW_ECHO_UNDER = 5;

export function subjectWeight(c: ClusterChoice): SubjectWeight {
  const outlets = new Set<string>();
  const countries = new Set<string>();
  const noCountry = new Set<string>();
  for (const a of c.articles) {
    const dom = a.outlet?.toLowerCase();
    if (dom) outlets.add(dom);
    const country = outletCountry(a.outlet);
    if (country) countries.add(country);
    else noCountry.add(dom ?? a.url);
  }
  return {
    outlets: outlets.size,
    countries: [...countries].sort(),
    countryUnknown: noCountry.size,
    articles: c.articleCount ?? c.articles.length,
    stories: distinctStories(c.articles).length,
    salience: c.salience,
    quietButSalient:
      typeof c.salience === 'number' && c.salience >= SALIENT_AT && outlets.size < LOW_ECHO_UNDER,
  };
}

/**
 * Classe les sujets par MÉDIAS DISTINCTS, pas par articles. Quarante radios locales relayant une
 * dépêche font quarante articles et une rédaction de plus — les compter en articles mettrait le
 * relais automatique devant le sujet réellement porté.
 *
 * Le nombre de pays n'entre PAS dans le rang : il n'est mesurable que pour un tiers des domaines,
 * et les muets sont massivement américains. L'y faire entrer pénaliserait structurellement les
 * sujets à couverture américaine (handoff 0030). Il s'affiche, il ne décide pas.
 */
export function rankSubjects(
  clusters: ClusterChoice[],
): { cluster: ClusterChoice; weight: SubjectWeight }[] {
  return clusters
    .map((cluster) => ({ cluster, weight: subjectWeight(cluster) }))
    .sort((a, b) => b.weight.outlets - a.weight.outlets || b.weight.articles - a.weight.articles);
}

/** « 63 médias · ≥ 2 pays (Irlande, Royaume-Uni) · 5 sans pays déclaré · 220 art. · 08/08 → 11/08 » */
export function weightLine(w: SubjectWeight, win: string | null): string {
  return [
    `*${w.outlets} média${w.outlets > 1 ? 's' : ''}*`,
    w.countries.length > 0
      ? `≥ ${w.countries.length} pays (${w.countries.slice(0, 3).join(', ')}${w.countries.length > 3 ? '…' : ''})`
      : null,
    w.countryUnknown > 0 ? `${w.countryUnknown} sans pays déclaré` : null,
    `${w.articles} art. · ${w.stories} histoire${w.stories > 1 ? 's' : ''}`,
    typeof w.salience === 'number' ? `saillance ${w.salience.toFixed(2)}` : null,
    win,
    // Dit en clair plutôt qu'encodé dans un rang : le sujet ne remonte pas, il se signale.
    w.quietButSalient ? ':eyes: *jugé saillant par l’amont, peu repris*' : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

/**
 * L'étiquette d'un sujet dans le menu : son POIDS d'abord, son intitulé ensuite.
 *
 * L'intitulé vient du modèle amont. Il n'est plus caché (ADR 0078) parce qu'un menu de
 * « security · 220 art. » ne permettait pas de choisir un sujet — mais il arrive APRÈS le chiffre,
 * et le libellé du champ dit d'où il vient. Le marquage tient sur le bloc, pas sur chaque ligne :
 * Slack plafonne une option à 75 caractères, et un préfixe par ligne mangerait l'intitulé.
 */
export function clusterLabel(c: ClusterChoice): string {
  const w = subjectWeight(c);
  const cat = c.eventCategory ? c.eventCategory.replace(/_/g, ' ') : 'couverture';
  const head = decodeEntities(c.headline ?? '').trim();
  const label = `${w.outlets} méd. · ${head || cat}`;
  // Slack caps option text at 75 characters and errors on longer.
  return label.length > 75 ? `${label.slice(0, 72)}…` : label;
}

/**
 * The modal. Article titles are rendered as markdown links so the promoter can open them from the
 * modal — the only honest answer to "did you read it" is to make reading one tap away.
 */
/**
 * Combien de regroupements la fenêtre propose — ET montre. Un seul nombre pour les deux, c'est tout
 * l'objet de la constante.
 *
 * POURQUOI. Le menu listait 100 regroupements quand l'aperçu n'en détaillait que 3 : on pouvait
 * donc sélectionner le septième et publier sur des articles que la fenêtre n'avait jamais affichés.
 * Toute la doctrine tient à « on lit avant de promouvoir » (ADR 0074) et la fenêtre permettait
 * exactement le contraire. Une seule borne rend l'incohérence impossible au lieu de compter sur
 * l'attention de la personne.
 */
export const PROMOTABLE_IN_MODAL = 5;

/** Places gardées pour les sujets saillants mais peu repris, en plus des {@link PROMOTABLE_IN_MODAL}. */
export const RESERVED_FOR_SALIENT = 2;

export const PICK_ACTION_PATTERN = /^pick_subject_\d+$/;
export function pickActionId(index: number): string {
  return `pick_subject_${index}`;
}

/** Ce qu'un bouton « Choisir » emporte : de quoi retrouver le sujet même si son identifiant change. */
export interface PickPayload {
  corridorId: string;
  clusterId: string;
  /**
   * Quelques URL d'articles. MESURÉ le 2026-08-11 : entre deux passes du même jour, aucun des 15
   * `cluster_id` n'a survécu. Sans ce repli, une fenêtre ouverte avant une passe échouait à la
   * validation en `cluster_not_found`, sans que la personne ait rien fait de faux.
   */
  urls: string[];
  /**
   * L'intitulé, transporté plutôt que relu dans le bloc cliqué. Le relire dépendait d'un préfixe
   * d'affichage — changer ce préfixe cassait la lecture, ce qui est exactement ce qui vient
   * d'arriver.
   */
  title: string;
}

/**
 * Fenêtre 1 — la liste des sujets. Un bouton par sujet, EN FACE du sujet.
 *
 * Le menu déroulant a été supprimé : il redemandait de choisir dans une liste de 75 caractères ce
 * qu'on venait de lire en détail juste au-dessus. Choisir deux fois n'est pas choisir mieux.
 */
export function buildPromoteModal(corridorId: string, clusters: ClusterChoice[], today: string) {
  // Les sujets les plus PORTÉS d'abord, puis on coupe. L'ordre précède la coupe : couper avant de
  // classer aurait gardé les cinq premiers du flux, pas les cinq qui comptent.
  const ranked = rankSubjects(clusters);
  const byEcho = ranked.slice(0, PROMOTABLE_IN_MODAL);
  // Des places RÉSERVÉES aux sujets jugés saillants par l'amont mais peu repris. Sans elles, le
  // classement par écho les coupe systématiquement et le drapeau ne s'affiche jamais : sur Ormuz,
  // « le trafic tombe à six navires » (saillance 0.90, 3 médias) sortait onzième. Un signal qu'on
  // calcule sans jamais le montrer ne vaut rien — c'est la leçon du drapeau de troncature.
  const quiet = ranked
    .filter((r) => r.weight.quietButSalient && !byEcho.includes(r))
    .slice(0, RESERVED_FOR_SALIENT);
  const shown = [...byEcho, ...quiet];
  const hidden = ranked.length - shown.length;

  const subjectBlocks = shown.flatMap(({ cluster: c, weight }, i) => {
    const stories = distinctStories(c.articles);
    const win = windowLabel(c.firstSeen, c.lastSeen);
    // L'intitulé du sujet, marqué comme venant du modèle (ADR 0078) : il sert à repérer, et le
    // cockpit refuse une note qui le recopie — c'est cette garde qui rend son affichage tenable.
    const title = decodeEntities(c.headline ?? '').trim();
    const payload: PickPayload = {
      corridorId,
      clusterId: c.clusterId,
      urls: stories.slice(0, 4).map((a) => a.url),
      title: (title || (c.eventCategory ?? 'couverture')).slice(0, 150),
    };
    return [
      {
        type: 'section' as const,
        text: {
          type: 'mrkdwn' as const,
          text: [
            title ? `*${title}*` : `*${(c.eventCategory ?? 'couverture').replace(/_/g, ' ')}*`,
            weightLine(weight, win),
          ].join('\n'),
        },
        accessory: {
          type: 'button' as const,
          action_id: pickActionId(i),
          // Slack plafonne `value` à 2000 caractères : quatre URL et deux identifiants tiennent.
          value: JSON.stringify(payload).slice(0, 2000),
          text: { type: 'plain_text' as const, text: 'Choisir' },
        },
      },
      {
        type: 'context' as const,
        elements: [
          {
            type: 'mrkdwn' as const,
            text: stories
              .slice(0, 4)
              .map((a) => {
                const t = decodeEntities(a.title).replace(/[<>|]/g, ' ').slice(0, 90);
                const age = ageLabel(a.observedOn, today);
                const line = [
                  a.outlets > 1 ? `${a.outlets} médias` : (a.outlet ?? 'média inconnu'),
                  age,
                ]
                  .filter(Boolean)
                  .join(' · ');
                return `   • <${a.url}|${t}> _(${line})_`;
              })
              .join('\n'),
          },
        ],
      },
    ];
  });

  return {
    type: 'modal' as const,
    callback_id: 'promote_pick_modal',
    private_metadata: corridorId,
    title: { type: 'plain_text' as const, text: 'Choisir un sujet' },
    close: { type: 'plain_text' as const, text: 'Fermer' },
    blocks: [
      // Le marquage tient ICI, une fois. Il vivait sur le libellé du menu déroulant ; en supprimant
      // le menu, je l'avais reporté sur chaque ligne — répétée sept fois, une mention cesse d'être
      // lue, ce qui est l'inverse du but (ADR 0078).
      {
        type: 'context' as const,
        elements: [
          {
            type: 'mrkdwn' as const,
            text: '_Les intitulés en gras sont proposés par le modèle amont, pas écrits par une rédaction. Ils servent à repérer un sujet — les recopier dans votre phrase sera refusé._',
          },
        ],
      },
      ...subjectBlocks,
      // Une coupe tue est une coupe qui ment : sans cette ligne, cinq sujets sur vingt-trois se
      // liraient comme la totalité du corridor (ADR 0077).
      ...(hidden > 0
        ? [
            {
              type: 'context' as const,
              elements: [
                {
                  type: 'mrkdwn' as const,
                  text: `_${hidden} autre(s) sujet(s) sur ce corridor ne sont pas montrés ici. Cette fenêtre n'offre que ce qu'elle affiche — les autres se traitent depuis le cockpit._`,
                },
              ],
            },
          ]
        : []),
    ],
  };
}

/** Fenêtre 2, état d'attente : ouverte tout de suite, le brouillon arrive par mise à jour. */
export function buildWritingModal(pick: PickPayload, subjectTitle: string) {
  return {
    type: 'modal' as const,
    callback_id: MODAL_CALLBACK_ID,
    private_metadata: JSON.stringify({ ...pick, draft: '' }),
    title: { type: 'plain_text' as const, text: 'Promouvoir' },
    submit: { type: 'plain_text' as const, text: 'Publier' },
    close: { type: 'plain_text' as const, text: 'Annuler' },
    blocks: [
      {
        type: 'context' as const,
        elements: [
          {
            type: 'mrkdwn' as const,
            text: `*${subjectTitle}*\n_intitulé proposé par le modèle_`,
          },
        ],
      },
      {
        type: 'input' as const,
        block_id: NOTE_BLOCK_ID,
        label: { type: 'plain_text' as const, text: 'Ce que cela change pour un décideur' },
        hint: {
          type: 'plain_text' as const,
          text: 'Rédaction du brouillon en cours… vous pouvez déjà écrire, le brouillon ne l’écrasera pas.',
        },
        element: {
          type: 'plain_text_input' as const,
          action_id: NOTE_ACTION_ID,
          multiline: true,
        },
      },
    ],
  };
}

/**
 * Fenêtre 2, brouillon arrivé. Le champ est pré-rempli ET le brouillon voyage dans
 * `private_metadata` : il repartira au cockpit, qui refusera une note qui s'en approche. Sans ce
 * voyage, pré-remplir aurait désactivé la règle en silence — une phrase fraîchement écrite par un
 * modèle ne ressemble à aucun des textes que le garde-fou connaissait (ADR 0079).
 */
export function buildWritingModalWithDraft(
  pick: PickPayload,
  subjectTitle: string,
  draft: { draft: string; whatItAdds?: string; basis?: string[]; cannot_say?: string[] },
) {
  /**
   * Ce que CETTE couverture apporte que la précédente n'avait pas — la case que le modèle doit
   * remplir avant d'écrire son brouillon (ADR 0079, prompt révisé le 2026-08-21). C'est le meilleur
   * résumé dont dispose la personne au moment de juger, et il ne lui parvenait pas.
   *
   * Placé AU-DESSUS du champ, et marqué comme prose de modèle au même titre que l'intitulé : c'est
   * une affirmation de machine sur une matière qu'elle n'a pas lue au-delà des titres (ADR 0078).
   */
  const adds = draft.whatItAdds?.trim();
  const notes = [
    draft.basis?.length ? `*Appuyé sur :* ${draft.basis.slice(0, 4).join(' · ')}` : null,
    draft.cannot_say?.length
      ? `*Ce que le brouillon ne peut pas dire :* ${draft.cannot_say.slice(0, 4).join(' · ')}`
      : null,
  ].filter(Boolean) as string[];

  return {
    type: 'modal' as const,
    callback_id: MODAL_CALLBACK_ID,
    // `whatItAdds` voyage AVEC la soumission : le cockpit ne peut pas le recalculer (il est produit
    // par l'appel de brouillon, pas stocké), et sans lui `noteOrigin` inscrirait « human_written »
    // sur une phrase recopiée du modèle.
    private_metadata: JSON.stringify({ ...pick, draft: draft.draft, whatItAdds: adds ?? '' }),
    title: { type: 'plain_text' as const, text: 'Promouvoir' },
    submit: { type: 'plain_text' as const, text: 'Publier' },
    close: { type: 'plain_text' as const, text: 'Annuler' },
    blocks: [
      {
        type: 'context' as const,
        elements: [
          {
            type: 'mrkdwn' as const,
            text: `*${subjectTitle}*\n_intitulé proposé par le modèle_`,
          },
        ],
      },
      ...(adds
        ? [
            {
              type: 'context' as const,
              elements: [
                {
                  type: 'mrkdwn' as const,
                  text: `*Ce que cette couverture ajoute, selon le modèle :* ${adds}`,
                },
              ],
            },
          ]
        : []),
      {
        type: 'input' as const,
        // Identifiant NEUF dès qu'il y a un brouillon : sans cela Slack garde le bloc d'origine,
        // vide, et n'applique jamais l'initial_value (voir NOTE_BLOCK_ID_DRAFT).
        block_id: draft.draft ? NOTE_BLOCK_ID_DRAFT : NOTE_BLOCK_ID,
        label: { type: 'plain_text' as const, text: 'Ce que cela change pour un décideur' },
        hint: {
          type: 'plain_text' as const,
          text: draft.draft
            ? 'Brouillon machine. Publiable tel quel — le journal notera qu’il n’a pas été retouché.'
            : 'Votre phrase, pas celle du titre. Une phrase courte et juste suffit.',
        },
        element: {
          type: 'plain_text_input' as const,
          action_id: NOTE_ACTION_ID,
          multiline: true,
          ...(draft.draft ? { initial_value: draft.draft } : {}),
        },
      },
      ...(notes.length
        ? [
            {
              type: 'context' as const,
              elements: [{ type: 'mrkdwn' as const, text: notes.join('\n') }],
            },
          ]
        : []),
    ],
  };
}

export interface Submission {
  /** L'identifiant du bloc de saisie effectivement présent — pour y accrocher un refus. */
  blockId: string;
  corridorId: string;
  clusterId: string;
  /** URL de repli, au cas où l'identifiant amont aurait changé depuis l'ouverture de la fenêtre. */
  urls: string[];
  /** Le brouillon proposé. Repart au cockpit, qui trace ce qu'il est devenu (`note_origin`). */
  draft: string;
  /** L'autre prose de modèle affichée dans la même fenêtre. Repart pour la même raison. */
  whatItAdds: string;
  note: string;
}

/** Read back what the promoter chose and wrote. Throws on a shape Slack should never send. */
export function parseSubmission(view: {
  private_metadata?: string;
  state?: { values?: Record<string, Record<string, unknown>> };
}): Submission {
  const values = view.state?.values ?? {};
  // Le champ vit sous l'un ou l'autre identifiant selon qu'un brouillon est arrivé.
  const blockId = values[NOTE_BLOCK_ID_DRAFT] ? NOTE_BLOCK_ID_DRAFT : NOTE_BLOCK_ID;
  const note = values[blockId]?.[NOTE_ACTION_ID] as { value?: string } | undefined;
  // Le sujet ne vient plus d'un menu : il a été choisi au bouton et voyage dans private_metadata,
  // avec les URL de repli et le brouillon qui a été mis sous les yeux de la personne.
  let meta: {
    corridorId?: string;
    clusterId?: string;
    urls?: string[];
    draft?: string;
    whatItAdds?: string;
  };
  try {
    meta = JSON.parse(view.private_metadata ?? '{}');
  } catch {
    throw new Error('submission incomplète');
  }
  if (!meta.corridorId || !meta.clusterId) throw new Error('submission incomplète');
  return {
    // Le bloc où poser un message d'erreur : viser le mauvais le rend invisible.
    blockId,
    corridorId: meta.corridorId,
    clusterId: meta.clusterId,
    urls: Array.isArray(meta.urls) ? meta.urls : [],
    draft: typeof meta.draft === 'string' ? meta.draft : '',
    whatItAdds: typeof meta.whatItAdds === 'string' ? meta.whatItAdds : '',
    note: (note?.value ?? '').trim(),
  };
}

/** Le bouton « Choisir » d'un sujet — ce que l'action rapporte. */
/**
 * D'où vient un clic « écrire », et a-t-il le droit d'exister.
 *
 * DEUX CHOSES CHANGENT quand le bouton passe d'une fenêtre à un message du flux au fil de l'eau :
 *
 * 1. `views.push` empile sur une fenêtre OUVERTE. Depuis un message il n'y a aucune pile — il faut
 *    `views.open`, sans quoi Slack refuse et le clic ne produit rien de visible.
 * 2. Le clic depuis une fenêtre avait déjà passé le contrôle du canal à la porte (le bouton
 *    corridor). Depuis un message, ce contrôle n'a jamais eu lieu : un message partagé dans un autre
 *    canal y porte un bouton fonctionnel. Or l'autorisation EST le canal privé — un bouton transféré
 *    n'est pas une approbation.
 */
export type PickEntry = { ok: true; mode: 'open' | 'push' } | { ok: false; reason: string };

export function pickEntry(
  body: { view?: { id?: string } | null; channel?: { id?: string } | null },
  allowedChannel: string | undefined,
): PickEntry {
  if (body.view?.id) return { ok: true, mode: 'push' };
  if (!body.channel?.id) return { ok: false, reason: 'origine inconnue' };
  if (!isAllowedChannel(body.channel.id, allowedChannel))
    return { ok: false, reason: 'canal non autorisé' };
  return { ok: true, mode: 'open' };
}

export function parsePick(value: string | undefined): PickPayload {
  const p = JSON.parse(value ?? '{}');
  if (!p.corridorId || !p.clusterId) throw new Error('pick incomplet');
  return {
    corridorId: p.corridorId,
    clusterId: p.clusterId,
    urls: Array.isArray(p.urls) ? p.urls : [],
    title: typeof p.title === 'string' ? p.title : 'sujet sélectionné',
  };
}

export type PromoteOutcome =
  | { ok: true }
  | { ok: false; field: 'note'; message: string }
  | { ok: false; field: null; message: string };

/**
 * Map the cockpit's answer onto something the modal can show. A 422 paraphrase is NOT an error to
 * log and swallow: it is the whole point of P2, and it belongs under the note field.
 */
export function outcomeFromCockpit(status: number, body: Record<string, unknown>): PromoteOutcome {
  if (status >= 200 && status < 300) return { ok: true };
  if (status === 422 && body.error === 'editorial_note_paraphrase') {
    return {
      ok: false,
      field: 'note',
      message: String(body.message ?? 'Votre phrase reprend un texte déjà présent.'),
    };
  }
  if (status === 400) {
    // Ne pas traduire TOUT 400 par « phrase manquante » : c'est ce qui a masqué pendant une heure un
    // champ vidé par Slack. On lit ce que le cockpit reproche vraiment.
    const issues = Array.isArray(body.issues) ? (body.issues as { path?: unknown[] }[]) : [];
    const onNote = issues.some((i) => Array.isArray(i.path) && i.path[0] === 'editorial_note');
    if (onNote || issues.length === 0)
      return { ok: false, field: 'note', message: 'Une phrase est requise.' };
    const paths = issues.map((i) => (Array.isArray(i.path) ? i.path.join('.') : '?')).join(', ');
    return {
      ok: false,
      field: null,
      message: `Le cockpit a refusé la requête (champ : ${paths}).`,
    };
  }
  return { ok: false, field: null, message: `Le cockpit a refusé (HTTP ${status}).` };
}
