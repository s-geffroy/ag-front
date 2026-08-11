import { readFile, writeFile, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  PromotedNewsItem,
  PromotedNewsStore,
  type PromotedNewsItem as PromotedNewsItemT,
} from '@ag/schema/content';
import type { NewsClusterOut, NewsFeedOut } from '@ag/chokepoints';
import { PUBLIC_DIR, touchPublishPending } from './publish';

// News promotion (ADR 0071). A human, in the cockpit, promotes ONE cluster from the (cockpit-only,
// read_tainted) /news feed onto the PUBLIC Atlas. Doctrine mirrors one-click publish (ADR 0069): the
// crossing candidate → public is a NOMINATIVE act (validated_by), journalled, and the host watcher does
// the rebuild. Two hard rules specific to news:
//   1. Only a CLEARED cluster is promotable — `license_taint` truthy is refused (ADR 0013 belt).
//   2. The reliable fields (articles[], affected_chokepoints[], counts) are taken from a FRESH
//      server-side re-fetch, never from the client body — believe the server, not the operator's copy.
// The store is app-owned public content (git-tracked JSON), decoupled from the producer's NewsClusterOut.

/** The public promoted-news store the SSG build reads (apps/public/src/data/promoted-news.json). */
export const PROMOTED_STORE = resolve(PUBLIC_DIR, 'src/data/promoted-news.json');

/** Only http(s) URLs survive into the public store (defence-in-depth; the schema also guards this). */
function isHttp(u: string | null | undefined): u is string {
  return typeof u === 'string' && /^https?:\/\//i.test(u);
}

/** A stable identity for a promoted cluster: durable cluster_id, else its sorted article-url set. */
export function itemKey(item: Pick<PromotedNewsItemT, 'cluster_id' | 'articles'>): string {
  if (item.cluster_id) return `id:${item.cluster_id}`;
  const urls = item.articles
    .map((a) => a.url)
    .filter(isHttp)
    .sort();
  return `urls:${urls.join('|')}`;
}

/**
 * Project a freshly-fetched cluster to the public-safe stored shape. Keeps only reliable fields verbatim
 * and the (candidate) prose the UI frames as such; drops non-http article URLs; forces
 * `taint_class: 'cleared_only'` (the caller has already verified the cluster is clear). Stamps WHO/WHEN.
 */
export function toPromotedItem(
  cluster: NewsClusterOut,
  opts: {
    promotedBy: string;
    promotedAt: string;
    editorialNote: string;
    noteOrigin?: 'human_written' | 'draft_edited' | 'draft_accepted';
  },
): PromotedNewsItemT {
  // Defence-in-depth: the route's resolvePromoteFromFeed already refuses a tainted cluster, but keep the
  // "cleared_only stamp ⇒ actually clear" invariant LOCAL so this exported projector is safe on its own.
  if (cluster.license_taint) {
    throw new Error('refusing to promote a tainted cluster (ADR 0013)');
  }
  return PromotedNewsItem.parse({
    articles: (cluster.articles ?? [])
      .filter((a) => isHttp(a.url))
      .map((a) => ({
        title: a.title ?? '',
        url: a.url,
        outlet: a.outlet ?? '',
        source_id: a.source_id ?? '',
        observed_on: a.observed_on ?? '',
      })),
    affected_chokepoints: (cluster.affected_chokepoints ?? []).map((c) => ({
      chokepoint_id: c.chokepoint_id,
      canonical_name: c.canonical_name ?? '',
      relevance: c.relevance ?? undefined,
    })),
    article_count: cluster.article_count ?? undefined,
    first_seen: cluster.first_seen ?? '',
    last_seen: cluster.last_seen ?? '',
    generated_at: cluster.generated_at ?? '',
    headline: cluster.headline ?? '',
    summary_text: cluster.summary_text ?? '',
    event_category: cluster.event_category ?? '',
    salience_score: cluster.salience_score ?? undefined,
    cluster_id: cluster.cluster_id ?? '',
    run_id: '',
    taint_class: 'cleared_only',
    // Required by the schema — a promotion without a human sentence does not parse, and therefore
    // cannot be written (ADR 0074).
    editorial_note: opts.editorialNote.trim(),
    note_origin: opts.noteOrigin,
    promoted_by: opts.promotedBy,
    promoted_at: opts.promotedAt,
  });
}

