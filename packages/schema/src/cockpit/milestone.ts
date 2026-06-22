import { z } from 'zod';
import { Horizon, MilestoneStatus } from './enums';

export const Milestone = z.object({
  id: z.string(),
  title: z.string(),
  horizon: Horizon,
  due_date: z.string(), // ISO 8601 date
  status: MilestoneStatus,
  linked_deliverables: z.array(z.string()).default([]),
  expected_proof: z.string(),
  success_metric: z.string(),
  blocker: z.string().optional(),
  next_action: z.string(),
});
export type Milestone = z.infer<typeof Milestone>;
