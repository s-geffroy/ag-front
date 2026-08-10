import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * Astro integration: distribute the plaquettes produced by `scripts/build-deck.sh`, and enforce their
 * publication gate. ADR 0073.
 *
 * Two jobs, both at `astro:build:done`:
 *
 *  1. COPY each PUBLISHED family's .pdf/.pptx from `presentations/<family>/<lang>/` into the built
 *     page's directory. They are NOT duplicated into `apps/public/public/`: two copies of a versioned
 *     binary in one repo is a guaranteed drift, and `presentations/` is the source of record.
 *
 *  2. GATE, per family. A family whose manifest says `published: false` contributes nothing. When NO
 *     family is published, the whole `dist/plaquette/` directory is moved out of the served tree into
 *     `.plaquette-preview/` — Astro has already written the page by this point, so hiding it means
 *     physically removing it. Anything left in `dist/` is public, and the cockpit still needs the
 *     exact same bytes to review.
 *
 * Failing loudly is deliberate: a /plaquette page whose download links 404 is worse than a red build.
 */

const REPO_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const SRC_ROOT = join(REPO_ROOT, 'presentations');
const PREVIEW_DIR = fileURLToPath(new URL('../.plaquette-preview', import.meta.url));

function readManifests() {
  if (!existsSync(SRC_ROOT)) return [];
  return readdirSync(SRC_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(SRC_ROOT, d.name, 'manifest.json')))
    .map((d) => ({
      dir: join(SRC_ROOT, d.name),
      manifest: JSON.parse(readFileSync(join(SRC_ROOT, d.name, 'manifest.json'), 'utf-8')),
    }));
}

export function plaquette() {
  return {
    name: 'ag:plaquette',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const pageDir = join(fileURLToPath(dir), 'plaquette');
        const families = readManifests();

        if (families.length === 0) {
          throw new Error(
            '[ag:plaquette] no presentations/<family>/manifest.json found — run scripts/build-deck.sh before building the site.',
          );
        }

        const published = families.filter((f) => f.manifest.published === true);

        // MUST match the rule in src/pages/plaquette.astro: the page lists the cleared families, or
        // all of them when none is cleared (that build is withheld for review, and a review page with
        // dead download links is worthless). Copying a different set than the page renders is how the
        // withheld preview ended up with an index.html and no binaries.
        const rendered = published.length > 0 ? published : families;

        // Every file the page will link to must exist. Checking here rather than trusting the
        // generator covers the case that actually happens: a --pptx-only run, which leaves the PDFs
        // stale or absent.
        const wanted = rendered.flatMap((f) =>
          Object.entries(f.manifest.languages ?? {}).flatMap(([lang, l]) =>
            [l.pdf, l.pptx].map((file) => ({ family: f.manifest.family, dir: f.dir, lang, file })),
          ),
        );
        const missing = wanted.filter((w) => !existsSync(join(w.dir, w.lang, w.file)));
        if (missing.length > 0) {
          throw new Error(
            `[ag:plaquette] manifests name files that do not exist: ${missing
              .map((m) => `${m.family}/${m.lang}/${m.file}`)
              .join(', ')} — re-run scripts/build-deck.sh (without --pptx-only).`,
          );
        }

        mkdirSync(pageDir, { recursive: true });
        for (const w of wanted) copyFileSync(join(w.dir, w.lang, w.file), join(pageDir, w.file));

        if (published.length > 0) {
          rmSync(PREVIEW_DIR, { recursive: true, force: true });
          logger.info(
            `published: ${published.map((f) => f.manifest.family).join(', ')} — ${wanted.length} files → dist/plaquette/`,
          );
          return;
        }

        // Nothing published: pull the page out of the served tree, but keep it byte-identical for the
        // cockpit reviewer. What they validate has to be what would ship, not an approximation.
        rmSync(PREVIEW_DIR, { recursive: true, force: true });
        renameSync(pageDir, PREVIEW_DIR);
        logger.warn(
          'no family is published → /plaquette withheld from dist and parked in ' +
            'apps/public/.plaquette-preview for cockpit review.',
        );
      },
    },
  };
}
