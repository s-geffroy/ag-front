/**
 * Les noms français des corridors — une décision éditoriale, pas une traduction du payload.
 *
 * POURQUOI CETTE TABLE EXISTE. La base chokepoints sert UN seul nom par objet, `canonical_name`, en
 * anglais. Il n'y a ni champ `_fr`, ni locale, ni alias traduit — vérifié sur le contrat épinglé
 * (`scripts/consumer/contract/openapi.json`) : la donnée n'existe pas, ce n'est pas une option qu'on
 * aurait oublié d'activer. Sur un site dont la langue première est le français, les trente cartes de
 * /atlas et les lignes du fil d'accueil s'intitulaient donc « Strait of Hormuz », « Panama Canal ».
 *
 * POURQUOI ELLE N'EST PAS DÉRIVÉE DES FICHES. Onze fiches Atlas portent un `chokepoint_id` et un
 * titre français, et la tentation était de s'en servir. Mais un TITRE DE FICHE N'EST PAS UN NOM DE
 * CORRIDOR : « Taïwan — semi-conducteurs et routes maritimes » est un cadrage éditorial, le corridor
 * s'appelle « Taiwan Strait » ; « Mer Rouge / Suez / Bab el-Mandeb » couvre trois objets là où le
 * `chokepoint_id` n'en désigne qu'un. Six titres sur onze tombaient juste, cinq auraient renommé
 * l'objet avec l'angle de la fiche. La table est donc explicite, décidée entrée par entrée.
 *
 * DEUX RAYONS, ET UN SEUL EST RENDU. `CORRIDOR_NAME_FR` ne contient que des noms qui n'inventent
 * rien : des exonymes français attestés (« détroit de Luçon », « Bab-el-Mandeb ») et la traduction de
 * libellés purement descriptifs (« Eastern Mediterranean System »). `CORRIDOR_NAME_FR_PENDING`
 * contient les noms qui demandent un ARBITRAGE et non une traduction — dire « goulet », « point de
 * passage obligé » ou « chokepoint », qualifier une filière d'« occidentale » — et il n'est
 * consulté par personne : `corridorNameFr` ne le lit pas, un test le vérifie. Ces entrées sont des
 * candidats en attente de validation humaine, et une candidate ne s'affiche pas.
 *
 * POUR VALIDER : déplacer la ligne de PENDING vers la table rendue. C'est tout, et c'est le geste.
 */

/**
 * Noms rendus. Aucun n'invente : exonyme français attesté, ou traduction d'un libellé descriptif.
 * La casse suit l'usage français des noms géographiques — « détroit de » en minuscule dans une
 * phrase, mais ces libellés servent de titres, donc capitale initiale.
 */
// NB : le préfixe `p0_`/`p1_`/`p3_` de l'identifiant n'est PAS la classe de priorité servie par
// l'API — la grille « P0 » de /atlas contient des identifiants `p1_` et `p3_`. Ne jamais déduire
// l'un de l'autre, et ne jamais FABRIQUER un identifiant d'après le nom : dix-neuf des trente-trois
// clés de cette table, devinées ainsi, étaient fausses. La garde de build ci-dessous existe pour ça.
export const CORRIDOR_NAME_FR: Record<string, string> = {
  // — Détroits, canaux, passages : exonymes français d'usage courant ————————————————
  p0_maritime_strait_strait_of_hormuz: 'Détroit d’Ormuz',
  p0_maritime_strait_strait_of_malacca: 'Détroit de Malacca',
  p0_maritime_strait_strait_of_gibraltar: 'Détroit de Gibraltar',
  p0_maritime_strait_singapore_strait: 'Détroit de Singapour',
  p0_maritime_strait_taiwan_strait: 'Détroit de Taïwan',
  // fr.wikipedia.org/wiki/Bab-el-Mandeb — forme française dominante (Universalis écrit
  // « Bāb al-Mandab », graphie savante que le reste du site n'emploie pas).
  p0_maritime_strait_bab_el_mandeb_strait: 'Détroit de Bab-el-Mandeb',
  // Le canal de Bashi fait PARTIE du détroit de Luçon (fr.wikipedia.org/wiki/Canal_de_Bashi) : la
  // base nomme les deux, le nom français les garde tous les deux plutôt que d'en choisir un.
  p0_maritime_strait_luzon_strait_bashi_channel: 'Détroit de Luçon / Canal de Bashi',
  p0_maritime_canal_panama_canal: 'Canal de Panama',
  p0_maritime_canal_suez_canal: 'Canal de Suez',
  p0_maritime_passage_cape_of_good_hope_route: 'Route du cap de Bonne-Espérance',

  // — Ports et routes ————————————————————————————————————————————————
  p0_global_port_gateway_port_of_singapore: 'Port de Singapour',
  p0_maritime_route_system_south_china_sea_main_sea_lanes:
    'Principales routes maritimes de la mer de Chine méridionale',

  // — Systèmes : libellés descriptifs, traduits comme tels ——————————————————————
  p0_maritime_energy_trade_digital_system_red_sea_bab_el_mandeb_suez_system:
    'Système mer Rouge – Bab-el-Mandeb – Suez',
  p0_maritime_energy_trade_system_malacca_singapore_strait_system:
    'Système des détroits de Malacca et de Singapour',
  p0_maritime_canal_system_panama_caribbean_interoceanic_system:
    'Système interocéanique Panama-Caraïbes',
  p0_energy_maritime_system_persian_gulf_hormuz_energy_export_system:
    'Système d’exportation énergétique golfe Persique – Ormuz',
  p1_maritime_route_system_eastern_mediterranean_system: 'Système de la Méditerranée orientale',
  p1_multimodal_corridor_system_trans_caspian_middle_corridor: 'Corridor médian trans-caspien',
  p2_submarine_cable_corridor_egypt_red_sea_mediterranean_cable_corridor:
    'Corridor de câbles Égypte – mer Rouge – Méditerranée',

  // — Infrastructure nommée : SUMED est un acronyme (SUez-MEDiterranean) et n'a pas d'exonyme
  //   français ; seul le nom commun se traduit.
  p0_pipeline_bypass_asset_sumed_pipeline: 'Oléoduc SUMED',
};

