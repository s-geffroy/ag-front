// HDDE API entrypoint. Binds loopback inside its container; Caddy fronts it as
// https://hdde.applied-geopolitics.com behind auth (ADR 0033). Serves the built SPA + /api.
import { config } from './config';
import { createApp } from './app';
import { getPack } from './pack';

const app = createApp();
const pack = getPack();

app.listen(config.port, config.host, () => {
  console.log(
    `[hdde-api] listening on ${config.host}:${config.port} — pack ${pack.id}@${pack.version}`,
  );
});
