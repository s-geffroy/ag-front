---
title: Mer Rouge / Suez / Bab el-Mandeb
verdict: >-
  Le détroit n’a ni rouvert ni fermé : il s’est dédoublé. Ouvert aux pétroliers
  et aux petits porte-conteneurs, il reste de facto interdit aux mégaporteurs
  Asie–Europe. Le chokepoint est devenu un filtre tarifé par le risque — son
  curseur n’est plus la distance, mais la prime d’assurance et la crédibilité
  d’un cessez-le-feu.
family: maritime
priority: P0
regions:
  - Méditerranée
  - Mer Rouge
  - Corne de l’Afrique
access: public
published: false
corrections: []
updated: 2026-08-10
confidence: moyen
cvi_level: eleve
chokepoint_id: p0_maritime_strait_bab_el_mandeb_strait
map:
  caption: Corridor Méditerranée → Bab el-Mandeb et contournement par le Cap
  waypoints:
    - { label: Port-Saïd, x: 20, y: 10, role: gate, align: right }
    - { label: Canal de Suez, x: 33, y: 24, role: gate, align: right }
    - { label: Bab el-Mandeb, x: 54, y: 44, role: chokepoint, align: right }
    - { label: Aden / Djibouti, x: 72, y: 53, role: hub, align: right }
  bypass:
    label: Route du Cap (~+2 sem.)
    path: M 20 10 C 0 26, 6 60, 38 60 S 66 56, 72 53
