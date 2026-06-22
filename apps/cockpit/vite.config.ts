import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const pkg = (p: string) => resolve(__dirname, '../../packages', p);

// Workspace packages are published as raw TS source; alias them to source so Vite transforms
// (and HMRs) them like first-party code, instead of treating them as opaque node_modules.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ag/schema/cockpit': pkg('schema/src/cockpit/index.ts'),
      '@ag/schema/content': pkg('schema/src/content/index.ts'),
      '@ag/schema': pkg('schema/src/index.ts'),
      '@ag/cvi': pkg('cvi/src/index.ts'),
      '@ag/tokens/tailwind-preset': pkg('tokens/src/tailwind-preset.ts'),
      '@ag/tokens': pkg('tokens/src/index.ts'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:8787' },
    fs: { allow: [resolve(__dirname, '../../')] },
  },
});
