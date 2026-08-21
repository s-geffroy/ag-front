/**
 * SFIM — helpers d'affichage pour la couche de prescription (ADR 0054).
 *
 * Deux problèmes, tous deux du même genre : un écran qui affirme plus que ce que la donnée dit.
 *
 *  1. `scoredDimensionRange` remplace un compte écrit en dur. Le sous-titre annonçait « le moteur
 *     score 4 dimensions sur 10 » alors que deux unités sur sept n'en portent que 3 — le même défaut
 *     qu'un nombre de diapositives figé dans un fichier pendant six semaines. Une phrase qui cite un
 *     chiffre doit le lire.
 *  2. `sfuFieldKind` remplace des `<pre>{JSON}</pre>`. Les cinq blocs de la fiche (`routes`,
 *     `control_actors`, `value_chain`, `aggregates`, `integration`) sont déclarés `items: {}` au
 *     contrat : le producteur ne promet AUCUNE forme, ce qui interdit de plaquer un rendu par champ
 *     nommé — la forme observée aujourd'hui n'est pas une forme garantie demain. D'où une règle qui
 *     ne porte que sur la PRÉSENTATION : chaque clé de chaque ligne est affichée, sans exception ;
 *     seule la manière de la présenter dépend du type de la valeur, et tout ce qui n'entre pas dans
 *     les cas simples retombe sur son JSON. Rien n'est masqué, rien n'est interprété.
 */

/** Au-delà, une chaîne cesse d'être une étiquette et devient un paragraphe. */
const INLINE_MAX = 90;

export type SfuFieldKind =
  | { kind: 'empty' }
  | { kind: 'scalar'; text: string }
  | { kind: 'text'; text: string }
  | { kind: 'chips'; items: string[] }
  | { kind: 'json'; json: string };

/**
 * Comment présenter une valeur de bloc de fiche. Jamais SI la présenter : l'appelant affiche toutes
 * les clés qu'il reçoit, y compris celles que le producteur ajouterait sans prévenir.
 */
export function sfuFieldKind(value: unknown): SfuFieldKind {
  if (value === null || value === undefined) return { kind: 'empty' };

  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return { kind: 'empty' };
    return t.length > INLINE_MAX ? { kind: 'text', text: t } : { kind: 'scalar', text: t };
  }

  // `0` et `false` sont des valeurs, pas des absences.
  if (typeof value === 'number' || typeof value === 'boolean') {
    return { kind: 'scalar', text: String(value) };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: 'empty' };
    const scalars = value.every((v) => typeof v === 'string' || typeof v === 'number');
    if (scalars) return { kind: 'chips', items: value.map((v) => String(v)) };
    return { kind: 'json', json: JSON.stringify(value, null, 2) };
  }

  return { kind: 'json', json: JSON.stringify(value, null, 2) };
}

/**
 * L'étendue MESURÉE des dimensions scorées sur les unités chargées. `null` quand il n'y a aucune
 * unité : il n'y a alors pas d'étendue à énoncer, et une phrase sans objet vaut mieux qu'un zéro
 * présenté comme un fait.
 */
export function scoredDimensionRange(
  items: { dimensions_scored?: number | null }[],
): { min: number; max: number; label: string } | null {
  if (items.length === 0) return null;
  const counts = items.map((s) => s.dimensions_scored ?? 0);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  return { min, max, label: min === max ? String(min) : `${min} à ${max}` };
}
