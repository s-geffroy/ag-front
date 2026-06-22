import { z } from 'zod';
import { CviAssessment } from '@ag/cvi';
import {
  actorRoles,
  corridorFamilies,
  corridorPriorities,
  fluxFamilies,
  nodeTypes,
  scenarioKinds,
  signalFrequencies,
  thresholdTypes,
} from './vocab';
import { Provenance } from './source';

export const CorridorFamily = z.enum(corridorFamilies);
export const CorridorPriority = z.enum(corridorPriorities);
export const FluxFamily = z.enum(fluxFamilies);
export const NodeType = z.enum(nodeTypes);
export const ActorRole = z.enum(actorRoles);

export const CorridorNode = z.object({ id: z.string(), name: z.string(), type: NodeType });
export const Actor = z.object({ id: z.string(), name: z.string(), role: ActorRole });

export const Dependency = z.object({
  dependent: z.string(),
  flux: FluxFamily,
  intensity: z.enum(['bas', 'modere', 'eleve', 'critique']),
  alternatives: z.array(z.string()).default([]),
  bypass_cost_note: z.string().optional(),
});

export const Vulnerability = z.object({
  type: z.string(),
  severity: z.enum(['bas', 'modere', 'eleve', 'critique']),
  description: z.string(),
  actor: z.string().optional(),
  /** Kept distinct from the threat itself: capability ≠ intent (CVI doctrine). */
  disruption_capacity: z.string().optional(),
});

export const Bypass = z.object({
  label: z.string(),
  cost_note: z.string().optional(),
  credibility: z.string().optional(),
});

/** A monitored indicator with its alert thresholds and the action it implies. */
export const Signal = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string(),
  frequency: z.enum(signalFrequencies),
  sources: z.array(z.string()).default([]),
  baseline: z.union([z.number(), z.string()]).optional(),
  alert_threshold: z.union([z.number(), z.string()]).optional(),
  critical_threshold: z.union([z.number(), z.string()]).optional(),
  implication: z.string(),
  action_if_triggered: z.string().optional(),
});

/** A tipping point: the condition, what it affects, and the decision window it opens. */
export const Threshold = z.object({
  id: z.string(),
  type: z.enum(thresholdTypes),
  condition: z.string(),
  implication: z.string(),
  decision_window: z.string().optional(),
});

export const Scenario = z.object({
  id: z.string(),
  kind: z.enum(scenarioKinds),
  hypothesis: z.string(),
  duration_months: z.tuple([z.number(), z.number()]).optional(),
  description: z.string(),
  mitigation_options: z.array(z.string()).default([]),
});

/** Canonical corridor entity — the graph; derived analysis (CVI) attaches but never mutates it. */
export const Corridor = z.object({
  id: z.string(),
  name_fr: z.string(),
  name_en: z.string().optional(),
  family: CorridorFamily,
  priority: CorridorPriority,
  regions: z.array(z.string()).default([]),
  verdict: z.string(),
  definition: z.string(),
  nodes: z.array(CorridorNode).default([]),
  flux: z.array(FluxFamily).default([]),
  actors: z.array(Actor).default([]),
  dependencies: z.array(Dependency).default([]),
  vulnerabilities: z.array(Vulnerability).default([]),
  bypasses: z.array(Bypass).default([]),
  signals: z.array(Signal).default([]),
  thresholds: z.array(Threshold).default([]),
  scenarios: z.array(Scenario).default([]),
  cvi: CviAssessment.optional(),
  provenance: Provenance,
});
export type Corridor = z.infer<typeof Corridor>;
export type Signal = z.infer<typeof Signal>;
export type Threshold = z.infer<typeof Threshold>;
export type Scenario = z.infer<typeof Scenario>;
