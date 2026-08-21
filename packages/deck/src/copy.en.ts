import type { DeckCopy } from './copy';

/**
 * English copy. A translation of intent, not of words — the FR register is deliberately sober and the
 * EN must be too. Prices are never here: they are imported from site.ts by `build-commercial.ts`.
 */
export const en: DeckCopy = {
  docTitle: 'Applied Geopolitics — Company Deck',
  docSubject:
    'Geopolitics of strategic corridors: the CVI method, HDDE, VERDICT, and the Basic / Standard / Premium tiers.',
  coverMeta: (date) => `COMPANY DECK · EN · ${date}`,

  acts: {
    ground: {
      numeral: 'I',
      title: 'What this rests on',
      lede: 'Not a consultancy restarting its research for every engagement: a corridor database we maintain, and methods that apply to it.',
    },
    offers: {
      numeral: 'II',
      title: 'Three levels of reading',
      lede: 'Inform, monitor, arbitrate. Three different commitments, each stated with its ceilings.',
    },
  },

  substrate: {
    eyebrow: 'The substrate',
    title: 'A database, not a news watch',
    labels: ['catalogued objects', 'registered sources', 'derivation engines'],
    footnote:
      'Catalogued is not validated: promotion to P0 requires sourced evidence and human validation. The method itself has its own deck.',
  },

  problem: {
    eyebrow: 'The problem',
    statement:
      'A company knows its suppliers. What it does not know is which corridors make those suppliers dependent on someone else.',
    support:
      'Declared dependency is contractual and legible. Real dependency runs through chokepoints, jurisdictions and insurers that never made it onto the risk register — a strait, a regulator, a single plant. What breaks an operation is almost always one tier further back.',
  },

  chain: {
    eyebrow: 'The doctrine',
    title: 'From corridor to decision, in seven moves',
    footnote:
      'The order is the argument: you do not jump from flows to decisions without thresholds.',
  },

  cvi: {
    eyebrow: 'CVI method',
    title: 'Measuring vulnerability, without pretending to precision',
    levels: ['Low', 'Moderate', 'High', 'Critical'],
    glosses: [
      'Credible alternatives, limited exposure.',
      'Real dependency, costly workaround.',
      'Few alternatives, thresholds close.',
      'Extreme concentration, systemic disruption.',
    ],
    footnote: (f) =>
      `Eight dimensions. Every score carries its sources, its date, its confidence level and its uncertainties. The scale states what the grid can establish, not where the base stands: as of this date, the ${f.instructedCorpus} instructed corridors spread across all four bands — ${f.levelDistribution.critique} critical, ${f.levelDistribution.eleve} high, ${f.levelDistribution.modere} moderate, ${f.levelDistribution.bas} low.`,
  },

  cviScope: {
    eyebrow: 'CVI method',
    title: 'What the CVI establishes',
    bullets: [
      'Eight dimensions, each tied to a precise question: exposure, concentration, threat, disruption capacity, resilience, cost of bypass, governance, uncertainty.',
      'The same grid applied the same way everywhere — two corridors become comparable, and one corridor becomes comparable to itself six months later.',
      'A scale that follows the tier: qualitative from low to critical, then 0–5 per dimension. The 0–100 aggregate is waiting on its methodological documentation: it is not computed, so it is not served.',
      'Every score carries its sources, its date, its confidence level and its uncertainties.',
    ],
    exclusions: [
      'No aggregate 0–100 score without published methodological documentation.',
      'Neither a prediction nor a probability of disruption — we do not produce them.',
      'No navigational or legal precision in map geometry.',
    ],
    measuredLimit: (f) =>
      `As of this date, ${f.allEightDimensions} instructed corridors out of ${f.instructedCorpus} carry all eight dimensions; ${f.twoDimensions} carry only two. The grid is applied everywhere; it is not populated everywhere.`,
    footnote:
      'The lines at the bottom matter as much as those at the top: an index that does not state its limits is not an index, it is an opinion with numbers.',
  },

  hdde: {
    eyebrow: 'HDDE',
    title: 'Surfacing a company’s hidden dependencies',
    bullets: [
      'A guided interview in eleven moves, from framing the case to a traceable synthesis.',
      'Nine diagnostic dimensions scored 0–5, from hidden dependency to decision readiness.',
      'Evidence scale 0–5: an official source rates 5; an LLM suggestion rates 1 and is not admissible.',
      'Adversarial red team before any conclusion, then a diagnostic packet, source by source.',
    ],
    footnote: 'Interview cockpit behind individual analyst accounts, FR/EN exports.',
  },

  verdict: {
    eyebrow: 'VERDICT — Premium tier',
    title: 'From diagnosis to arbitration',
    bullets: [
      'Seven moves, V·E·R·D·I·C·T, from “see the real situation” to a decision that holds.',
      'At least three mandatory options: the main one, a minimal alternative, and the opposite or doing nothing.',
      'Seven weighted criteria out of 100, a 0–5 proof scale, and a hard-veto audit.',
      'Four possible verdicts: DO, TEST, DEFER, ABANDON.',
    ],
    footnote:
      'PESTEL, SWOT and the Business Model Canvas are transformed for decision, not juxtaposed. The score is not the decision.',
  },

  coverage: {
    eyebrow: 'Coverage',
    title: 'Three corridors under study — and what “under study” means',
    body: [
      'Three founding corridors are under study: Malacca, Red Sea–Suez, Taiwan. Written and sourced, currently in human validation — not yet published. The Atlas opens one corridor at a time, never before the gates are met.',
      'Studying a corridor is not having an opinion about it: it starts with establishing what actually moves through it. These are the four opening measures for Malacca — institutional, dated, and verifiable without us.',
      'The rest of the method applies to those figures: real substitution, tipping thresholds, decision. It has its own deck.',
    ],
  },

  offersIntro: {
    eyebrow: 'Tiers',
    title: 'Three levels of reading',
    footnote: 'Basic informs. Standard monitors. Premium helps you arbitrate.',
  },

  offers: {
    basic: {
      promise: 'Inform',
      tagline: 'Understand corridors, flows and vulnerabilities.',
    },
    standard: {
      promise: 'Monitor',
      tagline: 'Track the signals, the scores and how they move.',
    },
    premium: {
      promise: 'Arbitrate',
      tagline: 'Scenarios, tipping thresholds and contextualised arbitration.',
    },
  },

  comparison: {
    eyebrow: 'Tiers',
    title: 'What each level opens',
    rows: [
      { label: 'Qualitative diagnosis, low → critical', cells: [true, true, true] },
      { label: '0–5 CVI scoring per dimension', cells: [false, true, true] },
      { label: 'Tracked signals per corridor', cells: ['—', '3 to 5', '3 to 5 + thresholds'] },
      { label: 'Thematic alerts', cells: [false, true, true] },
      { label: 'Corridor-to-corridor comparison', cells: [false, true, true] },
      { label: 'Client exposure diagnosis', cells: [false, false, true] },
      { label: 'Scenarios and tipping thresholds', cells: [false, false, true] },
      { label: 'Debrief + decision note', cells: [false, false, true] },
    ],
    footnote:
      'At launch, Basic and Standard open progressively as the Atlas and its history build up.',
  },

  pilot: {
    eyebrow: 'Premium',
    title: 'The pilot, and its stated ceilings',
    bullets: [
      'One main corridor, one optional comparison.',
      'Two to three flows examined.',
      'Three to five tracked signals.',
      'One 45–60 minute debrief, with a decision note.',
      'Six to eight weeks, as a closed pilot.',
    ],
    footnote:
      'The ceilings are stated before the engagement, not discovered during it. A scope that holds beats a scope that was promised.',
  },

  contact: {
    title: 'Start the conversation',
    lines: [
      'Applied Geopolitics publishes. Sylvain Geffroy signs. LucidAxis carries it structurally.',
      'For a Premium pilot, the framing interview comes before any proposal.',
    ],
  },
};
