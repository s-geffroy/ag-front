import { createChokepointsClient, type ChokepointsClient } from '@ag/chokepoints';

let cached: ChokepointsClient | null | undefined;

/**
 * Server-side client for the INTERNAL chokepoints exploration. Uses the `read_tainted` token and
 * `include_tainted` from env. This is reachable only over Tailscale; restricted records are never
 * exposed publicly (ADR 0013). Returns null when the API isn't configured.
 */
export function chokepointsClient(): ChokepointsClient | null {
  if (cached !== undefined) return cached;
  const baseUrl = process.env.CHOKEPOINTS_API_URL;
  const token = process.env.CHOKEPOINTS_API_TOKEN;
  if (!baseUrl || !token) {
    cached = null;
    return null;
  }
  cached = createChokepointsClient({
    baseUrl,
    token,
    includeTainted: process.env.CHOKEPOINTS_INCLUDE_TAINTED === 'true',
  });
  return cached;
}
