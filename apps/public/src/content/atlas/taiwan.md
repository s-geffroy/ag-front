---
title: Taïwan — semi-conducteurs et routes maritimes
verdict: >-
  Le chokepoint n'est pas ici un détroit, c'est une capacité de production. Taïwan
  concentre l'essentiel des semi-conducteurs les plus avancés du monde et se tient
  sur des routes maritimes majeures d'Asie de l'Est. La vulnérabilité n'est pas de
  volume mais d'irremplaçabilité : une interruption ne se contourne pas par une
  autre route, elle attend des années de reconstruction industrielle.
family: semi_conducteurs
priority: P0
regions:
  - Asie de l'Est
access: public
published: false
corrections: []
updated: 2026-07-14
confidence: moyen
cvi_level: critique
map:
  caption: Détroit de Taïwan et contournement maritime par l'est de l'île (façade Pacifique)
  waypoints:
    - { label: Kaohsiung, x: 30, y: 46, role: hub, align: right }
    - { label: Détroit de Taïwan, x: 44, y: 34, role: chokepoint, align: right }
    - { label: Keelung / Nord, x: 52, y: 22, role: gate, align: right }
    - { label: Mer de Chine orientale, x: 72, y: 18, role: hub, align: right }
  bypass:
    label: Contournement Est (Pacifique)
    path: M 30 46 C 60 56, 74 44, 66 24
sources:
  - label: "TSMC — Q4 2024 Earnings Conference Call (16 janv. 2025 ; ventilation revenus par nœud)"
    type: rapport_entreprise
    url: https://investor.tsmc.com/english/quarterly-results/2024/q4
  - label: TrendForce — part de marché fonderie & capacité par nœud avancé (2023–2025)
    type: analyse_secondaire
    url: https://www.trendforce.com/presscenter/news/
  - label: "Focus Taiwan — TSMC market share rises to 67.6% in Q1 (TrendForce, 2025)"
    type: presse_specialisee
    url: https://focustaiwan.tw/business/202506050014
  - label: "Bloomberg — trafic du détroit de Taïwan (données AIS, 2022 ; ~48% de la flotte conteneurs)"
    type: presse_specialisee
    url: https://www.bloomberg.com/news/articles/2022-08-03/taiwan-tensions-raise-risks-in-one-of-busiest-shipping-lanes
  - label: DG Trésor — Le leadership de Taïwan dans l'industrie des semi-conducteurs (Kaohsiung, rangs portuaires)
    type: institutionnel
    url: https://www.tresor.economie.gouv.fr/Pays/TW
  - label: "HCSS — Taiwan: The Cost of Conflict (2024 ; compilation Rhodium/CSIS/Bloomberg)"
    type: analyse_secondaire
    url: https://hcss.nl/report/taiwan-the-cost-of-conflict/
  - label: Global Market Insights — Extreme Ultraviolet Lithography Market (marché EUV, 2024)
    type: analyse_secondaire
    url: https://www.gminsights.com/industry-analysis/extreme-ultraviolet-lithography-market
  - label: "Bloomberg Economics — coût d'un conflit à Taïwan (2024 ; ~10 000 Md$ ≈ 10 % du PIB mondial, scénario guerre)"
    type: analyse_secondaire
  - label: "ASPI — A blockade of Taiwan would cripple China's economy (route Est plus exposée aux typhons)"
    type: analyse_secondaire
---

## Définition du nœud

Taïwan combine trois choses rarement réunies : un **rôle dominant dans les semi-conducteurs avancés**, une
**position sur des routes maritimes majeures** d'Asie de l'Est (détroit de Taïwan, façade Pacifique), et un
**environnement de friction** en mer de Chine. La fiche traite Taïwan comme **double chokepoint** — un nœud de
production irremplaçable à court terme *et* un passage maritime — sans dériver vers le commentaire
géopolitique général.

> **Cadrage strict : nœud critique composants + maritime.** L'analyse porte sur la dépendance de flux (puces,
> navires), pas sur le scénario militaire en tant que tel — celui-ci n'entre que comme variable des seuils.

## Nœuds principaux

- **Fabs TSMC** (Hsinchu, Tainan, Kaohsiung) — le cœur du nœud. TSMC détient **67,6 %** du marché mondial de
  la fonderie *pure-play* au T1 2025 (TrendForce, en revenus — estimation). À l'échelle du pays, Taïwan
  concentre ≈ **68 %** de la capacité mondiale de fonderie sur les nœuds avancés (16/14 nm et plus fins) et
  ≈ **80 %** de la capacité des procédés « génération EUV » (7 nm et au-delà) en 2023 (TrendForce — estimations
  de **capacité installée**, non de wafers produits).
- **Détroit de Taïwan** — rail maritime resserré entre l'île et le continent : ≈ **48 %** des **5 400**
  porte-conteneurs opérationnels dans le monde l'ont traversé sur janvier–juillet 2022 ; **88 %** du décile des
  plus gros porteurs (Bloomberg, données AIS — estimation).
- **Port de Kaohsiung** — **9,3 M EVP** manutentionnés en 2023, ≈ 17ᵉ rang mondial (statistiques portuaires
  taïwanaises, via DG Trésor — fait mesuré).

