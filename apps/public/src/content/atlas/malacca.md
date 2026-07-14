---
title: Détroit de Malacca
verdict: >-
  Le verrou énergétique de l'Asie de l'Est. Premier chokepoint pétrolier mondial
  en volume, un couloir qui se rétrécit à quelques kilomètres devant Singapour et
  par lequel passe l'essentiel du brut importé par la Chine — sans alternative de
  capacité équivalente. La vulnérabilité n'y est pas un événement mais une
  géographie : tout report par Lombok se paie en distance, en temps et en tirant
  d'eau.
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
    label: Détroit de Lombok (~+1–4 j)
    path: M 30 33 C 34 60, 60 62, 72 50
sources:
  - label: "US EIA — World Oil Transit Chokepoints (Malacca : 23,2 Mb/j, 1er semestre 2025 ; part Chine 48 %)"
    type: institutionnel
    url: https://www.eia.gov/international/analysis/special-topics/World_Oil_Transit_Chokepoints
  - label: "MPA Singapore — Annual Report 2024 (débit du hub : 41,12 M EVP en 2024)"
    type: institutionnel
    url: https://www.mpa.gov.sg/about-mpa/media-centre/details/strong-growth-momentum-for-maritime-singapore
  - label: "ReCAAP ISC — Annual Report 2025 (incidents Asie & détroits Malacca/Singapour)"
    type: institutionnel
    url: https://www.recaap.org/resources/ck/files/reports/annual/ReCAAP%20ISC%20Annual%20Report%202025.pdf
  - label: "Reuters — Myanmar-China oil pipeline (capacité ~400 000 b/j ≈ 5 % des imports chinois, 2017)"
    type: presse_specialisee
    url: https://www.reuters.com/article/myanmar-china-pipeline-idUSL3N1GY2ND
  - label: Global Energy Monitor — Sino-Myanmar Oil Pipeline (capacité ~442 000 b/j)
    type: donnees_ouvertes
    url: https://www.gem.wiki/Sino-Myanmar_Oil_Pipeline
  - label: ERIA — Sea Lane Security in Selected EAS Countries (statut du canal de Kra)
    type: analyse_secondaire
    url: https://www.eria.org/publications/
---

## Définition du corridor

Le détroit de **Malacca** relie l'**océan Indien** (mer d'Andaman) à la **mer de Chine méridionale**, entre
la péninsule malaise et Sumatra. Long d'environ 800 km, il se resserre à son extrémité sud, au **Phillips
Channel** près de Singapour, à quelques kilomètres de large. C'est le passage le plus court entre les
fournisseurs d'énergie du golfe Persique et d'Afrique et les grands consommateurs d'Asie de l'Est.

> **Périmètre volontairement restreint : énergie, conteneurs, alternatives.** On évite ici de dériver vers un
> commentaire général sur la rivalité sino-américaine ou la mer de Chine méridionale : la fiche traite le
> détroit comme **chokepoint de flux**, pas comme théâtre stratégique.

## Nœuds principaux

- **Phillips Channel / Singapour** — le point critique : chenal le plus étroit du détroit, doublé du premier
  hub de transbordement mondial. La contrainte physique y devient une contrainte de **tirant d'eau** : la
  norme de conception « Malaccamax » plafonne les navires à ≈ **20,5–21 m** de tirant d'eau, ≈ 333 m de long,
  ≈ 300 000 tpl (ordres de grandeur techniques — **pas une limite réglementaire codifiée** par une autorité).
- **One Fathom Bank** — haut-fond balisé sur l'axe, contraignant le rail montant/descendant.
- **Port de Singapour** — hub logistique et de soutage : **41,12 M EVP** manutentionnés en 2024, record
  historique (MPA Singapore — fait mesuré). Sa part exacte dans le commerce conteneurisé mondial (≈ 4–5 %) est
  une **estimation dérivée** (MPA + UNCTAD), non un chiffre primaire unique.

