/**
 * Le flux au fil de l'eau : un sujet, un message, dès qu'il franchit un seuil.
 *
 * POURQUOI CETTE FORME. Le digest hebdomadaire déposait trente-six regroupements le lundi matin —
 * un lot qu'on ne commence pas. Mesure au 2026-08-21 : une promotion en dix jours, le jour même du
 * câblage. L'unité de validation devient le sujet, pas la semaine.
 *
 * L'IDENTITÉ EST LE PROBLÈME CENTRAL, et il n'est pas évident. `cluster_id` ne survit pas à une
 * passe amont : 0 identifiant commun sur 15 entre deux passes du même corridor le même jour. Un
 * registre indexé dessus re-notifierait TOUT quatre fois par jour. `topic_id` dure tant que le sujet
 * reçoit des articles (clôture à trois jours, jamais réutilisé) — mais il n'est stable qu'à 80–87 %,
 * avec une passe mesurée à 50 %, et le producteur nous demande explicitement de garder le repli par
 * URL. D'où `streamKey` : topic, sinon URL, jamais cluster.
 *
 * Ce module ne fait AUCUNE entrée-sortie : il décide. Le sondage, le registre sur disque et l'envoi
 * vivent dans `stream-run.ts`, ce qui rend les règles testables sans jeton ni réseau.
 */

import {
  SALIENT_AT,
  decodeEntities,
  distinctStories,
  pickActionId,
  subjectWeight,
  weightLine,
  windowLabel,
  ageLabel,
  type ClusterChoice,
  type PickPayload,
  type SubjectWeight,
} from './promote.js';

/** Un regroupement, augmenté des deux choses que le flux exige et que la fenêtre ignorait. */
export interface StreamCluster extends ClusterChoice {
  /** L'identité durable (1.1.0). Absente sur les regroupements antérieurs au 2026-08-13. */
  topicId?: string;
  /** Les corridors réellement liés — recalculés côté serveur, pas inventés par le modèle. */
  corridorIds: string[];
}

export interface LedgerEntry {
  /** Le corridor sous lequel le sujet a été annoncé — celui de la classe la plus forte. */
  corridorId: string;
  firstNotifiedAt: string;
  lastNotifiedAt: string;
  /** Dernière passe où le sujet était encore servi. Sert la purge, pas la décision. */
  lastSeenAt: string;
  lastTier: number;
  reminders: number;
  /** `ts` du message Slack, pour un éventuel fil de rappels. Renseigné après l'envoi. */
  ts?: string;
}

export type Ledger = Record<string, LedgerEntry>;

/**
 * Paliers d'emballement, en MÉDIAS DISTINCTS. Sur Ormuz, « le trafic tombe à six navires » vaut 0,90
 * de saillance pour 3 médias quand « l'Iran lie la réouverture » vaut 0,90 pour 199 : deux mesures
 * distinctes, et c'est la seconde que ces paliers suivent.
 */
export const TIERS = [5, 20, 50, 100];

/** Un sujet qui enfle ne doit pas prendre le canal à lui seul. */
export const MAX_REMINDERS = 3;

/**
 * Annonces neuves par passe. Au premier sondage le registre est vide : sans plafond, tous les sujets
 * éligibles partiraient d'un seul coup, et un canal bruyant se mute — ce qui est exactement le point
 * de départ qu'on cherche à quitter.
 */
export const DEFAULT_MAX_PER_RUN = 5;

/** Seuil bas des P0. Le 2 dit « jamais sur une source unique » ; il ne vient pas de l'ADR 0072, qui compte des marchés. */
export const P0_MIN_OUTLETS = 2;
/** Seuil des autres classes — `LOW_ECHO_UNDER` de `promote.ts`, la limite du « peu repris ». */
export const OTHER_MIN_OUTLETS = 5;
/** En dessous de ce nombre de médias, la saillance déclarée ne suffit plus, hors P0. */
export const OTHER_SALIENT_MIN_OUTLETS = 3;

/** Rétention amont : quatorze jours. Au-delà, une entrée ne peut plus rien empêcher. */
export const LEDGER_RETENTION_DAYS = 14;

const PRIORITY_ORDER = ['P0', 'P1', 'P2', 'P3'];

/**
 * Les classes que le flux surveille. Le recensement compte 30 P0, 182 P1, 99 P2 et 1928 P3 : servir
 * les P3 revient à servir la quasi-totalité du recensement, et le 2026-08-21 sept des quinze
 * corridors présents dans le flux étaient des P3 « regional air cargo gateway » dont l'actualité
 * n'avait rien de géopolitique. Deux appels suffisent à charger P0 + P1.
 */
