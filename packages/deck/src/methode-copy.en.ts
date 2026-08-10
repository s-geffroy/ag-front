import type { MethodeCopy } from './methode-copy';

/** EN copy for the long `methode` plaquette. Same register as FR: sober, and specific about limits. */
export const methodeEn: MethodeCopy = {
  docTitle: 'Applied Geopolitics — Method',
  docSubject:
    'The chokepoints data substrate, the CVI method, the HDDE diagnosis and the VERDICT arbitration protocol.',
  coverTitle: 'What this rests on',
  coverBaseline:
    'An instrumented corridor database, three methods that chain into one another, and what they refuse to claim.',
  coverMeta: (date) => `METHOD · EN · ${date}`,

  acts: {
    substrate: {
      numeral: 'I',
      title: 'The substrate',
      lede: 'Before the method, the database. What we have catalogued, where it comes from, and what we derive from it.',
    },
    measure: {
      numeral: 'II',
      title: 'Measure',
      lede: 'CVI: eight dimensions to qualify a corridor’s vulnerability, and one hard rule about scores.',
    },
    surface: {
      numeral: 'III',
      title: 'Surface',
      lede: 'HDDE: a guided interview that works back from the declared supplier to the node that actually binds.',
    },
    arbitrate: {
      numeral: 'IV',
      title: 'Arbitrate',
      lede: 'VERDICT: seven moves, seven weighted criteria, four outcomes — and a mandatory stop condition.',
    },
    walkthrough: {
      numeral: 'V',
      title: 'Walk it through',
      lede: 'The method applied to Malacca, on public sources. An illustration, not a published diagnosis.',
    },
  },

  familyLabels: {
    port_gateway: 'Port gateways',
    land_chokepoint: 'Land crossings',
    maritime_chokepoint: 'Straits and canals',
    digital_infrastructure_chokepoint: 'Digital infrastructure',
    critical_supply_chokepoint: 'Critical supply',
    energy_infrastructure_chokepoint: 'Energy infrastructure',
    infrastructure_chokepoint: 'Other infrastructure',
    air_cargo_gateway: 'Air-cargo gateways',
    strategic_system: 'Strategic systems',
  },

  substrate: {
    thesis: {
      eyebrow: 'The substrate',
      statement:
        'We do not write notes off the back of the news. We query a corridor database that we maintain.',
      support:
        'Every analysis starts from catalogued, sourced, versioned objects — not from research restarted for each engagement. That is what makes it possible to compare two corridors, to track a change, and to answer tomorrow the question that was asked today.',
    },
    scale: {
      eyebrow: 'The substrate',
      title: 'The order of magnitude',
      labels: ['catalogued objects', 'registered sources', 'derivation engines'],
      notes: [
        'Straits, canals, ports, land crossings, cables, energy and digital infrastructure.',
        'Each carries its reliability level and its licence regime: use, extraction, storage.',
        'CVI, control, corroboration, resilience, network, weaponizability, event pressure, exposed trade loss…',
      ],
      footnote:
        'Catalogued is not validated: promoting an object to P0 requires sourced evidence and human validation. 22 objects are there today.',
    },
    corpus: {
      eyebrow: 'The substrate',
      title: 'What “corridor” actually covers',
      unit: 'objects',
      footnote:
        'A corridor is not a shipping lane. Three quarters of the corpus are not straits — they are ports, land crossings, cables and energy installations.',
    },
    provenance: {
      eyebrow: 'The substrate',
      title: 'Provenance is a constraint, not an appendix',
      body: [
        'Every source enters the registry with its reliability level and its licence regime. A source whose licence forbids extraction is quarantined by the loader: it never enters the database, and it cannot turn up in a deliverable by accident.',
        'Canonical and derived are separated all the way down into database privileges: the analytics engines run under a role that is read-only on canonical data. An analysis cannot, structurally, rewrite the fact it started from.',
        'The corpus is not frozen: every schema change is a versioned migration, and every architectural decision is written down before it is applied.',
      ],
      panelTitle: 'Discipline',
      footnote:
        'This is not rigour on display: it is what makes a claim refutable six months later.',
    },
    engines: {
      eyebrow: 'The substrate',
      title: 'What the database computes on its own',
      bullets: [
        'Control and weaponizability: who holds a node, and how far that power can be instrumentalised.',
        'Corroboration: how many independent sources support a claim, and which ones contradict it.',
        'Resilience and network: what falls second if the first node gives way, and along which path.',
        'Exposed trade loss: the order of magnitude of the flow actually at stake, not the corridor’s total volume.',
        'Event pressure: the gap between observed activity and its own baseline.',
      ],
      footnote:
        'Derived outputs are candidates: they inform judgement, they do not replace it, and they never modify the canonical record.',
    },
    live: {
      eyebrow: 'The substrate',
      title: 'What moves, and how we let it in',
      bullets: [
        'Per-corridor press aggregation, with media attention spike detection.',
        'Raw GDELT feed for worldwide event coverage.',
        'Prediction-market consensus, attached to a corridor by an LLM judge, then floored at two markets minimum.',
        'A robots.txt gate on all collection: what a publisher refuses, we do not take.',
      ],
      footnote:
        'The cardinality floor is recent and it costs: it removed the consensus block from Panama, our most visible corridor. A signal backed by a single market is not a consensus, however convenient.',
    },
    contract: {
      eyebrow: 'The substrate',
      statement:
        'The read interface is a versioned contract, pinned on the consumer side, and guarded by a test that breaks the build.',
      support:
        'A contract break is not discovered in production: it is caught at build time, on both sides, before anything is served.',
      statLabels: ['endpoints', 'schemas', 'pinned contract'],
    },
  },

  measure: {
    dimensions: {
      eyebrow: 'CVI method',
      title: 'Eight dimensions, and the question each one asks',
      footnote:
        'The CVI does not compress those eight questions into a single number until the weighting is documented and published.',
    },
    scales: {
      eyebrow: 'CVI method',
      title: 'The scale follows the tier; the hard rule does not move',
      bullets: [
        'Public and Basic: qualitative diagnosis, low → critical.',
        'Standard: 0–5 score per dimension, plus a qualitative overall level.',
        'Premium: aggregate 0–100 score, only where the methodology is documented.',
        'Every score carries its sources, its date, its confidence level and its uncertainties.',
      ],
      exclusions: [
        'No aggregate 0–100 score without published methodological documentation.',
        'No probability of disruption: we do not produce them.',
        'No navigational or legal precision in map geometry.',
      ],
      footnote:
        'An index that does not state its limits is not an index. It is an opinion with numbers.',
    },
  },

  surface: {
    intro: {
      eyebrow: 'HDDE',
      statement: 'The supplier a company declares is almost always the wrong object of analysis.',
      support:
        'HDDE starts from the visible actor and works back: what the dependency actually is, which flow is at stake, who can block it, and how fast a rupture reaches the client. The interview is guided because hidden dependency is never volunteered — it is inferred.',
    },
    interview: {
      eyebrow: 'HDDE',
      title: 'The interview, in eleven moves',
      steps: [
        {
          marker: '01',
          label: 'Framing the case',
          note: 'Scope, starting visible actor, decision question.',
        },
        {
          marker: '02',
          label: 'Critical visible actor',
          note: 'The declared supplier, body or point of passage.',
        },
        {
          marker: '03',
          label: 'Nature of the dependency',
          note: 'Contractual, technical, financial, regulatory?',
        },
        {
          marker: '04',
          label: 'Critical flow',
          note: 'The physical, informational or financial flow actually at stake.',
        },
        {
          marker: '05',
          label: 'Real substitution',
          note: 'Is there a credible alternative, at what cost, in what time?',
        },
        {
          marker: '06',
          label: 'Hidden dependencies',
          note: 'Second-tier suppliers, jurisdictions, invisible nodes.',
        },
        {
          marker: '07',
          label: 'Control and disruption',
          note: 'Gatekeepers, regulators, insurers, disruptive actors.',
        },
        {
          marker: '08',
          label: 'Impact timing',
          note: 'How fast a rupture propagates to the client.',
        },
        {
          marker: '09',
          label: 'Decision thresholds',
          note: 'The levels at which to prepare, act or escalate.',
        },
        {
          marker: '10',
          label: 'Red team',
          note: 'Adversarial testing of the diagnosis before any conclusion.',
        },
        {
          marker: '11',
          label: 'Synthesis',
          note: 'A traceable diagnostic packet, source by source.',
        },
      ],
      footnote:
        'Eleven moves, not a questionnaire: each block conditions the relevance of the next, and the red team always precedes the conclusion.',
    },
    dimensions: {
      eyebrow: 'HDDE',
      title: 'Nine diagnostic dimensions, scored 0–5',
      steps: [
        {
          marker: '01',
          label: 'Dependency on the visible actor',
          note: 'How far does the company depend on the declared actor?',
        },
        {
          marker: '02',
          label: 'Hidden dependency',
          note: 'What exposure runs through nodes not visible upstream?',
        },
        {
          marker: '03',
          label: 'Substitution weakness',
          note: 'Is replacement credible, fast, sustainable?',
        },
        {
          marker: '04',
          label: 'Jurisdictional exposure',
          note: 'Which jurisdictions can constrain or block the flow?',
        },
        {
          marker: '05',
          label: 'Flow criticality',
          note: 'Does a rupture put the business itself at stake?',
        },
        {
          marker: '06',
          label: 'Time pressure',
          note: 'How long before the impact reaches the client?',
        },
        {
          marker: '07',
          label: 'Gatekeeper pressure',
          note: 'What control or disruption power do intermediaries hold?',
        },
        {
          marker: '08',
          label: 'Evidence quality',
          note: 'Does the diagnosis rest on reliable, validated evidence?',
        },
        {
          marker: '09',
          label: 'Decision readiness',
          note: 'Is the company ready to decide on this exposure?',
        },
      ],
      footnote:
        'The eighth dimension scores how solid the other seven are: a diagnosis can be alarming and poorly evidenced, and that has to be visible.',
    },
    evidence: {
      eyebrow: 'HDDE',
      title: 'The evidence scale, and what it refuses',
      rungs: [
        { score: 5, label: 'Official source', admissible: true },
        { score: 4, label: 'Contract', admissible: true },
        { score: 4, label: 'Logistics data', admissible: true },
        { score: 4, label: 'Insurance clause', admissible: true },
        { score: 3, label: 'Supplier document', admissible: true },
        { score: 3, label: 'Analyst note', admissible: true },
        { score: 2, label: 'Client statement', admissible: true },
        { score: 2, label: 'Monitoring signal', admissible: true },
        { score: 1, label: 'LLM suggestion — not admissible', admissible: false },
      ],
      footnote:
        'The model proposes and challenges; it attests to nothing. An LLM suggestion is never admissible as evidence, however confident it sounds.',
    },
    output: {
      eyebrow: 'HDDE',
      title: 'What comes out of the interview',
      bullets: [
        'A versioned diagnostic packet, carrying the hash of the method pack that produced it.',
        'A dependency and control matrix: who holds what, and through which lever.',
        'A light action layer: what is feasible now, at what cost, to what effect.',
        'A diff between two versions: what changed since the last interview, and why.',
        'FR and EN exports, plus the canonical JSON packet.',
      ],
      footnote:
        'The packet is dated and replayable. Six months on, you can say what was known, when, and on what evidence.',
    },
  },

  arbitrate: {
    stages: {
      eyebrow: 'VERDICT',
      title: 'Seven moves, and the guardrail on each',
      footnote:
        'The order binds: you do not compare options before defining them, and you do not define them before stating the situation without its answer.',
    },
    criteria: {
      eyebrow: 'VERDICT',
      title: 'Seven criteria, weighted out of one hundred',
      footnote:
        'The weighting is shown before the assessment, not tuned after it. A weight discovered at the end is a result dressed up as a method.',
    },
    verdicts: {
      eyebrow: 'VERDICT',
      title: 'Four outcomes, and the score band that leads there',
      steps: [
        { marker: '≥ 80', label: 'DO', note: 'Commit. Evidence ≥ 4, no veto, human validation.' },
        {
          marker: '65–79',
          label: 'TEST',
          note: 'Run a falsifiable, bounded test, with its stop condition.',
        },
        {
          marker: '50–64',
          label: 'DEFER',
          note: 'Evidence is missing or the context is not ready. Set the review date.',
        },
        {
          marker: '< 50',
          label: 'ABANDON',
          note: 'The option does not hold. Write it down, so it is not revived in six months.',
        },
      ],
      footnote:
        'Defer and abandon are decisions, not failures of the method. A protocol that can only output “do” is worthless.',
    },
    vetoes: {
      eyebrow: 'VERDICT',
      title: 'What overrides the score',
      bullets: [
        'Hard vetoes, audited separately: a high score does not survive a regulatory, financial or capacity impossibility.',
        'Explicit, bounded adjustments, applied as reasoned penalties, never as rounding.',
        'At least three options, including a minimal alternative and the opposite or doing nothing.',
        'A mandatory stop condition: how you will know the decision was wrong, and on what date you look.',
      ],
      exclusions: [
        'No option is selected on score alone.',
        'No conclusion is issued without an adversarial red-team pass.',
        'No decision is taken by the model: validation is human and nominative.',
      ],
      footnote: '',
    },
    limit: {
      eyebrow: 'VERDICT',
      statement:
        'The score is not the decision. It is what the decision will have to justify itself against.',
      support:
        'VERDICT does not produce an automatic arbitration: it produces a reasoned one, with its assumptions, its evidence, its contradictions and its review date. Responsibility stays whole, and that is the point.',
    },
  },

  walkthrough: {
    disclaimer:
      'Method illustration on public sources — this is not a published diagnosis. The corresponding Atlas entry is still in human validation.',
    steps: [
      {
        eyebrow: 'Walk it through · 1/3',
        title: 'The corridor, and what actually moves through it',
        body: [
          'Malacca is not a route, it is a narrowing. The binding passage is the Phillips Channel, a few kilometres off Singapore — and that is where everything that follows concentrates.',
          'The first task is not to estimate a risk, it is to establish what passes. Crude volume, the share bound for a single importer, transit counts, the adjacent hub’s container throughput: four institutional measures, all sourced, none derived.',
          'Without this step, everything after it would be an opinion about a geography.',
        ],
        panelTitle: 'Measured, sourced',
        panel: [
          { key: 'Crude in transit', value: '23.2 Mb/d' },
          { key: 'Share imported by China', value: '48%' },
          { key: 'Transits (Malacca + Singapore)', value: '94,301 / yr' },
          { key: 'Hub container throughput', value: '41.1 M TEU' },
        ],
        footnote:
          'Sources: US EIA, World Oil Transit Chokepoints (H1 2025); MPA Singapore, Annual Report 2024.',
      },
      {
        eyebrow: 'Walk it through · 2/3',
        title: 'Where the dependency hides — and what nobody documents',
        body: [
          'The naive question is “can ships go elsewhere?”. The answer is yes: Lombok is deep and permissive, it takes vessels Malacca turns away. The constraint is therefore not draught.',
          'The constraint is the fleet. A detour of 300 to 1,000 nautical miles cuts annual rotations and ties up more vessels: rerouting hits systemic absorption, not geography. The only quantified alternative, the China–Myanmar pipeline, covers roughly 2% of the strait’s throughput.',
          'And the most useful result of the analysis is an absence: no public source quantifies residual absorption capacity. We write that down.',
        ],
        panelTitle: 'Substitution, examined',
        panel: [
          { key: 'Lombok depth', value: '≈ 1,000 m' },
          { key: 'Route extension', value: '+1 to +4 days' },
          { key: 'China–Myanmar pipeline', value: '≈ 400 kb/d' },
          { key: 'Share of throughput covered', value: '≈ 2%' },
          { key: 'Residual capacity', value: 'undocumented' },
        ],
        footnote:
          'Sources: Reuters (2017) and Global Energy Monitor for pipeline capacity; the route extension is a model, not official data.',
      },
      {
        eyebrow: 'Walk it through · 3/3',
        title: 'The threshold, and the decision it triggers',
        body: [
          'A diagnosis that does not say what to watch tomorrow morning has served no purpose. Each threshold ties an observable indicator to a regime shift and to the action it implies.',
          'They are explicitly graded: backed by verified sources, partial, or hypothetical marker. A hypothetical threshold is still useful — provided it does not pass itself off as a measurement.',
          'Crossings matter less than co-occurrence: a volume drop alongside rising incidents signals a durable shift, where either signal alone stays cyclical.',
        ],
        panelTitle: 'Decision markers',
        panel: [
          { key: 'Crude flow decline', value: '> 15%' },
          { key: 'Transit decline (4 wks)', value: '> 20%' },
          { key: 'Sustained SOMS incidents', value: '≥ 1 / wk × 3' },
          { key: 'Continuous physical blockage', value: '> 72 h' },
          { key: 'SOMS incidents 2025', value: '108 (+74%)' },
        ],
        footnote:
          'Source: ReCAAP ISC, Annual Report 2025. Thresholds are decision markers — an analysis, never a measurement.',
      },
    ],
  },

  contact: {
    title: 'Going further',
    lines: [
      'The full method, corridor by corridor, is run inside a closed six-to-eight-week Premium pilot.',
      'The framing interview precedes any proposal — it exists as much to qualify the request as to decline it if it is not ours to take.',
    ],
  },
};
