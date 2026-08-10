/**
 * Translation contract for the `methode` plaquette — the long deck, for a prospect who has already
 * said yes to the idea and now wants to know what it rests on.
 *
 * Five acts: the substrate (the chokepoints backend), measuring (CVI), surfacing (HDDE), arbitrating
 * (VERDICT), and one worked walkthrough. Same discipline as `copy.ts`: figures are imported from
 * `backend-facts.ts` and method vocabulary from `@ag/cvi` / `@ag/verdict`, never retyped here.
 */

export interface Act {
  numeral: string;
  title: string;
  lede: string;
}

export interface Step {
  marker: string;
  label: string;
  note: string;
}

export interface MethodeCopy {
  docTitle: string;
  docSubject: string;
  coverTitle: string;
  coverBaseline: string;
  coverMeta: (date: string) => string;

  acts: {
    substrate: Act;
    measure: Act;
    surface: Act;
    arbitrate: Act;
    walkthrough: Act;
  };

  /** Family labels for the corpus distribution — the backend's keys are English snake_case. */
  familyLabels: Record<string, string>;

  substrate: {
    thesis: { eyebrow: string; statement: string; support: string };
    scale: { eyebrow: string; title: string; labels: string[]; notes: string[]; footnote: string };
    corpus: { eyebrow: string; title: string; unit: string; footnote: string };
    provenance: {
      eyebrow: string;
      title: string;
      body: string[];
      panelTitle: string;
      footnote: string;
    };
    engines: { eyebrow: string; title: string; bullets: string[]; footnote: string };
    live: { eyebrow: string; title: string; bullets: string[]; footnote: string };
    /** `statLabels` are the three figures' captions — endpoints / schemas / pinned contract. */
    contract: {
      eyebrow: string;
      statement: string;
      support: string;
      statLabels: [string, string, string];
    };
  };

  measure: {
    /** The eight CVI dimensions, as a sequence. Labels come from `@ag/cvi`, not from here. */
    dimensions: { eyebrow: string; title: string; footnote: string };
    scales: {
      eyebrow: string;
      title: string;
      bullets: string[];
      exclusions: string[];
      footnote: string;
    };
  };

  surface: {
    intro: { eyebrow: string; statement: string; support: string };
    interview: { eyebrow: string; title: string; steps: Step[]; footnote: string };
    /** The nine diagnostic dimensions. A sequence, not a chart: they are all scored 0–5, so there is
     *  no distribution to plot — only nine questions to read. */
    dimensions: { eyebrow: string; title: string; steps: Step[]; footnote: string };
    evidence: {
      eyebrow: string;
      title: string;
      rungs: { score: number; label: string; admissible: boolean }[];
      footnote: string;
    };
    output: { eyebrow: string; title: string; bullets: string[]; footnote: string };
  };

  arbitrate: {
    stages: { eyebrow: string; title: string; footnote: string };
    criteria: { eyebrow: string; title: string; footnote: string };
    verdicts: { eyebrow: string; title: string; steps: Step[]; footnote: string };
    vetoes: {
      eyebrow: string;
      title: string;
      bullets: string[];
      exclusions: string[];
      footnote: string;
    };
    limit: { eyebrow: string; statement: string; support: string };
  };

  walkthrough: {
    disclaimer: string;
    steps: {
      eyebrow: string;
      title: string;
      body: string[];
      panelTitle: string;
      panel: { key: string; value: string }[];
      footnote: string;
    }[];
  };

  contact: { title: string; lines: string[] };
}
