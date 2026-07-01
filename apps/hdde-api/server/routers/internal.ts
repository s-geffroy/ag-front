// Internal read-only API for VERDICT ingestion (ADR 0042). NOT behind a user session: guarded by a
// shared service token (X-Internal-Token) and reachable only on the Docker network — Caddy 404s
// /api/internal/* publicly (defense in depth). Read-only: it never mutates HDDE data.
import { Router, type Request, type Response, type NextFunction } from 'express';
import { config } from '../config';
import { getCase, listPackets } from '../db/repo';

export const internalRouter = Router();

// Token guard. A missing/blank configured token disables the whole surface (every request 404s, so the
// endpoint is indistinguishable from "not mounted").
internalRouter.use((req: Request, res: Response, next: NextFunction) => {
  const provided = req.header('X-Internal-Token');
  if (!config.internalApiToken || !provided || provided !== config.internalApiToken) {
    res.status(404).end();
    return;
  }
  next();
});

// GET /api/internal/cases/:caseId/packet/latest — the latest HUMAN-VALIDATED diagnostic packet for a
// case, as a validated PacketPayload (the prefill engine's input). The doctrine guard "validation
// humaine obligatoire" (methode-verdict, ADR 0042) lives HERE: a draft packet is NEVER ingestible by
// VERDICT. 404 if the case is missing, or if no packet has been validated yet.
internalRouter.get('/cases/:caseId/packet/latest', (req: Request, res: Response) => {
  const c = getCase(req.params.caseId);
  if (!c) {
    res.status(404).json({ error: 'case_not_found' });
    return;
  }
  const packets = listPackets(req.params.caseId); // ordered version DESC
  const latest = packets.find((p) => p.status === 'validated'); // latest validated, never a draft
  if (!latest) {
    res.status(404).json({ error: 'no_validated_packet' });
    return;
  }
  res.json({
    case_id: c.id,
    case: { title: c.title, sector: c.sector, client_name: c.client_name },
    packet_id: latest.id,
    version_number: latest.version_number,
    pack_hash: latest.pack_hash,
    status: latest.status,
    packet: latest.packet_json, // full PacketPayload (already JSON-parsed by the repo)
  });
});
