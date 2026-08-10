/**
 * Translation contract for the `methode` plaquette — the long deck, for a prospect who has already
 * said yes to the idea and now wants to know what it rests on.
 *
 * Five acts: the substrate (the chokepoints backend), measuring (CVI), surfacing (HDDE), arbitrating
 * (VERDICT), and one worked walkthrough. Same discipline as `copy.ts`: figures are imported from
 * `backend-facts.ts` and method vocabulary from `@ag/cvi` / `@ag/verdict`, never retyped here.
 */

import type { verdictLabels } from '@ag/verdict';
import type { backend } from './backend-facts';
import type { CviFacts } from './cvi-facts';

/** The engine's own verdict keys, derived so the copy contract cannot name a verdict it does not have. */
type VerdictKey = keyof typeof verdictLabels;

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
    scale: {
      eyebrow: string;
      title: string;
      labels: string[];
      notes: string[];
      /** Takes the backend figures: the P0 count and the served/instructed gap are both measured. */
      footnote: (f: typeof backend) => string;
    };
    corpus: { eyebrow: string; title: string; unit: string; footnote: string };
    provenance: {
      eyebrow: string;
      title: string;
      body: string[];
      panelTitle: string;
      /**
       * Captions for the five panel figures, in order: sources, engines, written decisions, versioned
       * migrations, pinned contract. The unit-test count used to sit here and was dropped: it evidences
       * nothing the body claims, and a client-facing deck that counts its own unit tests is proving
       * developer hygiene where it was asked for analytical discipline.
       */
      panelLabels: [string, string, string, string, string];
      footnote: string;
    };
    engines: { eyebrow: string; title: string; bullets: string[]; footnote: string };
    live: { eyebrow: string; title: string; bullets: string[]; footnote: string };
  };

  measure: {
    /** The eight CVI dimensions, as a sequence. Labels come from `@ag/cvi`, not from here. */
    dimensions: { eyebrow: string; title: string; footnote: string };
    scales: {
      eyebrow: string;
      title: string;
      bullets: string[];
      exclusions: string[];
      /**
       * The measured state of the served base, rendered as the last exclusion. This is the slide that
       * sells the scale tier by tier, so it is the slide that owes the reader what the scale currently
       * resolves to — every instructed corridor in one band, three dimensions out of eight for most
       * of the corpus. Built from `cvi-facts.ts`; never a literal.
       */
      measuredLimit: (f: CviFacts) => string;
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
    /**
     * The four outcomes. `entries` is keyed by the engine's own verdict keys and carries ONLY what
     * translation owns — the localised name and gloss. The score band is deliberately absent: it
     * comes from `verdictLabels[].scoreBand` in `build-methode.ts`, because the one time it lived
     * here it drifted from the engine and shipped wrong bands in the PDF.
     */
    verdicts: {
      eyebrow: string;
      title: string;
      entries: Record<VerdictKey, { label: string; note: string }>;
      footnote: string;
    };
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
    /**
     * Caption for the outcome row appended to the last step's panel. The value itself is NOT here:
     * `build-methode.ts` builds it from `verdictLabels`, so the walkthrough cannot show a band the
     * engine would not produce.
     */
    outcomeLabel: string;
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
