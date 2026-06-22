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

/** Cockpit configuration — mirrors sample_data/config.json. */
export const Config = z.object({
  statuses: z.array(StatusDef),
  priorities: z.array(Priority),
  types: z.array(DeliverableType),
  pillars: z.array(Pillar),
  offers: z.array(Offer),
  quality_gate_statuses: z.array(QualityGateStatus),
  contact_stages: z.array(ContactStageDef),
});
export type Config = z.infer<typeof Config>;
