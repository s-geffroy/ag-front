import { z } from 'zod';
import {
  DeliverableType,
  MunichStatus,
  Offer,
  Pillar,
  Priority,
  QualityGateStatus,
  StatusId,
} from './enums';

/** Methodological gates a deliverable must clear before it ships. */
export const DeliverableGates = z.object({
  sources_ok: z.boolean(),
  llm_draft_done: z.boolean(),
  contradiction_done: z.boolean(),
  compliance_done: z.boolean(),
  human_review_done: z.boolean(),
  cvi_justified: z.boolean().optional(),
});
export type DeliverableGates = z.infer<typeof DeliverableGates>;

// url is a plain string: cockpit links may be anchors ("#"), relative paths, or absolute URLs.
export const LinkRef = z.object({ label: z.string(), url: z.string() });
export type LinkRef = z.infer<typeof LinkRef>;

export const Deliverable = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: DeliverableType,
  pillar: Pillar,
  status: StatusId,
  priority: Priority,
  progress: z.number().int().min(0).max(100),
  deadline: z.string(), // ISO 8601 date
  blocker: z.string().optional(),
  next_action: z.string(),
  impact: z.string(),
  offer: Offer,
  quality_gate_status: QualityGateStatus,
  gates: DeliverableGates,
  // Per-control Munich Charter status, keyed by control number "1".."10" (ADR 0037). Optional —
  // present on editorial artifacts (note / atlas_fiche / dossier); omitted elsewhere.
  munich: z.record(MunichStatus).optional(),
  links: z.array(LinkRef).optional(),
  internal_notes: z.string().optional(),
});
export type Deliverable = z.infer<typeof Deliverable>;
