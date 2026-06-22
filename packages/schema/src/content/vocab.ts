/**
 * Controlled vocabularies for the product content model (Atlas / corridors / flux).
 * Derived from the pack's doctrine (families P0/P1/P2, flux families, source types).
 * These are taxonomy values, not facts — records using them remain candidates pending validation.
 */

/** Corridor families, by priority tier. */
export const corridorFamiliesP0 = [
  'maritime',
  'chokepoint',
  'port_hinterland',
  'intermodal',
  'energie',
  'pipeline_lng',
  'cable_numerique',
  'minerais_critiques',
  'alimentaire',
  'militaire_logistique',
  'migratoire',
  'illicite_sanctions',
] as const;

export const corridorFamiliesP1 = [
  'financier',
  'normatif',
  'industriel',
  'humanitaire',
  'climatique',
  'culturel_diasporique',
] as const;

export const corridorFamiliesP2 = [
  'touristique',
  'religieux',
  'universitaire',
  'sportif',
  'symbolique',
] as const;

export const corridorFamilies = [
  ...corridorFamiliesP0,
  ...corridorFamiliesP1,
  ...corridorFamiliesP2,
] as const;

export const corridorPriorities = ['P0', 'P1', 'P2'] as const;

/** Families of flows that circulate through corridors. */
export const fluxFamilies = [
  'materiel',
  'energetique',
  'humain',
  'financier',
  'informationnel',
  'institutionnel',
  'militaire',
  'biologique',
  'symbolique',
] as const;

/** Conceptual node kinds (route → corridor → chokepoint → hub → gateway → network). */
export const nodeTypes = [
  'port',
  'strait',
  'hub',
  'gateway',
  'pipeline',
  'cable',
  'rail',
  'airport',
  'other',
] as const;

export const actorRoles = ['governance', 'threat', 'influence', 'operator', 'observer'] as const;

/** Types of tipping points / alert thresholds. */
export const thresholdTypes = [
  'physique',
  'economique',
  'securitaire',
  'politique',
  'climatique',
  'informationnel',
] as const;

export const scenarioKinds = ['stabilisation', 'perturbation_durable', 'escalade'] as const;

export const signalFrequencies = ['daily', 'weekly', 'monthly'] as const;

export const sourceTypes = [
  'institutionnel',
  'donnees_ouvertes',
  'presse_specialisee',
  'rapport_entreprise',
  'reglementaire',
  'carte',
  'analyse_secondaire',
  'source_contradictoire',
  'signal_faible',
] as const;

/** Access tier gating a piece of content (mirrors the cockpit Offer vocabulary). */
export const accessLevels = ['public', 'basic', 'standard', 'premium'] as const;