## Flux concernés

L'enjeu de Malacca est une **concentration** : beaucoup de flux vitaux sur un seul passage étroit.

- **Énergie (brut & produits)** : ≈ **23,2 Mb/j** de pétrole et liquides ont transité par Malacca au 1ᵉʳ
  semestre 2025, ce qui en fait le **premier chokepoint pétrolier mondial** en volume, devant Ormuz
  (≈ 20,9 Mb/j) (US EIA — estimation, tracking Vortexa).
- **Destination Chine** : la Chine reçoit **48 %** du pétrole transitant par Malacca (≈ 7,9 Mb/j au 1S 2025,
  US EIA) — soit la quasi-totalité de son brut maritime venu de l'océan Indien. L'EIA **ne publie pas** de
  « part des importations totales chinoises via Malacca » : ce serait un calcul dérivé. Pour le **Japon** et la
  **Corée du Sud**, aucune part chiffrée récente de source primaire n'existe — seulement des appréciations
  qualitatives (« majorité »).
- **GNL** : ≈ **9,2 milliards de pi³/j** de GNL via le détroit au 1S 2025 (US EIA — estimation) ; la **part du
  GNL maritime mondial** n'est pas publiée telle quelle (calcul dérivé nécessaire).
- **Volume de navires** : pas de série primaire consolidée récente pour le **seul** détroit de Malacca ; les
  chiffres courants (« > 90 000 navires/an ») **agrègent Malacca + Singapour** et proviennent de sources
  secondaires. Ordre de grandeur ≈ 60 000–100 000/an, à manier avec prudence.

## Vulnérabilités

- **Chokepoint géographique** — pas d'alternative de capacité équivalente. La largeur et le tirant d'eau
  limités concentrent le risque sur un couloir unique ; un incident majeur à Phillips Channel se propage
  immédiatement à l'ensemble du rail.
- **Dépendance asymétrique** — la « dépendance de Malacca » (*Malacca dilemma*) est structurelle pour l'Asie
  de l'Est : une part dominante de son approvisionnement énergétique tient à ce seul passage, sans stock ni
  route de substitution capables d'absorber une interruption prolongée.
- **Menace sécuritaire en hausse** — les détroits de Malacca et Singapour (SOMS) ont enregistré **108
  incidents** de piraterie / vol à main armée en 2025 (104 avérés + 4 tentatives), **+74 %** vs 62 en 2024 —
  le plus haut niveau depuis 2007 (ReCAAP ISC — fait mesuré). Mais **87 %** se concentrent sur janvier–juillet
  2025, sans aucun incident de catégorie 1 (la plus grave) : incidents majoritairement de **faible intensité**
  (CAT 4), au coût plus assurantiel que systémique. À l'échelle de l'Asie, 132 incidents en 2025 (+23 %).
- **Congestion** — la densité de trafic et la contrainte de tirant d'eau créent une sensibilité aux temps
  d'attente et aux files de mouillage, surtout autour de Singapour.

## Alternatives / bypass

- **Détroit de Lombok (+ Makassar)** — la principale alternative : plus profond (accueille les plus gros
  navires) mais **plus long**. Le surcoût n'est **pas standardisé dans une source primaire** ; les évaluations
  de routage donnent un ordre de grandeur de **+300 à +1 000 milles nautiques** (≈ +1 à +4 jours) selon les
  ports et la vitesse — **modélisation**, non donnée officielle datée.
- **Détroit de la Sonde (Sunda)** — étroit et peu profond, marginal pour les grands navires.
- **Pipeline Chine–Myanmar** (Kyaukphyu → Yunnan) — contourne *partiellement* Malacca : capacité nominale
  ≈ **400 000 b/j** (Reuters, 2017 ; **442 000 b/j** selon Global Energy Monitor), soit ≈ **5 %** des besoins
  d'importation de la Chine. Part **théorique** : aucune série publique ne montre le taux d'utilisation réel ni
  le volume effectivement détourné de Malacca sur 2023–2025.
