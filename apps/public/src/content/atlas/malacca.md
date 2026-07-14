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
- **Volume de navires** : **94 301** navires en 2024 dans les détroits de Malacca **et** Singapour (autorité
  portuaire de Singapour, MPA — fait mesuré). Réserve : ce total **agrège Malacca + Singapour** ; il n'existe
  pas de série primaire pour le **seul** détroit de Malacca.

## Vulnérabilités

- **Chokepoint géographique** — pas d'alternative de capacité équivalente. La largeur et le tirant d'eau
  limités concentrent le risque sur un couloir unique ; un incident majeur à Phillips Channel se propage
  immédiatement à l'ensemble du rail.
- **Dépendance asymétrique** — la « dépendance de Malacca » (*Malacca dilemma*) est structurelle pour l'Asie
  de l'Est : une part dominante de son approvisionnement énergétique tient à ce seul passage. Les importateurs
  l'**atténuent** — réserves stratégiques, diversification (pipelines terrestres, route arctique) — ce qui
  amortit un choc sur quelques semaines à quelques mois **sans le supprimer** : aucune de ces parades n'offre
  une **route de substitution de capacité équivalente** pour une interruption prolongée. La dépendance est donc
  une vulnérabilité de **coût et de délai**, pas d'effondrement instantané.
- **Menace sécuritaire en hausse** — les détroits de Malacca et Singapour (SOMS) ont enregistré **108
  incidents** de piraterie / vol à main armée en 2025 (104 avérés + 4 tentatives), **+74 %** vs 62 en 2024 —
  le plus haut niveau depuis 2007 (ReCAAP ISC — fait mesuré). Mais **87 %** se concentrent sur janvier–juillet
  2025, sans aucun incident de catégorie 1 (la plus grave) : incidents majoritairement de **faible intensité**
  (CAT 4), au coût plus assurantiel que systémique. À l'échelle de l'Asie, 132 incidents en 2025 (+23 %).
- **Congestion** — la densité de trafic et la contrainte de tirant d'eau créent une sensibilité aux temps
  d'attente et aux files de mouillage, surtout autour de Singapour.

## Alternatives / bypass

La question n'est pas *si* les navires peuvent physiquement passer ailleurs — ils le peuvent — mais *combien
de volume* une route de report peut absorber sans saturer flotte et ports. **Aucune source publique ne chiffre
cette « capacité résiduelle » d'absorption** en cas de fermeture de Malacca : c'est la principale lacune
documentaire, et elle borne toute affirmation de substituabilité.

- **Détroit de Lombok (+ Makassar)** — **capacité physique élevée** : profond (≈ **1 000 m**) et permissif, il
  accueille les plus gros pétroliers et vraquiers que Malacca ne prend pas (littérature recherche-défense —
  appréciation). La contrainte n'est donc **pas le gabarit** mais l'**absorption systémique** : l'allongement
  de la route (ordre de grandeur **+300 à +1 000 milles nautiques**, ≈ +1 à +4 jours — modélisation, non
  donnée officielle) **réduit le nombre de rotations annuelles** et immobilise davantage de navires — c'est
  l'**effet de flotte** qui borne le report à grande échelle. Trafic annuel de Lombok et capacité résiduelle :
  **non documentés publiquement**.
- **Détroit de la Sonde (Sunda)** — plus contraint physiquement que Lombok ; rôle d'**appoint marginal** pour
  les plus gros tonnages, pas d'exutoire principal d'un choc « fermeture de Malacca » (littérature —
  qualitatif ; pas de chiffres physiques publics pour VLCC/ULCV).
- **Pipeline Chine–Myanmar** (Kyaukphyu → Yunnan) — capacité nominale ≈ **400 000 b/j** (Reuters, 2017 ;
  **442 000 b/j** selon Global Energy Monitor), soit ≈ **5 %** des besoins d'importation de la Chine **mais
  seulement ≈ 1,7–1,9 % du débit total de Malacca** (23,2 Mb/j — calcul dérivé). Taux d'**utilisation réel
  2023-2025 non trouvé** en source publique. Même à pleine capacité, il ne change pas l'ordre de grandeur.
- **Canal de Kra (isthme thaïlandais)** — projet **non réalisé**, sans décision politique ferme de lancement,
  au mieux « à l'étude » et plusieurs fois mis en sommeil (ERIA). Aucune capacité réelle à ce jour.

> **Bilan de capacité (candidat).** Report *physiquement* possible, *systémiquement* **non substituable** : la
> limite est la **perte de rotations de flotte** due au détour, non le tirant d'eau, et **aucune étude publique
> ne fournit un « % du trafic Malacca réabsorbable »**. La seule alternative quantifiée (pipeline) ne couvre
> que ~2 % du débit. L'affirmation « non substituable en capacité » est donc **étayée** — avec la réserve
> assumée que le chiffre exact de capacité résiduelle n'existe pas en source primaire.

## Seuils d'alerte

Chaque seuil lie un indicateur observable à une bascule de régime et à l'action qu'elle implique. Ce sont des
**repères de décision** (analyse), non des mesures. La colonne _Statut_ distingue les repères **adossés à des
sources vérifiées** (≥ 2 sources indépendantes) des **repères historiques ou hypothétiques**.

| Indicateur                                              | Seuil de déclenchement                                  | Bascule / action                                               | Statut / fondement                                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Flux de brut** via Malacca (Mb/j)                    | recul soutenu **> 15 %** vs baseline ≈ 23 Mb/j          | report vers Lombok/pipelines — hausse des coûts d'appro        | **Adossé** — baseline **23,2 Mb/j** (1S 2025, EIA) ; 1ᵉʳ chokepoint pétrolier mondial                  |
| **Volume de transits** (navires/an)                    | recul **> 20 %** sur 4 semaines glissantes              | corridor en tension — suivi rapproché                          | **Partiel** — **94 301** navires 2024 (Malacca **+** Singapour, MPA) ; pas de série pour le seul détroit |
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
capacité) et sur les chiffres de source primaire (**flux de brut EIA**, **débit EVP + 94 301 navires
Singapour MPA**, **incidents ReCAAP**). L'incertitude porte sur les valeurs **absentes ou dérivées** : parts
d'importation Japon/Corée, part du GNL mondial, transits pour le seul détroit, surcoût Lombok, et surtout la
**capacité résiduelle d'absorption des alternatives** — non documentée en source primaire et signalée comme
telle. Point établi malgré la lacune : le facteur limitant du report est l'**effet de flotte** (rotations
perdues), non le gabarit.

> **Fait / analyse.** Les valeurs de source primaire (EIA, MPA, ReCAAP) sont des **faits rapportés** (non
> reconfirmés par nos soins) ; la « Malaccamax », la part mondiale de Singapour et le surcoût Lombok sont des
> **estimations / ordres de grandeur** ; les seuils et scénarios relèvent de l'**analyse**. Ce qui n'est pas
> documenté publiquement est signalé comme tel.

> Fiche Atlas — version publique (Basic). Le scoring CVI 0–5 par dimension est réservé à l'offre Standard.
> Géométrie schématique, sans valeur navigationnelle ou juridique.
> Candidat en attente de validation humaine.
