import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { plaquette } from './integrations/plaquette.mjs';
import { search } from './integrations/search.mjs';
import { anchors } from './integrations/anchors.mjs';

// Plaquette publication gate (ADR 0073), read at config time because @astrojs/sitemap needs it before
// the build starts. The integration itself re-reads the manifest and is the authority; this only keeps
// an unpublished /plaquette out of the sitemap.
const presentationsDir = fileURLToPath(new URL('../../presentations', import.meta.url));
const plaquettePublished =
  existsSync(presentationsDir) &&
  readdirSync(presentationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(presentationsDir, d.name, 'manifest.json'))
    .filter((f) => existsSync(f))
    .some((f) => JSON.parse(readFileSync(f, 'utf-8')).published === true);

// Workspace packages ship raw TS source; alias them so Astro/Vite transforms them as first-party.
const pkg = (p) => fileURLToPath(new URL(`../../packages/${p}`, import.meta.url));

export default defineConfig({
  site: 'https://www.applied-geopolitics.com',
  trailingSlash: 'ignore',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({
      filter: (url) => plaquettePublished || !/\/plaquette\/?$/.test(url),
    }),
    plaquette(),
    // MUST stay after plaquette(): that integration moves an unpublished dist/plaquette/ out of the
    // served tree in its own astro:build:done hook, and Astro runs same-named hooks in registration
    // order. Indexing first would publish a withheld page through the search box (ADR 0080).
    search(),
    // Vérifie que chaque identifiant de chokepoint ancré dans le contenu répond encore. Un 404 fait
    // ÉCHOUER le build (notre donnée est fausse) ; une API injoignable ne le fait pas (nous ne
    // savons rien). Placée en dernier : elle ne touche pas `dist/`, elle le juge.
    anchors(),
  ],
  vite: {
    resolve: {
      alias: {
        '@ag/chokepoints': pkg('chokepoints/src/index.ts'),
        '@ag/cvi': pkg('cvi/src/index.ts'),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
