/**
 * Le niveau CVI d'un corridor tient-il à une dimension dérivée d'une ABSENCE ?
 *
 * POURQUOI CE FICHIER EXISTE. ag-back a concédé (leur `0027`, 2026-08-12) que `concentration` n'est
 * pas une mesure : quand aucune alternative de contournement n'est modélisée, le moteur retombe sur
 * le compte brut des relations de contournement — zéro relation → crédit 0 → difficulté 5. Trois
 * cent cinq objets sur 313 sont notés sur cette absence, et la dimension sera SUPPRIMÉE.
 *
 * Contrefactuel qu'ils ont mesuré sur les 313 : 108 restent `critique`, 134 passent `eleve`,
 * 66 `modere`, 5 `bas`. Autrement dit, deux objets sur trois vont changer de niveau.
 *
 * Ce module répond à la question par corridor, avec les données déjà chargées par le panneau : le
 * niveau affiché survivra-t-il au retrait ? C'est le chiffre agrégé rendu utile là où quelqu'un
 * décide, plutôt que dans un tableau que personne n'ouvre (ADR 0077).
 *
 * CORRECTION D'UNE ERREUR À NOUS. Notre handoff `0026` affirmait que `incertitude` entrait dans la
 * contrainte liante. C'est faux : elle en est exclue depuis leur ADR 0055, et ils nous l'ont
 * signalé. Le calcul ci-dessous l'exclut, comme le leur.
 */

/** Exclue du maximum : elle qualifie la mesure, elle ne la constitue pas (ag-back ADR 0055). */
export const NON_SUBSTANTIVE = new Set(['incertitude']);

/** Dérivée d'une absence quand aucune alternative n'est modélisée — vouée au retrait. */
export const INFERRED_DIMENSION = 'concentration';

export interface CviBinding {
  /** Le score maximal parmi les dimensions substantielles, celui qui décide du niveau. */
  max: number | null;
  /** Le niveau tient-il UNIQUEMENT à la dimension inférée ? */
  boundByInferred: boolean;
  /** Le maximum une fois la dimension inférée retirée — ce que le niveau deviendra. */
  maxWithoutInferred: number | null;
}

export function cviBinding(
  dimensions: Record<string, { score?: number | null }> | null | undefined,
): CviBinding {
  const entries = Object.entries(dimensions ?? {}).filter(
    ([k, d]) => !NON_SUBSTANTIVE.has(k) && typeof d?.score === 'number',
  ) as [string, { score: number }][];
  if (entries.length === 0) return { max: null, boundByInferred: false, maxWithoutInferred: null };

  const max = Math.max(...entries.map(([, d]) => d.score));
  const without = entries.filter(([k]) => k !== INFERRED_DIMENSION);
  const maxWithoutInferred =
    without.length > 0 ? Math.max(...without.map(([, d]) => d.score)) : null;
  const inferred = entries.find(([k]) => k === INFERRED_DIMENSION);
  // « Liée » veut dire : la retirer FAIT BAISSER le maximum. Une dimension inférée qui plafonne à
  // égalité avec une vraie mesure ne décide de rien — la retirer ne changerait pas le niveau.
  const boundByInferred =
    !!inferred &&
    inferred[1].score === max &&
    maxWithoutInferred !== null &&
    maxWithoutInferred < max;
  return { max, boundByInferred, maxWithoutInferred };
}

/** `0–1 → bas`, `2 → modere`, `3 → eleve`, `4–5 → critique` (bandes servies par l'amont). */
export function levelForScore(score: number | null): string | null {
  if (score === null) return null;
  if (score <= 1) return 'bas';
  if (score === 2) return 'modere';
  if (score === 3) return 'eleve';
  return 'critique';
}
