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

/** GeoJSON export (/exports/geojson). Geometry kept loose; we only read feature properties + geometry. */
export const GeoJsonFeature = z
  .object({
    type: z.string(),
    geometry: z.any().nullable(),
    properties: z.record(z.any()).nullish(),
  })
  .passthrough();

export const GeoJsonFeatureCollection = z
  .object({
    type: z.literal('FeatureCollection'),
    note: z.string().optional(),
    features: z.array(GeoJsonFeature).default([]),
  })
  .passthrough();
export type GeoJsonFeatureCollection = z.infer<typeof GeoJsonFeatureCollection>;

/**
 * Feature properties safe to expose on the public redistribution surface (the GeoJSON export / map).
 * Deny-by-default: any other key — notably taint markers like `license_taint` / `max_license_risk`,
 * or restricted source notes the upstream API might leak — is dropped before a clear consumer sees it.
 * Keep this list to fields the public map/Atlas actually renders, plus legally-required attributions.
 */
export const PUBLIC_FEATURE_PROPS = [
  'id',
  'name',
  'canonical_name',
  'family',
  'priority',
  'role',
  'region',
  'required_attributions',
] as const;

/** Project every feature onto the public-safe property allowlist (see PUBLIC_FEATURE_PROPS). */
export function toPublicFeatureCollection(fc: GeoJsonFeatureCollection): GeoJsonFeatureCollection {
  return {
    ...fc,
    features: fc.features.map((f) => {
      const props = (f.properties ?? {}) as Record<string, unknown>;
      const safe: Record<string, unknown> = {};
      for (const k of PUBLIC_FEATURE_PROPS) {
        if (k in props) safe[k] = props[k];
      }
      return { ...f, properties: safe };
    }),
  };
}

export const ChokepointDetail = ChokepointSummary.extend({
  flows: z.array(Flow).default([]),
  risks: z.array(Risk).default([]),
  alternatives: z.array(Alternative).default([]),
  episodes: z.array(Episode).default([]),
  source_ids: z.array(z.string()).default([]),
  geometry_disclaimer: z.string().optional(),
}).passthrough();
export type ChokepointDetail = z.infer<typeof ChokepointDetail>;
