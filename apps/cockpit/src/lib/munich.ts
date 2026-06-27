// Munich Charter (1971) operationalised for Applied Geopolitics — ADR 0037. This list defines what
// `compliance_done` MEANS: a published artifact is compliant only when all applicable controls hold.
// `mode` flags how each is verified — `machine` (enforced at build/CI by scripts/munich-check.mjs),
// `humain` (reviewer judgement, tracked here), or `mixte`.
export type MunichMode = 'machine' | 'humain' | 'mixte';

export interface MunichControl {
  n: number;
  duty: string;
  control: string;
  mode: MunichMode;
}

export const munichControls: MunichControl[] = [
  {
    n: 1,
    duty: 'Respecter la vérité',
    control: 'Aucune affirmation structurante sans source ; confidence présent ; données datées',
    mode: 'mixte',
  },
  {
    n: 2,
    duty: 'Liberté d’information et de commentaire',
    control: 'Distinction explicite fait / analyse / opinion',
    mode: 'humain',
  },
  {
    n: 3,
    duty: 'Origine connue, ne pas dénaturer',
    control: 'Provenance obligatoire (label + type, URL si dispo) ; pas de citation tronquée',
    mode: 'mixte',
  },
  {
    n: 4,
    duty: 'Pas de méthodes déloyales',
    control: 'Sources = candidats pending validation ; pas de scraping derrière auth ni usurpation',
    mode: 'humain',
  },
  {
    n: 5,
    duty: 'Rectifier toute inexactitude',
    control: 'Bloc errata daté présent + affordance « signaler une erreur »',
    mode: 'machine',
  },
  {
    n: 6,
    duty: 'Secret des sources',
    control: 'Aucune source confidentielle exposée ; données restreintes → scope tainted interne',
    mode: 'humain',
  },
  {
    n: 7,
    duty: 'Pas de confusion avec pub/propagande',
    control:
      'Séparation éditorial / offres ; pas de sponsorisé déguisé ; le paywall ne déforme pas l’analyse',
    mode: 'mixte',
  },
  {
    n: 8,
    duty: 'Pas de plagiat/diffamation, vie privée',
    control: 'Citations attribuées ; aucune accusation non sourcée ; prudence sur acteurs nommés',
    mode: 'humain',
  },
  {
    n: 9,
    duty: 'Pas de corruption / d’avantage',
    control: 'Conflits d’intérêts déclarés ; indépendance vs clients / pilotes Premium',
    mode: 'humain',
  },
  {
    n: 10,
    duty: 'Refus de pression ; clause de conscience',
    control: 'Gouvernance éditoriale ; traçabilité des décisions de publication',
    mode: 'humain',
  },
];

export const munichModeLabel: Record<MunichMode, string> = {
  machine: 'Auto (build)',
  humain: 'Revue humaine',
  mixte: 'Auto + revue',
};
