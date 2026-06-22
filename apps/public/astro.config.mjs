import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';

// Workspace packages ship raw TS source; alias them so Astro/Vite transforms them as first-party.
const pkg = (p) => fileURLToPath(new URL(`../../packages/${p}`, import.meta.url));

export default defineConfig({
  site: 'https://www.applied-geopolitics.com',
  trailingSlash: 'ignore',
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
  vite: {
    resolve: {
      alias: {
        '@ag/cvi': pkg('cvi/src/index.ts'),
        '@ag/tokens': pkg('tokens/src/index.ts'),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
