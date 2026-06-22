import { z } from 'zod';

/**
 * Controlled vocabularies for the deployment cockpit (E-light model).
 * Kept byte-aligned with the reference config in the pack
 * (applied-geopolitics-deployment-ui/sample_data/config.json).
 */

export const statusIds = [
  'backlog',
  'framing',
  'sources',
  'production',
  'review',
  'ready',
  'published',
] as const;
export const StatusId = z.enum(statusIds);
export type StatusId = z.infer<typeof StatusId>;

export const priorities = ['P0', 'P1', 'P2', 'P3'] as const;
export const Priority = z.enum(priorities);
export type Priority = z.infer<typeof Priority>;

export const deliverableTypes = [
  'note',
  'atlas_fiche',
  'dossier',
  'site_page',
  'offer',
  'cvi',
  'prospection',
  'pilot',
  'map',
  'translation',
  'method',
] as const;
export const DeliverableType = z.enum(deliverableTypes);
export type DeliverableType = z.infer<typeof DeliverableType>;

export const pillars = ['method', 'production', 'offers', 'acquisition', 'scorecard', 'site'] as const;
export const Pillar = z.enum(pillars);
export type Pillar = z.infer<typeof Pillar>;

export const offers = ['public', 'basic', 'standard', 'premium', 'internal'] as const;
export const Offer = z.enum(offers);
export type Offer = z.infer<typeof Offer>;

export const qualityGateStatuses = ['ok', 'at_risk', 'blocked', 'not_started'] as const;
export const QualityGateStatus = z.enum(qualityGateStatuses);
export type QualityGateStatus = z.infer<typeof QualityGateStatus>;

export const contactStages = [
  'identified',
  'to_contact',
  'contacted',
  'replied',
  'meeting_obtained',
  'pilot_potential',
  'pilot_started',
] as const;
export const ContactStage = z.enum(contactStages);
export type ContactStage = z.infer<typeof ContactStage>;

export const milestoneStatuses = [
  'not_started',
  'in_progress',
  'at_risk',
  'completed',
  'blocked',
] as const;
export const MilestoneStatus = z.enum(milestoneStatuses);
export type MilestoneStatus = z.infer<typeof MilestoneStatus>;

export const horizons = ['90d', '12m'] as const;
export const Horizon = z.enum(horizons);
export type Horizon = z.infer<typeof Horizon>;

/** Derived deployment health (computed, never stored as canonical). */
export const healthStates = ['on_track', 'at_risk', 'blocked'] as const;
export const HealthState = z.enum(healthStates);
export type HealthState = z.infer<typeof HealthState>;
