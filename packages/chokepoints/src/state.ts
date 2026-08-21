/**
 * Lire `/chokepoints/{id}/state` sans en faire ce qu'il refuse d'être.
 *
 * POURQUOI CE MODULE EXISTE. Leur `0037` nous adresse une demande précise : « les trois pourcentages
 * ne se séparent pas », et « `/state` ne se trie pas ». Ce sont deux interdits faciles à respecter le
 * jour où on écrit l'écran, et faciles à perdre six mois plus tard, quand quelqu'un aura besoin d'un
 * chiffre unique pour une tuile ou d'une clef pour un tableau triable. Le seul endroit où l'interdit
 * tient est celui qui rend l'infraction malcommode : une lecture qui fabrique la phrase entière, et
 * aucune fonction de comparaison exportée d'ici.
 *
 * Ce que nous avons déjà payé pour l'apprendre : `pressure_score` triait `/atlas` alors qu'il
 * mesurait le volume de NOTRE collecte, pas la pression du monde. Retiré le jour même (`bd5633c`).
 * `/state` porte le même avertissement, dans son propre champ `comparability`, sur chaque réponse.
 */

import type { ChokepointState, StateComponent } from './schema';

export interface StateReading {
  /** Part des six composantes observées ET courantes. À LIRE EN PREMIER : c'est elle qui dit
   *  combien de terrain il y a sous les deux autres. */
  coveragePct: number;
  /** Moyenne sur les composantes QUI ONT une donnée — `null` quand aucune n'en a. Jamais un zéro. */
  tensionPct: number | null;
  /** La confiance des moteurs, divisée par deux là où la ligne est périmée. */
  confidencePct: number | null;
  /**
   * Les trois ensemble, en une chaîne. C'est le seul rendu que ce module offre : il n'y a pas de
   * `tensionLabel()`, et c'est le but. Un consommateur qui veut la tension seule doit aller la
   * chercher dans `tensionPct` et assumer de l'avoir découplée.
   */
  label: string;
  /** Vrai quand AUCUNE composante n'est observée. « Nous ne savons rien de cet objet », et non
   *  « tout va bien » — la distinction que la règle 1 de leur ADR 0108 protège. */
  knowsNothing: boolean;
  /** Les composantes servies en `stale` : une ligne qu'un moteur n'a pas recalculée à sa dernière
   *  passe. Elles restent au dénominateur, elles ne sont simplement pas courantes. */
  staleComponents: string[];
  /** Les composantes sans rien derrière. Hors du dénominateur de la tension, jamais un zéro. */
  missingComponents: string[];
  /** L'avertissement de comparabilité, tel qu'il arrive. À rendre avec les chiffres. */
  comparability: string;
}

function pct(n: number | null | undefined): string {
  return n === null || n === undefined ? '—' : `${n.toFixed(1).replace('.', ',')} %`;
}

function keysWithStatus(components: Record<string, StateComponent>, status: string): string[] {
  return Object.entries(components)
    .filter(([, c]) => c.status === status)
    .map(([k]) => k)
    .sort();
}

/**
 * La lecture complète d'un état, ou rien. Il n'existe pas de variante « juste la tension ».
 */
export function stateReading(s: ChokepointState): StateReading {
  const components = s.components ?? {};
  const missingComponents = keysWithStatus(components, 'no_data');
  const staleComponents = keysWithStatus(components, 'stale');
  const observed = Object.values(components).filter((c) => c.status === 'observed').length;
  const tensionPct = s.tension_pct ?? null;
  const confidencePct = s.confidence_pct ?? null;

  // L'ordre n'est pas cosmétique : la couverture ouvre la phrase parce qu'elle conditionne la
  // lecture des deux autres. `tension 75 %` seul est un piège ; précédé de `couverture 17 %` il
  // devient une information sur un objet dont on ne sait presque rien.
  const label =
    `couverture ${pct(s.coverage_pct)} · tension ${pct(tensionPct)} · ` +
    `confiance ${pct(confidencePct)}`;

  return {
    coveragePct: s.coverage_pct,
    tensionPct,
    confidencePct,
    label,
    knowsNothing: observed === 0 && staleComponents.length === 0,
    staleComponents,
    missingComponents,
    comparability: s.comparability,
  };
}
