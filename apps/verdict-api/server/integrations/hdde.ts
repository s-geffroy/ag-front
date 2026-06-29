// Read-only client for the HDDE internal ingestion API (ADR 0042). Server-side only; reaches HDDE by
// Docker service name (config.hddeInternalUrl), never via Caddy. Returns a VALIDATED PacketPayload so
// the prefill engine can trust its shape. Uses the global fetch (overridable in tests).
import { PacketPayload } from '@ag/schema/hdde';
import type { PacketPayload as PacketPayloadT } from '@ag/schema/hdde';
import { config } from '../config';

export interface FetchedPacket {
  packet: PacketPayloadT;
  packet_id: string;
  pack_hash: string;
  version_number: number;
  case: { title?: string; sector?: string; client_name?: string | null };
}

/** Pull the latest diagnostic packet for an HDDE case. Returns null when ingestion is unconfigured,
 * the case/packet is missing, HDDE is unreachable, or the payload fails validation. */
export async function fetchLatestPacket(caseRef: string): Promise<FetchedPacket | null> {
  if (!config.hddeInternalUrl || !config.internalApiToken) return null;
  const url = `${config.hddeInternalUrl.replace(/\/$/, '')}/api/internal/cases/${encodeURIComponent(caseRef)}/packet/latest`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'X-Internal-Token': config.internalApiToken },
      signal: AbortSignal.timeout(config.llmTimeoutMs),
    });
  } catch (e) {
    console.error('[verdict-api] HDDE ingestion fetch failed', (e as Error).message);
    return null;
  }
  if (!res.ok) return null;

  const body = (await res.json()) as Record<string, unknown>;
  const parsed = PacketPayload.safeParse(body.packet);
  if (!parsed.success) {
    console.error('[verdict-api] HDDE packet failed validation', parsed.error.issues.length, 'issues');
    return null;
  }
  return {
    packet: parsed.data,
    packet_id: String(body.packet_id ?? ''),
    pack_hash: String(body.pack_hash ?? ''),
    version_number: Number(body.version_number ?? 0),
    case: (body.case as FetchedPacket['case']) ?? {},
  };
}
