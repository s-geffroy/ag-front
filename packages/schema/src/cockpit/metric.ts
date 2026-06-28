import { z } from 'zod';
import { HealthState } from './enums';

export const Metric = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
  target_90d: z.number().optional(),
  target_12m: z.number().optional(),
  unit: z.string(),
  status: HealthState,
});
export type Metric = z.infer<typeof Metric>;

/** Metric groups are ranked: production first, audience last (value hierarchy). */
export const MetricGroup = z.object({
  id: z.string(),
  label: z.string(),
  rank: z.number().int(),
  // Which métier domain owns this tier (drives the ventilated scorecards). Absent ⇒ 'project'.
  domain: z.enum(['project', 'commercial']).optional(),
  metrics: z.array(Metric),
});
export type MetricGroup = z.infer<typeof MetricGroup>;

export const Scorecard = z.array(MetricGroup);
export type Scorecard = z.infer<typeof Scorecard>;
