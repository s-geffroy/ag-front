---
title: Mer Rouge / Suez / Bab el-Mandeb
verdict: >-
  Chokepoint redevenu économique, assurantiel et géopolitique : la crédibilité
  commerciale du corridor ne se mesure plus seulement en distance, mais en prime de
  risque et en disponibilité de contournement.
family: maritime
priority: P0
regions:
  - Méditerranée
  - Mer Rouge
  - Corne de l’Afrique
access: public
published: false
corrections: []
updated: 2026-07-01
confidence: moyen
cvi_level: eleve
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
  - label: Suez Canal Authority — Navigation Statistics (série primaire des transits)
    type: institutionnel
    url: https://www.suezcanal.gov.eg/English/Navigation/Pages/NavigationStatistics.aspx
  - label: UNCTAD — Navigating troubled waters (impact Mer Rouge, fév. 2024)
    type: institutionnel
    url: https://unctad.org/publication/navigating-troubled-waters-impact-global-trade-disruption-shipping-routes-red-sea-black
  - label: FMI — Red Sea Attacks Disrupt Global Trade / plateforme PortWatch (mars 2024)
    type: institutionnel
    url: https://www.imf.org/en/blogs/articles/2024/03/07/red-sea-attacks-disrupt-global-trade
  - label: Kiel Institute — Kiel Trade Indicator 12/23 (volume Mer Rouge)
    type: institutionnel
    url: https://www.kielinstitut.de/publications/news/cargo-volume-in-the-red-sea-collapses/
  - label: Joint War Committee (LMA/IUA) — Listed Areas, Hull War (désignation de zone)
    type: reglementaire
    url: https://lmalloyds.com/committee/joint-war-committee/
  - label: EEAS — Opération EUNAVFOR Aspides + Conseil de l’UE (mandat ; UNSC 2722)
    type: institutionnel
    url: https://www.eeas.europa.eu/eunavfor-aspides/about-operation-eunavfor-aspides_en
  - label: IUMI via The Maritime Executive — « cover remains affordable » (nuance l’indisponibilité)
    type: source_contradictoire
    url: https://maritime-executive.com/article/as-war-risk-spikes-in-red-sea-iumi-says-cover-remains-affordable
  - label: BIMCO — CONWARTIME (clause war-risk d’affrètement, refus de transit)
    type: reglementaire
    url: https://www.bimco.org/contractual-affairs/bimco-clauses/earlier-clauses-list/war_risks_clause_for_time_charters_2013/
---

## Définition du corridor

Système maritime durable reliant la Méditerranée (canal de Suez, Port-Saïd) à la mer
Rouge, au détroit de **Bab el-Mandeb** et au golfe d’Aden. Il porte une part majeure du
commerce conteneurisé Asie–Europe et des flux énergétiques.

## Nœuds principaux

- Port-Saïd — entrée méditerranéenne du canal
- Canal de Suez — passage sous gouvernance égyptienne
- Détroit de Bab el-Mandeb — point critique
- Aden / Djibouti — hubs logistiques et de surveillance

## Flux concernés

Conteneurs (commerce Asie–Europe), pétrole brut et GNL, et — moins visible — les
**flux financiers** d’assurance maritime qui conditionnent la viabilité de la route. Le corridor porte
normalement ≈ 15 % du commerce maritime mondial et ≈ 22 % du trafic conteneurisé (2023, FMI / UNCTAD —
chiffres rapportés).

## Vulnérabilités

- **Chokepoint géographique** : pas d’alternative physique sans surcoût majeur.
- **Menace sécuritaire** : capacité de perturbation démontrée (attaques sur navires marchands depuis
  octobre 2023 ; Sud Mer Rouge et golfe d’Aden classés « High Risk » par le Joint War Committee).
- **Assurance** : primes _war-risk_ volatiles ; disponibilité de couverture **débattue** — l’IUMI la dit
  « abordable » et maintenue (Suez comme Cap), ce qui nuance la thèse d’indisponibilité.
- **Gouvernance** : sensibilité politique régionale.

## Alternatives / bypass

La **route du Cap** contourne l’Afrique : environ deux semaines et un surcoût important
par navire. Réelle, mais limitée en capacité à grande échelle.

## Seuils d’alerte

Chaque seuil lie un indicateur observable à une bascule de régime et à l’action qu’elle implique. Les
seuils sont des **repères de décision** (analyse), non des mesures : la colonne _Statut_ distingue ceux
**adossés à des sources vérifiées** (phénomène recoupé par ≥ 2 sources indépendantes) des **repères
encore hypothétiques**, à valider avant d’être opposables.

| Indicateur                                              | Seuil de déclenchement                                    | Bascule / action                                                    | Statut / fondement                                                                                                    |
| ------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Transits totaux** Suez (Suez Canal Authority)         | recul **> 30 %** sur 4 semaines glissantes                | corridor en tension — suivi rapproché                               | **Adossé** — creux observé ≈ −50 % (FMI/PortWatch, Kiel, gCaptain) ; le seuil est un repère de vigilance             |
| **Part déroutée** vers le Cap, conteneurs Asie–Europe   | **> 50 %** du tonnage                                     | la route du Cap devient le régime dominant — congestion attendue    | **Partiel** — report vers le Cap **+74 %** documenté (FMI/PortWatch) ; la valeur de bascule reste un repère           |
| **Prime _war-risk_** (valeur coque)                     | **> 1 %** durable sur 2 semaines, ou retrait de capacité  | viabilité commerciale dégradée — révision des choix d’armateurs     | **Niveau adossé** (fourchette 0,01 → 1 %, IUMI) ; **trajectoire non vérifiée** (sources spécialisées bloquées)        |
| **Incidents sécuritaires** Bab el-Mandeb / golfe d’Aden | **≥ 1 / semaine** sur 3 semaines consécutives             | menace persistante (et non ponctuelle)                              | **Hypothèse — non sourcé** : pas de série d’incidents publique recoupée (attaques attestées depuis oct. 2023, EEAS)   |
| **Durée de fermeture** ou quasi-fermeture continue      | **> 4 semaines**                                          | bascule logistique structurelle (scénario « Perturbation durable ») | **Hypothèse — non sourcé** : aucune donnée de durée disponible                                                        |

> Les seuils croisés (déroutement élevé **et** prime au-delà du repère) signalent un basculement
> plus probablement durable que conjoncturel.

## Scénarios

1. **Stabilisation** — apaisement régional, retour progressif vers Suez.
2. **Perturbation durable** — Suez reste viable mais affaibli ; ~30 % de déroutement.
3. **Rupture** — fermeture longue, réorganisation logistique coûteuse.

## Niveau de confiance

**Moyen.** Élevé sur la géographie, les nœuds et l’ampleur du déroutement (recoupé par trois sources
indépendantes : FMI/PortWatch, Kiel, gCaptain) ; **faible sur la trajectoire des primes** d’assurance
(sources spécialisées bloquées, non vérifiées) et sur la durée d’une éventuelle stabilisation.

> **Fait / analyse.** Les valeurs chiffrées proviennent des sources citées (faits rapportés, non
> reconfirmés par nos soins) ; les seuils et les scénarios relèvent de l’analyse (repères de décision).

> Fiche Atlas — version publique (Basic). Le scoring CVI 0–5 par dimension est réservé à
> l’offre Standard. Géométrie schématique, sans valeur navigationnelle ou juridique.
> Candidat en attente de validation humaine.