/**
 * NON RENDUS — candidats en attente de validation humaine.
 *
 * Ces libellés ne se traduisent pas, ils s'arbitrent. « Chokepoint » n'a pas d'équivalent français
 * stable dans notre vocabulaire (goulet ? point de passage obligé ? le mot anglais, que la méthode
 * CVI emploie déjà ?), et « Western Nuclear Fuel Conversion » porte une qualification géopolitique
 * — « occidental » — qui est une position, pas une traduction. Les propositions ci-dessous sont là
 * pour être relues et corrigées, pas pour être affichées : `corridorNameFr` ne les lit pas.
 */
export const CORRIDOR_NAME_FR_PENDING: Record<string, string> = {
  p1_critical_supply_chokepoint_bayan_obo_rare_earths: 'Terres rares de Bayan Obo (Chine)',
  p1_critical_supply_chokepoint_ganzhou_rare_earth_processing:
    'Pôle de traitement des terres rares de Ganzhou (Chine)',
  p3_critical_supply_chokepoint_high_purity_quartz_spruce_pine:
    'Quartz de haute pureté (Spruce Pine, creusets pour silicium)',
  p3_critical_supply_chokepoint_asml_euv_lithography:
    'Monopole de lithographie EUV (ASML, Veldhoven)',
  p1_critical_supply_chokepoint_taiwan_semiconductor_cluster:
    'Pôle de semi-conducteurs de Taïwan (Hsinchu / Tainan)',
  p3_critical_supply_chokepoint_rosatom_uranium_enrichment:
    'Enrichissement d’uranium Rosatom (Russie)',
  p3_critical_supply_chokepoint_urenco_uranium_enrichment:
    'Enrichissement d’uranium Urenco (Almelo / Gronau / Capenhurst)',
  p3_energy_infrastructure_chokepoint_nuclear_fuel_conversion_west:
    'Conversion de combustible nucléaire (Orano / Cameco)',
  p3_infrastructure_chokepoint_swift_financial_messaging:
    'Réseau de messagerie financière SWIFT (La Hulpe)',
  p3_infrastructure_chokepoint_usd_clearing_chips_fedwire:
    'Compensation en dollars (CHIPS / Fedwire)',
  p3_infrastructure_chokepoint_cls_fx_settlement: 'Système de règlement de change CLS',
  p3_infrastructure_chokepoint_euroclear_dtcc_securities_settlement:
    'Règlement-livraison et conservation de titres (Euroclear / DTCC)',
  p3_infrastructure_chokepoint_correspondent_banking_network:
    'Réseau de banques correspondantes (accès nostro/vostro en USD)',
};

/**
 * Le nom à afficher : le français quand nous l'avons décidé, sinon le nom de la base, tel quel.
 *
 * Jamais de traduction à la volée, jamais de nom fabriqué : une absence de la table rend le
 * `canonical_name` anglais, ce qui est honnête — c'est le nom que porte la donnée.
 */
export function corridorNameFr(id: string, canonicalName: string): string {
  return CORRIDOR_NAME_FR[id] ?? canonicalName;
}