sources:
  - label: Suez Canal Authority — Traffic Statistics, Annual Report 2025 (série des transits)
    type: institutionnel
    url: https://www.suezcanal.gov.eg/English/Navigation/Pages/NavigationStatistics.aspx
  - label: >-
      Ahram Online — Recettes du canal de Suez en hausse de 23 % à 4,67 Md$ sur l'exercice 2025/26
      (10 août 2026)
    type: presse_specialisee
    url: https://english.ahram.org.eg/NewsContent/1/1235/571808/Egypt/Urban--Transport/
  - label: >-
      Middle East Observer — Deuxième trimestre 2026 : 3 580 navires (+7,7 %), 169 Mt de tonnage net
      (+18,3 %) (5 août 2026)
    type: presse_specialisee
    url: https://meobserver.news/ports/2026/08/05/suez-canal-recovery-gains-momentum-as-q
  - label: >-
      Lloyd's List Intelligence — Red Sea Brief : 266 transits du 27 juillet au 2 août 2026, retour
      au niveau du début 2026 (données préliminaires)
    type: presse_specialisee
    url: https://www.lloydslistintelligence.com/resources/blog/red-sea-brief-6-august-2026
  - label: >-
      Reuters / Kpler — Comptage journalier des navires marchands à Bab el-Mandeb, 1er-5 août 2026
      (28 → 18 → 1) ; données commerciales, très volatiles
    type: presse_specialisee
  - label: "World Shipping Council — Red Sea: necessary capacity and current transit (janv. 2026)"
    type: rapport_entreprise
    url: https://www.worldshipping.org/
  - label: UNCTAD — Navigating troubled waters + Review of Maritime Transport 2024
    type: institutionnel
    url: https://unctad.org/publication/navigating-troubled-waters-impact-global-trade-disruption-shipping-routes-red-sea-black
  - label: FMI — Red Sea Attacks Disrupt Global Trade / plateforme PortWatch
    type: donnees_ouvertes
    url: https://www.imf.org/en/blogs/articles/2024/03/07/red-sea-attacks-disrupt-global-trade
  - label: Kiel Institute — Kiel Trade Indicator (volume Mer Rouge)
    type: institutionnel
    url: https://www.kielinstitut.de/publications/news/cargo-volume-in-the-red-sea-collapses/
  - label: US EIA — Fewer tankers transit the Red Sea (flux pétrole & GNL, Bab el-Mandeb)
    type: donnees_ouvertes
    url: https://www.eia.gov/todayinenergy/detail.php?id=63446
  - label: Reuters — Red Sea war-risk premiums (déc. 2023 ; juil. 2025)
    type: presse_specialisee
    url: https://www.reuters.com/business/autos-transportation/red-sea-insurance-soars-after-deadly-houthi-ship-attacks-2025-07-10/
  - label: S&P Global (Platts) — Maritime war risk premiums fall in Red Sea (déc. 2025)
    type: presse_specialisee
    url: https://www.spglobal.com/energy/en/news-research/latest-news/shipping/120425-maritime-war-risk-premiums-fall-in-red-sea-rise-in-black-sea-amid-changing-security-dynamics
  - label: Joint War Committee (LMA/IUA) — Listed Areas, Hull War (désignation de zone)
    type: reglementaire
    url: https://lmalloyds.com/committee/joint-war-committee/
  - label: JWC/LMA — Circulaire JWLA-033 (3 mars 2026 ; périmètre & coordonnées de la zone)
    type: reglementaire
    url: https://lmalloyds.com/wp-content/uploads/2026/03/JWLA-033_Iran.pdf
  - label: IUMI via The Maritime Executive — « cover remains affordable » (nuance l’indisponibilité)
    type: source_contradictoire
    url: https://maritime-executive.com/article/as-war-risk-spikes-in-red-sea-iumi-says-cover-remains-affordable
  - label: IUMI — Stats Report 2025 (marché mondial assurance marine 39,92 Md$ ; ocean hull 9,67 Md$, 2024)
    type: institutionnel
    url: https://iumi.com/wp-content/uploads/2025/11/IUMI-Stats-Report-2025.pdf
  - label: US MARAD — Advisory 2026-006 (statut de la menace, chronologie officielle)
    type: reglementaire
    url: https://www.maritime.dot.gov/msci/2026-006-red-sea-bab-el-mandeb-strait-gulf-aden-arabian-sea-and-somali-basin-houthi-attacks
  - label: ACLED — Houthi attacks on commercial vessels (totaux annuels d’incidents)
    type: donnees_ouvertes
    url: https://acleddata.com/report/regional-power-struggles-fuel-simmering-tensions-across-red-sea
  - label: JMIC / Combined Maritime Forces — Monthly Statistics (série mensuelle d’incidents)
    type: institutionnel
    url: https://mscio.eu/media/documents/JMIC_Monthly_Statistics_-_Jan_2026.pdf
  - label: EEAS — EUNAVFOR Aspides, mandat (≈1 960 navires accompagnés / ≈650 protégés ; UNSC 2722)
    type: institutionnel
    url: https://www.eeas.europa.eu/eunavfor-aspides/eunavfor-aspides-mandate-0_en
  - label: CIMSEC — Aspides and the EU’s aspirations for sea control (navires protégés)
    type: analyse_secondaire
    url: https://cimsec.org/with-the-shield-or-on-it-aspides-and-the-eu-aspirations-for-sea-control/
  - label: BIMCO — CONWARTIME (clause war-risk d’affrètement, refus de transit)
    type: reglementaire
    url: https://www.bimco.org/news-insights/bimco-news/2026/03/03-war-risks
  - label: Reuters — Les Houthis annoncent avoir visé deux pétroliers saoudiens (22 juil. 2026)
    type: presse_specialisee
    url: https://www.reuters.com/world/middle-east/yemens-houthis-say-they-targeted-two-saudi-oil-tankers-2026-07-22/
  - label: Xinhua / Saudi Press Agency — Incendie à bord de l’Encelia après attaque (confirmation d’État, 23 juil. 2026)
    type: institutionnel
    url: https://english.news.cn/20260723/f45d031d4a7e48589b0aed3452627f9e/c.html
  - label: Reuters — Le trafic à Bab el-Mandeb ralentit après une frappe houthie (données Kpler, 27 juil. 2026)
    type: presse_specialisee
    url: https://www.reuters.com/world/middle-east/red-sea-shipping-slows-after-houthi-attack-saudi-arabia-data-shows-2026-07-27/
  - label: JMIC — Advisory Note, Update 079 (2 août 2026 ; niveau régional SEVERE, transits AIS en baisse)
    type: institutionnel
    url: https://dbce.org/wp-content/uploads/2026/08/Update-079-JMIC-Advisory-Note-02-August.pdf
---

## Définition du corridor

