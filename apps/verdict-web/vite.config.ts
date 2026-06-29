import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies /api to verdict-api (default loopback :8095). In prod the SPA is built and served
// by verdict-api directly, so no proxy is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5181,
    proxy: {
      '/api': {
        target: process.env.VERDICT_API_TARGET ?? 'http://localhost:8095',
        changeOrigin: true,
      },
    },
  },
});
