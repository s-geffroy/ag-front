---
title: Détroit d’Ormuz
verdict: >-
  Ormuz n’est pas fermé : il est devenu un passage sous autorisation. Le trafic
  s’est effondré à ~2,5 transits par jour, et la variable qui décide n’est plus
  la sécurité de la navigation mais la négociation — Téhéran lie la réouverture
  à des concessions, coordonne un tracé avec Mascate et examine un régime de
  droits de passage. Le chokepoint le moins substituable du monde a changé de
  nature : de goulet physique, il est passé à péage politique.
family: maritime
priority: P0
regions:
  - Golfe Persique
  - Moyen-Orient
access: public
published: false
corrections: []
updated: 2026-08-10
confidence: moyen
cvi_level: critique
chokepoint_id: p0_maritime_strait_strait_of_hormuz
map:
  caption: Golfe Persique → Ormuz → mer d’Arabie, et les deux contournements par pipeline
  waypoints:
    - { label: Terminaux du Golfe, x: 18, y: 16, role: gate, align: right }
    - { label: Ormuz, x: 48, y: 34, role: chokepoint, align: right }
    - { label: Fujaïrah, x: 62, y: 44, role: hub, align: right }
    - { label: Mer d’Arabie, x: 82, y: 54, role: gate, align: right }
  bypass:
    label: Pipelines Petroline / Habshan-Fujaïrah
    path: M 18 16 C 34 4, 58 18, 62 44
