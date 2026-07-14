---
title: Taïwan — semi-conducteurs et routes maritimes
verdict: >-
  Le chokepoint n'est pas ici un détroit, c'est une capacité de production. Taïwan
  concentre l'essentiel des semi-conducteurs les plus avancés du monde et se tient
  sur des routes maritimes majeures d'Asie de l'Est. La vulnérabilité n'est pas de
  volume mais d'irremplaçabilité : une interruption ne se contourne pas par une
  autre route, elle attend des années de reconstruction industrielle.
family: cable_numerique
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
  - label: TSMC — Annual Report / financials (part des nœuds avancés, capacité)
    type: rapport_entreprise
    url: https://investor.tsmc.com/english/annual-reports
  - label: SEMI — World Fab Forecast / market data (capacité de fonderie mondiale)
    type: institutionnel
    url: https://www.semi.org/en/products-services/market-data
  - label: TrendForce — parts de marché fonderie (segment avancé)
    type: analyse_secondaire
    url: https://www.trendforce.com/
  - label: Rhodium Group — coût économique d'un blocus de Taïwan (estimation)
    type: analyse_secondaire
    url: https://rhg.com/
  - label: Données de trafic maritime régional (part de la flotte transitant le détroit)
    type: donnees_ouvertes
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

- **Fabs TSMC** (Hsinchu, Tainan, Kaohsiung) — le cœur du nœud : Taïwan produit ≈ [À SOURCER] % des puces les
  plus avancées (nœuds < 7 nm / < 5 nm), et TSMC concentre ≈ [À SOURCER] % de la fonderie mondiale sous
  contrat. C'est une concentration **sans équivalent** dans aucune autre chaîne critique.
- **Détroit de Taïwan** — rail maritime resserré entre l'île et le continent ; ≈ [À SOURCER] % de la flotte de
  porte-conteneurs mondiale le traverse au fil de l'année.
- **Port de Kaohsiung** — l'un des grands ports conteneurisés d'Asie de l'Est, exutoire logistique de l'île.

## Flux concernés

L'histoire n'est pas le volume, c'est l'**irremplaçabilité à court terme**.

- **Semi-conducteurs avancés** : ≈ [À SOURCER] % de la production mondiale de logique avancée (< 7 nm) sort de
  Taïwan. Pour les nœuds de pointe (< 5 nm / < 3 nm), la concentration est encore plus forte : ≈ [À SOURCER] %.
  Ces composants irriguent l'automobile, l'électronique grand public, les centres de données (IA) et la
  défense.
- **Maritime** : le détroit et les eaux adjacentes portent une part significative du trafic conteneurisé
  intra-asiatique et Asie–Amérique ([À SOURCER] % de la flotte mondiale en transit).
- **Couplage amont** : la chaîne dépend elle-même d'intrants critiques (lithographie EUV **ASML**,
  matériaux) — un point de fragilité en amont des fabs.

## Vulnérabilités

- **Irremplaçabilité à court terme** — la substitution industrielle des composants de pointe est **longue
  (années) et coûteuse** : aucune capacité de fonderie avancée ne peut absorber à court terme une perte de
  l'offre taïwanaise. C'est la vulnérabilité centrale.
- **Effet de cascade** — une rupture d'approvisionnement se propage à l'aval (automobile, électronique,
  défense) avec un multiplicateur économique estimé très supérieur au seul chiffre d'affaires des puces
  ([À SOURCER] — estimations Rhodium/analystes).
- **Couplage risque maritime / risque d'appro** — les mêmes tensions qui menaceraient les fabs affecteraient
  simultanément les routes maritimes : le risque n'est pas diversifiable localement.
- **Dépendance amont ASML/EUV** — la concentration de la lithographie de pointe ajoute un second goulet, en
  amont des fabs taïwanaises.

## Alternatives / bypass

