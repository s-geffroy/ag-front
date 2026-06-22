export const site = {
  name: 'Applied Geopolitics',
  baseline: 'Géopolitique des corridors stratégiques et des flux de puissance.',
  url: 'https://www.applied-geopolitics.com',
  email: 'contact@applied-geopolitics.com',
  positioning:
    'Applied Geopolitics analyse les corridors par lesquels circulent les flux de puissance afin d’identifier les dépendances critiques, les vulnérabilités géopolitiques et les décisions de résilience possibles.',
};

export const nav = [
  { href: '/atlas', label: 'Atlas' },
  { href: '/dossiers', label: 'Dossiers' },
  { href: '/notes', label: 'Notes' },
  { href: '/methode-cvi', label: 'Méthode CVI' },
  { href: '/offres', label: 'Offres' },
  { href: '/a-propos', label: 'À propos' },
] as const;

export type Offer = {
  id: 'basic' | 'standard' | 'premium';
  name: string;
  promise: string;
  price: string;
  tagline: string;
  includes: string[];
  excludes: string[];
  cta: { label: string; href: string };
  featured?: boolean;
};

export const offers: Offer[] = [
  {
    id: 'basic',
    name: 'Basic',
    promise: 'Informer',
    price: '19–49 €/mois',
    tagline: 'Comprendre les corridors, les flux et les vulnérabilités.',
    includes: [
      'Notes structurées',
      'Fiches Atlas Basic',
      'Diagnostics qualitatifs (bas/modéré/élevé/critique)',
      'Cartes statiques simples',
      'Résumés exécutifs de dossiers',
      'Newsletter de synthèse',
    ],
    excludes: ['Scoring CVI 0–5', 'Alertes thématiques', 'Historique d’évolution', 'Contextualisation client'],
    cta: { label: 'Être informé du lancement', href: '/contact' },
  },
  {
    id: 'standard',
    name: 'Standard',
    promise: 'Surveiller',
    price: '199–799 €/mois',
    tagline: 'Suivre les signaux, les scores et les évolutions.',
    includes: [
      'Tout Basic, plus :',
      'Fiches Atlas complètes',
      'Scoring CVI 0–5 par dimension',
      'Alertes thématiques',
      '3 à 5 signaux suivis par corridor',
      'Comparaisons entre corridors',
      'Historique léger d’évolution',
    ],
    excludes: ['Contextualisation client', 'Pondérations CVI sur mesure', 'Restitution personnalisée'],
    cta: { label: 'Être informé du lancement', href: '/contact' },
    featured: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    promise: 'Arbitrer',
    price: '3 000–15 000 €+',
    tagline: 'Scénarios, seuils de bascule et arbitrage contextualisé.',
    includes: [
      'Tout Standard, plus :',
      'Entretien de cadrage',
      'Diagnostic d’exposition client',
      'Scénarios et seuils de bascule adaptés',
      'Options de mitigation',
      'Restitution 45–60 min + note de décision',
      'Pilote fermé 6–8 semaines',
    ],
    excludes: ['Audit complet de supply chain', 'Conseil juridique', 'Garantie de prédiction', 'Surveillance temps réel'],
    cta: { label: 'Demander un pilote', href: '/contact?sujet=pilote' },
  },
];

/** Corridors → flux → dépendances → vulnérabilités → seuils → scénarios → décisions. */
export const doctrineChain = [
  'Corridors',
  'Flux',
  'Dépendances',
  'Vulnérabilités',
  'Seuils',
  'Scénarios',
  'Décisions',
];
