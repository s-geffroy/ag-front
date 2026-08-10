import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { plaquette } from './integrations/plaquette.mjs';

// Plaquette publication gate (ADR 0073), read at config time because @astrojs/sitemap needs it before
// the build starts. The integration itself re-reads the manifest and is the authority; this only keeps
// an unpublished /plaquette out of the sitemap.
const plaquetteManifest = fileURLToPath(
  new URL('../../presentations/commercial/manifest.json', import.meta.url),
);
const plaquettePublished =
  existsSync(plaquetteManifest) &&
  JSON.parse(readFileSync(plaquetteManifest, 'utf-8')).published === true;

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
