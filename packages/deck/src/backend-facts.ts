/**
 * Verified figures about the `chokepoints` backend (`srv1305127`), for the `methode` plaquette.
 *
 * These are NOT candidates in the ADR 0027 sense — they are measurements of our own infrastructure,
 * countable from the read-only mirror at `/home/deploy/ag-back` and from the pinned contract at
 * `scripts/consumer/contract/openapi.json`. Each one carries how it was counted, because the next
 * person to update this file needs to reproduce the count, not guess at it.
 *
 * MEASURED 2026-08-10 against mirror `58848a1` and contract `0.18.0` — see `MEASURED_ON`, which
 * `backend-facts.test.ts` turns into a failing test once the measurement goes stale. ADR 0073 recorded
 * that nothing signalled the ageing of these figures; that gap is what the freshness guard closes.
 *
 * One distinction the deck must never blur: the corpus is **recensé**, not **validé**. 313 objects are
 * catalogued; a P0 promotion needs sourced, human-validated evidence. Saying "313 corridors analysed"
 * would be a lie of exactly the kind the CVI limits slide promises we do not tell.
 *
 * A second distinction, added after the 2026-08-10 audit: the **instructed corpus** (313 objects, the
 * seed the engines run over) is not the **served catalogue** (2 218 objects, what the read API returns).
 * The difference is 1 905 P3 digital-infrastructure objects that carry no engine output at all. The
 * deck prints the instructed corpus, because that is the honest denominator for an analytical claim —
 * but it has to say which of the two it is counting, or the larger number looks like the one withheld.
 */

/** The date the figures below were counted. Any slide printing them is only as fresh as this. */
export const MEASURED_ON = '2026-08-10';

export const backend = {
  /** `metadata.total_count` in seed/chokepoints_seed_all.yaml, cross-checked: family counts sum to it. */
  objects: 313,
  /**
   * `GET /chokepoints?priority_class=P0` on the read API, tainted excluded — what is *served* as P0
   * today, which is what a slide saying "aujourd'hui" has to mean.
   *
   * The seed file still counts 22 (`^  priority_class: P0` at object level; the nested occurrences
   * belong to relations). The eight-object gap is a producer-side state we do not arbitrate here: the
   * API is the truth of what is served, so the API is what the deck prints. Carried to ag-back.
   */
  p0: 30,
  /** `^- source_id:` in seed/source_registry.yaml. */
  sources: 190,
  /** engines/*.py minus __init__.py and core.py. */
  engines: 15,
  /** Keys of `paths` in the pinned openapi.json. */
  endpoints: 40,
  /** Keys of `components.schemas`. */
  schemas: 51,
  /** docs/decisions/*.md in the backend repo. */
  adrs: 90,
  /** tests/test_*.py. */
  tests: 131,
  /** Alembic revisions — migrations/versions/*.py. */
  migrations: 70,
  /** Contract version served and pinned on our side. */
  contract: '0.18.0',
  /**
   * Objects the read API serves, all families, tainted excluded — `GET /chokepoints`, paginated.
   * NOT the instructed corpus: 1 905 of these are P3 digital-infrastructure objects with no engine
   * output. Kept here so the gap is stated in the same place as the number that hides it.
   */
  servedCatalogue: 2218,
} as const;

/** The corpus by family. Sums to `backend.objects` — that identity is the check on the count. */
export const corpusByFamily: { key: string; value: number }[] = [
  { key: 'port_gateway', value: 75 },
  { key: 'land_chokepoint', value: 51 },
  { key: 'maritime_chokepoint', value: 45 },
  { key: 'digital_infrastructure_chokepoint', value: 36 },
  { key: 'critical_supply_chokepoint', value: 32 },
  { key: 'energy_infrastructure_chokepoint', value: 26 },
  { key: 'infrastructure_chokepoint', value: 23 },
  { key: 'air_cargo_gateway', value: 18 },
  { key: 'strategic_system', value: 7 },
];

/** Guard: a family count edited without touching the total would otherwise pass unnoticed. */
export function corpusTotal(): number {
  return corpusByFamily.reduce((n, f) => n + f.value, 0);
}
