import { DEFAULT_WEIGHTS } from './scoring';
import type { CriterionKey, DecisionVerdict } from '@ag/schema/verdict';

/** FR-facing labels for the VERDICT method — single source for the public /methode-verdict page and
 * the verdict-web cockpit. Mirrors `docs/methode-verdict.md`. */

export interface Stage {
  letter: string;
  key: string;
  title: string;
  summary: string;
  guardrail: string;
}

/** The 7 temps V·E·R·D·I·C·T (in order). */
export const verdictStages: Stage[] = [
  {
    letter: 'V',
    key: 'see',
    title: 'Voir la situation réelle',
    summary: 'Énoncer la situation sans solution préférée : objet, horizon, parties prenantes.',
    guardrail: 'La situation est posée sans la réponse.',
  },
  {
    letter: 'E',
    key: 'evaluate',
    title: 'Évaluer les forces externes',
    summary: 'PESTEL décisionnel : uniquement les facteurs qui déplacent une option.',
    guardrail: 'Pas de PESTEL encyclopédique.',
  },
  {
    letter: 'R',
    key: 'reveal',
    title: 'Révéler position, contraintes et asymétries',
    summary: 'SWOT décisionnelle : capacités réelles, contraintes dures, leviers, asymétries.',
    guardrail: 'Une force sans preuve devient une hypothèse.',
  },
  {
    letter: 'D',
    key: 'define',
    title: 'Définir les options décisionnelles',
    summary: '≥3 options (principale + alternative minimale + opposée/non-action) ; Canvas de viabilité.',
    guardrail: 'Alternative minimale et opposée/non-action obligatoires.',
  },
  {
    letter: 'I',
    key: 'interrogate',
    title: 'Interroger hypothèses, preuves et biais',
    summary: 'Hypothèse critique, preuve, contradiction, niveau de preuve 0–5 ; red flags.',
    guardrail: 'Preuve et contre-argument explicités.',
  },
  {
    letter: 'C',
    key: 'compare',
    title: 'Comparer par score, risques et vetos',
    summary: '7 critères pondérés /100 → score brut + ajustements ; audit + vetos.',
    guardrail: 'Le score n’est pas la décision ; les vetos sont vérifiés.',
  },
  {
    letter: 'T',
    key: 'decide',
    title: 'Trancher, tester ou différer',
    summary: 'Verdict + seuil d’arrêt + date de revue + validation humaine.',
    guardrail: 'Condition d’arrêt obligatoire.',
  },
];

/** The 7 scoring criteria with their FR label, weight and guiding question. */
export const criterionLabels: Record<CriterionKey, { label: string; question: string; weight: number }> = {
  strategic_value: { label: 'Valeur stratégique', question: 'L’option améliore-t-elle réellement la situation ?', weight: DEFAULT_WEIGHTS.strategic_value },
  context_fit: { label: 'Adéquation au contexte', question: 'Résiste-t-elle aux forces externes ?', weight: DEFAULT_WEIGHTS.context_fit },
  real_capacity: { label: 'Capacité réelle', question: 'Avons-nous vraiment les moyens d’exécuter ?', weight: DEFAULT_WEIGHTS.real_capacity },
  systemic_viability: { label: 'Viabilité systémique', question: 'Peut-elle fonctionner comme un système réel ?', weight: DEFAULT_WEIGHTS.systemic_viability },
  net_risk: { label: 'Risque net', question: 'Le risque est-il acceptable au regard du gain ?', weight: DEFAULT_WEIGHTS.net_risk },
  proof_level: { label: 'Niveau de preuve', question: 'Repose-t-elle sur des preuves solides ?', weight: DEFAULT_WEIGHTS.proof_level },
  optionality: { label: 'Optionalité', question: 'Ouvre-t-elle plus de portes qu’elle n’en ferme ?', weight: DEFAULT_WEIGHTS.optionality },
};

/** Proof-level scale 0–5. */
export const proofLevels: { level: number; label: string }[] = [
  { level: 0, label: 'Aucune preuve (préférence)' },
  { level: 1, label: 'Intuition' },
  { level: 2, label: 'Raisonnement plausible, non vérifié' },
  { level: 3, label: 'Signaux externes, cas comparables' },
  { level: 4, label: 'Donnée directe partielle, test, mesure' },
  { level: 5, label: 'Validation directe forte (paiement, usage répété)' },
];

/** The four operational verdicts. */
export const verdictLabels: Record<DecisionVerdict, { label: string; description: string; scoreBand: string }> = {
  FAIRE: { label: 'Faire', description: 'Engager — preuve ≥4, pas de veto, validation humaine.', scoreBand: '≥ 80' },
  TESTER: { label: 'Tester', description: 'Lancer un test de vérité falsifiable qui peut tuer l’option.', scoreBand: '60–79' },
  'DIFFÉRER': { label: 'Différer', description: 'Attendre un signal de réouverture ; revoir à date fixée.', scoreBand: '40–59' },
  ABANDONNER: { label: 'Abandonner', description: 'Renoncer ; définir la disposition (archiver/transformer).', scoreBand: '0–39' },
};
