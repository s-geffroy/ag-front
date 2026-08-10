/**
 * Verified figures about the `chokepoints` backend (`srv1305127`), for the `methode` plaquette.
 *
 * These are NOT candidates in the ADR 0027 sense — they are measurements of our own infrastructure,
 * countable from the read-only mirror at `/home/deploy/ag-back` and from the pinned contract at
 * `scripts/consumer/contract/openapi.json`. Each one carries how it was counted, because the next
 * person to update this file needs to reproduce the count, not guess at it.
 *
 * MEASURED 2026-08-10 against mirror `dda1f4c` and contract `0.18.0`.
 *
 * One distinction the deck must never blur: the corpus is **recensé**, not **validé**. 313 objects are
 * catalogued; a P0 promotion needs sourced, human-validated evidence. Saying "313 corridors analysed"
 * would be a lie of exactly the kind the CVI limits slide promises we do not tell.
 */

export const backend = {
  /** `metadata.total_count` in seed/chokepoints_seed_all.yaml, cross-checked: family counts sum to it. */
  objects: 313,
  /** `^  priority_class: P0` at object level (the nested occurrences belong to relations, not objects). */
  p0: 22,
  /** `^- source_id:` in seed/source_registry.yaml. */
  sources: 190,
  /** engines/*.py minus __init__.py and core.py. */
  engines: 15,
  /** Keys of `paths` in the pinned openapi.json. */
  endpoints: 40,
  /** Keys of `components.schemas`. */
  schemas: 51,
  /** docs/decisions/*.md in the backend repo. */
  adrs: 87,
  /** tests/test_*.py. */
  tests: 123,
  /** Alembic revisions. */
  migrations: 66,
  /** Contract version served and pinned on our side. */
  contract: '0.18.0',
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
