/**
 * Le fil d'actualité de la page d'accueil : veille promue ET publications éditoriales, un seul flux.
 *
 * POURQUOI CE MODULE NE CHARGE RIEN. Il ne connaît ni `promoted-news.json` ni `astro:content` : la
 * page lit, ce module fusionne. Deux raisons, dans cet ordre. (1) `astro:content` n'existe pas sous
 * vitest — `apps/public` n'a pas de `vitest.config`, et un tel import casserait le fichier de test
 * entier à la résolution, donc la règle ne serait plus éprouvable. (2) C'est le partage déjà retenu
 * dans `atlas-data.ts` entre `newsSignalFrom` (la règle) et `corridorNewsSignal` (l'adaptateur),
 * pour la raison qui y est écrite : un test qui casse quand le produit marche finit désactivé.
 *
 * LA RÈGLE HÉRITÉE DE `veille.ts` : ce fil tombe vers le VIDE, jamais vers le PÉRIMÉ. Un bloc titré
 * « Actualité » surmontant un dossier de juin n'est pas neutre, il affirme — et c'est exactement
 * ainsi que la fiche Mer Rouge en est venue à soutenir « aucune attaque depuis octobre 2025 » dix
 * jours après que ce fut faux. Le seuil est donc le même que partout ailleurs sur le site : 21 jours.
 *
 * LA FRAÎCHEUR EST CALCULÉE À L'INSTANT DU BUILD. Le site est statique : sans reconstruction, un fil
 * daté du 21 août resterait affiché en octobre. C'est le cron horaire
 * `17 * * * * scripts/redeploy-public.sh --refresh-signals` qui fait réellement s'éteindre le bloc
 * au bout de 21 jours en production. Sans lui, « tombe vers le vide » ne serait qu'une propriété de
 * test sans effet sur ce que voit un lecteur.
 */

import { HOMEPAGE_MAX_AGE_DAYS, type VeilleEntry } from './veille';

/**
 * Importé, jamais recopié. Deux constantes à 21 jours existent déjà dans ce dépôt
 * (`HOMEPAGE_MAX_AGE_DAYS`, `NEWS_SIGNAL_MAX_AGE_DAYS`) et ont dû être tenues en phase à la main ;
 * un troisième littéral serait une troisième occasion de dériver. Arbitré le 2026-08-10.
 */
export const ACTUALITE_MAX_AGE_DAYS = HOMEPAGE_MAX_AGE_DAYS;

export type ActualiteKind = 'veille' | 'dossier' | 'note' | 'fiche';

/**
 * Ce que l'appelant fournit : une FORME, sans règle. `at` peut être absent ou illisible — c'est ce
 * module qui tranche, pas la page, sinon chaque appelant réinventerait le prédicat de fraîcheur.
 */
export interface ActualiteCandidate {
  kind: ActualiteKind;
  href: string;
  title: string;
  /** La ligne affichée sous le titre : `editorial_note` (veille), `summary`, `verdict`. */
  line: string;
  /** `promoted_at` (veille), `date` (note/dossier), `updated` (fiche Atlas). */
  at: Date | string | null | undefined;
}

/** Ce que le fil rend : daté d'une date VALIDE, frais, trié. */
export interface ActualiteEntry {
  kind: ActualiteKind;
  href: string;
  title: string;
  line: string;
  at: Date;
}

/**
 * Étiquette de nature. Sur une fiche Atlas, `updated` ne distingue pas création et mise à jour
 * (voir le schéma de la collection) : le fil ne prétend donc PAS « nouvelle fiche ». L'étiquette dit
 * ce qu'est l'objet, la date dit ce que la donnée sait. Ne jamais écrire « Nouveau » ici.
 */
export const actualiteKindLabel: Record<ActualiteKind, string> = {
  veille: 'Veille',
  dossier: 'Dossier',
  note: 'Note',
  fiche: 'Fiche Atlas',
};

/** Départage des ex æquo. Du plus engageant au plus périssable — un ordre, pas un classement. */
const KIND_RANK: Record<ActualiteKind, number> = { dossier: 0, fiche: 1, note: 2, veille: 3 };

