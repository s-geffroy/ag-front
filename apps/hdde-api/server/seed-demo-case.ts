// Demo enterprise case (ADR 0036) — a REAL anchor company (Dürr Group, public profile) modelled as a
// complete enterprise: sites, suppliers, customers, partners. Supplier-level specifics are
// ILLUSTRATIVE candidates pending validation, anchored to sector-level evidence (EU↔China industrial-
// equipment dependency: ECB 2024, Euronews 2026) — NOT Dürr's confidential supplier list.
//
//   npm --workspace @ag/hdde-api run seed:demo -- <owner-email-or-id>
import { getDb } from './db/index';
import { getUserByEmail, getUserById, createCase, createEntity } from './db/repo';
import type { CaseEntityInput } from '@ag/schema/hdde';

const ENTITIES: CaseEntityInput[] = [
  // --- Sites ---
  {
    entity_type: 'site',
    name: 'Bietigheim-Bissingen (siège, R&D)',
    country: 'Germany',
    role: 'Siège / ingénierie',
    what_it_enables: 'Conception systèmes de peinture & automation',
    criticality: 4,
    substitutability: 'no',
    tier2_visibility: 'yes',
    jurisdiction_risk: 1,
    time_to_impact: 3,
    single_source: true,
    tier: null,
    share_pct: null,
    notes: '',
  },
  {
    entity_type: 'site',
    name: 'Site de production Shanghai',
    country: 'China',
    role: 'Production / assemblage Asie',
    what_it_enables: 'Lignes pour clients automobiles chinois',
    criticality: 4,
    substitutability: 'partial',
    tier2_visibility: 'partial',
    jurisdiction_risk: 4,
    time_to_impact: 3,
    single_source: false,
    tier: null,
    share_pct: null,
    notes: 'Exposition réglementaire + dépendance marché EV chinois.',
  },
  {
    entity_type: 'site',
    name: 'Site Amérique du Nord',
    country: 'United States',
    role: 'Production / service',
    what_it_enables: 'Marché NAFTA',
    criticality: 3,
    substitutability: 'partial',
    tier2_visibility: 'yes',
    jurisdiction_risk: 2,
    time_to_impact: 2,
    single_source: false,
    tier: null,
    share_pct: null,
    notes: '',
  },

  // --- Suppliers (illustrative, sector-anchored) ---
  {
    entity_type: 'supplier',
    name: 'Fournisseur de composants robotiques/motion',
    country: 'China',
    role: 'Composants critiques',
    what_it_enables: 'Axes & motion des robots de peinture',
    criticality: 5,
    substitutability: 'no',
    tier2_visibility: 'no',
    jurisdiction_risk: 4,
    time_to_impact: 4,
    single_source: true,
    tier: 1,
    share_pct: 18,
    notes: 'Secteur robotique = forte dépendance Chine (Euronews 2026).',
  },
  {
    entity_type: 'supplier',
    name: 'Fournisseur de semi-conducteurs / cartes',
    country: 'Taiwan',
    role: 'Électronique de commande',
    what_it_enables: 'Contrôleurs & cartes industrielles',
    criticality: 5,
    substitutability: 'no',
    tier2_visibility: 'no',
    jurisdiction_risk: 5,
    time_to_impact: 4,
    single_source: true,
    tier: 1,
    share_pct: 12,
    notes: 'Exposition détroit de Taïwan (chokepoint).',
  },
  {
    entity_type: 'supplier',
    name: 'Fournisseur PLC / électronique industrielle',
    country: 'Germany',
    role: 'Automates',
    what_it_enables: 'Pilotage des lignes',
    criticality: 4,
    substitutability: 'partial',
    tier2_visibility: 'unknown',
    jurisdiction_risk: 2,
    time_to_impact: 3,
    single_source: false,
    tier: 1,
    share_pct: 10,
    notes: 'Sous-composants rang 2 souvent asiatiques (non documentés).',
  },
  {
    entity_type: 'supplier',
    name: 'Acier / aluminium',
    country: 'European Union',
    role: 'Matières',
    what_it_enables: 'Structures & convoyeurs',
    criticality: 3,
    substitutability: 'partial',
    tier2_visibility: 'partial',
    jurisdiction_risk: 2,
    time_to_impact: 2,
    single_source: false,
    tier: 1,
    share_pct: 8,
    notes: '',
  },
  {
    entity_type: 'supplier',
    name: 'Roulements de précision',
    country: 'Japan',
    role: 'Composants',
    what_it_enables: 'Mécanique de précision',
    criticality: 3,
    substitutability: 'partial',
    tier2_visibility: 'partial',
    jurisdiction_risk: 2,
    time_to_impact: 2,
    single_source: false,
    tier: 1,
    share_pct: 6,
    notes: '',
  },

  // --- Customers (concentration) ---
  {
    entity_type: 'customer',
    name: 'Grand constructeur automobile européen',
    country: 'Germany',
    role: 'Client dominant',
    what_it_enables: 'Carnet de commandes ateliers peinture',
    criticality: 5,
    substitutability: 'partial',
    tier2_visibility: 'yes',
    jurisdiction_risk: 1,
    time_to_impact: 3,
    single_source: false,
    tier: null,
    share_pct: 22,
    notes: 'Cyclicité automobile.',
  },
  {
    entity_type: 'customer',
    name: 'Constructeur EV chinois',
    country: 'China',
    role: 'Client en croissance',
    what_it_enables: 'Commandes Asie',
    criticality: 4,
    substitutability: 'partial',
    tier2_visibility: 'partial',
    jurisdiction_risk: 4,
    time_to_impact: 2,
    single_source: false,
    tier: null,
    share_pct: 12,
    notes: 'Dépendance au marché chinois (de-risking UE).',
  },
  {
    entity_type: 'customer',
    name: 'Constructeur premium européen',
    country: 'Germany',
    role: 'Client',
    what_it_enables: 'Commandes',
    criticality: 3,
    substitutability: 'partial',
    tier2_visibility: 'yes',
    jurisdiction_risk: 1,
    time_to_impact: 2,
    single_source: false,
    tier: null,
    share_pct: 10,
    notes: '',
  },

  // --- Partners (gatekeepers) ---
  {
    entity_type: 'logistics_provider',
    name: 'Transitaire maritime Asie–Europe',
    country: 'Global',
    role: 'Logistique',
    what_it_enables: 'Acheminement composants & lignes',
    criticality: 4,
    substitutability: 'partial',
    tier2_visibility: 'partial',
    jurisdiction_risk: 3,
    time_to_impact: 4,
    single_source: false,
    tier: null,
    share_pct: null,
    notes: 'Exposition Suez / mer Rouge.',
  },
  {
    entity_type: 'insurer',
    name: 'Assureur crédit-export',
    country: 'European Union',
    role: 'Assurance',
    what_it_enables: 'Couverture grands contrats',
    criticality: 3,
    substitutability: 'partial',
    tier2_visibility: 'yes',
    jurisdiction_risk: 2,
    time_to_impact: 2,
    single_source: false,
    tier: null,
    share_pct: null,
    notes: '',
  },
  {
    entity_type: 'regulator',
    name: 'Contrôle export (biens à double usage)',
    country: 'European Union',
    role: 'Régulateur',
    what_it_enables: 'Autorisations d’export',
    criticality: 3,
    substitutability: 'no',
    tier2_visibility: 'yes',
    jurisdiction_risk: 3,
    time_to_impact: 3,
    single_source: false,
    tier: null,
    share_pct: null,
    notes: 'Contrôles export UE/Chine.',
  },
];

