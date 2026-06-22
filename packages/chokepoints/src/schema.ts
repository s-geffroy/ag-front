import { z } from 'zod';

// Response shapes for the Chokepoints Read API (v0.1.0). Defensive: `.passthrough()` tolerates extra
// fields and additive API changes; we only depend on what we render. Mirrors docs/api-interface-contract.md.

export const ChokepointSummary = z
  .object({
    id: z.string(),
    canonical_name: z.string(),
    object_kind: z.string().optional(),
    family: z.string().optional(),
    type: z.string().optional(),
    priority_class: z.string().optional(),
    macro_region: z.string().nullish(),
    license_taint: z.boolean().optional(),
    required_attributions: z.array(z.string()).default([]),
    max_license_risk: z.string().nullish(),
  })
  .passthrough();
export type ChokepointSummary = z.infer<typeof ChokepointSummary>;

export const ChokepointList = z
  .object({
    count: z.number().optional(),
    include_tainted: z.boolean().optional(),
    attribution_notice: z.string().optional(),
    items: z.array(ChokepointSummary).default([]),
  })
  .passthrough();
export type ChokepointList = z.infer<typeof ChokepointList>;

const Flow = z
  .object({
    flow_type: z.string(),
    importance_score: z.number().nullish(),
    estimated_volume: z.union([z.number(), z.string()]).nullish(),
    volume_unit: z.string().nullish(),
    directionality: z.string().nullish(),
  })
  .passthrough();

const Risk = z
  .object({
    risk_type: z.string(),
    probability_score: z.number().nullish(),
    impact_score: z.number().nullish(),
    current_status: z.string().nullish(),
  })
  .passthrough();

const Alternative = z
  .object({
    description: z.string(),
    feasibility: z.string().nullish(),
    cost_penalty: z.union([z.number(), z.string()]).nullish(),
    time_penalty: z.union([z.number(), z.string()]).nullish(),
    substitution_note: z.string().nullish(),
  })
  .passthrough();

const Episode = z
  .object({
    episode_key: z.string(),
    name: z.string(),
    status: z.string().nullish(),
    severity: z.string().nullish(),
  })
  .passthrough();

export const ChokepointDetail = ChokepointSummary.extend({
  flows: z.array(Flow).default([]),
  risks: z.array(Risk).default([]),
  alternatives: z.array(Alternative).default([]),
  episodes: z.array(Episode).default([]),
  source_ids: z.array(z.string()).default([]),
  geometry_disclaimer: z.string().optional(),
}).passthrough();
export type ChokepointDetail = z.infer<typeof ChokepointDetail>;
