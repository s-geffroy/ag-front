import type {
  Config,
  Contact,
  ContradictionReport,
  Deliverable,
  JudgeReport,
  Milestone,
  QualityGates,
  Scorecard,
  ValidationEntry,
} from '@ag/schema/cockpit';

/** The full cockpit state as served by `GET /api/state`. */
export type CockpitState = {
  config: Config;
  deliverables: Deliverable[];
  milestones: Milestone[];
  metrics: Scorecard;
  contacts: Contact[];
  quality_gates: QualityGates;
  contradictions: ContradictionReport[];
  // LLM judge pré-validation reports (ADR 0068) + append-only human-validation journal (ADR 0046).
  judgements: JudgeReport[];
  validation_journal: ValidationEntry[];
};
