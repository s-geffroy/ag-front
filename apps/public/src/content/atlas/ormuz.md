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
updated: 2026-08-21
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
  - label: UNCTAD — Review of Maritime Transport 2024
    type: institutionnel
    url: https://unctad.org/publication/review-maritime-transport-2024
  - label: Base chokepoints (API de lecture) — métrique PortWatch, transits journaliers moyens, 2026-08
    type: donnees_ouvertes
  - label: Reuters — Le trafic à Ormuz se réduit alors que les marchés observent les pourparlers Iran-Oman (7 août 2026)
    type: presse_specialisee
    url: https://www.reuters.com/business/energy/vessel-traffic-through-hormuz-dwindles-this-week-markets-watch-iran-oman-talks-2026-08-07/
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
  - label: >-
      Reuters — L’Iran et Oman s’entendent sur les coordonnées d’une route à travers Ormuz
      (ministère iranien, 5 août 2026)
    type: presse_specialisee
    url: https://www.reuters.com/world/middle-east/iran-oman-reach-understanding-coordinates-route-through-hormuz-iran-ministry-2026-08-05/
  - label: >-
      Ansar Allah — déclaration du 5 août 2026 : 29 pétroliers saoudiens déclarés refoulés en mer
      Rouge et mer d’Arabie. Revendication d’un belligérant, rapportée par gCaptain qui précise que
      ces chiffres n’ont pas pu être vérifiés de source indépendante
    type: source_contradictoire
    url: https://gcaptain.com/houthis-escalate-red-sea-campaign-claim-eighth-saudi-tanker-attack/
  - label: >-
      Congressional Research Service — R45281, « The Strait of Hormuz: Security Developments and
      Impacts on Oil, Gas, and Other Commodities », mise à jour du 7 août 2026 (chronologie ;
      régime de péage sourcé par le CRS à Lloyd’s List du 25 mars 2026). URL de miroir : l’éditeur
      rend 403
    type: institutionnel
    url: https://www.everycrsreport.com/files/2026-08-07_R45281_3d6151e227c61c7faf43873a9e30be6b8c9a6f08.pdf
  - label: >-
      CNBC — Trafic maritime à Ormuz inférieur d’environ 90 % à la moyenne journalière d’avant les
      frappes (12 août 2026 ; Lloyd’s List Intelligence donne « plus de 90 % » sur les entrées du Golfe)
    type: presse_specialisee
    url: https://www.cnbc.com/2026/08/12/strait-hormuz-ship-traffic-iran-war-deal.html
  - label: >-
      Policy Center for the New South — Emran & Berahab, « Stress Test: The Hormuz Crisis and the
      Fracturing of the Global Energy Order », PB-29/26, juin 2026 (estimation des 17,8 Mb/j)
    type: analyse_secondaire
    url: https://www.policycenter.ma/publications/stress-test-hormuz-crisis-and-fracturing-global-energy-order
  - label: >-
      Reuters — « Les Houthis cherchent à reproduire en mer Rouge le contrôle iranien sur Ormuz »,
      selon le ministre yéménite des Affaires étrangères (27 juillet 2026)
    type: presse_specialisee
    url: https://www.reuters.com/world/middle-east/houthis-pushing-model-irans-hormuz-control-red-sea-yemeni-fm-says-2026-07-27/
  - label: >-
      Council on Foreign Relations — « Another Hormuz? What to Know About the Houthi Threat »
      (analyse)
    type: analyse_secondaire
    url: https://www.cfr.org/articles/another-hormuz-the-red-seas-threat-to-the-global-economy
  - label: >-
      Reuters — Le trafic ralentit à Ormuz après des attaques contre des pétroliers (17 août 2026,
      données Kpler) : 5 navires de commerce le samedi 15, aucun le dimanche 16, contre 31 le
      week-end précédent ; plus de 130 navires par jour avant la guerre de février
    type: presse_specialisee
    url: https://www.reuters.com/world/middle-east/shipping-via-hormuz-strait-slows-after-tanker-attacks-data-shows-2026-08-16/
  - label: >-
      Reuters — Washington menace d'accroître la pression économique ; deux navires de plus attaqués
      à Ormuz (14 août 2026)
    type: presse_specialisee
    url: https://www.reuters.com/world/middle-east/us-warns-iran-it-will-step-up-economic-pressure-two-more-ships-attacked-hormuz-2026-08-14/
  - label: >-
      Al Jazeera — « As Strait of Hormuz transit drops, Trump again says US has 'control' »
      (12 août 2026) : revendications concurrentes sur le contrôle du passage
    type: presse_specialisee
    url: https://www.aljazeera.com/news/2026/8/12/as-strait-of-hormuz-transit-drops-trump-again-says-us-has-control
