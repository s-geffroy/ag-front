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
updated: 2026-06-13
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
  - label: Suez Canal Authority — statistiques de transit
    type: institutionnel
  - label: UNCTAD — Review of Maritime Transport
    type: institutionnel
  - label: Lloyd’s List
    type: presse_specialisee
  - label: Suivi AIS (trafic navires)
    type: donnees_ouvertes
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
**flux financiers** d’assurance maritime qui conditionnent la viabilité de la route.

## Vulnérabilités

- **Chokepoint géographique** : pas d’alternative physique sans surcoût majeur.
- **Menace sécuritaire** : capacité de perturbation démontrée sur la zone.
- **Assurance** : primes volatiles, possible indisponibilité de couverture.
- **Gouvernance** : sensibilité politique régionale.

## Alternatives / bypass

La **route du Cap** contourne l’Afrique : environ deux semaines et un surcoût important
par navire. Réelle, mais limitée en capacité à grande échelle.

## Seuils d’alerte

Seuils de surveillance **proposés** (candidats en attente de validation) : chacun lie un
indicateur observable à une bascule de régime et à l’action qu’elle implique. Les valeurs sont
des repères de déclenchement, non des mesures validées.

| Indicateur (source)                                         | Seuil de déclenchement                                                                     | Bascule / action                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| **Transits quotidiens** Suez (Suez Canal Authority / AIS)   | recul **> 30 %** sur 4 semaines glissantes                                                 | corridor en tension — suivi rapproché                               |
| **Part déroutée** vers le Cap, conteneurs Asie–Europe (AIS) | **> 50 %** du tonnage                                                                      | la route du Cap devient le régime dominant — congestion attendue    |
| **Prime de risque de guerre** (war-risk, Lloyd’s List)      | franchissement durable **> 1 %** de la valeur coque sur 2 semaines, ou retrait de capacité | viabilité commerciale dégradée — révision des choix d’armateurs     |
| **Incidents sécuritaires** Bab el-Mandeb / golfe d’Aden     | **≥ 1 / semaine** sur 3 semaines consécutives                                              | menace persistante (et non ponctuelle)                              |
| **Durée de fermeture** ou quasi-fermeture continue          | **> 4 semaines**                                                                           | bascule logistique structurelle (scénario « Perturbation durable ») |

> Les seuils croisés (déroutement élevé **et** prime au-delà du repère) signalent un basculement
> plus probablement durable que conjoncturel.

## Scénarios

1. **Stabilisation** — apaisement régional, retour progressif vers Suez.
2. **Perturbation durable** — Suez reste viable mais affaibli ; ~30 % de déroutement.
3. **Rupture** — fermeture longue, réorganisation logistique coûteuse.

## Niveau de confiance

**Moyen.** Élevé sur la géographie, les nœuds et les acteurs ; plus faible sur la
trajectoire des primes et la durée d’une éventuelle stabilisation.

> Fiche Atlas — version publique (Basic). Le scoring CVI 0–5 par dimension est réservé à
> l’offre Standard. Géométrie schématique, sans valeur navigationnelle ou juridique.
> Candidat en attente de validation humaine.
