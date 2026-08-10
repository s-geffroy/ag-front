import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * Astro integration: distribute the plaquette produced by `scripts/build-deck.sh`, and enforce its
 * publication gate. ADR 0073.
 *
 * Two jobs, both at `astro:build:done`:
 *
 *  1. COPY the .pdf/.pptx from `presentations/commercial/<lang>/` into the built page's directory.
 *     They are NOT duplicated into `apps/public/public/`: two copies of a versioned binary in one repo
 *     is a guaranteed drift, and `presentations/` is the source of record.
 *
 *  2. GATE. When the manifest says `published: false`, the whole `dist/plaquette/` directory is moved
 *     out of the served tree into `.plaquette-preview/`. Astro has already written the page by this
 *     point, so hiding it means physically removing it — anything left in `dist/` is public, and the
 *     cockpit still needs the exact same bytes to review.
 *
 * Failing loudly is deliberate: a /plaquette page whose download links 404 is worse than a red build.
 */

const REPO_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const FAMILY = 'commercial';
const SRC_DIR = join(REPO_ROOT, 'presentations', FAMILY);
const PREVIEW_DIR = fileURLToPath(new URL('../.plaquette-preview', import.meta.url));

export function plaquette() {
  return {
    name: 'ag:plaquette',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const distRoot = fileURLToPath(dir);
        const pageDir = join(distRoot, 'plaquette');
        const manifestFile = join(SRC_DIR, 'manifest.json');

        if (!existsSync(manifestFile)) {
          throw new Error(
            `[ag:plaquette] ${manifestFile} is missing — run scripts/build-deck.sh before building the site.`,
          );
        }
        const manifest = JSON.parse(readFileSync(manifestFile, 'utf-8'));

        // The page renders download links straight from the manifest, so every file it names must
        // exist. Checking here rather than trusting the generator covers the case that actually
        // happens: a --pptx-only run, which leaves the PDFs stale or absent.
        const wanted = Object.entries(manifest.languages ?? {}).flatMap(([lang, l]) =>
          [l.pdf, l.pptx].map((file) => ({ lang, file })),
        );
        const missing = wanted.filter(({ lang, file }) => !existsSync(join(SRC_DIR, lang, file)));
        if (missing.length > 0) {
          throw new Error(
            `[ag:plaquette] the manifest names files that do not exist: ${missing
              .map((m) => `${m.lang}/${m.file}`)
              .join(', ')} — re-run scripts/build-deck.sh (without --pptx-only).`,
          );
        }

        mkdirSync(pageDir, { recursive: true });
        for (const { lang, file } of wanted) {
          copyFileSync(join(SRC_DIR, lang, file), join(pageDir, file));
        }

        if (manifest.published === true) {
          rmSync(PREVIEW_DIR, { recursive: true, force: true });
          logger.info(`published: ${wanted.length} files → dist/plaquette/`);
          return;
        }

        // Not published: pull the page out of the served tree, but keep it byte-identical for the
        // cockpit reviewer. What they validate has to be what would ship, not an approximation.
        rmSync(PREVIEW_DIR, { recursive: true, force: true });
        mkdirSync(join(PREVIEW_DIR, '..'), { recursive: true });
        renameSync(pageDir, PREVIEW_DIR);
        logger.warn(
          'manifest.published is false → /plaquette withheld from dist and parked in ' +
            'apps/public/.plaquette-preview for cockpit review.',
        );
      },
    },
  };
}
