import { z } from 'zod';

/** Evidence item — manually enriched by the analyst. Evidence types come from the domain pack;
 * `llm_generated_suggestion` is NOT allowed as evidence (ADR 0034). */
export const evidenceTypeIds = [
  'client_statement',
  'contract',
  'supplier_document',
  'logistics_data',
  'insurance_clause',
  'official_source',
  'analyst_note',
  'news_signal',
] as const;
export const EvidenceTypeId = z.enum(evidenceTypeIds);
export type EvidenceTypeId = z.infer<typeof EvidenceTypeId>;

export const EvidenceInput = z.object({
  title: z.string().trim().min(1).max(300),
  evidence_type: EvidenceTypeId,
  source_type: z.string().trim().max(120).optional().default('manual'),
  summary: z.string().trim().max(10000),
  reliability: z.number().int().min(0).max(5).default(0),
  relevance: z.number().int().min(0).max(5).default(0),
  confidence: z.number().int().min(0).max(5).default(0),
});
export type EvidenceInput = z.infer<typeof EvidenceInput>;

export const Evidence = EvidenceInput.extend({
  id: z.string(),
  case_id: z.string(),
  status: z.string(),
  attachment_path: z.string().nullable(),
  created_at: z.string(),
});
export type Evidence = z.infer<typeof Evidence>;

/** Link an evidence item to an answer or a scored dimension. */
export const EvidenceLinkInput = z.object({
  evidence_id: z.string(),
  target_kind: z.enum(['answer', 'dimension', 'pattern']),
  target_ref: z.string().trim().min(1).max(200),
});
export type EvidenceLinkInput = z.infer<typeof EvidenceLinkInput>;
