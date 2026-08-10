import type { MethodeCopy } from './methode-copy';

/**
 * FR copy for the long `methode` plaquette.
 *
 * The walkthrough uses the Malacca fiche's INSTITUTIONAL, SOURCED figures only (EIA, MPA Singapore,
 * ReCAAP, Reuters/GEM) and publishes no CVI score: the fiche itself is `published: false`, and the
 * point of the act is to show the method working, not to leak a diagnosis. The most valuable slide in
 * it is the one that states what no public source documents — that is the register the whole deck is
 * trying to earn.
 */
export const methodeFr: MethodeCopy = {
  docTitle: 'Applied Geopolitics — Méthode',
  docSubject:
    'Le socle de données chokepoints, la méthode CVI, le diagnostic HDDE et le protocole d’arbitrage VERDICT.',
  coverTitle: 'Sur quoi cela repose',
  coverBaseline:
    'Une base de données de corridors instrumentée, trois méthodes qui s’enchaînent, et ce qu’elles refusent de prétendre.',
  coverMeta: (date) => `MÉTHODE · FR · ${date}`,

  acts: {
    substrate: {
      numeral: 'I',
      title: 'Le socle',
      lede: 'Avant la méthode, la base. Ce que nous avons recensé, d’où cela vient, et ce que nous en dérivons.',
    },
    measure: {
      numeral: 'II',
      title: 'Mesurer',
      lede: 'Le CVI : huit dimensions pour qualifier la vulnérabilité d’un corridor, et une règle dure sur les scores.',
    },
    surface: {
      numeral: 'III',
      title: 'Révéler',
      lede: 'HDDE : un entretien guidé qui remonte du fournisseur déclaré jusqu’au nœud qui contraint réellement.',
    },
    arbitrate: {
      numeral: 'IV',
      title: 'Arbitrer',
      lede: 'VERDICT : sept temps, sept critères pondérés, quatre issues — et une condition d’arrêt obligatoire.',
    },
    walkthrough: {
      numeral: 'V',
      title: 'Dérouler',
      lede: 'La méthode appliquée à Malacca, sur sources publiques. Une illustration, pas un diagnostic publié.',
    },
  },

  familyLabels: {
    port_gateway: 'Portes portuaires',
    land_chokepoint: 'Points de passage terrestres',
    maritime_chokepoint: 'Détroits et canaux',
    digital_infrastructure_chokepoint: 'Infrastructure numérique',
    critical_supply_chokepoint: 'Approvisionnements critiques',
    energy_infrastructure_chokepoint: 'Infrastructure énergétique',
    infrastructure_chokepoint: 'Autres infrastructures',
    air_cargo_gateway: 'Portes aéro-cargo',
    strategic_system: 'Systèmes stratégiques',
  },

  substrate: {
    thesis: {
      eyebrow: 'Le socle',
      statement:
        'Nous ne produisons pas des notes à partir de la presse. Nous interrogeons une base de corridors que nous tenons.',
      support:
        'Chaque analyse part d’objets recensés, sourcés et versionnés, pas d’une recherche recommencée à chaque dossier. C’est ce qui permet de comparer deux corridors, de suivre une évolution, et de répondre le lendemain à la question posée la veille.',
    },
    scale: {
      eyebrow: 'Le socle',
      title: 'L’ordre de grandeur',
      labels: ['objets recensés', 'sources au registre', 'moteurs dérivés'],
      notes: [
        'Détroits, canaux, ports, points de passage terrestres, câbles, infrastructures énergétiques et numériques.',
        'Chacune porte son niveau de fiabilité et son régime de licence : usage, extraction, stockage.',
        'CVI, contrôle, corroboration, résilience, réseau, arme-abilité, pression événementielle, perte commerciale exposée…',
      ],
      footnote:
        'Recensé n’est pas validé : la promotion d’un objet en priorité P0 exige des preuves sourcées et une validation humaine. 22 objets y sont aujourd’hui.',
    },
    corpus: {
      eyebrow: 'Le socle',
      title: 'Ce que « corridor » recouvre réellement',
      unit: 'objets',
      footnote:
        'Un corridor n’est pas une route maritime. Les trois quarts du corpus ne sont pas des détroits — ce sont des ports, des passages terrestres, des câbles et des installations énergétiques.',
    },
    provenance: {
      eyebrow: 'Le socle',
      title: 'La provenance est une contrainte, pas une annexe',
      body: [
        'Chaque source entre au registre avec son niveau de fiabilité et son régime de licence. Une source dont la licence interdit l’extraction est mise en quarantaine par le chargeur : elle n’entre pas dans la base, elle ne se retrouve pas dans un livrable par inadvertance.',
        'Le canonique et le dérivé sont séparés jusque dans les droits de la base : les moteurs analytiques tournent sous un rôle en lecture seule sur les données canoniques. Une analyse ne peut pas, structurellement, réécrire le fait dont elle part.',
        'Le corpus n’est pas figé : chaque changement de schéma est une migration versionnée, et chaque décision d’architecture est écrite avant d’être appliquée.',
      ],
      panelTitle: 'Discipline',
      footnote:
        'Ce n’est pas de la rigueur affichée : c’est ce qui rend une affirmation réfutable six mois plus tard.',
    },
    engines: {
      eyebrow: 'Le socle',
      title: 'Ce que la base calcule d’elle-même',
      bullets: [
        'Contrôle et arme-abilité : qui tient un nœud, et jusqu’où ce pouvoir est instrumentalisable.',
        'Corroboration : combien de sources indépendantes soutiennent une affirmation, et lesquelles la contredisent.',
        'Résilience et réseau : ce qui tombe en second si le premier nœud cède, et par quel chemin.',
        'Perte commerciale exposée : l’ordre de grandeur du flux réellement en jeu, pas le volume total du corridor.',
        'Pression événementielle : l’écart entre l’activité observée et sa ligne de base.',
      ],
      footnote:
        'Les sorties dérivées sont des candidats : elles alimentent le jugement, elles ne le remplacent pas, et elles ne modifient jamais l’enregistrement canonique.',
    },
    live: {
      eyebrow: 'Le socle',
      title: 'Ce qui bouge, et comment nous le laissons entrer',
      bullets: [
        'Agrégation de presse par corridor, avec détection des pics d’attention médiatique.',
        'Flux GDELT brut pour la couverture événementielle mondiale.',
        'Consensus de marchés prédictifs, rattaché à un corridor par un juge LLM, puis planché à deux marchés minimum.',
        'Une porte robots.txt sur toute collecte : ce que l’éditeur refuse, nous ne le prenons pas.',
      ],
      footnote:
        'Le plancher de cardinalité est récent et il coûte : il a retiré son bloc de consensus à Panama, notre corridor le plus visible. Un signal adossé à un seul marché n’est pas un consensus, même quand il arrange.',
    },
    contract: {
      eyebrow: 'Le socle',
      statement:
        'L’interface de lecture est un contrat versionné, épinglé chez le consommateur, et gardé par un test qui casse le build.',
      support:
        'Une rupture de contrat n’est pas découverte en production : elle est détectée à la compilation, des deux côtés, avant d’être servie.',
      statLabels: ['points d’accès', 'schémas', 'contrat épinglé'],
    },
  },

  measure: {
    dimensions: {
      eyebrow: 'Méthode CVI',
      title: 'Huit dimensions, et la question que chacune pose',
      footnote:
        'Le CVI ne compresse pas ces huit questions en un chiffre unique tant que la pondération n’est pas documentée et publiée.',
    },
    scales: {
      eyebrow: 'Méthode CVI',
      title: 'Ce que l’échelle vous donne, niveau par niveau',
      bullets: [
        'Public et Basic — un diagnostic qualitatif, bas → critique : de quoi situer un corridor et le comparer à un autre.',
        'Standard — un score 0–5 par dimension : de quoi voir OÙ se loge la vulnérabilité, et donc sur quoi agir.',
        'Premium — un score agrégé 0–100, pondéré pour le contexte du client, dès lors que la méthodologie est documentée.',
        'À tous les niveaux, chaque score affiche ses sources, sa date, son niveau de confiance et ses incertitudes.',
      ],
      exclusions: [
        'Pas de score global 0–100 sans documentation méthodologique publiée.',
        'Pas de probabilité de rupture : nous n’en produisons pas.',
        'Aucune valeur navigationnelle ni juridique dans la géométrie des cartes.',
      ],
      footnote:
        'Un indice qui ne dit pas ses limites n’est pas un indice, c’est une opinion chiffrée.',
    },
  },

  surface: {
    intro: {
      eyebrow: 'HDDE',
      statement:
        'Le fournisseur qu’une entreprise déclare est presque toujours le mauvais objet d’analyse.',
      support:
        'HDDE part de l’acteur visible et remonte : quelle est la nature réelle de la dépendance, quel flux est en jeu, qui peut le bloquer, et à quelle vitesse une rupture atteint le client. L’entretien est guidé parce que la dépendance cachée ne se déclare pas spontanément — elle se déduit.',
    },
    interview: {
      eyebrow: 'HDDE',
      title: 'L’entretien, en onze temps',
      steps: [
        {
          marker: '01',
          label: 'Cadrage du cas',
          note: 'Périmètre, acteur visible de départ, question de décision.',
        },
        {
          marker: '02',
          label: 'Acteur critique visible',
          note: 'Le fournisseur, l’organe ou le point de passage déclaré.',
        },
        {
          marker: '03',
          label: 'Nature de la dépendance',
          note: 'Contractuelle, technique, financière, réglementaire ?',
        },
        {
          marker: '04',
          label: 'Flux critique',
          note: 'Le flux physique, informationnel ou financier réellement en jeu.',
        },
        {
          marker: '05',
          label: 'Substitution réelle',
          note: 'Une alternative crédible existe-t-elle, à quel coût, en quel délai ?',
        },
        {
          marker: '06',
          label: 'Dépendances cachées',
          note: 'Fournisseurs de second rang, juridictions, nœuds invisibles.',
        },
        {
          marker: '07',
          label: 'Contrôle et nuisance',
          note: 'Gatekeepers, régulateurs, assureurs, acteurs de perturbation.',
        },
        {
          marker: '08',
          label: 'Temporalité d’impact',
          note: 'À quelle vitesse une rupture se propage jusqu’au client.',
        },
        {
          marker: '09',
          label: 'Seuils de décision',
          note: 'Les niveaux à partir desquels préparer, agir ou escalader.',
        },
        {
          marker: '10',
          label: 'Red team',
          note: 'Mise à l’épreuve contradictoire du diagnostic avant conclusion.',
        },
        {
          marker: '11',
          label: 'Synthèse',
          note: 'Packet de diagnostic traçable, source par source.',
        },
      ],
      footnote:
        'Onze temps, pas un questionnaire : chaque bloc conditionne la pertinence du suivant, et la red team précède toujours la conclusion.',
    },
    dimensions: {
      eyebrow: 'HDDE',
      title: 'Neuf dimensions de diagnostic, notées 0–5',
      steps: [
        {
          marker: '01',
          label: 'Dépendance à l’acteur visible',
          note: 'À quel point l’entreprise dépend-elle de l’acteur déclaré ?',
        },
        {
          marker: '02',
          label: 'Dépendance cachée',
          note: 'Quelle exposition passe par des nœuds non visibles en amont ?',
        },
        {
          marker: '03',
          label: 'Faiblesse de substitution',
          note: 'Le remplacement est-il crédible, rapide, soutenable ?',
        },
        {
          marker: '04',
          label: 'Exposition juridictionnelle',
          note: 'Quelles juridictions peuvent contraindre ou bloquer le flux ?',
        },
        {
          marker: '05',
          label: 'Criticité du flux',
          note: 'Une rupture met-elle en jeu l’activité elle-même ?',
        },
        {
          marker: '06',
          label: 'Pression temporelle',
          note: 'Combien de temps avant que l’impact atteigne le client ?',
        },
        {
          marker: '07',
          label: 'Pression des gatekeepers',
          note: 'Quel pouvoir de contrôle ou de nuisance des intermédiaires ?',
        },
        {
          marker: '08',
          label: 'Qualité de preuve',
          note: 'Le diagnostic repose-t-il sur des preuves fiables et validées ?',
        },
        {
          marker: '09',
          label: 'Préparation décisionnelle',
          note: 'L’entreprise est-elle prête à décider face à cette exposition ?',
        },
      ],
      footnote:
        'La huitième dimension note la solidité des sept autres : un diagnostic peut être alarmant et mal étayé, et il faut que cela se voie.',
    },
    evidence: {
      eyebrow: 'HDDE',
      title: 'L’échelle de preuve, et ce qu’elle refuse',
      rungs: [
        { score: 5, label: 'Source officielle', admissible: true },
        { score: 4, label: 'Contrat', admissible: true },
        { score: 4, label: 'Donnée logistique', admissible: true },
        { score: 4, label: 'Clause d’assurance', admissible: true },
        { score: 3, label: 'Document fournisseur', admissible: true },
        { score: 3, label: 'Note analyste', admissible: true },
        { score: 2, label: 'Déclaration client', admissible: true },
        { score: 2, label: 'Signal de veille', admissible: true },
        { score: 1, label: 'Suggestion LLM — non recevable', admissible: false },
      ],
      footnote:
        'Le modèle propose et conteste ; il n’atteste rien. Une suggestion LLM n’est jamais admissible comme preuve, quel que soit son aplomb.',
    },
    output: {
      eyebrow: 'HDDE',
      title: 'Ce qui sort de l’entretien',
      bullets: [
        'Un packet de diagnostic versionné, avec le hash du pack méthodologique qui l’a produit.',
        'Une matrice de dépendance et de contrôle : qui tient quoi, et par quel levier.',
        'Une couche d’action légère : ce qui est faisable maintenant, à quel coût, avec quel effet.',
        'Un diff entre deux versions : ce qui a changé depuis le dernier entretien, et pourquoi.',
        'Des exports FR et EN, et le JSON canonique du packet.',
      ],
      footnote:
        'Le packet est daté et rejouable. Six mois plus tard, on peut dire ce qui était su, quand, et sur quelle preuve.',
    },
  },

  arbitrate: {
    stages: {
      eyebrow: 'VERDICT',
      title: 'Sept temps, et le garde-fou de chacun',
      footnote:
        'L’ordre est contraignant : on ne compare pas des options avant de les avoir définies, et on ne les définit pas avant d’avoir posé la situation sans sa réponse.',
    },
    criteria: {
      eyebrow: 'VERDICT',
      title: 'Sept critères pondérés sur cent',
      footnote:
        'La pondération est affichée avant l’évaluation, pas ajustée après. Un poids que l’on découvre à la fin est un résultat déguisé en méthode.',
    },
    verdicts: {
      eyebrow: 'VERDICT',
      title: 'Quatre issues, et la bande de score qui y mène',
      steps: [
        {
          marker: '≥ 80',
          label: 'FAIRE',
          note: 'Engager. Preuve ≥ 4, aucun veto, validation humaine.',
        },
        {
          marker: '65–79',
          label: 'TESTER',
          note: 'Engager un test falsifiable, borné, avec sa condition d’arrêt.',
        },
        {
          marker: '50–64',
          label: 'DIFFÉRER',
          note: 'La preuve manque ou le contexte n’est pas mûr. On fixe la date de revue.',
        },
        {
          marker: '< 50',
          label: 'ABANDONNER',
          note: 'L’option ne tient pas. On l’écrit, pour ne pas la reprendre dans six mois.',
        },
      ],
      footnote:
        'Différer et abandonner sont des décisions, pas des échecs de la méthode. Un protocole qui ne peut produire que « faire » ne sert à rien.',
    },
    vetoes: {
      eyebrow: 'VERDICT',
      title: 'Ce qui écrase le score',
      bullets: [
        'Vetos durs, audités séparément : un score élevé ne survit pas à une impossibilité réglementaire, financière ou capacitaire.',
        'Ajustements explicites et bornés, appliqués comme des pénalités raisonnées, jamais comme un arrondi.',
        'Trois options minimum, dont une alternative minimale et l’opposée ou la non-action.',
        'Condition d’arrêt obligatoire : à quoi reconnaît-on que la décision était mauvaise, et à quelle date on regarde.',
      ],
      exclusions: [
        'Aucune option n’est retenue sur le seul score.',
        'Aucune conclusion n’est rendue sans passage en red team contradictoire.',
        'Aucune décision n’est prise par le modèle : la validation est humaine et nominative.',
      ],
      footnote: '',
    },
    limit: {
      eyebrow: 'VERDICT',
      statement:
        'Le score n’est pas la décision. Il est ce sur quoi la décision devra s’expliquer.',
      support:
        'VERDICT ne produit pas un arbitrage automatique : il produit un arbitrage argumenté, avec ses hypothèses, ses preuves, ses contradictions et sa date de revue. La responsabilité reste entière, et c’est le but.',
    },
  },

  walkthrough: {
    disclaimer:
      'Illustration de méthode sur sources publiques — ce n’est pas un diagnostic publié. La fiche Atlas correspondante est en cours de validation humaine.',
    steps: [
      {
        eyebrow: 'Dérouler · 1/3',
        title: 'Le corridor, et ce qui y circule vraiment',
        body: [
          'Malacca n’est pas une route, c’est un rétrécissement. Le passage contraignant est le chenal de Phillips, quelques kilomètres devant Singapour — et c’est là que se concentre tout ce qui suit.',
          'Le premier travail n’est pas d’estimer un risque, c’est d’établir ce qui passe. Volume de brut, part destinée à un seul importateur, nombre de transits, débit conteneurisé du hub adjacent : quatre mesures institutionnelles, toutes sourcées, aucune dérivée.',
          'Sans cette étape, tout ce qui suit serait une opinion sur une géographie.',
        ],
        panelTitle: 'Mesuré, sourcé',
        panel: [
          { key: 'Brut transitant', value: '23,2 Mb/j' },
          { key: 'Part importée par la Chine', value: '48 %' },
          { key: 'Transits (Malacca + Singapour)', value: '94 301 / an' },
          { key: 'Débit conteneurs du hub', value: '41,1 M EVP' },
        ],
        footnote:
          'Sources : US EIA, World Oil Transit Chokepoints (1ᵉʳ semestre 2025) ; MPA Singapore, Annual Report 2024.',
      },
      {
        eyebrow: 'Dérouler · 2/3',
        title: 'Où se cache la dépendance — et ce que personne ne documente',
        body: [
          'La question naïve est « peut-on passer ailleurs ? ». La réponse est oui : Lombok est profond et permissif, il accueille des navires que Malacca refuse. La contrainte n’est donc pas le tirant d’eau.',
          'La contrainte est la flotte. Un détour de +300 à +1 000 milles réduit le nombre de rotations annuelles et immobilise davantage de navires : le report bute sur l’absorption systémique, pas sur la géographie. La seule alternative chiffrée, le pipeline Chine–Myanmar, couvre environ 2 % du débit du détroit.',
          'Et le résultat le plus utile de l’analyse est une absence : aucune source publique ne chiffre la capacité résiduelle d’absorption. Nous l’écrivons.',
        ],
        panelTitle: 'La substitution, examinée',
        panel: [
          { key: 'Profondeur de Lombok', value: '≈ 1 000 m' },
          { key: 'Allongement de route', value: '+1 à +4 j' },
          { key: 'Pipeline Chine–Myanmar', value: '≈ 400 kb/j' },
          { key: 'Part du débit couverte', value: '≈ 2 %' },
          { key: 'Capacité résiduelle', value: 'non documentée' },
        ],
        footnote:
          'Sources : Reuters (2017) et Global Energy Monitor pour la capacité du pipeline ; l’allongement de route est une modélisation, pas une donnée officielle.',
      },
      {
        eyebrow: 'Dérouler · 3/3',
        title: 'Le seuil, et la décision qu’il déclenche',
        body: [
          'Un diagnostic qui ne dit pas à quoi regarder demain matin n’a servi à rien. Chaque seuil lie un indicateur observable à une bascule de régime et à l’action qu’elle implique.',
          'Ils sont explicitement classés : adossé à des sources vérifiées, partiel, ou repère hypothétique. Un seuil hypothétique reste utile — à condition qu’il ne se fasse pas passer pour une mesure.',
          'Le croisement compte plus que le franchissement isolé : une chute de volume simultanée à une hausse d’incidents signale un basculement durable, là où chaque signal pris seul reste conjoncturel.',
        ],
        panelTitle: 'Repères de décision',
        panel: [
          { key: 'Recul du flux de brut', value: '> 15 %' },
          { key: 'Recul des transits (4 sem.)', value: '> 20 %' },
          { key: 'Incidents SOMS soutenus', value: '≥ 1 / sem. × 3' },
          { key: 'Blocage physique continu', value: '> 72 h' },
          { key: 'Incidents SOMS 2025', value: '108 (+74 %)' },
        ],
        footnote:
          'Source : ReCAAP ISC, Annual Report 2025. Les seuils sont des repères de décision — une analyse, jamais une mesure.',
      },
    ],
  },

  contact: {
    title: 'Aller plus loin',
    lines: [
      'La méthode complète, corridor par corridor, s’instruit dans un pilote Premium fermé de six à huit semaines.',
      'L’entretien de cadrage précède toute proposition — il sert autant à qualifier la demande qu’à la refuser si elle ne relève pas de nous.',
    ],
  },
};