sources:
  - label: US EIA — World Oil Transit Chokepoints (flux brut, GNL, produits raffinés)
    type: institutionnel
    url: https://www.eia.gov/international/analysis/special-topics/World_Oil_Transit_Chokepoints
  - label: AIE — Strait of Hormuz oil security (substituabilité et capacités de contournement)
    type: institutionnel
    url: https://www.iea.org/
  - label: UNCTAD — Review of Maritime Transport 2024
    type: institutionnel
    url: https://unctad.org/publication/review-maritime-transport-2024
  - label: Base chokepoints (API de lecture) — métrique PortWatch, transits journaliers moyens, 2026-08
    type: donnees_ouvertes
  - label: Reuters — Le trafic à Ormuz se réduit alors que les marchés observent les pourparlers Iran-Oman (7 août 2026)
    type: presse_specialisee
    url: https://www.reuters.com/
  - label: >-
      AIE — Strait of Hormuz : capacité de contournement disponible estimée à 3,5–5,5 Mb/j
      (Petroline plafonné à 5 Mb/j en maximum théorique, ADCOP 1,5–1,8 Mb/j)
    type: institutionnel
    url: https://www.iea.org/about/oil-security-and-emergency-response/strait-of-hormuz
  - label: >-
      US EIA — Amid regional conflict, the Strait of Hormuz remains critical oil chokepoint
      (flux total 20,9 Mb/j au S1 2025 ; capacité de contournement mobilisable en cas d'interruption)
    type: institutionnel
    url: https://www.eia.gov/todayinenergy/detail.php?id=65504
  - label: US EIA — Short-Term Energy Outlook, communiqué du 4 juillet 2026 (fermetures de production, prévision Brent)
    type: institutionnel
    url: https://www.eia.gov/outlooks/steo/
  - label: Iran / Oman — accord sur les coordonnées de la route d’Ormuz (5 août 2026)
    type: presse_specialisee
  - label: Ansar Allah — déclaration du 5 août 2026 (29 navires saoudiens empêchés, mer Rouge et mer d’Arabie)
    type: source_contradictoire
---

## Définition du corridor

Bras de mer entre l’Iran et le sultanat d’Oman (péninsule de Musandam) reliant le golfe Persique au
golfe d’Oman puis à la mer d’Arabie. Large de ~33 km au plus étroit, il n’offre que deux chenaux de
navigation de 3 km, séparés par une zone tampon. C’est le point de passage **le moins substituable de
l’économie mondiale** : contrairement à Bab el-Mandeb, qui se contourne par le Cap au prix de dix à
seize jours, Ormuz **n’a pas de route maritime alternative**. Ce qui sort du Golfe passe par là, ou ne
sort que par pipeline — et la capacité de ces pipelines est chiffrée plus bas : **3,5 à 5,5 Mb/j
disponibles** contre **20,7 Mb/j** de pétrole en transit, et **rien du tout** pour le GNL. « Pas
d’alternative » n’est donc pas une figure de style mais un **déficit mesuré d’environ 14 Mb/j**
(voir _Alternatives / bypass_).

## Nœuds principaux

- **Chenaux de Musandam** — entrée et sortie séparées, sous surveillance iranienne et omanaise.
- **Terminaux du Golfe** — Ras Tanura (Arabie saoudite), Kharg (Iran), Basra (Irak), Jebel Dhanna
  (Émirats), Ras Laffan (Qatar, GNL).
- **Fujaïrah** — le seul terminal majeur de la région situé **en dehors** du détroit ; débouché du
  contournement émirati.

## Flux concernés

Chiffres 2024 (US EIA, via la base chokepoints), avant la crise :

- **Brut** : ≈ **14,6 Mb/j** — le plus fort volume pétrolier d’un chokepoint mondial.
- **GNL** : ≈ **10,5 Gpi³/j** — l’essentiel des exportations qatariennes.
- **Produits raffinés** : ≈ **6,1 Mb/j**.
- **Conteneurs** : présent mais secondaire ; l’enjeu d’Ormuz est énergétique.

## État du corridor

> **État au 10 août 2026.** Le trafic est effondré. La métrique PortWatch servie par la base
> chokepoints donne **2,5 transits journaliers moyens** pour août 2026 — à comparer, même métrique et
> même mois, à **36,5** pour Suez, **230,5** pour Malacca et **248** pour le détroit de Taïwan. Des
> sources externes situent la restriction **au-delà de 90 %** et décrivent une perturbation sévère
> sur l’essentiel des cinq derniers mois.

## Vulnérabilités

- **Non-substituabilité** — c’est la vulnérabilité première, et elle est géographique, non politique.
  Aucun réacheminement maritime n’existe. Les seules échappatoires sont deux pipelines et les stocks.
- **Passage sous autorisation** — la nature du risque a changé. L’Iran **lie la réouverture à des
  concessions américaines**, a convenu de **coordonnées de route avec Mascate**, et son Parlement
  **examine un cadre législatif** sur la sécurité et le passage, jusqu’à d’éventuels droits de
  transit. Le détroit fonctionne moins comme une zone de combat que comme un **guichet**.
- **Assurance et disponibilité de la couverture** — le risque `insurance_cost_spike` est évalué à
  impact 4 dans la base. Nous ne disposons **d’aucune série primaire de primes** sur la période :
  cette dimension est nommée, pas mesurée.
- **Escalade militaire et minage** — risques évalués à impact 5 (base chokepoints, statut *assessed*).
  Le minage est ce qui distingue Ormuz : il ferme un chenal sans qu’aucun navire ne soit touché.

## Alternatives / bypass

Les trois contournements référencés sont tous **candidats**, tous à **pénalité de capacité élevée** :

- **Petroline (East-West, Arabie saoudite)** vers les terminaux mer Rouge — faisabilité moyenne.
  **Capacité nominale contestée** : Aramco annonce **7 Mb/j**, l’AIE retient **5 Mb/j** comme maximum
  théorique, et le port d’exportation de Yanbu plafonne autour de **4,5 Mb/j**. L’ouvrage n’a jamais
  été exploité durablement à 7. Il renvoie en outre le problème vers un corridor lui-même perturbé
  (voir la fiche Mer Rouge / Suez).
- **Habshan-Fujaïrah / ADCOP (Émirats)** — faisabilité moyenne ; sort du Golfe sans passer le détroit.
  **1,5 Mb/j**, jusqu’à **1,8 Mb/j** selon l’AIE. Un second tube est en construction, qui porterait
  l’ensemble à ~3,6 Mb/j — **capacité future, pas disponible aujourd’hui**.
- **Réserves stratégiques et effacement de la demande** — faisabilité **faible**. Ce n’est pas un
  contournement, c’est un délai.

### Ce que la substitution couvre, chiffres à l’appui

| | Volume | Fondement |
| --- | --- | --- |
| Pétrole transitant par Ormuz | **20,7 Mb/j** (brut 14,6 + raffinés 6,1) | base chokepoints, 2024, `official_reported` ; concordant avec l’EIA (20,9 Mb/j, S1 2025) |
| Capacité de contournement **nominale** | **6,5 à 8,8 Mb/j** | Petroline 5–7 + ADCOP 1,5–1,8 |
| Capacité **disponible** avant la crise | **3,5 à 5,5 Mb/j** | AIE / EIA — capacité inutilisée, pas nominale |
| Volume effectivement acheminé depuis la crise | **~6,5 Mb/j** | les deux tubes tournent quasi à plein (juillet 2026) |
| **Reste non contournable** | **~14 Mb/j** | différence des deux lignes précédentes |

Autrement dit : au débit constaté aujourd’hui, les contournements absorbent **moins d’un tiers** du
pétrole qui passait par Ormuz. À capacité nominale maximale — jamais atteinte — ils en absorberaient
au mieux **43 %**.

**Et le GNL n’a aucun contournement.** Les **10,5 Gpc/j** de gaz liquéfié qui franchissent le détroit
ne disposent d’**aucune route de substitution opérationnelle** : le GNL qatari sort exclusivement par
Ormuz. L’asymétrie est le fait structurant de cette fiche — le pétrole est partiellement
contournable, le gaz ne l’est pas du tout.

C’est ce qui fonde le verdict de « moins substituable au monde » : non pas l’absence d’alternative,
mais un **déficit chiffré d’environ 14 Mb/j** sur le pétrole et de **la totalité** du GNL.

## Seuils d’alerte

| Indicateur | Seuil de déclenchement | Bascule / action | Statut / fondement |
| --- | --- | --- | --- |
| **Transits journaliers** (PortWatch) | retour durable **> 20 /j** sur 3 semaines | reprise crédible du passage | **Adossé** — base chokepoints ; référence de crise **2,5 /j** (2026-08) |
| **Régime de passage** | instauration de **droits de transit** ou d’un régime d’autorisation formalisé | le péage devient structurel, non conjoncturel | **Repère** — cadre législatif à l’examen au Parlement iranien |
| **Prix du Brent** | maintien **> 120 $/b** sur 4 semaines | sortie du scénario « conflit contenu » | **Adossé** — moyenne **103 $/b** en mars 2026 (EIA) ; fourchette 100–120 $/b en scénario contenu |
| **Fermetures de production** | remontée **> 8 Mb/j** | l’offre mondiale décroche à nouveau | **Adossé** — 6,7 Mb/j en mai 2026 (EIA) |

## Scénarios

1. **Réouverture négociée** — le passage se rétablit contre concessions ; l’EIA anticipe un retour
   *proche des niveaux d’avant-conflit fin 2026*. Le corridor rouvre, mais **le précédent reste** :
   la démonstration qu’Ormuz est actionnable aura été faite.
2. **Péage institutionnalisé** — le régime d’autorisation se formalise (droits de transit, tracé
   convenu). Le détroit fonctionne, à un coût et sous une dépendance politique nouveaux. C’est le
   scénario que le cadre législatif à l’examen rend le plus lisible.
3. **Ré-escalade** — reprise des frappes, minage, fermeture longue. Les pipelines saturent, les
   réserves s’épuisent, et la contrainte devient physique.

## Effets systémiques

- **Offre mondiale** — des travaux externes estiment que la fermeture effective a retiré ≈ **17,8 Mb/j**
  de brut et de GNL, soit **environ un cinquième de l’offre échangée** — candidat, non recoupé par
  nos soins.
- **Prix** — Brent à **103 $/b** de moyenne en mars 2026 ; les scénarios de conflit contenu situent le
  baril entre **100 et 120 $**, primes de risque incluses.
- **Au-delà de l’énergie** — les premières données signalent des reculs marqués aussi sur les
  **engrais** et les **produits industriels**, la région exportant bien plus que des hydrocarbures.

## Articulation avec la mer Rouge

Les deux crises se lisent ensemble, et pas seulement parce qu’elles sont simultanées.

Le 22 juillet 2026, les Houthis ont ouvert une campagne contre la navigation **saoudienne**, déclarant
une interdiction de navigation et affirmant le 5 août avoir empêché **29 navires saoudiens** de
passer, en mer Rouge comme en mer d’Arabie. Des analyses décrivent explicitement une tentative de
**reproduire en mer Rouge le contrôle iranien sur Ormuz**.

C’est le même geste stratégique appliqué à deux détroits : convertir un passage en **passage autorisé**,
et faire de l’autorisation un levier. La différence tient à la substituabilité — la mer Rouge se
contourne par le Cap, Ormuz ne se contourne pas. Le levier y est donc, structurellement, beaucoup plus
fort.

> **Ce que nous ne concluons pas.** Une coordination opérationnelle entre Téhéran et Ansar Allah est
> *évoquée par des experts*, pas établie par nos soins. La convergence des méthodes est observable ;
> la chaîne de commandement ne l’est pas.

## Niveau de confiance

**Moyen.** Élevé sur la géographie, la non-substituabilité et les ordres de grandeur des flux
(sources institutionnelles). Élevé aussi sur l’effondrement du trafic, mesuré par la métrique que
nous servons nous-mêmes.

Plus faible sur trois points, tous nommés plutôt que comblés : l’**ampleur exacte du report** vers les
pipelines, dont nous n’avons pas la mesure ; la **trajectoire des primes d’assurance**, sans série
primaire ; et la **durée**, qui dépend d’une négociation dont l’issue n’est pas modélisable.

> **Fait / analyse.** Les volumes, les transits et les prix proviennent des sources citées (faits
> **rapportés**, non reconfirmés par nos soins) ; les seuils, les scénarios et la lecture « passage
> sous autorisation » relèvent de l’analyse.

> Fiche Atlas — version publique (Basic). Le scoring CVI 0–5 par dimension est réservé à l’offre
> Standard. Géométrie schématique, sans valeur navigationnelle ou juridique.
> Candidat en attente de validation humaine.
