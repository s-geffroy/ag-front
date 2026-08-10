import type { DeckCopy } from './copy';

/**
 * French copy — the primary language, consistent with the public site.
 *
 * Sourced from the site's own pages so the plaquette says what the site says:
 * `/methode-cvi` (ramp glosses, the hard 0–100 rule), `/methode-hdde` (the eleven interview moves,
 * the evidence scale), `/methode-verdict` + `packages/verdict/src/labels.ts` (the 7 temps and the four
 * verdicts), `/offres` (the pilot ceilings).
 */
export const fr: DeckCopy = {
  docTitle: 'Applied Geopolitics — Plaquette',
  docSubject:
    'Géopolitique des corridors stratégiques : méthode CVI, HDDE, VERDICT et offres Basic / Standard / Premium.',
  coverMeta: (date) => `PLAQUETTE · FR · ${date}`,

  acts: {
    ground: {
      numeral: 'I',
      title: 'Ce sur quoi cela repose',
      lede: 'Pas un cabinet qui recommence sa recherche à chaque dossier : une base de corridors que nous tenons, et des méthodes qui s’y appliquent.',
    },
    offers: {
      numeral: 'II',
      title: 'Trois niveaux de lecture',
      lede: 'Informer, surveiller, arbitrer. Trois engagements différents, annoncés avec leurs plafonds.',
    },
  },

  substrate: {
    eyebrow: 'Le socle',
    title: 'Une base de données, pas une veille',
    labels: ['objets recensés', 'sources au registre', 'moteurs dérivés'],
    footnote:
      'Recensé n’est pas validé : la promotion en priorité P0 exige des preuves sourcées et une validation humaine. Le détail de la méthode fait l’objet d’une plaquette dédiée.',
  },

  problem: {
    eyebrow: 'Le problème',
    statement:
      'Une entreprise connaît ses fournisseurs. Elle ignore par quels corridors ils dépendent, eux, de quelqu’un d’autre.',
    support:
      'La dépendance déclarée est contractuelle et lisible. La dépendance réelle passe par des points de passage, des juridictions et des assureurs que personne n’a inscrits au registre des risques.',
  },

  chain: {
    eyebrow: 'La doctrine',
    title: 'Du corridor à la décision, en sept temps',
    footnote:
      'L’ordre est l’argument : on ne saute pas des flux aux décisions sans passer par les seuils.',
  },

  hiddenDependency: {
    eyebrow: 'Le déplacement',
    statement:
      'Dépendance visible n’est pas dépendance critique. Ce qui casse une activité est presque toujours au second rang.',
    support:
      'Le fournisseur déclaré est rarement le nœud contraignant. Derrière lui : un détroit, un régulateur, un assureur, une usine unique — et c’est là que se joue la rupture.',
  },

  cvi: {
    eyebrow: 'Méthode CVI',
    title: 'Mesurer une vulnérabilité, sans illusion de précision',
    levels: ['Bas', 'Modéré', 'Élevé', 'Critique'],
    glosses: [
      'Alternatives crédibles, faible exposition.',
      'Dépendance réelle, contournement coûteux.',
      'Peu d’alternatives, seuils proches.',
      'Concentration extrême, perturbation systémique.',
    ],
    footnote:
      'Huit dimensions. Chaque score affiche ses sources, sa date, son niveau de confiance et ses incertitudes.',
  },

  cviLimits: {
    eyebrow: 'Méthode CVI',
    title: 'Ce que le CVI ne prétend pas être',
    bullets: [
      'Règle dure : pas de score global 0–100 sans documentation méthodologique publiée.',
      'L’échelle suit l’offre — qualitatif en Basic, 0–5 par dimension en Standard, agrégé en Premium.',
      'La géométrie des cartes est schématique : aucune valeur navigationnelle ni juridique.',
    ],
    exclusions: [
      'Ce n’est pas une prédiction, ni une probabilité de rupture.',
      'Ce n’est pas un conseil juridique, financier ou assurantiel engageant.',
      'Cela ne se substitue jamais au jugement interne du client.',
    ],
    footnote:
      'Un indice qui ne dit pas ses limites n’est pas un indice, c’est une opinion chiffrée.',
  },

  hdde: {
    eyebrow: 'HDDE',
    title: 'Révéler les dépendances cachées d’une entreprise',
    bullets: [
      'Entretien guidé en onze temps, du cadrage du cas à la synthèse traçable.',
      'Neuf dimensions de diagnostic notées 0–5, de la dépendance cachée à la préparation décisionnelle.',
      'Échelle de preuve 0–5 : une source officielle vaut 5, une suggestion LLM vaut 1 et n’est pas recevable.',
      'Red team contradictoire avant conclusion, puis packet de diagnostic, source par source.',
    ],
    footnote: 'Cockpit d’entretien accessible par compte analyste, exports FR/EN.',
  },

  verdict: {
    eyebrow: 'VERDICT — offre Premium',
    title: 'Passer du diagnostic à l’arbitrage',
    bullets: [
      'Sept temps V·E·R·D·I·C·T, de « voir la situation réelle » à la décision tenue.',
      'Au moins trois options obligatoires : la principale, une alternative minimale, et l’opposée ou la non-action.',
      'Sept critères pondérés sur 100, échelle de preuve 0–5, audit des vetos durs.',
      'Quatre verdicts possibles : FAIRE, TESTER, DIFFÉRER, ABANDONNER.',
    ],
    footnote:
      'PESTEL, SWOT et Business Model Canvas y sont transformés pour la décision, pas juxtaposés. Le score n’est pas la décision.',
  },

  coverage: {
    eyebrow: 'Couverture',
    statement: 'Trois corridors fondateurs sont instruits : Malacca, Mer Rouge–Suez, Taïwan.',
    support:
      'Fiches rédigées et sourcées, en cours de validation humaine — elles ne sont pas encore publiées. L’Atlas s’ouvre corridor par corridor, jamais avant que les gates soient tenues.',
  },

  offersIntro: {
    eyebrow: 'Offres',
    title: 'Trois niveaux de lecture',
    footnote: 'Basic informe. Standard surveille. Premium aide à arbitrer.',
  },

  offers: {
    basic: {
      promise: 'Informer',
      tagline: 'Comprendre les corridors, les flux et les vulnérabilités.',
      includes: [
        'Notes structurées',
        'Fiches Atlas Basic',
        'Diagnostics qualitatifs (bas → critique)',
        'Résumés exécutifs de dossiers',
        'Newsletter de synthèse',
      ],
      excludes: ['Scoring CVI 0–5', 'Alertes thématiques', 'Historique d’évolution'],
    },
    standard: {
      promise: 'Surveiller',
      tagline: 'Suivre les signaux, les scores et les évolutions.',
      includes: [
        'Tout Basic, plus :',
        'Fiches Atlas complètes',
        'Scoring CVI 0–5 par dimension',
        'Alertes thématiques',
        '3 à 5 signaux suivis par corridor',
        'Comparaisons entre corridors',
      ],
      excludes: [
        'Contextualisation client',
        'Pondérations CVI sur mesure',
        'Restitution personnalisée',
      ],
    },
    premium: {
      promise: 'Arbitrer',
      tagline: 'Scénarios, seuils de bascule et arbitrage contextualisé.',
      includes: [
        'Tout Standard, plus :',
        'Entretien de cadrage',
        'Diagnostic d’exposition client',
        'Scénarios et seuils de bascule adaptés',
        'Options de mitigation',
        'Restitution 45–60 min + note de décision',
      ],
      excludes: ['Audit complet de supply chain', 'Conseil juridique', 'Garantie de prédiction'],
    },
  },

  comparison: {
    eyebrow: 'Offres',
    title: 'Ce que chaque niveau ouvre',
    rows: [
      { label: 'Diagnostic qualitatif bas → critique', cells: [true, true, true] },
      { label: 'Scoring CVI 0–5 par dimension', cells: [false, true, true] },
      { label: 'Signaux suivis par corridor', cells: ['—', '3 à 5', '3 à 5 + seuils'] },
      { label: 'Alertes thématiques', cells: [false, true, true] },
      { label: 'Comparaison entre corridors', cells: [false, true, true] },
      { label: 'Diagnostic d’exposition client', cells: [false, false, true] },
      { label: 'Scénarios et seuils de bascule', cells: [false, false, true] },
      { label: 'Restitution + note de décision', cells: [false, false, true] },
    ],
    footnote:
      'Au lancement, Basic et Standard ouvrent à mesure que l’Atlas et l’historique se constituent.',
  },

  pilot: {
    eyebrow: 'Premium',
    title: 'Le pilote, et ses plafonds annoncés',
    bullets: [
      'Un corridor principal, un comparatif optionnel.',
      'Deux à trois flux instruits.',
      'Trois à cinq signaux suivis.',
      'Une restitution de 45 à 60 minutes, accompagnée d’une note de décision.',
      'Six à huit semaines, en pilote fermé.',
    ],
    footnote:
      'Les plafonds sont annoncés avant l’engagement, pas découverts pendant. Un périmètre tenu vaut mieux qu’un périmètre promis.',
  },

  contact: {
    title: 'Engager la conversation',
    lines: [
      'Applied Geopolitics publie. Sylvain Geffroy signe. LucidAxis porte structurellement.',
      'Pour un pilote Premium, l’entretien de cadrage précède toute proposition.',
    ],
  },
};
