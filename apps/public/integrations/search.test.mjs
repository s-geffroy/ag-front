import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { verifyIndex } from './search.mjs';

/**
 * These cases reproduce a real partial write: Pagefind returned from `writeFiles()` leaving
 * `pagefind-entry.json` at 0 bytes, which the browser resolves into "Failed to load Pagefind
 * metadata" on every query while the overlay still looks alive. The guard only earns its place if
 * it actually fires, hence this fixture.
 */
let dir;

/** Write a coherent index: entry, the artefacts it points at, and one fragment per declared page. */
function writeIndex(out, { pages = 2, entry, truncate = [] } = {}) {
  mkdirSync(join(out, 'fragment'), { recursive: true });
  writeFileSync(join(out, 'pagefind.js'), 'export const search = () => {};');
  writeFileSync(join(out, 'pagefind.fr_abc123.pf_meta'), 'meta');
  writeFileSync(join(out, 'wasm.fr.pagefind'), 'wasm');
  for (let i = 0; i < pages; i++) writeFileSync(join(out, 'fragment', `fr_${i}.pf_fragment`), 'x');
  writeFileSync(
    join(out, 'pagefind-entry.json'),
    JSON.stringify(
      entry ?? {
        version: '1.5.2',
        languages: { fr: { hash: 'fr_abc123', wasm: 'fr', page_count: pages } },
      },
    ),
  );
  for (const f of truncate) writeFileSync(join(out, f), '');
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'ag-search-'));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('verifyIndex', () => {
  it('accepts a coherent index', () => {
    writeIndex(dir);
    expect(verifyIndex(dir)).toBeNull();
  });

  it('rejects the observed failure: a truncated entry file', () => {
    writeIndex(dir, { truncate: ['pagefind-entry.json'] });
    expect(verifyIndex(dir)).toMatch(/pagefind-entry\.json is empty/);
  });

  it('rejects a truncated wasm or metadata artefact the entry points at', () => {
    writeIndex(dir, { truncate: ['wasm.fr.pagefind'] });
    expect(verifyIndex(dir)).toMatch(/wasm\.fr\.pagefind is empty/);

    const other = mkdtempSync(join(tmpdir(), 'ag-search-'));
    writeIndex(other, { truncate: ['pagefind.fr_abc123.pf_meta'] });
    expect(verifyIndex(other)).toMatch(/pf_meta is empty/);
    rmSync(other, { recursive: true, force: true });
  });

  it('rejects a missing index directory outright', () => {
    expect(verifyIndex(join(dir, 'nope'))).toMatch(/pagefind\.js is missing/);
  });

  it('rejects unparseable JSON', () => {
    writeIndex(dir);
    writeFileSync(join(dir, 'pagefind-entry.json'), '{not json');
    expect(verifyIndex(dir)).toMatch(/not valid JSON/);
  });

  it('rejects an index that declares no page — the every-page-opted-out case', () => {
    writeIndex(dir, {
      pages: 0,
      entry: {
        version: '1.5.2',
        languages: { fr: { hash: 'fr_abc123', wasm: 'fr', page_count: 0 } },
      },
    });
    expect(verifyIndex(dir)).toMatch(/indexed 0 pages/);
  });

  it('rejects an entry declaring no language at all', () => {
    writeIndex(dir);
    writeFileSync(
      join(dir, 'pagefind-entry.json'),
      JSON.stringify({ version: '1.5.2', languages: {} }),
    );
    expect(verifyIndex(dir)).toMatch(/declares no language/);
  });

  it('rejects a fragment count that disagrees with the declared page count', () => {
    // The silent-shrink case: pages dropped out of the index but the manifest still claims them.
    writeIndex(dir, { pages: 5 });
    writeFileSync(
      join(dir, 'pagefind-entry.json'),
      JSON.stringify({
        version: '1.5.2',
        languages: { fr: { hash: 'fr_abc123', wasm: 'fr', page_count: 9 } },
      }),
    );
    expect(verifyIndex(dir)).toMatch(/fragment count \(5\).*page count \(9\)/);
  });
});
