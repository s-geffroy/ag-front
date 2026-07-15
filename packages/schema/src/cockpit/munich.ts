// Munich Charter (1971) operationalised for Applied Geopolitics — ADR 0037. This list defines what
// `compliance_done` MEANS: a published artifact is compliant only when all applicable controls hold.
// `mode` flags how each is verified — `machine` (enforced at build/CI by scripts/munich-check.mjs),
// `humain` (reviewer judgement, tracked on the deliverable), or `mixte`.
//
// Lives in the schema package (not the cockpit front) so the SERVER can import it too: the LLM judge
// (ADR 0068) needs the control catalogue to know which controls it may score. The front re-exports it
// from `apps/cockpit/src/lib/munich.ts`, keeping a single source of truth.
export type MunichMode = 'machine' | 'humain' | 'mixte';

export interface MunichControl {
  n: number;
  duty: string;
  control: string;
  mode: MunichMode;
  /**
   * Whether the LLM judge (ADR 0068) may emit a candidate verdict for this control from the document
   * text alone. `false` for controls a model cannot verify from the text — 6 (source secrecy),
   * 9 (independence / conflict of interest), 10 (governance / editorial pressure): those stay a pure
   * human decision, with no candidate. The judge is restricted to text-evidenced controls.
   */
  judgeable: boolean;
}

export const munichControls: MunichControl[] = [
  {
    n: 1,
    duty: 'Respecter la vérité',
    control: 'Aucune affirmation structurante sans source ; confidence présent ; données datées',
    mode: 'mixte',
    judgeable: true,
  },
  {
    n: 2,
    duty: 'Liberté d’information et de commentaire',
    control: 'Distinction explicite fait / analyse / opinion',
    mode: 'humain',
    judgeable: true,
  },
  {
    n: 3,
    duty: 'Origine connue, ne pas dénaturer',
    control: 'Provenance obligatoire (label + type, URL si dispo) ; pas de citation tronquée',
    mode: 'mixte',
    judgeable: true,
  },
  {
    n: 4,
    duty: 'Pas de méthodes déloyales',
    control: 'Sources = candidats pending validation ; pas de scraping derrière auth ni usurpation',
    mode: 'humain',
    judgeable: false,
  },
  {
    n: 5,
    duty: 'Rectifier toute inexactitude',
    control: 'Bloc errata daté présent + affordance « signaler une erreur »',
    mode: 'machine',
    judgeable: false,
  },
  {
    n: 6,
    duty: 'Secret des sources',
    control: 'Aucune source confidentielle exposée ; données restreintes → scope tainted interne',
    mode: 'humain',
    judgeable: false,
  },
  {
    n: 7,
    duty: 'Pas de confusion avec pub/propagande',
    control:
      'Séparation éditorial / offres ; pas de sponsorisé déguisé ; le paywall ne déforme pas l’analyse',
    mode: 'mixte',
    judgeable: true,
  },
  {
    n: 8,
    duty: 'Pas de plagiat/diffamation, vie privée',
    control: 'Citations attribuées ; aucune accusation non sourcée ; prudence sur acteurs nommés',
    mode: 'humain',
    judgeable: true,
  },
  {
    n: 9,
    duty: 'Pas de corruption / d’avantage',
    control: 'Conflits d’intérêts déclarés ; indépendance vs clients / pilotes Premium',
    mode: 'humain',
    judgeable: false,
  },
  {
    n: 10,
    duty: 'Refus de pression ; clause de conscience',
    control: 'Gouvernance éditoriale ; traçabilité des décisions de publication',
    mode: 'humain',
    judgeable: false,
  },
];

export const munichModeLabel: Record<MunichMode, string> = {
  machine: 'Auto (build)',
  humain: 'Revue humaine',
  mixte: 'Auto + revue',
};

/** The control numbers the LLM judge is allowed to score (text-evidenced only). */
export const judgeableMunichControls: MunichControl[] = munichControls.filter((c) => c.judgeable);