---

## Définition du corridor

Bras de mer entre l’Iran et le sultanat d’Oman (péninsule de Musandam) reliant le golfe Persique au
golfe d’Oman puis à la mer d’Arabie. Large de ~33 km au plus étroit, il n’offre que deux chenaux de
navigation de 3 km, séparés par une zone tampon. C’est, **au critère de la substituabilité par route maritime**, le point de passage le moins
substituable de l’économie mondiale — les autres chokepoints majeurs en ont une, coûteuse : Bab
el-Mandeb se contourne par le Cap au prix de dix à seize jours, Malacca par les détroits de la Sonde
ou de Lombok, Panama par le cap Horn ou le rail transcontinental. Ormuz **n’a pas de route maritime
alternative** du tout. Ce qui sort du Golfe passe par là, ou ne
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

> **Chronologie.** Le Congressional Research Service place l’origine de la crise au **28 février
> 2026** : « *As part of its response to U.S. and Israeli attacks beginning on February 28, 2026,
> Iran has sought to exert control over the Strait of Hormuz* » (R45281, 7 août 2026). Cette date
> **ouvre la période** et ne date pas l’acte qu’elle semble dater : le même rapport situe la
> déclaration de fermeture « *days after* », sans en donner le jour. Le trafic s’est alors largement
> arrêté, des centaines de navires restant bloqués dans le Golfe. Un **cessez-le-feu le 7 avril 2026**
> a fermé cette phase. Ce qui dure depuis n’est donc pas une fermeture continue mais un **régime
> dégradé post-cessez-le-feu** — c’est ce régime, et non une fermeture, que décrit cette fiche.
>
> **État au 21 août 2026.** Le trafic est effondré, et il s’est encore creusé au cours de la deuxième
> semaine d’août. La métrique PortWatch servie par la base chokepoints donne **2,5 transits
> journaliers moyens** pour août 2026 — relue le 21 août, inchangée — à comparer, même métrique et
> même mois, à **36,5** pour Suez, **230,5** pour Malacca et **248** pour le détroit de Taïwan. Hors
> site, **CNBC** situe le trafic à environ **90 % en dessous** de la moyenne journalière d’avant les
> frappes (12 août) et **Lloyd’s List Intelligence** à « plus de 90 % » sur les entrées du Golfe. Le
> point de comparaison d’avant-crise est désormais chiffré : **plus de 130 navires par jour**
> franchissaient le détroit avant la guerre de février (Reuters).
>
> **Ce qui a changé depuis le 10 août.** Trois navires exploités par l’ADNOC ont été attaqués en
> transit dans la semaine du 10, selon les Émirats. Le passage s’en est trouvé quasi arrêté : les
> données Kpler relevées par Reuters comptent **5 navires de commerce le samedi 15 août et aucun le
> dimanche 16**, contre **31** le week-end précédent. Les pourparlers américano-iraniens sont **au
> point mort**, et le ministre iranien des Affaires étrangères a redit que la reprise du trafic
> suppose que Washington satisfasse les conditions de Téhéran.
>
> **Et le guichet a maintenant deux guichetiers.** Les États-Unis ont déclaré pouvoir maintenir
> **indéfiniment un blocus naval de l’Iran** et affirment contrôler l’accès maritime ; Téhéran affirme
> de son côté contrôler le détroit et le maintenir fermé tant que le blocus, les sanctions et les gels
> d’avoirs ne sont pas levés. **Les deux revendications portent sur le même passage** et aucune source
> ne permet, à ce stade, d’établir laquelle détermine le débit constaté. C’est une **revendication
> concurrente**, pas un fait partagé : nous la rapportons comme telle.
>
> **Réserve de mesure.** Certains navires passent transpondeur éteint et échappent au comptage
> (Reuters / Kpler) : les chiffres ci-dessus sont un **plancher observé**, non un décompte exhaustif.

## Vulnérabilités

- **Non-substituabilité** — c’est la vulnérabilité première, et elle est géographique, non politique.
  Aucun réacheminement maritime n’existe. Les seules échappatoires sont deux pipelines et les stocks.