## Flux concernés

L'histoire n'est pas le volume, c'est l'**irremplaçabilité à court terme**.

- **Semi-conducteurs avancés** — la ventilation de revenus de TSMC au T4 2024 donne **3 nm : 26 %**,
  **5 nm : 34 %**, **7 nm : 14 %** (soit **74 %** du CA wafers sur ces trois nœuds) (TSMC, earnings call du
  16 janvier 2025 — **fait** interne à TSMC). TSMC détiendrait par ailleurs **70–80 %** du marché 5 nm et
  **> 90 %** du marché 3 nm (TrendForce, 2023–2024 — estimation par nœud). Comme ces nœuds sont produits à
  Taïwan, la littérature spécialisée en **déduit** que l'île concentre ≈ **80–90 %** de la production mondiale
  de logique < 5 nm et **> 90 %** du < 3 nm — **déduction** (TSMC + TrendForce), **non une statistique
  officielle** : aucune source primaire ne ventile la production < 7 / 5 / 3 nm **par pays**. Contre-argument à
  garder : cette part est un **plafond**, pas 100 % — **Samsung** produit du 3 nm (GAA) en **Corée** depuis
  2022 et **Intel** monte sa génération 18A aux **États-Unis**, si bien qu'une fraction non-taïwanaise existe
  même au nœud de pointe. La concentration est écrasante, non absolue.
- **Maritime** — le détroit porte une part majeure du trafic conteneurisé (≈ 48 % de la flotte mondiale en
  transit sur 2022, Bloomberg/AIS), reliant Asie de l'Est, Amérique et Europe.
- **Couplage amont** — la chaîne dépend d'intrants critiques, au premier rang desquels la **lithographie EUV
  d'ASML** (voir *Vulnérabilités*).

## Vulnérabilités

- **Irremplaçabilité à court terme** — la substitution industrielle des composants de pointe est **longue
  (années) et coûteuse** : les fabs de substitution en cours l'illustrent — **TSMC Arizona** (annoncé 2020,
  première production ≈ 2024-2025) et **Kumamoto / JASM** au Japon (chantier 2022, production fin 2024) ont
  demandé **3 à 5 ans**, souvent sur des nœuds au départ moins avancés que la pointe taïwanaise. Aucune
  capacité de fonderie avancée ne peut donc absorber à court terme une perte de l'offre taïwanaise. C'est la
  vulnérabilité centrale.
- **Effet de cascade** — une rupture se propage à l'aval (automobile, électronique, défense). **Aucune
  estimation publique unique ne fait consensus** ; l'ancrage le plus cité est **Bloomberg Economics (2024)**,
  qui chiffre une **guerre** autour de Taïwan à ≈ **10 000 Md$**, soit ≈ **10 % du PIB mondial** — un
  **blocus** partiel étant nettement moindre. Les compilations de think tanks (HCSS 2024, d'après
  Rhodium/CSIS/Bloomberg) convergent sur des ordres de grandeur de **plusieurs milliers de milliards** et
  **plusieurs points de PIB mondial**. Ce sont des **estimations scénarisées**, très dépendantes des
  hypothèses (durée, périmètre, sanctions), non des faits.
- **Couplage risque maritime / risque d'appro** — les mêmes tensions menaceraient simultanément les fabs et
  les routes maritimes : le risque n'est pas diversifiable localement.
- **Dépendance amont ASML / EUV** — la lithographie EUV de production est un **monopole de fait** (ASML seul
  fournisseur de machines EUV opérationnelles ; marché EUV estimé à **11,4 Md$** en 2024, Global Market
  Insights). Or ≈ 80 % de la capacité « génération EUV » est à Taïwan (TrendForce) : l'amont européen (ASML) et
  le chokepoint taïwanais sont directement liés.

## Alternatives / bypass

- **Nouvelles fabs hors de Taïwan** — la capacité de fonderie avancée située **hors de Taïwan** est passée de
  ≈ **32 %** en 2023 à une projection de ≈ **59 %** en 2027 (part de Taïwan **68 % → 41 %**), sous l'effet du
  **CHIPS Act** (Arizona : TSMC/Intel/Samsung) et des plans japonais (Kumamoto/JASM) (TrendForce —
  **projection** de capacité installée, non de production, et **sans ventilation Arizona vs Kumamoto**
  publiée). La montée en capacité s'étale sur **plusieurs années** : elle réduit la dépendance à horizon long,
  pas à court terme.
- **Reroutage maritime à l'est de l'île** — le détroit est la **route la plus directe** ; contourner par la
  façade Pacifique (Luzon Strait) n'ajoute qu'une **distance limitée** pour la plupart des lignes, mais expose
  davantage aux **typhons** (ASPI) : le coût du reroutage est d'abord un coût de **risque et de météo**, pas de
  kilométrage. **Le surcoût chiffré agrégé n'est pas documenté publiquement** : aucune source primaire (Lloyd's
  List, Clarksons, BIMCO) ne publie un « +X % de distance / +Y jours » — donnée propriétaire des
  armateurs/assureurs.
