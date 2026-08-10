/**
 * CLI: model → .pptx, plus the manifest the cockpit and the public page both read.
 *
 * Invoked by `scripts/build-deck.sh`, which then drives the `slides` container for validation,
 * PDF conversion and QA. Running this alone gives you a .pptx and nothing else — that is intentional:
 * the PDF is the artifact of record and it must come from the converter, never from a second renderer.
 *
 * The output path is DERIVED from --deck and --lang, never passed in. `presentations/<deck>/<lang>/`
 * is a repo convention, not a per-invocation choice.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCommercialDeck } from '../src/build-commercial';
import { deckSitePaths } from '../src/model';
import { unpublishablePaths } from '../src/publication';
import { renderDeckToPptx } from '../src/render-pptx';
import type { Lang } from '../src/model';

const REPO_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const PRESENTATIONS = join(REPO_ROOT, 'presentations');

const BUILDERS = { commercial: buildCommercialDeck } as const;
type Family = keyof typeof BUILDERS;

interface Args {
  family: Family;
  langs: Lang[];
  date: string;
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };

  const family = (get('--deck') ?? 'commercial') as Family;
  if (!(family in BUILDERS)) {
    throw new Error(`unknown deck family '${family}' — known: ${Object.keys(BUILDERS).join(', ')}`);
  }

  const langArg = get('--lang') ?? 'all';
  const langs: Lang[] =
    langArg === 'all' ? ['fr', 'en'] : langArg === 'fr' || langArg === 'en' ? [langArg] : [];
  if (langs.length === 0) throw new Error(`--lang must be fr, en or all (got '${langArg}')`);

  const date = get('--date') ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw new Error(`--date must be YYYY-MM-DD (got '${date}')`);

  return { family, langs, date };
}

/**
 * Carry the publication flag across a rebuild. Defaults to `false` when the manifest is absent or
 * unreadable — an unreadable manifest must never be read as "this was approved for the open internet".
 */
function readPublishedFlag(manifestPath: string): boolean {
  if (!existsSync(manifestPath)) return false;
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf-8')).published === true;
  } catch {
    console.warn(`[deck] manifest unreadable, treating the deck as unpublished: ${manifestPath}`);
    return false;
  }
}

async function main(): Promise<void> {
  const { family, langs, date } = parseArgs(process.argv.slice(2));
  const outDir = join(PRESENTATIONS, family);

  const built: { lang: Lang; slides: number; file: string }[] = [];

  for (const lang of langs) {
    const deck = BUILDERS[family](lang, date);

    // Fail here, not in CI: the .pptx must never exist with a dead promise in it, because a file that
    // exists gets sent. The same rule is enforced as a unit test (publication.test.ts) — this is the
    // belt for the day someone runs the generator without running the suite.
    const offending = unpublishablePaths(deckSitePaths(deck));
    if (offending.length > 0) {
      throw new Error(
        `refusing to build: the ${lang} deck links to unpublished content — ${offending.join(', ')}`,
      );
    }

    const file = join(outDir, lang, `${family}.${lang}.pptx`);
    mkdirSync(dirname(file), { recursive: true });
    await renderDeckToPptx(deck, file, date);
    built.push({ lang, slides: deck.slides.length, file });
    console.log(`[deck] ${lang}: ${deck.slides.length} slides → ${file}`);
  }

  // The manifest is the ONLY source of the date shown on the public page and in the cockpit. Never a
  // file mtime: mtimes are not versioned, so they say nothing about the artifact that was reviewed.
  //
  // `published` is preserved across rebuilds when it already exists — regenerating a deck must not
  // silently put it online, nor silently take it down. Flipping it is a cockpit act (ADR 0069).
  const manifestPath = join(outDir, 'manifest.json');
  const published = readPublishedFlag(manifestPath);

  const manifest = {
    family,
    updated: date,
    published,
    languages: Object.fromEntries(
      built.map((b) => [
        b.lang,
        { slides: b.slides, pptx: `${family}.${b.lang}.pptx`, pdf: `${family}.${b.lang}.pdf` },
      ]),
    ),
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
  console.log(`[deck] manifest → ${manifestPath} (published: ${published})`);
}

main().catch((err: unknown) => {
  console.error(`[deck] ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