Système maritime reliant la Méditerranée (canal de Suez, Port-Saïd) à la mer Rouge, au détroit de
**Bab el-Mandeb** et au golfe d’Aden. En temps normal il porte ≈ 15 % du commerce maritime mondial et
≈ 22 % du trafic conteneurisé (2023). Depuis les attaques houthies d’octobre 2023, il n’a pas fermé : il
s’est **scindé en deux corridors** — l’un, régional et pétrolier, largement rétabli ; l’autre, celui des
mégaporteurs Asie–Europe, quasi vidé et durablement dérouté par le Cap. **Les deux segments se
mesurent séparément** : côté énergie, le canal a retrouvé son trafic — recettes de **4,67 Md$** sur
l’exercice 2025/26, en **hausse de 23 %**, et **3 580 navires** au deuxième trimestre 2026 (+7,7 %)
pour **169 Mt** de tonnage net (+18,3 %), avril 2026 marquant la meilleure recette mensuelle depuis
début 2024. Côté conteneurs, **le Cap reste la route par défaut** pour l’Asie–Europe : CMA CGM, après
avoir mené le retour, s’est retiré de la plupart des transits, et Maersk a annulé son service MECL
prévu par la mer Rouge. Le même corridor est donc **rétabli pour les uns et abandonné pour les
autres**.

> **État au 10 août 2026.** L’accalmie est terminée. Depuis le 22 juillet 2026, des **pétroliers sont de
> nouveau attaqués** : l’*Encelia* a pris feu à l’avant — attaque **confirmée par l’agence de presse
> saoudienne**, et non seulement revendiquée —, suivi du *NCC Ghazal* le 28 juillet puis d’un tanker
> contrôlé par Bahri le 4 août. Le JMIC a relevé Bab el-Mandeb à « Substantial » le 23 juillet, puis
> inscrit un niveau régional **SEVERE** le 2 août, avec des transits AIS en baisse.
>
> **Le motif a changé.** Les Houthis n’invoquent plus le lien avec Israël mais une **interdiction de
> navigation visant les navires saoudiens**. Le ciblage est donc plus étroit qu’en 2023-24 : à ce stade,
> il vise un pavillon et un armateur, non le trafic Asie–Europe indistinctement. **Premières mesures,
> à manier avec prudence** : le suivi préliminaire du 27 juillet au 2 août recense **266 transits**,
> soit un retour au niveau du **début 2026** — c’est-à-dire l’effacement du sursaut qu’avait provoqué
> la perturbation d’Ormuz, et non un effondrement supplémentaire. Le comptage journalier à
> Bab el-Mandeb est en revanche **très volatil** : 28 navires le vendredi, 27 le samedi, 18 le
> dimanche, et **un seul** le mercredi 5 août (Kpler). Ces chiffres sont **préliminaires et d’origine
> commerciale** ; ils indiquent une stabilisation basse, pas une tendance établie. Ce qui reste non
> mesuré est l’effet **par segment** : aucun décompte public ne sépare encore le report des
> conteneurs de celui des tankers depuis le 22 juillet.

## Nœuds principaux

- **Port-Saïd** — entrée méditerranéenne du canal.
- **Canal de Suez** — passage sous gouvernance égyptienne ; le **pipeline SUMED** (Aïn Soukhna → Sidi
  Kérir, ≈ 2,5 mb/j) double le canal *pour le brut uniquement* — un contournement partiel distinct de la
  route du Cap.
- **Détroit de Bab el-Mandeb** — le point critique : ~30 km de large, sans alternative physique.
- **Aden / Djibouti** — hubs logistiques et de surveillance navale.

## Flux concernés

L’histoire n’est plus la part de marché, c’est **l’effondrement et le tri**.

- **Transits Suez** (Suez Canal Authority) : **26 434** navires en 2023 (record) → **12 758** en 2025, soit
  **−52 % en nombre** et **−67 % en tonnage net** (chiffres rapportés, source primaire SCA).
- **La bascule est bimodale.** En 2025, les gros porte-conteneurs (≥ 7 500 EVP) ne représentaient plus que
  **5,7 %** de leur niveau 2023 au canal — **9 transits seulement** par Bab el-Mandeb sur toute l’année —
  quand les petits porteurs (< 7 500 EVP) étaient revenus à **91 %** (World Shipping Council, d’après
  Alphaliner). Autrement dit : le corridor a **filtré les mégaporteurs Asie–Europe**, pas les autres.
