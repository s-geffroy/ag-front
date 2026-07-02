import { z } from 'zod';
import { CviAssessment } from '@ag/cvi';
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
  // Chokepoint candidates relevant to the critical flow (read scope, ADR 0035). Candidates pending
  // validation, never facts. Persisted here so VERDICT can prefill PESTEL-Political/Threats from the
  // single HDDE ingestion contract (ADR 0042) without a second data source. Optional for back-compat.
  chokepoints: z
    .array(z.object({ id: z.string(), name: z.string(), note: z.string().optional() }))
    .optional(),
  // Per-corridor multi-dimension CVI assessment (candidate, read scope — ADR 0035/0043), sourced from
  // the Chokepoints Read API and validated by @ag/cvi. Feeds VERDICT's CVI→SWOT/PESTEL prefill via the
  // single HDDE contract (ADR 0042). Optional: absent when the API serves none, or on older packets.
  corridor_cvi: CviAssessment.optional(),
  // Per-corridor decision context (candidate, read scope — ADR 0035/0042): disruption-precedent
  // episodes (from /episodes + /episodes/{key}) and derived analytics (from /analytics/results),
  // sourced by HDDE and carried in the packet so VERDICT prefills context without a second data
  // source. Candidates pending validation, never facts. Optional for back-compat.
  corridor_context: z
    .object({
      episodes: z
        .array(
          z.object({
            key: z.string(),
            name: z.string(),
            started_on: z.string().optional(),
            ended_on: z.string().optional(),
          }),
        )
        .default([]),
      analytics: z
        .array(
          z.object({
            result_type: z.string().optional(),
            score: z.number().optional(),
            confidence: z.string().optional(),
            summary: z.string().optional(),
          }),
        )
        .default([]),
    })
    .optional(),
  // Enterprise layer (ADR 0036): per-actor verdicts + concentration synthesis. Optional for back-compat.
  entities: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        entity_type: z.string(),
        country: z.string().optional(),
        operational_verdict: Verdict,
        confidence: Confidence,
        top_risk: z.string(),
        scores: z.array(Score),
      }),
    )
    .optional(),
  concentration: z
    .object({
      supplier_count: z.number(),
      customer_count: z.number(),
      site_count: z.number(),
      single_source_supplier_count: z.number(),
      tier2_blind_spots: z.number(),
      customer_top_share_pct: z.number().nullable(),
      customer_hhi: z.number().nullable(),
      supplier_top_country: z.string().nullable(),
      supplier_top_country_count: z.number(),
      notes: z.array(z.string()),
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