export const ELIGIBLE_CLASSES = ['P0', 'P1'];

function isHttp(u: string): boolean {
  return /^https?:\/\//i.test(u);
}

/**
 * L'identité du sujet pour le registre. JAMAIS `cluster_id` : il change à chaque passe.
 *
 * `null` quand rien n'identifie le sujet — et c'est un refus, pas un défaut : un sujet sans identité
 * serait re-annoncé à chaque sondage, donc quatre fois par jour, pour toujours.
 */
export function streamKey(c: StreamCluster): string | null {
  const topic = c.topicId?.trim();
  if (topic) return `topic:${topic}`;
  const urls = c.articles
    .map((a) => a.url)
    .filter(isHttp)
    .sort();
  return urls.length > 0 ? `urls:${urls.join('|')}` : null;
}

/**
 * La classe de priorité la plus forte parmi les corridors touchés.
 *
 * Elle se LIT dans le recensement, elle ne se devine pas depuis le préfixe de l'identifiant. Un
 * corridor absent du recensement rend `null`, et `meetsThreshold` appliquera alors le seuil le plus
 * exigeant — ne pas savoir n'est pas une raison d'alerter plus.
 */
export function priorityOf(c: StreamCluster, classes: Map<string, string>): string | null {
  let best: string | null = null;
  for (const id of c.corridorIds) {
    const cls = classes.get(id);
    if (!cls) continue;
    if (best === null || PRIORITY_ORDER.indexOf(cls) < PRIORITY_ORDER.indexOf(best)) best = cls;
  }
  return best;
}

/** Le corridor sous lequel annoncer : celui qui porte la classe retenue. */
export function corridorFor(c: StreamCluster, classes: Map<string, string>): string {
  const best = priorityOf(c, classes);
  if (best) {
    const match = c.corridorIds.find((id) => classes.get(id) === best);
    if (match) return match;
  }
  return c.corridorIds[0] ?? '';
}

/**
 * Le sujet mérite-t-il un message ?
 *
 * Les P0 alertent tôt (deux médias suffisent) parce qu'un P0 qui bouge est déjà une information. Le
 * reste doit être PORTÉ. Dans les deux cas la saillance déclarée par l'amont ouvre une porte
 * dérobée — c'est le cas « six navires », trois médias et le fait le plus décisionnel du corridor.
 */
export function meetsThreshold(c: StreamCluster, priority: string | null): boolean {
  const w = subjectWeight(c);
  const salient = typeof w.salience === 'number' && w.salience >= SALIENT_AT;
  if (priority === 'P0') return w.outlets >= P0_MIN_OUTLETS || salient;
  return w.outlets >= OTHER_MIN_OUTLETS || (salient && w.outlets >= OTHER_SALIENT_MIN_OUTLETS);
}

/** Combien de paliers ce nombre de médias a franchis. 0 = sous le premier. */
export function tierOf(outlets: number): number {
  return TIERS.filter((t) => outlets >= t).length;
}

export interface StreamAction {
  key: string;
  cluster: StreamCluster;
  corridorId: string;
  weight: SubjectWeight;
  /** Palier franchi, pour un rappel. Absent sur une première annonce. */
  tier?: number;
}

export interface StreamPlan {
  notify: StreamAction[];
  remind: StreamAction[];
  ledger: Ledger;
}

/**
 * Décide, pour une passe, ce qui s'annonce et ce qui se rappelle.
 *
 * UN CHOIX QUI MÉRITE D'ÊTRE DIT : un sujet sous le seuil n'est PAS inscrit au registre. L'y
 * inscrire l'aurait tu à jamais, alors que le sujet qui monte est précisément celui qu'on veut voir
 * le jour où il monte.
 */
