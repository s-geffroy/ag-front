import type {
  HealthState,
  MilestoneStatus,
  Priority,
  QualityGateStatus,
} from '@ag/schema/cockpit';

export type Tone = 'neutral' | 'accent' | 'on_track' | 'at_risk' | 'blocked' | 'not_started';

export const healthTone: Record<HealthState, Tone> = {
  on_track: 'on_track',
  at_risk: 'at_risk',
  blocked: 'blocked',
};
export const healthLabel: Record<HealthState, string> = {
  on_track: 'Sur les rails',
  at_risk: 'À risque',
  blocked: 'Bloqué',
};

export const gateTone: Record<QualityGateStatus, Tone> = {
  ok: 'on_track',
  at_risk: 'at_risk',
  blocked: 'blocked',
  not_started: 'not_started',
};
export const gateLabel: Record<QualityGateStatus, string> = {
  ok: 'OK',
  at_risk: 'À risque',
  blocked: 'Bloqué',
  not_started: 'Non démarré',
};

export const priorityTone: Record<Priority, Tone> = {
  P0: 'blocked',
  P1: 'at_risk',
  P2: 'neutral',
  P3: 'neutral',
};

export const milestoneTone: Record<MilestoneStatus, Tone> = {
  not_started: 'not_started',
  in_progress: 'accent',
  at_risk: 'at_risk',
  completed: 'on_track',
  blocked: 'blocked',
};
export const milestoneLabel: Record<MilestoneStatus, string> = {
  not_started: 'Non démarré',
  in_progress: 'En cours',
  at_risk: 'À risque',
  completed: 'Terminé',
  blocked: 'Bloqué',
};

export const typeLabel: Record<string, string> = {
  note: 'Note',
  atlas_fiche: 'Fiche Atlas',
  dossier: 'Dossier',
  site_page: 'Page site',
  offer: 'Offre',
  cvi: 'CVI',
  prospection: 'Prospection',
  pilot: 'Pilote',
  map: 'Carte',
  translation: 'Traduction',
  method: 'Méthode',
};

export const pillarLabel: Record<string, string> = {
  method: 'Méthode',
  production: 'Production',
  offers: 'Offres',
  acquisition: 'Acquisition',
  scorecard: 'Scorecard',
  site: 'Site',
};

export const offerLabel: Record<string, string> = {
  public: 'Public',
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
  internal: 'Interne',
};

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function daysUntil(iso: string, now = new Date()): number {
  return Math.round((new Date(iso).getTime() - now.getTime()) / 86_400_000);
}
