import { z } from 'zod';
import { DeliverableType } from './enums';

export const GateDef = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
});
export type GateDef = z.infer<typeof GateDef>;

/** The required gates for a given deliverable type (note / atlas_fiche / dossier / offer / cvi …). */
export const QualityGateSpec = z.object({
  type: DeliverableType,
  required_gates: z.array(GateDef),
});
export type QualityGateSpec = z.infer<typeof QualityGateSpec>;

export const QualityGates = z.array(QualityGateSpec);
export type QualityGates = z.infer<typeof QualityGates>;