export type PromoteResolution =
  | { ok: false; status: number; error: string }
  | { ok: true; cluster: NewsClusterOut; matchedBy?: 'cluster_id' | 'article_urls' };

/**
 * Pick + validate the cluster to promote out of a fresh feed. Matches by `cluster_id` when given, else
 * by article-url overlap (cluster_id is not durable across runs — ADR 0076). Refuses a tainted cluster.
 */
export function resolvePromoteFromFeed(
  feed: NewsFeedOut,
  select: { cluster_id?: string; article_urls?: string[] },
): PromoteResolution {
  const items = feed.items ?? [];
  let cluster: NewsClusterOut | undefined;
  let matchedBy: 'cluster_id' | 'article_urls' | undefined;
  if (select.cluster_id) {
    cluster = items.find((c) => c.cluster_id === select.cluster_id);
    if (cluster) matchedBy = 'cluster_id';
  }
  // REPLI PAR LES URL, et non plus « sinon ». Mesuré le 2026-08-11 : entre deux passes du même jour
  // (aggregate_news@…T061535Z puis …T181553Z) AUCUN des 15 cluster_id n'a survécu — zéro en commun
  // sur 18 nouveaux. Une fenêtre ouverte avant une passe et validée après échouait donc en
  // `cluster_not_found`, sans que la personne ait rien fait de faux. Les URL d'articles, elles,
  // survivent à la re-génération.
  if (!cluster && select.article_urls?.length) {
    const wanted = new Set(select.article_urls);
    cluster = items.find((c) => (c.articles ?? []).some((a) => a.url && wanted.has(a.url)));
    if (cluster) matchedBy = 'article_urls';
  }
  if (!cluster) return { ok: false, status: 404, error: 'cluster_not_found' };
  // Belt to ADR 0013: a redistribution-restricted cluster never reaches the public site.
  if (cluster.license_taint) return { ok: false, status: 409, error: 'cluster_tainted' };
  // A cluster with no usable (http) article is not attributable → not promotable.
  if (!(cluster.articles ?? []).some((a) => isHttp(a.url))) {
    return { ok: false, status: 409, error: 'no_attributable_article' };
  }
  return { ok: true, cluster, matchedBy };
}

async function readStore(): Promise<Record<string, PromotedNewsItemT[]>> {
  let raw: unknown = {};
  try {
    raw = JSON.parse(await readFile(PROMOTED_STORE, 'utf8'));
  } catch {
    raw = {};
  }
  // `.catch({})` makes this total; a malformed file resets rather than throwing.
  return PromotedNewsStore.parse(raw) as Record<string, PromotedNewsItemT[]>;
}