export function planStream(input: {
  clusters: StreamCluster[];
  ledger: Ledger;
  classes: Map<string, string>;
  now: string;
  maxPerRun?: number;
}): StreamPlan {
  const { clusters, ledger, classes, now, maxPerRun = DEFAULT_MAX_PER_RUN } = input;
  const next: Ledger = { ...ledger };
  const notify: StreamAction[] = [];
  const remind: StreamAction[] = [];
  const candidates: StreamAction[] = [];

  for (const c of clusters) {
    const key = streamKey(c);
    if (!key) continue;

    const weight = subjectWeight(c);
    const tier = tierOf(weight.outlets);
    const entry = next[key];

    if (!entry) {
      // HORS PÉRIMÈTRE = SILENCE, quel que soit l'écho. `classes` ne contient QUE les corridors
      // éligibles (P0/P1 par défaut), donc une classe absente veut dire « pas notre sujet », et non
      // « classe inconnue à traiter prudemment ». Mesuré à blanc : sans cette ligne, trois annonces
      // sur cinq portaient sur des P3 « regional air cargo gateway » — l'aéroport d'Ontario
      // ramassant l'actualité de la province du même nom.
      const priority = priorityOf(c, classes);
      if (!priority) continue;
      if (!meetsThreshold(c, priority)) continue;
      candidates.push({ key, cluster: c, corridorId: corridorFor(c, classes), weight, tier });
      continue;
    }

    if (tier > entry.lastTier && entry.reminders < MAX_REMINDERS) {
      next[key] = {
        ...entry,
        lastTier: tier,
        lastNotifiedAt: now,
        lastSeenAt: now,
        reminders: entry.reminders + 1,
      };
      remind.push({ key, cluster: c, corridorId: entry.corridorId, weight, tier });
      continue;
    }

    // Le palier est enregistré même sans rappel : sinon un sujet plafonné rappellerait de nouveau
    // au palier suivant depuis un `lastTier` resté bas.
    next[key] = { ...entry, lastSeenAt: now, lastTier: Math.max(entry.lastTier, tier) };
  }

  // Les mieux portés d'abord, puis on coupe — l'ordre précède la coupe, sans quoi le plafond
  // garderait les premiers du flux et non ceux qui comptent. Les écartés ne sont PAS inscrits : ils
  // se représenteront au sondage suivant, ce qui étale l'amorçage au lieu de vider le flux d'un coup.
  candidates.sort(
    (a, b) => b.weight.outlets - a.weight.outlets || b.weight.articles - a.weight.articles,
  );
  for (const action of candidates.slice(0, Math.max(0, maxPerRun))) {
    next[action.key] = {
      corridorId: action.corridorId,
      firstNotifiedAt: now,
      lastNotifiedAt: now,
      lastSeenAt: now,
      lastTier: action.tier ?? 0,
      reminders: 0,
    };
    notify.push({ ...action, tier: undefined });
  }

  return { notify, remind, ledger: next };
}

/** Oublie ce que l'amont a lui-même purgé. */
export function purgeLedger(ledger: Ledger, now: Date, days = LEDGER_RETENTION_DAYS): Ledger {
  const cutoff = now.getTime() - days * 86_400_000;
  const kept: Ledger = {};
  for (const [key, entry] of Object.entries(ledger)) {
    const seen = Date.parse(entry.lastSeenAt);
    if (Number.isFinite(seen) && seen >= cutoff) kept[key] = entry;
  }
  return kept;
}

/**
 * Le message d'un sujet. C'est LUI la surface de lecture — les titres des éditeurs y sont cliquables
 * de plein droit, ce qui supprime la fenêtre de choix de l'ancien parcours.
 *
 * Le bouton porte exactement la charge utile qu'attend le gestionnaire existant (`parsePick`), pour
 * que l'étage d'écriture — fenêtre, brouillon, refus de paraphrase — reste inchangé.
 */
export function buildStreamMessage(c: StreamCluster, corridorId: string, today: string) {
  const weight = subjectWeight(c);
  const stories = distinctStories(c.articles);
  const title = decodeEntities(c.headline ?? '').trim();
  const subject = title || (c.eventCategory ?? 'couverture').replace(/_/g, ' ');
  const payload: PickPayload = {
    corridorId,
    clusterId: c.clusterId,
    urls: stories.slice(0, 4).map((a) => a.url),
    title: subject.slice(0, 150),
  };

  const lines = stories.slice(0, 4).map((a) => {
    const t = decodeEntities(a.title).replace(/[<>|]/g, ' ').slice(0, 90);
    const age = ageLabel(a.observedOn, today);
    const who = [a.outlets > 1 ? `${a.outlets} médias` : (a.outlet ?? 'média inconnu'), age]
      .filter(Boolean)
      .join(' · ');
    return `   • <${a.url}|${t}> _(${who})_`;
  });

  return {
    text: `${weight.outlets} média${weight.outlets > 1 ? 's' : ''} — ${subject}`.slice(0, 150),
    blocks: [
      {
        type: 'section' as const,
        text: {
          type: 'mrkdwn' as const,
          text: [`*${subject}*`, weightLine(weight, windowLabel(c.firstSeen, c.lastSeen))].join(
            '\n',
          ),
        },
      },
      {
        type: 'context' as const,
        elements: [{ type: 'mrkdwn' as const, text: lines.join('\n') }],
      },
      {
        // Le marquage tient ici, une fois par message : l'intitulé ci-dessus est du texte de modèle,
        // il sert à repérer et le cockpit refuse une note qui le recopie (ADR 0078/0074).
        type: 'context' as const,
        elements: [
          {
            type: 'mrkdwn' as const,
            text: '_Intitulé écrit par le modèle amont — jamais publié. La phrase reste à écrire._',
          },
        ],
      },
      {
        type: 'actions' as const,
        elements: [
          {
            type: 'button' as const,
            action_id: pickActionId(0),
            value: JSON.stringify(payload).slice(0, 2000),
            style: 'primary' as const,
            text: { type: 'plain_text' as const, text: 'Écrire la phrase' },
          },
        ],
      },
    ] as Record<string, unknown>[],
  };
}