function parseDate(at: ActualiteCandidate['at']): Date | null {
  if (at == null) return null;
  const d = at instanceof Date ? at : new Date(at);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Les candidats frais, du plus récent au plus ancien, coupés à `limit`.
 *
 * Vide quand rien n'est frais — c'est la propriété qui compte, et c'est elle qui fait disparaître le
 * bloc de la page d'accueil plutôt que de l'y laisser vieillir.
 */
export function actualiteFeed(
  candidates: readonly ActualiteCandidate[],
  now: Date,
  { limit = 4, maxAgeDays = ACTUALITE_MAX_AGE_DAYS }: { limit?: number; maxAgeDays?: number } = {},
): ActualiteEntry[] {
  const fresh: ActualiteEntry[] = [];
  for (const c of candidates) {
    const at = parseDate(c.at);
    // Une entrée non datable est ÉCARTÉE, pas reléguée. `loadVeille` fait l'inverse — elle garde une
    // estampille cassée en la triant en dernier — et a raison : sa liste est exhaustive et la date y
    // est un ornement. Ici la date est le prédicat : ce qu'on ne peut pas dater, on ne peut pas le
    // déclarer frais. L'entrée reste visible sur /veille, /notes, /dossiers.
    if (!at) continue;
    const ageDays = (now.getTime() - at.getTime()) / 86_400_000;
    // Borne haute inclusive, comme `newsSignalFrom` et l'ancienne `homepageVeille`.
    if (ageDays > maxAgeDays) continue;
    // Borne basse : une date FUTURE est écartée. Un `updated: 2027-…` — coquille, ou publication
    // programmée — se punaiserait en tête du fil pour toujours, et un signal qui ne s'éteint jamais
    // cesse d'en être un. Les dates de contenu sont posées à minuit UTC par `z.coerce.date()`, donc
    // une publication du jour reste dans le passé pour tout build postérieur : pas de faux négatif.
    if (ageDays < 0) continue;
    fresh.push({ kind: c.kind, href: c.href, title: c.title, line: c.line, at });
  }
  // Le filtrage est fait ENTRÉE PAR ENTRÉE, pas sur l'âge du plus récent : `homepageVeille` testait
  // le plus récent puis coupait sans revérifier, si bien qu'un item de mars pouvait s'afficher à
  // côté d'un item d'hier sous un titre « Actualité ».
  fresh.sort((a, b) => {
    const parDate = b.at.getTime() - a.at.getTime();
    if (parDate !== 0) return parDate;
    // Les dates de contenu sont à la journée près, donc souvent égales, et l'ordre d'entrée vient de
    // `getCollection`, donc du système de fichiers. Sans ces deux clés, deux builds du même dépôt
    // pourraient rendre deux pages différentes.
    const parNature = KIND_RANK[a.kind] - KIND_RANK[b.kind];
    if (parNature !== 0) return parNature;
    return a.href.localeCompare(b.href);
  });
  // Une SEULE ligne par cible, la plus fraîche. Un corridor peut porter deux promotions valides —
  // c'est le cas d'Ormuz, promu le 11 puis le 21 août — et les deux sont de vraies actualités ; mais
  // sur un fil de quatre lignes, les répéter revient à donner la moitié de la page au même objet et
  // à évincer ce qui, ailleurs, vient aussi de bouger. Le détail des promotions d'un corridor est
  // sur sa fiche et sur /veille, qui sont exhaustives ; ce fil-ci répond à « qu'est-ce qui bouge ».
  // Dédupliqué APRÈS le tri : la première rencontrée est donc la plus récente.
  const vues = new Set<string>();
  const uniques = fresh.filter((e) => !vues.has(e.href) && vues.add(e.href));
  return uniques.slice(0, limit);
}

/**
 * `VeilleEntry` → candidat. Aucune règle ici : un changement de forme, et la garantie qu'une seule
 * phrase passe — celle du promoteur (`editorial_note`), jamais celle du modèle (`headline`,
 * `summary_text`), qui restent au magasin comme trace de ce qui a été PROPOSÉ (ADR 0074).
 *
 * Faire passer la veille par cet adaptateur, plutôt que par un `.map()` dans `index.astro`, est ce
 * qui tient la page d'accueil à distance de ces champs — et rend la garde vérifiable sur un fichier
 * de lib plutôt que sur un composant.
 */
export function veilleCandidates(entries: readonly VeilleEntry[]): ActualiteCandidate[] {
  return entries.map((e) => ({
    kind: 'veille' as const,
    href: `/atlas/chokepoints/${e.corridorId}`,
    title: e.corridorName,
    line: e.item.editorial_note,
    at: e.promotedAt,
  }));
}
