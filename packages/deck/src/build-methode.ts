/**
 * Assemble the `methode` plaquette — the long deck, for a prospect who wants to know what the offer
 * rests on rather than what it costs.
 *
 * Same rule as `build-commercial.ts`: nothing that exists elsewhere in the monorepo is retyped here.
 * The CVI dimensions come from `@ag/cvi`, the VERDICT stages and weighted criteria from `@ag/verdict`,
 * and the backend figures from `backend-facts.ts` with their counting method recorded. That is what
 * makes the deck trustworthy to regenerate: nobody has to remember to update it in two places.
 */

import { cviDimensionKeys, cviDimensions } from '@ag/cvi';
import { criterionLabels, verdictLabels, verdictStages } from '@ag/verdict';
import { site } from '../../../apps/public/src/lib/site';
import { backend, corpusByFamily } from './backend-facts';
import { cviFacts } from './cvi-facts';
import type { Deck, Lang, Slide } from './model';
import type { MethodeCopy } from './methode-copy';
import { methodeEn } from './methode-copy.en';
import { methodeFr } from './methode-copy.fr';

const COPY: Record<Lang, MethodeCopy> = { fr: methodeFr, en: methodeEn };

export function buildMethodeDeck(lang: Lang, date: string): Deck {
  const c = COPY[lang];

  const slides: Slide[] = [
    {
      kind: 'cover',
      title: c.coverTitle,
      baseline: c.coverBaseline,
      meta: c.coverMeta(date),
    },

    // ── Act I — the substrate ────────────────────────────────────────────────────────────────────
    { kind: 'section-break', ...c.acts.substrate },
    {
      kind: 'statement',
      eyebrow: c.substrate.thesis.eyebrow,
      statement: c.substrate.thesis.statement,
      support: c.substrate.thesis.support,
    },
    {
      kind: 'stat-row',
      eyebrow: c.substrate.scale.eyebrow,
      title: c.substrate.scale.title,
      stats: [backend.objects, backend.sources, backend.engines].map((value, i) => ({
        value: String(value),
        label: c.substrate.scale.labels[i]!,
        note: c.substrate.scale.notes[i]!,
      })),
      footnote: c.substrate.scale.footnote(backend),
    },
    {
      kind: 'distribution',
      eyebrow: c.substrate.corpus.eyebrow,
      title: c.substrate.corpus.title,
      unit: c.substrate.corpus.unit,
      bars: corpusByFamily.map((f) => ({
        label: c.familyLabels[f.key] ?? f.key,
        value: f.value,
      })),
      footnote: c.substrate.corpus.footnote,
    },
    {
      kind: 'split',
      eyebrow: c.substrate.provenance.eyebrow,
      title: c.substrate.provenance.title,
      body: c.substrate.provenance.body,
      panelTitle: c.substrate.provenance.panelTitle,
      // The panel used to read ADR / Migrations / Tests / Sources, with English captions in both
      // languages. The unit-test count is gone — it evidenced nothing in the body, and a deck that
      // counts its own unit tests is proving developer hygiene to a reader who asked about analytical
      // discipline. What is left maps line for line onto a claim the body actually makes, plus the
      // pinned contract, folded in from the slide that used to follow this one.
      panel: [
        String(backend.sources),
        String(backend.engines),
        String(backend.adrs),
        String(backend.migrations),
        backend.contract,
      ].map((value, i) => ({ key: c.substrate.provenance.panelLabels[i]!, value })),
      footnote: c.substrate.provenance.footnote,
    },
    {
      kind: 'bullets',
      eyebrow: c.substrate.engines.eyebrow,
      title: c.substrate.engines.title,
      bullets: c.substrate.engines.bullets,
      footnote: c.substrate.engines.footnote,
    },
    {
      kind: 'bullets',
      eyebrow: c.substrate.live.eyebrow,
      title: c.substrate.live.title,
      bullets: c.substrate.live.bullets,
      footnote: c.substrate.live.footnote,
    },
    // A stat-row on the read contract used to close Act I: "40 endpoints · 51 schemas · 0.18.0 pinned".
    // It was the deck's most inward-looking slide — endpoint counts are an engineering property, and a
    // B2B geopolitics buyer does not buy one. Its single client-relevant idea (a contract break is
    // caught at compile time, not in production) folded into the provenance footnote above, and the
    // slot went to the fourth walkthrough slide, where the method finally reaches a decision.

    // ── Act II — measure ─────────────────────────────────────────────────────────────────────────
    // No CVI ramp here: the commercial deck already carries the gauge. This act goes one level down,
    // to the eight questions behind it, and repeating the ramp would just cost a slide.
    { kind: 'section-break', ...c.acts.measure },
    {
      kind: 'sequence',
      eyebrow: c.measure.dimensions.eyebrow,
      title: c.measure.dimensions.title,
      columns: 4,
      steps: cviDimensionKeys.map((k, i) => ({
        marker: String(i + 1).padStart(2, '0'),
        label: cviDimensions[k].label,
        note: cviDimensions[k].question,
      })),
      footnote: c.measure.dimensions.footnote,
    },
    {
      kind: 'bullets',
      eyebrow: c.measure.scales.eyebrow,
      title: c.measure.scales.title,
      bullets: c.measure.scales.bullets,
      // The measured state of the base rides with the things we refuse to claim, because that is what
      // it is: a limit on what the scale currently resolves to, stated where the scale is sold.
      exclusions: [...c.measure.scales.exclusions, c.measure.scales.measuredLimit(cviFacts)],
      footnote: c.measure.scales.footnote,
    },

    // ── Act III — surface (HDDE) ─────────────────────────────────────────────────────────────────
    { kind: 'section-break', ...c.acts.surface },
    {
      kind: 'statement',
      eyebrow: c.surface.intro.eyebrow,
      statement: c.surface.intro.statement,
      support: c.surface.intro.support,
    },
    {
      kind: 'sequence',
      eyebrow: c.surface.interview.eyebrow,
      title: c.surface.interview.title,
      columns: 4,
      steps: c.surface.interview.steps,
      footnote: c.surface.interview.footnote,
    },
    {
      kind: 'sequence',
      eyebrow: c.surface.dimensions.eyebrow,
      title: c.surface.dimensions.title,
      columns: 3,
      steps: c.surface.dimensions.steps,
      footnote: c.surface.dimensions.footnote,
    },
    {
      kind: 'ladder',
      eyebrow: c.surface.evidence.eyebrow,
      title: c.surface.evidence.title,
      rungs: c.surface.evidence.rungs,
      footnote: c.surface.evidence.footnote,
    },
    {
      kind: 'bullets',
      eyebrow: c.surface.output.eyebrow,
      title: c.surface.output.title,
      bullets: c.surface.output.bullets,
      footnote: c.surface.output.footnote,
    },

    // ── Act IV — arbitrate (VERDICT) ─────────────────────────────────────────────────────────────
    { kind: 'section-break', ...c.acts.arbitrate },
    {
      kind: 'sequence',
      eyebrow: c.arbitrate.stages.eyebrow,
      title: c.arbitrate.stages.title,
      columns: 4,
      steps: verdictStages.map((s) => ({
        marker: s.letter,
        label: s.title,
        note: s.guardrail,
      })),
      footnote: c.arbitrate.stages.footnote,
    },
    {
      kind: 'weighted-bars',
      eyebrow: c.arbitrate.criteria.eyebrow,
      title: c.arbitrate.criteria.title,
      items: Object.values(criterionLabels).map((k) => ({
        label: k.label,
        weight: k.weight,
        question: k.question,
      })),
      footnote: c.arbitrate.criteria.footnote,
    },
    {
      kind: 'sequence',
      eyebrow: c.arbitrate.verdicts.eyebrow,
      title: c.arbitrate.verdicts.title,
      columns: 2,
      // The band comes from the engine, the name and gloss from the copy. Retyping the band here is
      // exactly what shipped `65–79 / 50–64 / < 50` into a PDF while the engine said `60–79 / 40–59
      // / 0–39`; `method-coupling.test.ts` now fails if this ever stops importing.
      steps: (Object.keys(verdictLabels) as (keyof typeof verdictLabels)[]).map((v) => ({
        marker: verdictLabels[v].scoreBand,
        label: c.arbitrate.verdicts.entries[v].label,
        note: c.arbitrate.verdicts.entries[v].note,
      })),
      footnote: c.arbitrate.verdicts.footnote,
    },
    {
      kind: 'bullets',
      eyebrow: c.arbitrate.vetoes.eyebrow,
      title: c.arbitrate.vetoes.title,
      bullets: c.arbitrate.vetoes.bullets,
      exclusions: c.arbitrate.vetoes.exclusions,
      footnote: c.arbitrate.vetoes.footnote || undefined,
    },
    {
      kind: 'statement',
      eyebrow: c.arbitrate.limit.eyebrow,
      statement: c.arbitrate.limit.statement,
      support: c.arbitrate.limit.support,
    },

    // ── Act V — walk it through ──────────────────────────────────────────────────────────────────
    { kind: 'section-break', ...c.acts.walkthrough },
    ...c.walkthrough.steps.map(
      (step, i): Slide => ({
        kind: 'split',
        eyebrow: step.eyebrow,
        title: step.title,
        body: step.body,
        panelTitle: step.panelTitle,
        // The last step ends on the arbitration's outcome, and the outcome row is built from the
        // engine — band and name both — so the walkthrough cannot display a verdict VERDICT would not
        // produce. This is the only place the two methods visibly chain: a threshold crossed in Act V
        // enters the protocol laid out in Act IV and comes out as a bounded test, not as a commitment.
        panel:
          i === c.walkthrough.steps.length - 1
            ? [
                ...step.panel,
                {
                  key: c.walkthrough.outcomeLabel,
                  value: `${verdictLabels.TESTER.scoreBand} · ${c.arbitrate.verdicts.entries.TESTER.label}`,
                },
              ]
            : step.panel,
        // The disclaimer rides on EVERY walkthrough slide, not once at the top of the act: slides get
        // screenshotted and forwarded individually, and a caveat that only exists on slide 26 is not
        // a caveat.
        footnote: `${c.walkthrough.disclaimer} ${step.footnote}`,
      }),
    ),

    {
      kind: 'contact',
      title: c.contact.title,
      lines: c.contact.lines,
      links: [
        { label: site.email, href: `mailto:${site.email}` },
        { label: site.url.replace(/^https:\/\//, ''), href: site.url },
      ],
    },
  ];

  return { lang, family: 'methode', title: c.docTitle, subject: c.docSubject, slides };
}
