/**
 * Lire une liste servie SOIT comme un tableau nu, SOIT comme une enveloppe comptée.
 *
 * POURQUOI, ET POURQUOI MAINTENANT. Huit ressources du contrat `0.18.0` renvoient un tableau nu : on
 * ne peut pas distinguer « voici tout » de « voici les N premiers ». Mesuré sur Ormuz : `limit=500`
 * rendait 500 lignes, `limit=2000` en rendait 2000 — et ag-back nous a appris depuis qu'il y en a
 * **6488**. Ils ont décidé (leur `0027`, 2026-08-12) d'ajouter une enveloppe comptée
 * — `returned` / `total_count` / `truncated` / `limit` / `generated_at` — sur ces huit ressources.
 * C'est une **rupture assumée**, version cible `1.0.0`, annoncée avant bascule.
 *
 * Ce module accepte les deux formes dès aujourd'hui. Le jour de la bascule, notre consommation ne
 * doit pas casser, et surtout : le jour d'AVANT, elle ne doit pas prétendre savoir ce qu'elle ne
 * sait pas. D'où `total: null` sur un tableau nu — un compte inconnu n'est pas un compte égal à la
 * longueur reçue (ADR 0077).
 */

export interface ListEnvelope<T> {
  items: T[];
  /** Total annoncé par l'amont. `null` tant que la ressource sert un tableau nu. */
  total: number | null;
  /**
   * `true` si l'amont DÉCLARE avoir coupé. `null` quand il ne déclare rien — à ne pas lire comme
   * `false` : c'est précisément l'ambiguïté que la version 1.0.0 vient lever.
   */
  truncated: boolean | null;
  /** La limite effectivement appliquée, si l'amont la déclare. */
  limit: number | null;
  generatedAt: string | null;
}

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * @param raw   la charge utile brute, avant validation d'items
 * @param parse le validateur d'items (zod ou équivalent), appliqué au tableau extrait
 */
export function readListEnvelope<T>(raw: unknown, parse: (items: unknown) => T[]): ListEnvelope<T> {
  // Forme historique : un tableau nu. On ne déduit RIEN de sa longueur.
  if (Array.isArray(raw)) {
    return { items: parse(raw), total: null, truncated: null, limit: null, generatedAt: null };
  }
  if (!raw || typeof raw !== 'object') {
    return { items: parse([]), total: null, truncated: null, limit: null, generatedAt: null };
  }
  const e = raw as Record<string, unknown>;
  // `items` est notre nom de travail ; l'amont pourra livrer `results` ou `data`. On accepte les
  // trois plutôt que de casser sur un détail de nommage le jour de la bascule.
  const arr = [e.items, e.results, e.data].find(Array.isArray) ?? [];
  return {
    items: parse(arr),
    total: num(e.total_count) ?? num(e.total),
    // Seul le booléen `true` vaut aveu de troncature : ni la chaîne "true", ni 1.
    truncated: e.truncated === true ? true : e.truncated === false ? false : null,
    limit: num(e.limit),
    generatedAt: typeof e.generated_at === 'string' ? e.generated_at : null,
  };
}

/**
 * Ce qu'on peut dire du compte, en une chaîne. `≥ N` tant que le total est inconnu et que la
 * réponse touche la limite — jamais `N` tout court, qui affirmerait l'exhaustivité.
 */
export function envelopeCountLabel<T>(e: ListEnvelope<T>): string {
  if (e.total !== null) return String(e.total);
  if (e.truncated === true) return `≥ ${e.items.length}`;
  if (e.limit !== null && e.items.length >= e.limit) return `≥ ${e.items.length}`;
  return String(e.items.length);
}
