// VERDICT API entrypoint. Binds loopback inside its container; Caddy fronts it as
// https://verdict.applied-geopolitics.com behind auth (ADR 0041). Serves the built SPA + /api.
import { config } from './config';
import { createApp } from './app';

const app = createApp();

app.listen(config.port, config.host, () => {
  console.log(`[verdict-api] listening on ${config.host}:${config.port}`);
});