- **Énergie** : Bab el-Mandeb portait ≈ 12 % du pétrole et ≈ 8 % du GNL maritimes mondiaux ; les flux de
  brut y sont tombés à **≈ 4,0 mb/j** (2024, jan.–août) contre **8,7 mb/j** en 2023, le complément partant
  par le Cap (US EIA / Vortexa — données AIS, possible sous-estimation des tankers « dark »).
- Moins visible mais décisif : les **flux financiers d’assurance** (prime _war-risk_) qui conditionnent la
  viabilité de la route (voir *Vulnérabilités*).

## Vulnérabilités

- **Chokepoint géographique** — pas d’alternative physique à Bab el-Mandeb ; tout report se paie en
  distance, temps et carburant.
- **Menace sécuritaire** — capacité de perturbation démontrée : **~150** attaques contre des navires
  marchands en 2024, retombées à **~7** en 2025 (ACLED) ; au pic (déc. 2023 – printemps 2024), la cadence
  atteignait **~3–4 attaques par semaine**. Sud mer Rouge et golfe d’Aden restent classés « High Risk » par
  le Joint War Committee (circulaire primaire **JWLA-033**, 3 mars 2026 — zone désormais combinée/élargie).
  La menace est **active** : après neuf mois sans attaque suivant le cessez-le-feu d’octobre 2025, les
  frappes ont repris le 22 juillet 2026 contre des pétroliers saoudiens (Reuters ; SPA via Xinhua pour la
  confirmation de l’incendie de l’*Encelia*), et le JMIC a porté le niveau régional à **SEVERE** le 2 août
  (Update 079). L’arsenal (missiles/drones, portée démontrée > 150 milles) est employé, non plus seulement
  disponible.
- **Assurance — la variable pivot.** La surprime _war-risk_ (en % de la valeur coque) a suivi un arc :
  ~0,05 % avant octobre 2023 → **0,3–0,5 %** en décembre 2023 → jusqu’à **~1 %** début 2024 → détente, puis
  **bond à 0,7–1 %** en juillet 2025 après le naufrage de deux navires → **~0,2 %** après le cessez-le-feu
  d’octobre 2025 (Reuters, S&P Global/Platts — valeurs de marché rapportées). La couverture est restée
  **disponible et « abordable »** tout du long (IUMI), ce qui nuance la thèse d’une indisponibilité.
- **Gouvernance** — réponse navale réelle mais **défensive** : l’opération européenne **EUNAVFOR Aspides**
  a **accompagné plus de 1 960 navires marchands** et assuré la **protection rapprochée de plus de 650**
  d’entre eux depuis février 2024 (EEAS), mandat prolongé jusqu’en février 2027 (mandat
  d’accompagnement, non offensif). Sensibilité politique régionale forte (Yémen, Iran, riverains).

## Alternatives / bypass

- **Route du Cap** — contourne l’Afrique : **+10 à 16 jours** selon le tronçon, **+48 %** de distance pour
  un porte-conteneurs, **+38 %** pour un tanker, **~+40 %** de carburant par voyage (Banque mondiale ;
  UNCTAD). Réelle, mais son **revers systémique** est la congestion : les transits conteneurs par le Cap ont
  bondi de **~+191 %** en 2024. Capacité limitée à grande échelle sans tension sur les ports.
- **SUMED** — bypass *du canal* pour le brut (≈ 2,5 mb/j), sans effet pour les conteneurs ni le détroit de
  Bab el-Mandeb lui-même.

## Seuils d’alerte

Chaque seuil lie un indicateur observable à une bascule de régime et à l’action qu’elle implique. Ce sont
des **repères de décision** (analyse), non des mesures. La colonne _Statut_ distingue les repères **adossés
à des sources vérifiées** (≥ 2 sources indépendantes) des **repères historiques ou hypothétiques**.

