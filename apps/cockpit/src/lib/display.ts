import type { HealthState, MilestoneStatus, Priority, QualityGateStatus } from '@ag/schema/cockpit';

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
  ops: 'Exploitation',
};

export const pillarLabel: Record<string, string> = {
  method: 'Méthode',
  production: 'Production',
  offers: 'Offres',
  acquisition: 'Acquisition',
  scorecard: 'Scorecard',
  site: 'Site',
  ops: 'Exploitation',
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

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/**
 * Decode the HTML entities that leak into some /news cluster text (ag-back 0017: ~6 titles in 118
 * carried an undecoded `&#x2013;` from the GKG raw feed). Display-only — never persist the result.
 * Handles numeric (`&#8211;` / `&#x2013;`) and the common named entities; leaves anything unknown
 * verbatim rather than guessing.
 */
export function decodeHtmlEntities(input?: string | null): string {
  if (!input) return '';
  return String(input).replace(
    /&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g,
    (match, code: string) => {
      if (code[0] === '#') {
        const cp =
          code[1] === 'x' || code[1] === 'X'
            ? Number.parseInt(code.slice(2), 16)
            : Number.parseInt(code.slice(1), 10);
        return Number.isFinite(cp) && cp > 0 ? String.fromCodePoint(cp) : match;
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? match;
    },
  );
}

/**
 * Derive a readable content reference ({type, slug}) from a deliverable's links — a public-site URL
 * like `/atlas/mer-rouge-suez` maps to the content folder `atlas` and slug `mer-rouge-suez`. Returns
 * null when no link points at an editorial artifact (so the cockpit only shows "Lire" when readable).
 */
export function contentRefFromLinks(
  links?: { url: string }[],
): { type: 'atlas' | 'dossiers' | 'notes'; slug: string } | null {
  for (const l of links ?? []) {
    const m = /^\/(atlas|dossiers|notes)\/([a-z0-9][a-z0-9-]*)\/?$/.exec(l.url);
    if (m) return { type: m[1] as 'atlas' | 'dossiers' | 'notes', slug: m[2] };
  }
  return null;
}