- **Canal de Kra (isthme thaïlandais)** — projet **non réalisé**, sans décision politique ferme de lancement,
  au mieux « à l'étude » et plusieurs fois mis en sommeil (ERIA). Aucune capacité réelle à ce jour.

> Le report par Lombok/pipeline est **physiquement possible mais non substituable en capacité** : il déplace
> le problème vers la distance et le carburant, pas vers une redondance véritable.

## Seuils d'alerte

Chaque seuil lie un indicateur observable à une bascule de régime et à l'action qu'elle implique. Ce sont des
**repères de décision** (analyse), non des mesures. La colonne _Statut_ distingue les repères **adossés à des
sources vérifiées** (≥ 2 sources indépendantes) des **repères historiques ou hypothétiques**.

| Indicateur                                              | Seuil de déclenchement                                  | Bascule / action                                               | Statut / fondement                                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Flux de brut** via Malacca (Mb/j)                    | recul soutenu **> 15 %** vs baseline ≈ 23 Mb/j          | report vers Lombok/pipelines — hausse des coûts d'appro        | **Adossé** — baseline **23,2 Mb/j** (1S 2025, EIA) ; 1ᵉʳ chokepoint pétrolier mondial                  |
| **Volume de transits** (navires/j)                     | recul **> 20 %** sur 4 semaines glissantes              | corridor en tension — suivi rapproché                          | **À adosser** — pas de série primaire pour le seul détroit (chiffres agrégés Malacca+Singapour)        |
| **Incidents sécuritaires** (piraterie/vol) — SOMS      | **≥ 1 / semaine** sur 3 semaines consécutives           | menace persistante (et non ponctuelle) — prime d'assurance     | **Adossé** — série ReCAAP : **108 incidents SOMS en 2025** (+74 %), pic janv.–juil., majorité CAT 4    |
| **Temps d'attente / congestion** autour de Singapour   | file de mouillage anormale (vs baseline portuaire)      | tension logistique — répercussion sur les chaînes aval         | **Repère opérationnel** — à calibrer sur données portuaires MPA                                        |
| **Blocage physique** (échouement/collision) à Phillips | interruption continue **> 72 h**                        | bascule logistique — reroutage d'urgence par Lombok            | **Repère hypothétique** — pas de précédent de blocage prolongé documenté récemment                     |

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
  avant tout effet de volume ; la hausse 2025 des incidents SOMS pèse d'abord sur l'assurance.
- **Couplage régional** — Singapour comme hub de transbordement lie la fluidité de Malacca à la performance
  d'une part importante du commerce conteneurisé asiatique.

## Niveau de confiance

**Moyen.** Élevé sur la géographie, la **nature** de la dépendance (chokepoint énergétique sans substitut de
capacité) et sur les chiffres de source primaire (**flux de brut EIA**, **débit EVP Singapour MPA**,
**incidents ReCAAP**). L'incertitude porte sur les valeurs **absentes ou dérivées** : parts d'importation
Japon/Corée, part du GNL mondial, nombre de transits pour le seul détroit, surcoût Lombok — non documentées en
source primaire et signalées comme telles.

> **Fait / analyse.** Les valeurs de source primaire (EIA, MPA, ReCAAP) sont des **faits rapportés** (non
> reconfirmés par nos soins) ; la « Malaccamax », la part mondiale de Singapour et le surcoût Lombok sont des
> **estimations / ordres de grandeur** ; les seuils et scénarios relèvent de l'**analyse**. Ce qui n'est pas
> documenté publiquement est signalé comme tel.

> Fiche Atlas — version publique (Basic). Le scoring CVI 0–5 par dimension est réservé à l'offre Standard.
> Géométrie schématique, sans valeur navigationnelle ou juridique.
> Candidat en attente de validation humaine.
