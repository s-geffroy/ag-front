---
title: Détroit de Malacca
verdict: >-
  Le verrou énergétique de l'Asie de l'Est. Un couloir de ~800 km qui se rétrécit
  à quelques kilomètres devant Singapour, par lequel transite l'essentiel du brut
  importé par la Chine, le Japon et la Corée — sans alternative de capacité
  équivalente. La vulnérabilité n'y est pas un événement mais une géographie :
  tout report par Lombok ou Sunda se paie en distance, en temps et en tirant d'eau.
family: chokepoint
priority: P0
regions:
  - Asie du Sud-Est
  - Océan Indien
access: public
published: false
corrections: []
updated: 2026-07-14
confidence: moyen
cvi_level: eleve
map:
  caption: Océan Indien → détroit de Malacca → mer de Chine méridionale, contournement par Lombok
  waypoints:
    - { label: Mer d'Andaman, x: 12, y: 20, role: gate, align: right }
    - { label: One Fathom Bank, x: 30, y: 33, role: gate, align: right }
    - { label: Phillips Channel / Singapour, x: 48, y: 46, role: chokepoint, align: right }
    - { label: Mer de Chine méridionale, x: 70, y: 40, role: hub, align: right }
  bypass:
    label: Détroit de Lombok (~+2–3 j)
    path: M 30 33 C 34 60, 60 62, 72 50
sources:
  - label: US EIA — World Oil Transit Chokepoints (Malacca, volumes de brut & produits)
    type: institutionnel
    url: https://www.eia.gov/international/analysis/special-topics/World_Oil_Transit_Chokepoints
  - label: UNCTAD — Review of Maritime Transport 2024 (trafic conteneurisé, routes)
    type: institutionnel
    url: https://unctad.org/publication/review-maritime-transport-2024
  - label: MPA Singapore — Port Statistics (débit du hub de Singapour)
    type: donnees_ouvertes
    url: https://www.mpa.gov.sg/port-marine-ops/port-statistics
  - label: ReCAAP ISC — rapports d'incidents de piraterie/vol à main armée (Asie)
    type: institutionnel
    url: https://www.recaap.org/reports
  - label: Analyses sectorielles shipping (capacité des routes alternatives)
    type: analyse_secondaire
---

## Définition du corridor

Le détroit de **Malacca** relie l'**océan Indien** (mer d'Andaman) à la **mer de Chine méridionale**, entre
la péninsule malaise et Sumatra. Long d'environ 800 km, il se resserre à son extrémité sud, au **Phillips
Channel** près de Singapour, à quelques kilomètres de large. C'est le passage le plus court entre les
fournisseurs d'énergie du golfe Persique et d'Afrique et les grands consommateurs d'Asie de l'Est — et l'un
des plus fréquentés au monde.

> **Périmètre volontairement restreint : énergie, conteneurs, alternatives.** On évite ici de dériver vers un
> commentaire général sur la rivalité sino-américaine ou la mer de Chine méridionale : la fiche traite le
> détroit comme **chokepoint de flux**, pas comme théâtre stratégique.

## Nœuds principaux

- **Phillips Channel / Singapour** — le point critique : chenal le plus étroit du détroit, doublé du premier
  hub de transbordement mondial. La contrainte physique y devient une contrainte de **tirant d'eau** (norme
  « Malaccamax » ≈ [À SOURCER] m), qui plafonne la taille des navires et pousse les plus gros pétroliers vers
  d'autres routes.
- **One Fathom Bank** — haut-fond balisé sur l'axe, contraignant le rail montant/descendant.
- **Port Klang / Singapour** — hubs logistiques et de soutage ; Singapour concentre une part majeure du
  transbordement conteneurisé régional ([À SOURCER] EVP/an).

## Flux concernés

L'enjeu de Malacca est une **concentration** : beaucoup de flux vitaux sur un seul passage étroit.

- **Énergie (brut & produits)** : Malacca porte ≈ [À SOURCER] Mb/j de pétrole (US EIA), soit le **deuxième
  chokepoint pétrolier mondial** après Ormuz. L'essentiel alimente la Chine, le Japon et la Corée du Sud :
  ≈ [À SOURCER] % du brut importé par la Chine y transite.
