import { z } from 'zod';

/** Controlled vocabularies for the Hidden Dependency Discovery Engine (HDDE). English identifiers
 * per the language doctrine; aligned with the adopted domain pack (ADR 0032). */

// Evidence discipline — every interview answer is marked with one of these registers.
export const answerTypes = [
  'verified_fact',
  'estimate',
  'hypothesis',
  'intuition',
  'unknown',
  'not_applicable',
] as const;
export const AnswerType = z.enum(answerTypes);
export type AnswerType = z.infer<typeof AnswerType>;

// Operational posture — never an automatic decision (SPEC_V1 §7).
export const verdicts = ['monitor', 'prepare', 'act', 'escalate'] as const;
export const Verdict = z.enum(verdicts);
export type Verdict = z.infer<typeof Verdict>;

export const confidences = ['low', 'medium', 'high'] as const;
export const Confidence = z.enum(confidences);
export type Confidence = z.infer<typeof Confidence>;

export const caseStatuses = ['draft', 'in_progress', 'validated', 'archived'] as const;
export const CaseStatus = z.enum(caseStatuses);
export type CaseStatus = z.infer<typeof CaseStatus>;

export const packetStatuses = ['draft', 'validated', 'superseded'] as const;
export const PacketStatus = z.enum(packetStatuses);
export type PacketStatus = z.infer<typeof PacketStatus>;

export const suggestionStatuses = ['pending', 'accepted', 'rejected'] as const;
export const SuggestionStatus = z.enum(suggestionStatuses);
export type SuggestionStatus = z.infer<typeof SuggestionStatus>;

// Visible critical actor types (from the domain pack actor_types.yaml).
export const actorTypes = [
  'supplier',
  'logistics_provider',
  'insurer',
  'reinsurer',
  'bank',
  'regulator',
  'customs_authority',
  'platform_operator',
  'infrastructure_owner',
  'port_authority',
  'shipping_company',
  'state_owned_company',
  'customer',
  'certification_body',
  'armed_group',
  'state',
] as const;
export const ActorType = z.enum(actorTypes);
export type ActorType = z.infer<typeof ActorType>;

export const userRoles = ['owner_admin', 'analyst'] as const;
export const UserRole = z.enum(userRoles);
export type UserRole = z.infer<typeof UserRole>;