async function writeStore(store: Record<string, PromotedNewsItemT[]>): Promise<void> {
  const tmp = `${PROMOTED_STORE}.tmp`;
  await writeFile(tmp, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  await rename(tmp, PROMOTED_STORE);
}

/**
 * Add a promoted item under a corridor, de-duping by {@link itemKey} (re-promoting refreshes in place).
 * Atomic tmp+rename, then touch the publish sentinel so the host watcher ships it. Returns the stored
 * item. Newest promotions render first.
 */
export async function writePromotedNews(
  corridorId: string,
  item: PromotedNewsItemT,
): Promise<PromotedNewsItemT> {
  const store = await readStore();
  const key = itemKey(item);
  const existing = store[corridorId] ?? [];
  const next = [item, ...existing.filter((it) => itemKey(it) !== key)];
  store[corridorId] = next;
  await writeStore(store);
  await touchPublishPending();
  return item;
}

/** Remove a promoted item (by key) from a corridor. Returns true if something was removed. */
export async function unpromoteNews(corridorId: string, key: string): Promise<boolean> {
  const store = await readStore();
  const existing = store[corridorId] ?? [];
  const next = existing.filter((it) => itemKey(it) !== key);
  if (next.length === existing.length) return false;
  if (next.length === 0) delete store[corridorId];
  else store[corridorId] = next;
  await writeStore(store);
  await touchPublishPending();
  return true;
}

// --- P2 : refus de la paraphrase (ADR 0074, arbitré le 2026-08-10) ---------------------------------
//
// L'ADR 0074 exige une phrase du promoteur parce que juger un cluster sur son titre était le défaut
// retiré. Rien n'empêchait jusqu'ici de RECOPIER le titre dans ce champ, ce qui satisfait la lettre
// de la règle en la vidant. On ne peut pas prouver qu'un humain a lu ; on peut refuser qu'il se
// contente de redire.
//
// POURQUOI PAS `questionFingerprint` DE @ag/chokepoints : son lexique d'arrêts est anglais, et il
// sert une garde en service (l'indépendance des marchés, sur des questions en anglais). Nos notes et
// les `headline` du modèle sont en français : sans « de / la / les / des », deux phrases françaises
// sans rapport partagent déjà assez de jetons pour franchir un seuil. On garde la même idée de
// normalisation, avec le lexique de la bonne langue.
const NOTE_STOPWORDS = new Set([
  'le',
  'la',
  'les',
  'un',
  'une',
  'des',
  'du',
  'de',
  'au',
  'aux',
  'et',
  'ou',
  'en',
  'dans',
  'sur',
  'pour',
  'par',
  'que',
  'qui',
  'quoi',
  'dont',
  'avec',
  'sans',
  'ne',
  'pas',
  'plus',
  'est',
  'sont',
  'ete',
  'etre',
  'a',
  'ce',
  'ces',
  'cet',
  'cette',
  'son',
  'sa',
  'ses',
  'leur',
  'leurs',
  'il',
  'elle',
  'ils',
  'elles',
  'on',
  'se',
  'y',
  'the',
  'of',
  'to',
  'in',
  'and',
  'for',
  'on',
  'as',
  'is',
  'are',
]);

/** Jetons discriminants d'une phrase : minuscules, sans accents ni ponctuation, mots-outils ôtés. */
export function noteFingerprint(text: string): string[] {
  return [
    ...new Set(
      (text ?? '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1 && !NOTE_STOPWORDS.has(w)),
    ),
  ].sort();
}

/**
 * Taux de RECOUVREMENT (et non Jaccard) : |A ∩ B| / |A|, la part de la note déjà présente dans le
 * texte candidat.
 *
 * Jaccard pénalise l'écart de longueur, donc une note brève entièrement recopiée d'un titre long y
 * obtiendrait un score bas et passerait — exactement le cas à attraper. Le recouvrement mesure ce qui
 * compte : « cette phrase apporte-t-elle des mots qui ne sont pas déjà là ? ». C'est aussi ce qui
 * rend la règle compatible avec la consigne « une note courte mais juste est publiée » : une note
 * brève et pertinente porte des mots neufs — son analyse — donc son recouvrement reste bas.
 */
export function containment(note: string[], candidate: string[]): number {
  if (note.length === 0) return 0;
  const set = new Set(candidate);
  return note.filter((t) => set.has(t)).length / note.length;
}

/** Au-delà, la note ne dit rien que le texte candidat ne disait déjà. */
export const PARAPHRASE_CONTAINMENT = 0.8;

export interface ParaphraseHit {
  /** Le texte que la note recopie (titre d'article, ou prose du modèle). */
  source: string;
  score: number;
}

/**
 * La note est-elle une quasi-copie de l'un des textes candidats ?
 *
 * Limite assumée, à dire plutôt qu'à masquer : la comparaison est lexicale, donc une note française
 * paraphrasant un titre ANGLAIS ne sera pas attrapée. Le cas dominant l'est, lui : le `headline` du
 * modèle est en français et c'est précisément ce que le promoteur a sous les yeux — c'est là que
 * l'ADR 0074 avait quelque chose à perdre.
 */
export function findParaphrase(
  note: string,
  candidates: (string | null | undefined)[],
  threshold = PARAPHRASE_CONTAINMENT,
): ParaphraseHit | null {
  const fp = noteFingerprint(note);
  if (fp.length === 0) return null;
  let worst: ParaphraseHit | null = null;
  for (const c of candidates) {
    if (!c || !c.trim()) continue;
    const score = containment(fp, noteFingerprint(c));
    if (score >= threshold && (!worst || score > worst.score)) worst = { source: c, score };
  }
  return worst;
}

/** Les textes qu'une note ne doit pas se contenter de redire : titres des articles + prose du modèle. */
/**
 * Titres distincts d'un regroupement, les plus portés d'abord, avec le compte de rédactions.
 *
 * DUPLICATION DÉLIBÉRÉE avec le slackbot : le cockpit re-lit le flux lui-même avant d'écrire ou de
 * rédiger, et ne fait jamais confiance à la vue qu'un client lui transmet. Dériver ici sa propre
 * lecture est le principe, pas un oubli de factorisation.
 */
export function distinctTitles(
  cluster: Pick<NewsClusterOut, 'articles'>,
): { title: string; outlets: number }[] {
  const by = new Map<string, { title: string; outlets: Set<string> }>();
  for (const a of cluster.articles ?? []) {
    const title = (a.title ?? '').trim();
    if (!title) continue;
    const key = title
      .toLowerCase()
      .replace(/&#x[0-9a-f]+;|&[a-z]+;/gi, ' ')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
    const e = by.get(key);
    if (e) e.outlets.add((a.outlet ?? a.url ?? '').toLowerCase());
    else by.set(key, { title, outlets: new Set([(a.outlet ?? a.url ?? '').toLowerCase()]) });
  }
  return [...by.values()]
    .map((e) => ({ title: e.title, outlets: e.outlets.size }))
    .sort((x, y) => y.outlets - x.outlets);
}

/** Rédactions distinctes de tout le regroupement — le poids, pas le volume d'articles. */
export function distinctOutlets(cluster: Pick<NewsClusterOut, 'articles'>): number {
  return new Set(
    (cluster.articles ?? []).map((a) => (a.outlet ?? '').toLowerCase()).filter(Boolean),
  ).size;
}

/**
 * Les textes qu'une note ne peut pas recopier.
 *
 * Le BROUILLON n'y figure plus (ADR 0079 amendé le 2026-08-11) : publier le brouillon tel quel est
 * désormais permis, sur décision explicite. Ce qui reste interdit est inchangé et n'a rien à voir —
 * recopier un TITRE, c'est redire ce qui est arrivé au lieu de dire ce que ça change, et aucune
 * décision d'ergonomie ne rend cela utile à un lecteur.
 */
export function paraphraseCandidates(cluster: NewsClusterOut): string[] {
  return [
    cluster.headline ?? '',
    cluster.summary_text ?? '',
    ...(cluster.articles ?? []).map((a) => a.title ?? ''),
  ].filter((s) => s.trim().length > 0);
}

/**
 * D'où vient la phrase publiée. Ce n'est pas un jugement, c'est un fait consigné : le journal est
 * nominatif et en ajout seul, il doit dire ce qui a été signé.
 *
 * Le seuil de 0.9 est volontairement haut — on ne cherche pas à qualifier une réécriture partielle
 * de « acceptée », seulement à reconnaître un texte laissé pratiquement intact.
 */
export function noteOrigin(
  note: string,
  draft?: string,
): 'human_written' | 'draft_edited' | 'draft_accepted' {
  const d = (draft ?? '').trim();
  if (!d) return 'human_written';
  const n = note.trim();
  if (n === d) return 'draft_accepted';
  const score = containment(noteFingerprint(n), noteFingerprint(d));
  return score >= 0.9 ? 'draft_accepted' : 'draft_edited';
}
