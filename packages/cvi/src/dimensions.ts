/** The 8 analytical dimensions of the Corridor Vulnerability Index (CVI). */
export const cviDimensionKeys = [
  'exposition',
  'concentration',
  'menace',
  'capacite_perturbation',
  'resilience',
  'cout_contournement',
  'gouvernance',
  'incertitude',
] as const;

export type CviDimensionKey = (typeof cviDimensionKeys)[number];

/** Human-facing FR labels + the central question each dimension answers. */
export const cviDimensions: Record<CviDimensionKey, { label: string; question: string }> = {
  exposition: { label: 'Exposition', question: 'Quels flux dépendent du corridor ?' },
  concentration: { label: 'Concentration', question: 'Existe-t-il des alternatives crédibles ?' },
  menace: { label: 'Menace', question: 'Quels acteurs/événements peuvent perturber ?' },
  capacite_perturbation: {
    label: 'Capacité de perturbation',
    question: 'Ces acteurs ont-ils les moyens réels de perturber ?',
  },
  resilience: { label: 'Résilience', question: 'Combien de temps pour contourner/réparer/absorber ?' },
  cout_contournement: {
    label: 'Coût de contournement',
    question: 'Quel coût économique, logistique, assurantiel ou politique ?',
  },
  gouvernance: { label: 'Gouvernance', question: 'Qui peut sécuriser/coordonner/stabiliser ?' },
  incertitude: { label: 'Incertitude', question: 'Que ne sait-on pas, avec quel niveau de confiance ?' },
};
