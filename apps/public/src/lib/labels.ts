export type Tone = 'neutral' | 'accent' | 'navy' | 'on' | 'risk' | 'blocked';

export const accessLabel: Record<string, string> = {
  public: 'Public',
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
};
export const accessTone: Record<string, Tone> = {
  public: 'on',
  basic: 'neutral',
  standard: 'accent',
  premium: 'accent',
};

export const confidenceLabel: Record<string, string> = {
  bas: 'Confiance basse',
  moyen: 'Confiance moyenne',
  eleve: 'Confiance élevée',
};

export const cviLevelLabel: Record<string, string> = {
  bas: 'Vulnérabilité basse',
  modere: 'Vulnérabilité modérée',
  eleve: 'Vulnérabilité élevée',
  critique: 'Vulnérabilité critique',
};
export const cviLevelTone: Record<string, Tone> = {
  bas: 'on',
  modere: 'neutral',
  eleve: 'risk',
  critique: 'blocked',
};

export const familyLabel: Record<string, string> = {
  maritime: 'Corridor maritime',
  chokepoint: 'Chokepoint',
  cable_numerique: 'Câbles / numérique',
  semi_conducteurs: 'Semi-conducteurs',
  energie: 'Énergie',
  pipeline_lng: 'Pipeline / GNL',
  minerais_critiques: 'Minerais critiques',
};

export const sourceTypeLabel: Record<string, string> = {
  institutionnel: 'Institutionnel',
  donnees_ouvertes: 'Données ouvertes',
  presse_specialisee: 'Presse spécialisée',
  rapport_entreprise: 'Rapport d’entreprise',
  reglementaire: 'Réglementaire',
  carte: 'Carte',
  analyse_secondaire: 'Analyse secondaire',
  source_contradictoire: 'Source contradictoire',
  signal_faible: 'Signal faible',
};

export function formatDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Humanise a controlled-vocabulary key (e.g. `maritime_chokepoint` → `Maritime chokepoint`). */
export function humanize(s?: string | null): string {
  if (!s) return '';
  const t = s.replace(/_/g, ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export const priorityTone: Record<string, Tone> = {
  P0: 'blocked',
  P1: 'risk',
  P2: 'neutral',
  P3: 'neutral',
};
