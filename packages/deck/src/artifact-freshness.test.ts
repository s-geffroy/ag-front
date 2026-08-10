import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verdictLabels } from '@ag/verdict';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

/**
 * The artifact-freshness guard — the one every other test in this package is blind to.
 *
 * Everything else here asserts over the slide MODEL: it proves the generator would produce the right
 * document. It says nothing about the `.pptx` and `.pdf` actually sitting in `presentations/`, which
 * are what a prospect receives. ADR 0073 recorded both halves of that gap as unautomated:
 *
 *   « Toute révision tarifaire sur /offres impose de régénérer `commercial` — rien ne l'automatise. »
 *   « Les mesures de backend-facts.ts […] vieillissent. Rien ne le signale non plus. »
 *
 * So: read the shipped artifact, and require that the canonical values appear in it. When this fails,
 * the fix is `scripts/build-deck.sh --date <date>` — not an edit here.
 *
 * FR only. It is the primary language and it is regenerated in the same run as EN, so a stale EN
 * without a stale FR is not a state the build can reach.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const PRESENTATIONS = resolve(HERE, '../../../presentations');

/** All text in a .pptx, concatenated. Enough to assert a value is present; not a layout check. */
async function pptxText(path: string): Promise<string> {
  const zip = await JSZip.loadAsync(readFileSync(path));
  const slides = Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n));
  expect(slides.length, `no slides found in ${path}`).toBeGreaterThan(0);
  const xml = await Promise.all(slides.map((n) => zip.files[n]!.async('string')));
  // `<a:t>` runs carry the visible text; strip everything else so attribute values cannot match.
  return xml
    .flatMap((x) => x.match(/<a:t>[^<]*<\/a:t>/g) ?? [])
    .join(' ')
    .replace(/<\/?a:t>/g, '');
}

describe('the shipped artifacts carry the current canonical values', () => {
  it('commercial.fr.pptx prints the prices from apps/public/src/lib/site.ts', async () => {
    const { offers } = await import('../../../apps/public/src/lib/site');
    const text = await pptxText(`${PRESENTATIONS}/commercial/fr/commercial.fr.pptx`);
    for (const offer of offers) {
      expect(text, `price "${offer.price}" is missing — regenerate commercial`).toContain(
        offer.price,
      );
    }
  });

  it('methode.fr.pptx prints the score bands from @ag/verdict', async () => {
    const text = await pptxText(`${PRESENTATIONS}/methode/fr/methode.fr.pptx`);
    for (const v of Object.values(verdictLabels)) {
      expect(text, `score band "${v.scoreBand}" is missing — regenerate methode`).toContain(
        v.scoreBand,
      );
    }
  });

  it('the manifests agree with the decks the generator now produces', async () => {
    const { buildCommercialDeck } = await import('./build-commercial');
    const { buildMethodeDeck } = await import('./build-methode');
    const built = {
      commercial: buildCommercialDeck('fr', '2026-08-10').slides.length,
      methode: buildMethodeDeck('fr', '2026-08-10').slides.length,
    };
    for (const [family, slides] of Object.entries(built)) {
      const manifest = JSON.parse(
        readFileSync(`${PRESENTATIONS}/${family}/manifest.json`, 'utf8'),
      ) as { languages: Record<string, { slides: number }> };
      for (const [lang, entry] of Object.entries(manifest.languages)) {
        expect(entry.slides, `${family}/${lang} slide count is stale — regenerate`).toBe(slides);
      }
    }
  });
});
