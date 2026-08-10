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
import { criterionLabels, verdictStages } from '@ag/verdict';
import { site } from '../../../apps/public/src/lib/site';
import { backend, corpusByFamily } from './backend-facts';
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
      footnote: c.substrate.scale.footnote,
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
      panel: [
        { key: 'ADR', value: String(backend.adrs) },
        { key: 'Migrations', value: String(backend.migrations) },
        { key: 'Tests', value: String(backend.tests) },
        { key: 'Sources', value: String(backend.sources) },
      ],
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
    {
      kind: 'stat-row',
      eyebrow: c.substrate.contract.eyebrow,
      title: c.substrate.contract.statement,
      stats: [String(backend.endpoints), String(backend.schemas), backend.contract].map(
        (value, i) => ({ value, label: c.substrate.contract.statLabels[i]! }),
      ),
      footnote: c.substrate.contract.support,
    },

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
      exclusions: c.measure.scales.exclusions,
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
      steps: c.arbitrate.verdicts.steps,
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
      (step): Slide => ({
        kind: 'split',
        eyebrow: step.eyebrow,
        title: step.title,
        body: step.body,
        panelTitle: step.panelTitle,
        panel: step.panel,
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
