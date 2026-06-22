import type {
  Config,
  Contact,
  Deliverable,
  Milestone,
  QualityGates,
  Scorecard,
} from '@ag/schema/cockpit';

/** The full cockpit state as served by `GET /api/state`. */
export type CockpitState = {
  config: Config;
  deliverables: Deliverable[];
  milestones: Milestone[];
  metrics: Scorecard;
  contacts: Contact[];
  quality_gates: QualityGates;
};