- **Passage sous autorisation** — la nature du risque a changé. L’Iran **lie la réouverture à des
  concessions américaines**, a convenu de **coordonnées de route avec Mascate** (Reuters, 5 août
  2026, citant le ministère iranien), et son Parlement **examine un cadre législatif** sur la
  sécurité et le passage, jusqu’à d’éventuels droits de transit. Le détroit fonctionne moins comme
  une zone de combat que comme un **guichet** — une lecture qui n’est pas la nôtre seule : le CRS
  reprend la formule de **Lloyd’s List du 25 mars 2026**, « *Tehran’s 'toll booth' system is now
  controlling Hormuz traffic* ».
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
3. **Ré-escalade** — reprise des frappes, minage, fermeture longue. *Dans cette hypothèse* — et ce
   qui suit est une projection, non une mesure : les pipelines satureraient, les réserves
   s’épuiseraient, et la contrainte redeviendrait physique. Nous ne disposons d’aucune série publique
   sur les niveaux de réserves ni sur le taux d’utilisation courant des deux tubes.

## Effets systémiques

- **Offre mondiale** — le **Policy Center for the New South** (Emran & Berahab, PB-29/26, juin 2026)
  estime que la fermeture effective a retiré ≈ **17,8 Mb/j** de brut et de GNL, soit **environ un
  cinquième de l’offre échangée** — candidat, non recoupé par nos soins.
- **Prix** — Brent à **103 $/b** de moyenne en mars 2026 ; les scénarios de conflit contenu situent le
  baril entre **100 et 120 $**, primes de risque incluses.
- **Au-delà de l’énergie** — les premières données signalent des reculs marqués aussi sur les
  **engrais** et les **produits industriels**, la région exportant bien plus que des hydrocarbures.

## Articulation avec la mer Rouge

Les deux crises se lisent ensemble, et pas seulement parce qu’elles sont simultanées.

Les Houthis ont déclaré le **20 juillet 2026** un blocus naval visant l’Arabie saoudite, et ouvert
deux jours plus tard une campagne contre la navigation **saoudienne**, affirmant le 5 août avoir refoulé **29 pétroliers saoudiens** en mer
Rouge comme en mer d’Arabie — **revendication d’un belligérant**, rapportée par gCaptain qui précise
que le chiffre n’a pas pu être vérifié de source indépendante. La tentative de **reproduire en mer
Rouge le contrôle iranien sur Ormuz** est décrite par le ministre yéménite des Affaires étrangères
(Reuters, 27 juillet 2026) et analysée comme telle par le **Council on Foreign Relations**.

C’est le même geste stratégique appliqué à deux détroits : convertir un passage en **passage autorisé**,
et faire de l’autorisation un levier. La différence tient à la substituabilité — la mer Rouge se
contourne par le Cap, Ormuz ne se contourne pas. Le levier y est donc, structurellement, beaucoup plus
fort.

Elle tient aussi à l’ampleur, et le week-end du 15-16 août le montre d’un même relevé : **49 transits
de navires de commerce à Bab el-Mandeb** contre 55 la semaine précédente, quand Ormuz en comptait
**5 puis zéro**. Le blocus houthi filtre un pavillon — aucune cargaison pétrolière saoudienne suivie
n’y est passée ; celui d’Ormuz arrête le passage lui-même.

> **Ce que nous ne concluons pas.** Une coordination opérationnelle entre Téhéran et Ansar Allah est
> *évoquée dans l’analyse du Council on Foreign Relations citée en sources*, pas établie par nos
> soins — et la source la plus directe sur l’intention, le ministre yéménite des Affaires étrangères,
> est une **partie au conflit**. La convergence des méthodes est observable ; la chaîne de
> commandement ne l’est pas.

## Niveau de confiance

**Moyen.** Élevé sur la géographie, la non-substituabilité et les ordres de grandeur des flux
(sources institutionnelles). Élevé aussi sur l’effondrement du trafic, mesuré par la métrique que
nous servons nous-mêmes.

Plus faible sur trois points, tous nommés plutôt que comblés : l’**ampleur exacte du report** vers les
pipelines, dont nous n’avons pas la mesure ; la **trajectoire des primes d’assurance**, sans série
primaire ; et la **durée**, qui dépend d’une négociation dont l’issue n’est pas modélisable.

S’y ajoute depuis la mi-août une **quatrième inconnue, et elle porte sur l’acteur** : Washington et
Téhéran revendiquent l’un et l’autre de commander le passage. Aucune source publique ne permet de
départager ce qui, du blocus naval américain ou des conditions iraniennes, détermine le débit
constaté. Nous rapportons les deux revendications sans trancher entre elles.

> **Fait / analyse.** Les volumes, les transits et les prix proviennent des sources citées (faits
> **rapportés**, non reconfirmés par nos soins) ; les seuils, les scénarios et la lecture « passage
> sous autorisation » relèvent de l’analyse.

> Fiche Atlas — version publique (Basic). Le scoring CVI 0–5 par dimension est réservé à l’offre
> Standard. Géométrie schématique, sans valeur navigationnelle ou juridique.
> Candidat en attente de validation humaine.