- **Stocks stratégiques de composants** — tampon de court terme (quelques mois), pas une substitution.

> Contrairement à un détroit, le **bypass industriel n'existe pas à court terme** : la seule vraie redondance
> se construit sur des années (fabs) ou se tamponne sur des mois (stocks).

## Seuils d'alerte

Chaque seuil lie un indicateur observable à une bascule de régime et à l'action qu'elle implique. Ce sont des
**repères de décision** (analyse), non des mesures. La colonne _Statut_ distingue les repères **adossés à des
sources vérifiées** (≥ 2 sources indépendantes) des **repères historiques ou hypothétiques**.

| Indicateur                                                | Seuil de déclenchement                                | Bascule / action                                                | Statut / fondement                                                                                                   |
| --------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Activité militaire** (incursions ADIZ, exercices)       | passage d'exercices ponctuels à un **blocus déclaré** | bascule de régime — activation des plans de continuité          | **Repère qualitatif** — série d'incursions non consolidée en source primaire unique                                 |
| **Déclaration de quarantaine / zone d'exclusion**         | annonce officielle de restriction de navigation       | reroutage maritime forcé + choc assurance/appro                 | **Repère hypothétique** — pas de précédent récent ; scénario de rupture                                             |
| **Délais d'approvisionnement** composants avancés         | dépassement durable de la baseline **8–12 sem.**      | tension de chaîne — rationnement, priorisation sectorielle      | **Adossé** — baseline 8–12 sem. ; pic 2021–22 à **46–47 sem.** (extrêmes 70–130) puis retour 2023 (BFM, Groupe Alpha, S&P/Supplyframe) |
| **Reroutage / prime d'assurance** trafic détroit          | **bond > ×2** de la prime *war-risk* sur événement    | ré-évaluation des routes par les armateurs                      | **À adosser** — pas de série de prime propre au détroit publiée                                                      |
| **Capacité de fonderie hors Taïwan** (nœuds avancés)      | recul du rythme sous la trajectoire **32 % → 59 %**   | dépendance critique prolongée — priorité aux fabs de substitution | **Adossé (projection)** — 32 % (2023) → 59 % (2027) attendus (TrendForce) ; à suivre contre le calendrier réel      |

> Les seuils croisés (montée militaire **et** allongement des délais composants) signalent un basculement plus
> probablement durable que conjoncturel.

## Scénarios

1. **Statu quo tendu** — friction militaire récurrente sans rupture ; la dépendance reste gérée par la
   diversification lente (fabs Arizona/Japon) et les stocks, la prime de risque restant contenue.
2. **Rupture d'approvisionnement** — interruption partielle (quarantaine, incident, tension) provoquant un
   choc de délais sur les composants avancés et une cascade sur l'automobile/l'électronique, le temps que les
   stocks et les fabs alternatives absorbent — insuffisamment à court terme.
3. **Quarantaine / blocus** — restriction maritime prolongée combinant choc composants *et* reroutage : le
   scénario de plus fort impact systémique, où l'irremplaçabilité industrielle devient le facteur dominant.

## Effets systémiques

- **Chaînes industrielles européennes** — l'exposition indirecte (via l'automobile et l'électronique) fait de
  Taïwan une **vulnérabilité systémique** pour l'industrie européenne, au-delà de tout achat direct de puces.
- **Choc macroéconomique** — les estimations d'un blocus prolongé se comptent en **milliers de milliards de
  dollars** / **points de PIB mondial**, sans chiffre unique consensuel (voir *Vulnérabilités*) : ordres de
  grandeur scénarisés, non des faits.
- **Course à la relocalisation** — CHIPS Act, subventions japonaises et européennes redessinent lentement la
  carte de la fonderie (part hors Taïwan 32 % → ~59 % projetés en 2027), sans supprimer la dépendance de court
  terme.

## Niveau de confiance

**Moyen.** Élevé sur la **nature** de la vulnérabilité (concentration de la fonderie avancée, irremplaçabilité
à court terme, couplage maritime et amont ASML/EUV) et sur plusieurs chiffres **de source primaire** (mix de
revenus TSMC T4 2024 ; débit de Kaohsiung). L'incertitude porte sur la **production < 5 / < 3 nm par pays**
(une **déduction**, non une statistique officielle), sur le **coût d'un blocus** (fourchettes scénarisées) et
sur le **surcoût de reroutage** (non documenté publiquement).

> **Fait / analyse.** Les valeurs de source primaire (mix TSMC, EVP Kaohsiung, marché EUV) sont des **faits
> rapportés** (non reconfirmés par nos soins) ; les parts de capacité/marché TrendForce sont des
> **estimations** ; la part de production par pays est une **déduction** explicite ; les seuils et scénarios
> relèvent de l'**analyse**. Ce qui n'est pas documenté publiquement est signalé comme tel.

> Fiche Atlas — version publique (Basic). Le scoring CVI 0–5 par dimension est réservé à l'offre Standard.
> Géométrie schématique, sans valeur navigationnelle ou juridique.
> Candidat en attente de validation humaine.