/**
 * Projette un regroupement du flux vers la forme que ce module manipule.
 *
 * `topic_id` était parsé par le schéma et jeté par tout le reste du code : c'est ici qu'il sert
 * enfin. Les URL non-http sont écartées à l'entrée, comme dans la fenêtre.
 */
export function toStreamCluster(raw: Record<string, unknown>): StreamCluster {
  const articles = ((raw.articles ?? []) as Record<string, unknown>[])
    .filter((a) => typeof a.url === 'string' && isHttp(String(a.url)))
    .map((a) => ({
      title: String(a.title ?? ''),
      url: String(a.url),
      outlet: a.outlet ? String(a.outlet) : undefined,
      // `observed_on` = quand le flux a VU l'article, jamais sa date de publication (ADR 0077).
      observedOn: a.observed_on ? String(a.observed_on) : undefined,
    }));

  return {
    clusterId: String(raw.cluster_id ?? ''),
    topicId: raw.topic_id ? String(raw.topic_id) : undefined,
    corridorIds: ((raw.affected_chokepoints ?? []) as Record<string, unknown>[])
      .map((a) => String(a.chokepoint_id ?? ''))
      .filter(Boolean),
    eventCategory: raw.event_category ? String(raw.event_category) : undefined,
    articleCount: typeof raw.article_count === 'number' ? raw.article_count : undefined,
    headline: raw.headline ? String(raw.headline) : undefined,
    salience: typeof raw.salience_score === 'number' ? raw.salience_score : undefined,
    firstSeen: raw.first_seen ? String(raw.first_seen) : undefined,
    lastSeen: raw.last_seen ? String(raw.last_seen) : undefined,
    articles,
  };
}

/**
 * Le flux est-il exploitable ?
 *
 * Le contrat est explicite : `count: 0` AVEC un `run_id` est un vide honnête — une passe a tourné et
 * n'a rien trouvé. `count: 0` SANS `run_id` signifie qu'aucune agrégation n'a jamais tourné. Traiter
 * le second comme le premier transformerait un pipeline en panne en semaine calme, et le flux au fil
 * de l'eau se tairait sans que personne ne puisse distinguer le silence du vide.
 */
export function feedIsUsable(
  feed: { count?: number; run_id?: string | null } | null | undefined,
): boolean {
  if (!feed) return false;
  if ((feed.count ?? 0) > 0) return true;
  return Boolean(feed.run_id);
}

/**
 * Rend une clé à son état d'avant la passe. Appelé quand l'envoi Slack a échoué : sans cela le
 * registre retiendrait un sujet qui n'a jamais été annoncé, et ce sujet ne reviendrait jamais.
 */
export function revertKey(next: Ledger, previous: Ledger, key: string): Ledger {
  const out = { ...next };
  if (previous[key]) out[key] = previous[key];
  else delete out[key];
  return out;
}

/**
 * Lit le plafond par passe depuis l'environnement.
 *
 * `docker compose` passe une chaîne VIDE pour une variable non définie, et `Number('')` vaut `0` :
 * un `??` seul aurait donc éteint le flux sans rien dire le jour où la variable n'est pas renseignée.
 * Un zéro ÉCRIT reste accepté — couper le flux volontairement doit rester possible.
 */
export function maxPerRunFrom(raw: string | undefined): number {
  const trimmed = (raw ?? '').trim();
  if (trimmed === '') return DEFAULT_MAX_PER_RUN;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_MAX_PER_RUN;
  return Math.floor(n);
}
