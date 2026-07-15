import { z } from 'zod';
import {
  ContactStage,
  DeliverableType,
  Offer,
  Pillar,
  Priority,
  QualityGateStatus,
  StatusId,
} from './enums';

export const StatusDef = z.object({ id: StatusId, label: z.string() });
export const ContactStageDef = z.object({ id: ContactStage, label: z.string() });

/**
 * Declares one editorial "output workspace" (Dossiers, Fiches Atlas, Notes, …). Config-driven so a
 * new output type is a data change, not new code. `type` keys deliverables + quality_gates;
 * `content_type` keys the review/reader API (folder names differ from the deliverable type);
 * `icon` is a lucide icon name resolved by the frontend registry (icons aren't serializable).
 */
export const OutputTypeDef = z.object({
  type: DeliverableType,
  slug: z.string(),
  label: z.string(),
  icon: z.string(),
  content_type: z.enum(['atlas', 'dossiers', 'notes']),
});
export type OutputTypeDef = z.infer<typeof OutputTypeDef>;

/** Cockpit configuration — mirrors sample_data/config.json. */
export const Config = z.object({
  statuses: z.array(StatusDef),
  priorities: z.array(Priority),
  types: z.array(DeliverableType),
  pillars: z.array(Pillar),
  offers: z.array(Offer),
  quality_gate_statuses: z.array(QualityGateStatus),
  contact_stages: z.array(ContactStageDef),
  output_types: z.array(OutputTypeDef),
  /**
   * Nominative identity of the human operator, used as the default `validated_by` when writing a
   * validation-journal entry (ADR 0046 / 0068). Honor-system: the cockpit has no auth (tailnet-only),
   * so this is a declared identity confirmed per action, never derived from the OS user. Optional so
   * a config without it still parses; the validate endpoint requires an explicit `validated_by`.
   */
  operator: z.string().optional(),
});
export type Config = z.infer<typeof Config>;