function main(): void {
  const ref = process.argv[2];
  if (!ref) {
    console.error('Usage: seed:demo -- <owner-email-or-id>');
    process.exit(1);
  }
  getDb();
  const owner = getUserByEmail(ref) ?? getUserById(ref);
  if (!owner) {
    console.error(`No user found for "${ref}". Seed an account first (seed:user).`);
    process.exit(1);
  }
  const c = createCase(owner.id, {
    title: 'Dürr Group — cartographie des dépendances (démo)',
    client_name: 'Démo interne',
    sector: 'Équipement industriel (peinture/automation automobile)',
    critical_actor_name: 'Fournisseur de composants robotiques (Chine)',
    critical_actor_type: 'supplier',
    business_function_at_risk:
      'Production et livraison de systèmes de peinture/automation aux constructeurs.',
    suspected_dependency:
      'Composants robotiques/électroniques asiatiques + concentration clients automobile.',
    initial_concern:
      'Exposition Chine/Taïwan, fret Asie-Europe, contrôles export, concentration client.',
    hq_country: 'Germany',
    employee_band: '~18000',
    revenue_band: '~4.2 Md€',
    description:
      'Équipementier industriel (réf. publique : Dürr Group). Profil illustratif — candidat à valider ; ' +
      'spécifiques fournisseurs ancrés au niveau secteur (ECB 2024 / Euronews 2026), non confidentiels.',
  });
  const caseId = String(c.id);
  for (const e of ENTITIES) createEntity(caseId, e);
  console.log(`Seeded demo case ${caseId} for ${owner.email} with ${ENTITIES.length} entities.`);
}

main();