- **GNL** : ≈ [À SOURCER] % du GNL maritime mondial emprunte le détroit vers les importateurs d'Asie de l'Est.
- **Conteneurs** : trafic conteneurisé intense adossé au hub de Singapour (≈ [À SOURCER] % du commerce
  conteneurisé mondial sur l'axe Asie–Europe et intra-asiatique).
- **Volume de navires** : ≈ [À SOURCER] transits/an, l'un des plus élevés au monde.

## Vulnérabilités

- **Chokepoint géographique** — pas d'alternative de capacité équivalente. La largeur et le tirant d'eau
  limités concentrent le risque sur un couloir unique ; un incident majeur (échouement, collision, blocage)
  à Phillips Channel se propage immédiatement à l'ensemble du rail.
- **Dépendance asymétrique** — la « dépendance de Malacca » (*Malacca dilemma*) est structurelle pour l'Asie
  de l'Est : une part dominante de son approvisionnement énergétique tient à ce seul passage, sans stock ni
  route de substitution capables d'absorber une interruption prolongée.
- **Menace sécuritaire résiduelle** — la piraterie et le vol à main armée persistent à bas bruit (ReCAAP) :
  ≈ [À SOURCER] incidents/an, en général de faible intensité mais concentrés dans les zones de mouillage et
  d'attente. Le risque n'est pas de fermeture, mais de coût et d'assurance.
- **Congestion** — la densité de trafic et la contrainte de tirant d'eau créent une sensibilité aux temps
  d'attente et aux files de mouillage, surtout autour de Singapour.

## Alternatives / bypass

- **Détroit de Lombok (+ Makassar)** — la principale alternative : plus profond (accueille les plus gros
  navires) mais **plus long de ≈ [À SOURCER] jours / [À SOURCER] milles**, avec une capacité et une
  infrastructure de soutage moindres. Réel, mais coûteux à grande échelle.
- **Détroit de la Sonde (Sunda)** — étroit et peu profond, marginal pour les grands navires.
- **Pipelines Chine–Myanmar** — le pipeline pétrole/gaz Kyaukphyu → Yunnan contourne *partiellement* Malacca
  pour une fraction du brut chinois (≈ [À SOURCER] Mb/j de capacité nominale), sans effet sur les conteneurs
  ni sur les flux japonais/coréens.
- **Canal de Kra (isthme thaïlandais)** — projet **récurrent mais non réalisé** : il court-circuiterait
  Malacca sur le papier, mais reste hypothétique (coût, souveraineté, environnement). Aucune capacité réelle
  à ce jour.

> Le report par Lombok/Sunda est **physiquement possible mais non substituable en capacité** : il déplace le
> problème vers la distance et le carburant, pas vers une redondance véritable.

## Seuils d'alerte

Chaque seuil lie un indicateur observable à une bascule de régime et à l'action qu'elle implique. Ce sont des
**repères de décision** (analyse), non des mesures. La colonne _Statut_ distingue les repères **adossés à des
sources vérifiées** (≥ 2 sources indépendantes) des **repères historiques ou hypothétiques**.

| Indicateur                                              | Seuil de déclenchement                                  | Bascule / action                                               | Statut / fondement                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Volume de transits** (navires/j)                     | recul **> 20 %** sur 4 semaines glissantes              | corridor en tension — suivi rapproché                          | **À adosser** — dépend d'une série AIS/portuaire à sourcer [À SOURCER]              |
| **Flux de brut** via Malacca (Mb/j)                    | recul soutenu **> 15 %** vs baseline                    | report vers Lombok/pipelines — hausse des coûts d'appro        | **À adosser** — baseline EIA à confirmer [À SOURCER]                                |
| **Incidents sécuritaires** (piraterie/vol) — zone sud  | **≥ 1 / semaine** sur 3 semaines consécutives           | menace persistante (et non ponctuelle) — prime d'assurance     | **À adosser** — série ReCAAP à extraire [À SOURCER]                                 |
| **Temps d'attente / congestion** autour de Singapour   | file de mouillage **> [À SOURCER]** jours               | tension logistique — répercussion sur les chaînes aval         | **Repère opérationnel** — seuil à calibrer sur données portuaires MPA               |
| **Blocage physique** (échouement/collision) à Phillips | interruption continue **> 72 h**                        | bascule logistique — reroutage d'urgence par Lombok            | **Repère hypothétique** — pas de précédent de blocage prolongé documenté récemment  |

> Les seuils croisés (chute de volume **et** hausse d'incidents) signalent un basculement plus probablement
> durable que conjoncturel.

## Scénarios

1. **Statu quo sous tension** — le détroit reste ouvert et saturé ; la vulnérabilité demeure latente, gérée
   par la redondance des stocks stratégiques des importateurs plutôt que par une route alternative.
2. **Perturbation ponctuelle** — incident (blocage, pic de piraterie, tension régionale) provoquant un
   reroutage partiel par Lombok, une hausse des primes et des surcoûts de fret temporaires, sans rupture.
3. **Contrainte durable** — interruption ou insécurité prolongée forçant un basculement structurel vers
   Lombok et les pipelines ; le plafond de capacité des alternatives devient le facteur limitant de
   l'approvisionnement énergétique est-asiatique.

## Effets systémiques

- **Sécurité énergétique de l'Asie de l'Est** — la « dépendance de Malacca » est un déterminant de la
  politique de stocks stratégiques et de diversification (pipelines, routes arctiques) de la Chine, du Japon
  et de la Corée.
- **Coûts de fret et d'assurance** — toute dégradation du passage se répercute d'abord en prime et en délai,
  avant tout effet de volume.
- **Couplage régional** — Singapour comme hub de transbordement lie la fluidité de Malacca à la performance
  d'une part importante du commerce conteneurisé asiatique.

## Niveau de confiance

**Moyen.** Élevé sur la géographie, les nœuds et la **nature** de la dépendance (chokepoint énergétique sans
substitut de capacité) ; l'incertitude porte sur les **valeurs chiffrées** (parts de brut/GNL, volumes de
transit, distances des alternatives), encore à sourcer et à recouper sur sources primaires (EIA, UNCTAD, MPA,
ReCAAP) avant toute promotion en fait.

> **Fait / analyse.** La géographie et la structure de dépendance relèvent du fait établi ; les valeurs
> chiffrées portent le marqueur `[À SOURCER]` tant qu'elles ne sont pas adossées à ≥ 2 sources primaires ; les
> seuils et scénarios relèvent de l'analyse (repères de décision).

> Fiche Atlas — version publique (Basic). Le scoring CVI 0–5 par dimension est réservé à l'offre Standard.
> Géométrie schématique, sans valeur navigationnelle ou juridique.
> Candidat en attente de validation humaine.
