import { z } from 'zod';
import { Verdict, Confidence, PacketStatus } from './enums';

/** A single scored dimension carried by a diagnostic packet. */
export const Score = z.object({
  dimension_id: z.string(),
  value: z.number().int().min(0).max(5),
  confidence: Confidence,
  rationale: z.string(),
  evidence_refs: z.array(z.string()).default([]),
  open_uncertainties: z.array(z.string()).default([]),
});
export type Score = z.infer<typeof Score>;

/** The full packet payload (also serialised to diagnostic_packet.json). */
export const PacketPayload = z.object({
  case_id: z.string(),
  pack_hash: z.string(),
  operational_verdict: Verdict,
  confidence: Confidence,
  primary_diagnosis: z.string(),
  matched_verdict_rules: z.array(z.string()).default([]),
  scores: z.array(Score),
  activated_patterns: z.array(
    z.object({ id: z.string(), label_fr: z.string(), description_fr: z.string().optional() }),
  ),
  red_flags: z.array(z.object({ id: z.string(), severity: z.number(), message: z.string() })),
  open_uncertainties: z.array(z.object({ uncertainty: z.string(), required_test: z.string() })),
  light_actions: z.array(
    z.object({
      priority: z.number(),
      action: z.string(),
      purpose: z.string(),
      owner_category: z.string(),
      suggested_delay: z.string(),
      linked_risk: z.string(),
    }),
  ),
  matrix_rows: z.array(z.unknown()).default([]),
  // Derived CVI reading (candidate, never a fact — ADR 0035). Optional: absent on older packets.
  cvi: z
    .object({
      flow_criticality_score: z.number(),
      vulnerability_level: z.string(),
      note: z.string(),
    })
    .optional(),
});
export type PacketPayload = z.infer<typeof PacketPayload>;

export const DiagnosticPacket = z.object({
  id: z.string(),
  case_id: z.string(),
  version_number: z.number().int(),
  status: PacketStatus,
  operational_verdict: Verdict,
  confidence: Confidence,
  primary_diagnosis: z.string(),
  pack_hash: z.string(),
  packet_json: PacketPayload,
  validated_by: z.string().nullable(),
  validated_at: z.string().nullable(),
  created_at: z.string(),
});
export type DiagnosticPacket = z.infer<typeof DiagnosticPacket>;
