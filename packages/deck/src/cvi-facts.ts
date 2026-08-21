/**
 * What the CVI actually covers today — measured, not asserted.
 *
 * CE QUE LA MESURE DU 2026-08-21 CHANGE, ET IL FAUT LE LIRE AVANT LES CHIFFRES. Au 2026-08-10, la
 * base ne discriminait pas : les 313 corridors instruits étaient **tous** en bande `critique`, et le
 * texte de la plaquette le disait — « la grille discrimine en droit, la base ne discrimine pas encore
 * en fait ». **Ce n'est plus vrai.** Le CVI a été rejoué le 2026-08-12 (leur message `0028`) et les
 * quatre bandes sont désormais occupées : 127 `critique`, 137 `élevé`, 65 `modéré`, 5 `bas`.
 *
 * Ce n'est pas un progrès à annoncer tel quel, et c'est le point que la copie doit tenir. La
 * discrimination est apparue quand la dimension `concentration` a été **retirée** des objets qui ne
 * portent pas d'étude de substitution : elle couvrait 313 objets sur 313, elle en couvre **15 sur
 * 334**. Autrement dit la base distingue mieux parce qu'elle affirme moins. Les deux faits vont
 * ensemble ou aucun des deux n'est honnête.
 *
 * Conséquence sur la couverture : **275 corridors sur 334 (82 %) ne portent que DEUX dimensions**,
 * `exposition` et `incertitude`. Le « voir OÙ se situe la vulnérabilité » repose donc sur deux axes
 * pour la grande majorité du corpus — un de moins qu'au relevé précédent.
 *
 * MEASURED 2026-08-21 against the read API (contract `4.0.0`), `read` scope, `include_tainted=false`.
 * Method: paginate `GET /chokepoints` (limit 500) for the full catalogue (2 239), drop the 1 905 P3
 * digital-infrastructure objects — which carry no engine output — to obtain the instructed corpus
 * (334), then `GET /chokepoints/{id}/cvi-assessment` object by object. No sampling: all 334 queried.
 *
 * `backend-facts.test.ts` fails when this measurement goes stale, and asserts it agrees with
 * `backend-facts.ts` on the corpus sizes.
 */

/** The date the figures below were counted. Any slide printing them is only as fresh as this. */
export const CVI_MEASURED_ON = '2026-08-21';

export const cviCoverage = {
  /** Objects the read API serves, all families — the same count as `backend.servedCatalogue`. */
  servedCatalogue: 2239,
  /** The served catalogue minus the 1 905 P3 digital objects with no engine output. */
  instructedCorpus: 334,
  /** Instructed objects returning a CVI assessment with a `global_level`. 334 of 334. */
  assessed: 334,
  /** Instructed objects carrying all eight dimensions. */
  allEightDimensions: 5,
  /** Instructed objects carrying three. */
  threeDimensions: 43,
  /**
   * Instructed objects carrying only TWO — `exposition` et `incertitude`. C'est désormais le cas
   * dominant, et c'est le chiffre que la plaquette doit imprimer : 82 % du corpus.
   */
  twoDimensions: 275,
  /** Objects carrying `resilience` — and it is a reroute-time proxy, never repair or absorption time. */
  resilience: 6,
  /** Distinct `global_level` values observed across the instructed corpus. Four — c'était UN. */
  distinctLevels: 4,
  /** La distribution, parce qu'un décompte de bandes occupées ne dit pas comment elles se remplissent. */
  levelDistribution: { critique: 127, eleve: 137, modere: 65, bas: 5 },
  /** La bande la plus peuplée. Stated as data — elle n'est plus la seule, et ce n'est plus `critique`. */
  dominantLevel: 'eleve',
} as const;

/**
 * The figures as the copy files receive them: the measurement plus the date it was taken, because a
 * coverage claim without its date is the same failure as a score without its sources.
 *
 * Copy functions take this object. They are never handed a literal — that is the discipline the
 * VERDICT score bands broke.
 */
export type CviFacts = typeof cviCoverage & { measuredOn: string };
export const cviFacts: CviFacts = { ...cviCoverage, measuredOn: CVI_MEASURED_ON };

/**
 * The dimensions actually served, most-covered first, out of `cviCoverage.instructedCorpus`.
 * Counted from the same pass: one increment per dimension key present on an assessment.
 *
 * `concentration` est passée de 313/313 à 15/334 : seuls les objets portant une étude de substitution
 * la gardent. C'est la ligne à lire en premier — elle explique la discrimination retrouvée.
 */
export const cviDimensionCoverage: { key: string; value: number }[] = [
  { key: 'exposition', value: 334 },
  { key: 'incertitude', value: 334 },
  { key: 'menace', value: 53 },
  { key: 'concentration', value: 15 },
  { key: 'cout_contournement', value: 15 },
  { key: 'capacite_perturbation', value: 8 },
  { key: 'gouvernance', value: 8 },
  { key: 'resilience', value: 6 },
];
