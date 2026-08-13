import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * Astro integration: build the site search index with Pagefind. ADR 0080.
 *
 * Pagefind indexes the FINISHED `dist/`, which is the whole point: publication gating on this site
 * works by absence — a withheld document is filtered in `getStaticPaths`, so it produces no page and
 * no sitemap entry, and therefore cannot enter the index. There is no filter to replicate here, and
 * no way for a second copy of the publication rule to drift from the first.
 *
 * ORDERING IS LOAD-BEARING. This integration MUST be registered AFTER `plaquette()` in
 * `astro.config.mjs`. Astro runs same-named hooks in registration order, and `plaquette()` uses its
 * own `astro:build:done` to physically MOVE `dist/plaquette/` out of the served tree when no family
 * is published. Indexing first would put a deliberately withheld page into the search results.
 *
 * Only pages carrying `data-pagefind-body` are indexed (set on <main> by `layouts/Base.astro`), so
 * header and footer chrome never match a query and the opted-out pages never appear.
 */

/** Files Pagefind must always emit, whatever the corpus. */
const REQUIRED = ['pagefind.js', 'pagefind-entry.json'];

/**
 * Pagefind occasionally returns from `writeFiles()` with some outputs still truncated to 0 bytes —
 * observed on this site with `pagefind-entry.json`, `wasm.unknown.pagefind` and two UI bundles all
 * empty on one run out of several, the next run being fine. The failure is silent and nasty: the
 * engine still loads, so the overlay looks alive and every query dies on "Failed to load Pagefind
 * metadata". Nothing downstream would catch it — so read the index back and prove it is coherent.
 */
export function verifyIndex(outputPath) {
  for (const f of REQUIRED) {
    const p = join(outputPath, f);
    if (!existsSync(p)) return `${f} is missing`;
    if (statSync(p).size === 0) return `${f} is empty`;
  }

  let entry;
  try {
    entry = JSON.parse(readFileSync(join(outputPath, 'pagefind-entry.json'), 'utf-8'));
  } catch (err) {
    return `pagefind-entry.json is not valid JSON (${err.message})`;
  }

  const languages = Object.entries(entry.languages ?? {});
  if (!languages.length) return 'pagefind-entry.json declares no language';

  let declared = 0;
  for (const [lang, meta] of languages) {
    declared += meta.page_count ?? 0;
    // Every artefact the entry points at must exist and be non-empty, or the browser resolves a
    // valid-looking manifest onto a truncated file.
    for (const f of [`pagefind.${meta.hash}.pf_meta`, `wasm.${meta.wasm}.pagefind`]) {
      const p = join(outputPath, f);
      if (!existsSync(p)) return `${lang}: ${f} is missing`;
      if (statSync(p).size === 0) return `${lang}: ${f} is empty`;
    }
  }

  if (declared === 0) {
    return 'indexed 0 pages — every page opted out, or `data-pagefind-body` is missing from layouts/Base.astro';
  }

  const fragments = existsSync(join(outputPath, 'fragment'))
    ? readdirSync(join(outputPath, 'fragment')).length
    : 0;
  if (fragments !== declared) {
    return `fragment count (${fragments}) does not match the declared page count (${declared})`;
  }

  return null;
}

async function buildIndex(dist, outputPath) {
  // Start from a clean directory so a retry can never leave a half-written file from the previous
  // attempt behind, looking valid.
  rmSync(outputPath, { recursive: true, force: true });

  const pagefind = await import('pagefind');
  const { index, errors: createErrors } = await pagefind.createIndex();
  if (createErrors?.length) throw new Error(`createIndex failed: ${createErrors.join('; ')}`);

  const { errors: addErrors } = await index.addDirectory({ path: dist });
  if (addErrors?.length) throw new Error(`addDirectory failed: ${addErrors.join('; ')}`);

  const { errors: writeErrors } = await index.writeFiles({ outputPath });
  if (writeErrors?.length) throw new Error(`writeFiles failed: ${writeErrors.join('; ')}`);

  await pagefind.close();
}

export function search({ attempts = 3 } = {}) {
  return {
    name: 'ag:search',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const outputPath = join(dist, 'pagefind');

        // Guard the ordering invariant rather than trusting it: if the plaquette gate has not run
        // yet, a withheld page is still on disk and would be indexed.
        if (existsSync(join(dist, 'plaquette'))) {
          logger.warn(
            'dist/plaquette/ is still present — if no family is published, ag:search must be registered AFTER plaquette() in astro.config.mjs.',
          );
        }

        let problem = null;
        for (let attempt = 1; attempt <= attempts; attempt++) {
          try {
            await buildIndex(dist, outputPath);
          } catch (err) {
            throw new Error(`[ag:search] ${err.message}`);
          }

          problem = verifyIndex(outputPath);
          if (!problem) {
            const entry = JSON.parse(
              readFileSync(join(outputPath, 'pagefind-entry.json'), 'utf-8'),
            );
            const pages = Object.values(entry.languages).reduce((n, l) => n + l.page_count, 0);
            logger.info(
              `search index built — ${pages} pages indexed${attempt > 1 ? ` (attempt ${attempt})` : ''}.`,
            );
            return;
          }
          logger.warn(`incomplete index on attempt ${attempt}/${attempts}: ${problem} — retrying.`);
        }

        // Failing the build is deliberate, and matches what plaquette.mjs does with dead download
        // links: a search box that silently returns nothing must not ship.
        rmSync(outputPath, { recursive: true, force: true });
        throw new Error(
          `[ag:search] index still incomplete after ${attempts} attempts: ${problem}`,
        );
      },
    },
  };
}