| Indicateur                                                  | Seuil de déclenchement                                            | Bascule / action                                                        | Statut / fondement                                                                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Transits totaux** Suez (SCA)                              | recul **> 30 %** sur 4 semaines glissantes                       | corridor en tension — suivi rapproché                                    | **Adossé** — creux observé **−52 %** en 2025 vs 2023 (SCA) ; le seuil est un repère de vigilance                        |
| **Gros porteurs déroutés** (≥ 7 500 EVP, Asie–Europe)       | **> 50 %** du tonnage de segment reroutés par le Cap             | rupture de la ligne mainline — le corridor est de facto fermé au segment | **Adossé** — segment à **~94 % dérouté** en 2025 (WSC) ; seuil déjà franchi, à surveiller à la baisse pour le retour     |
| **Prime _war-risk_** (valeur coque)                         | **bond > ×2** sur un événement, ou palier **> 0,5 %** sur 2 sem. | ré-escalade — révision des choix d’armateurs                            | **Adossé** — arc 0,05 → 1 % → 0,2 % documenté (Reuters, S&P) ; recalibré : 1 % n’est qu’un **pic**, pas un régime durable |
| **Incidents sécuritaires** Bab el-Mandeb / golfe d’Aden     | **≥ 1 / semaine** sur 3 semaines consécutives                    | menace persistante (et non ponctuelle)                                  | **Adossé** — série mensuelle primaire JMIC/CMF (pic déc. 2023 **~19/mois ≈ 4,4/sem.**) ; ~150 attaques 2024 (ACLED) ; seuil dépassé au plus fort |
| **Durée de fermeture** ou quasi-fermeture continue          | **> 4 semaines**                                                 | bascule logistique structurelle (scénario « Rupture »)                  | **Repère historique** — précédent de fermeture **8 ans (1967-75)** ; l’épisode actuel est un **déroutage, pas une fermeture** |

> Les seuils croisés (segment mainline dérouté **et** prime en bond sur événement) signalent un basculement
> plus probablement durable que conjoncturel.

## Scénarios

1. **Retour progressif** — *scénario suspendu par la reprise du 22 juillet 2026.* Il supposait une
   accalmie durable ; le compteur des « ~3 mois sans attaque » que les armateurs évoquent avant de
   replanifier est **remis à zéro**. Le scénario redevient plausible si la campagne reste circonscrite au
   pavillon saoudien et si la prime ne se généralise pas — deux conditions à vérifier, non acquises.
2. **Perturbation durable** — le canal reste ouvert mais amputé de sa mainline ; le corridor bimodal
   (tankers + feeders oui, mégaporteurs non) se prolonge, la route du Cap devient le régime dominant du
   conteneur longue distance.
3. **Rupture** — reprise des frappes et retrait de capacité assurantielle ; contrairement aux précédents de
   *fermeture* (1967-75), il s’agirait d’un **verrouillage par le risque**, pas d’un blocage physique.

## Effets systémiques

Le chokepoint irrigue l’économie mondiale, et sa perturbation s’y lit :

- **Ton-milles** maritimes portés à un record (**+6 %** en 2024, UNCTAD) par l’allongement des routes.
- **Prix à la consommation** mondiaux : hausse simulée de **~+0,6 %** attribuée à la crise mer Rouge +
  Panama (UNCTAD, modèle).
- **Égypte** : recettes du canal tombées de **~10,2 Md$ (2023) à ~4 Md$ (2024), −60 %** — un choc
  budgétaire direct (la remontée 2025 des recettes *en livres égyptiennes* reflète la dévaluation, non un
  retour du trafic).

## Niveau de confiance

**Moyen.** Élevé sur la géographie, les nœuds, l’ampleur et la **structure bimodale** du déroutage (recoupé
par SCA, WSC, FMI/PortWatch, Kiel) et sur l’arc des primes jusqu’à fin 2025 (Reuters, S&P).

L’incertitude s’est **déplacée et creusée** depuis le 22 juillet 2026. Elle ne porte plus sur la durabilité
d’une accalmie — celle-ci a cessé — mais sur **l’extension du ciblage** : une campagne visant le seul
pavillon saoudien n’a pas le même effet sur le corridor qu’un retour au ciblage indistinct de 2023-24.
Trois grandeurs manquent pour trancher, et aucune n’est estimée ici : la **prime _war-risk_ post-juillet
2026**, le **report vers le Cap** sur la période, et la **réaction des mégaporteurs**. Variables
politiques, non hydrographiques.

> **Fait / analyse.** Les valeurs chiffrées proviennent des sources citées (faits **rapportés**, non
> reconfirmés par nos soins) ; les seuils et les scénarios relèvent de l’analyse (repères de décision).

> Fiche Atlas — version publique (Basic). Le scoring CVI 0–5 par dimension est réservé à l’offre Standard.
> Géométrie schématique, sans valeur navigationnelle ou juridique.
> Candidat en attente de validation humaine.
