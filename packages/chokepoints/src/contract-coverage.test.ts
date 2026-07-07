import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { COVERED_PATHS } from './client';

/**
 * Phase 6 guard-rail — make the drift-check TS-aware.
 *
 * The consumer drift-check (`scripts/consumer/`) pins the producer OpenAPI and regenerates a *Python*
 * client, but the runtime client is the hand-written TS in `client.ts` — so a producer that adds (or
 * renames/removes) a path would only surface in the Python drift alert, never in these TS types. This
 * test closes that gap: every path in the pinned contract MUST have a corresponding TS client method,
 * declared in `COVERED_PATHS`. When the pin bumps to 0.4.0, any newly-pinned endpoint without a wired
 * method fails the build here, forcing the method + zod schema to be written (usage stays maximal).
 *
 * Direction is one-way: pin ⊆ COVERED_PATHS. The client may cover MORE than the pin (endpoints
 * pre-wired ahead of the producer deploy), so extras are allowed; only *uncovered pinned paths* fail.
 */

const PIN_PATH = fileURLToPath(
  new URL('../../../scripts/consumer/contract/openapi.json', import.meta.url),
);

function pinnedPaths(): string[] {
  const spec = JSON.parse(readFileSync(PIN_PATH, 'utf8')) as { paths?: Record<string, unknown> };
  return Object.keys(spec.paths ?? {}).sort();
}

describe('contract coverage (Phase 6 drift guard)', () => {
  it('every pinned contract path has a TS client method (COVERED_PATHS)', () => {
    const covered = new Set<string>(COVERED_PATHS);
    const missing = pinnedPaths().filter((p) => !covered.has(p));
    expect(missing, `pinned contract paths with no TS client method: ${missing.join(', ')}`).toEqual(
      [],
    );
  });

  it('COVERED_PATHS has no duplicates', () => {
    expect(COVERED_PATHS.length).toBe(new Set(COVERED_PATHS).size);
  });
});
