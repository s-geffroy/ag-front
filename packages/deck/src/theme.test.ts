import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { cviRamp, palette } from './theme';

/**
 * Anti-drift guard, in the spirit of `packages/chokepoints/src/contract-coverage.test.ts` (ADR 0066):
 * the deck must not be allowed to quietly keep an old palette after the site changes its own.
 *
 * `packages/tokens/src/index.ts` is exactly what happens without a guard like this — it still declares
 * `#1f4e79` and Source Serif 4, long after global.css moved on. A plaquette is a client-facing artifact;
 * shipping one in last season's colours is worse than a red build.
 */

const GLOBAL_CSS = fileURLToPath(
  new URL('../../../apps/public/src/styles/global.css', import.meta.url),
);

/**
 * Read one `--var: R G B;` triplet from the light-mode `:root` block and return it as pptx hex.
 * Anchored on the braces, not on the bare selector names: the file's header comment mentions both
 * `:root` and `.dark` in prose, so a looser search slices the wrong region (or an empty one).
 */
function readLightVar(css: string, name: string): string {
  const start = css.indexOf(':root {');
  const end = css.indexOf('.dark {', start);
  if (start === -1 || end === -1) throw new Error('cannot locate the :root / .dark blocks');
  const root = css.slice(start, end);
  const m = new RegExp(`--${name}:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)\\s*;`).exec(root);
  if (!m) throw new Error(`--${name} not found in the :root block of global.css`);
  return m
    .slice(1, 4)
    .map((n) => Number(n).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

describe('deck theme tracks the site palette', () => {
  const css = readFileSync(GLOBAL_CSS, 'utf-8');

  it.each(Object.keys(palette) as (keyof typeof palette)[])(
    'palette.%s matches global.css',
    (key) => {
      expect(palette[key]).toBe(readLightVar(css, key));
    },
  );

  it('the CVI ramp matches --cvi-1..4, in order', () => {
    expect([...cviRamp]).toEqual([1, 2, 3, 4].map((i) => readLightVar(css, `cvi-${i}`)));
  });

  it('reads the LIGHT values, not the dark ones', () => {
    // Cheap self-check on the parser: --accent differs between modes, so a slice bug would show here.
    expect(readLightVar(css, 'accent')).not.toBe('EA5C5E');
  });
});
