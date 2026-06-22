import express from 'express';
import { LeadInput } from '@ag/schema/cockpit';
import { recordLead } from './store';
import { notifyLead } from './email';

const HOST = process.env.HOST ?? '0.0.0.0'; // isolated container; only Caddy reaches it
const PORT = Number(process.env.PORT ?? 8080);

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true); // behind Caddy
app.use(express.json({ limit: '16kb' }));

// Minimal in-memory rate limit: max posts per IP per window.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();
function rateLimited(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/lead', async (req, res) => {
  const now = Date.now();
  const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || 'unknown').trim();
  if (rateLimited(ip, now)) {
    res.status(429).json({ error: 'too_many_requests' });
    return;
  }

  const parsed = LeadInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid' });
    return;
  }
  // Honeypot filled → silently accept and drop (don't tip off bots).
  if (parsed.data.website) {
    res.json({ ok: true });
    return;
  }

  try {
    const { id } = await recordLead(parsed.data, new Date(now));
    notifyLead(parsed.data, id).catch((e) => console.error('[lead] email error', e));
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error('[lead] store error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`[lead-api] listening on ${HOST}:${PORT}`);
});