- **Nouvelles fabs hors de Taïwan** — Arizona (**CHIPS Act**, TSMC/Intel/Samsung), Kumamoto (**Japon**,
  TSMC/JASM), Europe (Dresde) : réelles, mais **montée en capacité sur plusieurs années** et souvent sur des
  nœuds moins avancés au départ. Elles réduisent la dépendance à horizon long, pas à court terme.
- **Reroutage maritime à l'est de l'île** — le trafic peut contourner par la façade Pacifique : possible, avec
  surcoût de distance/temps [À SOURCER], mais sans effet sur la dépendance aux composants.
- **Stocks stratégiques de composants** — tampon de court terme (constitution de stocks par les
  industriels/États), efficace quelques mois, pas une substitution.

> Contrairement à un détroit, le **bypass industriel n'existe pas à court terme** : la seule vraie redondance
> se construit sur des années (fabs) ou se tamponne sur des mois (stocks).

## Seuils d'alerte

Chaque seuil lie un indicateur observable à une bascule de régime et à l'action qu'elle implique. Ce sont des
**repères de décision** (analyse), non des mesures. La colonne _Statut_ distingue les repères **adossés à des
sources vérifiées** (≥ 2 sources indépendantes) des **repères historiques ou hypothétiques**.

| Indicateur                                                | Seuil de déclenchement                                | Bascule / action                                                | Statut / fondement                                                                 |
| --------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Activité militaire** (incursions ADIZ, exercices)       | passage d'exercices ponctuels à un **blocus déclaré** | bascule de régime — activation des plans de continuité          | **Repère qualitatif** — série d'incursions à sourcer [À SOURCER]                    |
| **Déclaration de quarantaine / zone d'exclusion**         | annonce officielle de restriction de navigation       | reroutage maritime forcé + choc assurance/appro                 | **Repère hypothétique** — pas de précédent récent ; scénario de rupture            |
| **Délais d'approvisionnement** composants avancés         | allongement **> [À SOURCER]** semaines vs baseline    | tension de chaîne — rationnement, priorisation sectorielle      | **À adosser** — baseline de lead-time à sourcer [À SOURCER]                         |
| **Reroutage / prime d'assurance** trafic détroit          | **bond > ×2** de la prime *war-risk* sur événement    | ré-évaluation des routes par les armateurs                      | **À adosser** — pas de série de prime propre au détroit publiée [À SOURCER]         |
| **Capacité de fonderie hors Taïwan** (nœuds avancés)      | passage sous **[À SOURCER] %** de la demande mondiale | dépendance critique confirmée — priorité aux fabs de substitution | **À adosser** — part de capacité SEMI/TrendForce à sourcer [À SOURCER]              |

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
- **Choc macroéconomique** — les estimations d'un blocus prolongé chiffrent l'impact en points de PIB mondial
  [À SOURCER] (Rhodium/analystes) — un ordre de grandeur qui excède largement la valeur du marché des puces.
- **Course à la relocalisation** — CHIPS Act, subventions japonaises et européennes redessinent lentement la
  carte de la fonderie, sans supprimer la dépendance de court terme.

## Niveau de confiance

**Moyen.** Élevé sur la **nature** de la vulnérabilité (concentration de la fonderie avancée, irremplaçabilité
à court terme, couplage maritime) ; l'incertitude porte sur les **valeurs chiffrées** (parts de marché par
nœud, part de flotte en transit, estimations de choc PIB, délais), à sourcer et recouper sur sources primaires
(TSMC, SEMI, TrendForce, Rhodium) avant toute promotion en fait.

> **Fait / analyse.** La concentration de la fonderie avancée à Taïwan et son irremplaçabilité de court terme
> relèvent du fait établi ; les valeurs chiffrées portent le marqueur `[À SOURCER]` tant qu'elles ne sont pas
> adossées à ≥ 2 sources primaires ; les seuils et scénarios relèvent de l'analyse (repères de décision).

> Fiche Atlas — version publique (Basic). Le scoring CVI 0–5 par dimension est réservé à l'offre Standard.
> Géométrie schématique, sans valeur navigationnelle ou juridique.
> Candidat en attente de validation humaine.
