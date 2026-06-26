import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies /api to the hdde-api (default loopback :8090). In prod the SPA is built and
// served by hdde-api directly, so no proxy is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5180,
    proxy: {
      '/api': {
        target: process.env.HDDE_API_TARGET ?? 'http://localhost:8090',
        changeOrigin: true,
      },
    },
  },
});
