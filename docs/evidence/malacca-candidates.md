# Candidats-sources — Détroit de Malacca (fiche Atlas)

> **STATUT : CANDIDATS EN ATTENTE DE VALIDATION HUMAINE — PAS DES FAITS.**
> Registre ouvert le 2026-07-14 pour lever les marqueurs `[À SOURCER]` de
> `apps/public/src/content/atlas/malacca.md` (deliverable `deliv_atlas_malacca_fiche`).
> Aucune valeur ci-dessous ne doit être promue dans la fiche canonique ni présentée comme établie
> avant lecture, recoupement (≥ 2 sources primaires) et validation nominative par un analyste humain
> (ADR 0046). Les chiffres attendus sont **rapportés** par les sources, non confirmés par nous.
>
> Méthode retenue par Sylvain : **Perplexity Recherche Avancée** (prompt ci-dessous), puis
> escalade `agent-browser` (conteneur Docker `tools`) pour les PDF/pages bloquées.

---

## Prompt Perplexity Recherche Avancée — à coller tel quel

```
Tu es analyste en géopolitique des chaînes d'approvisionnement. Je prépare une fiche factuelle
sur le DÉTROIT DE MALACCA comme chokepoint énergétique et maritime. J'ai besoin de chiffres
sourcés, chacun avec sa SOURCE PRIMAIRE, une URL et une DATE. Réponds EN FRANÇAIS.

Pour CHAQUE point ci-dessous, donne : (a) la valeur chiffrée la plus récente ; (b) l'année/date
de la donnée ; (c) la source primaire (organisme + titre du document) ; (d) l'URL ; (e) précise
si c'est un FAIT mesuré ou une ESTIMATION. Si une donnée n'existe pas publiquement, dis-le
explicitement plutôt que d'inventer. Privilégie les sources primaires : US EIA, UNCTAD, IEA,
MPA Singapore, ReCAAP ISC, autorités portuaires ; évite les blogs.

FLUX ÉNERGÉTIQUES
1. Volume de pétrole (brut + produits) transitant par Malacca, en Mb/j (source EIA World Oil
   Transit Chokepoints), et son rang mondial parmi les chokepoints pétroliers.
2. Part (%) du brut importé par la Chine qui transite par Malacca. Idem Japon et Corée du Sud
   si disponible.
3. Part (%) du GNL maritime mondial transitant par le détroit.

TRAFIC & CONTENEURS
4. Nombre de transits de navires par an dans le détroit de Malacca.
5. Part (%) du commerce conteneurisé mondial passant par Malacca / le hub de Singapour, et débit
   annuel du port de Singapour en EVP (source MPA Singapore).
6. Norme de tirant d'eau « Malaccamax » (mètres) et tonnage/longueur maximaux associés.

ALTERNATIVES
7. Détroit de Lombok : surcoût en distance (milles) et en temps (jours) par rapport à Malacca
   pour un grand pétrolier / porte-conteneurs.
8. Capacité nominale du pipeline pétrole/gaz Chine-Myanmar (Kyaukphyu → Yunnan), en Mb/j, et
   part du brut chinois qu'il peut détourner de Malacca.
9. Statut actuel du projet de canal de Kra (isthme de Thaïlande) : réalisé ? à l'étude ? abandonné ?

SÉCURITÉ
10. Nombre d'incidents de piraterie / vol à main armée par an dans le détroit de Malacca et le
    détroit de Singapour (source ReCAAP ISC), tendance sur 3-5 ans.

Termine par une liste des points où les données publiques sont absentes ou contradictoires.
```

---

## À obtenir — liste de collecte priorisée (mappée sur les `[À SOURCER]` de la fiche)

1. **Flux de brut Mb/j + rang mondial** (section _Flux_, seuil « Flux de brut ») — EIA.
2. **Part du brut chinois via Malacca** (_Flux_, verdict) — EIA / IEA.
3. **Norme Malaccamax (tirant d'eau, m)** (_Nœuds_) — autorité portuaire / classification.
4. **Débit conteneurisé Singapour (EVP/an) + part mondiale** (_Nœuds_, _Flux_) — MPA Singapore, UNCTAD.
5. **Nombre de transits/an** (_Flux_, seuil « Volume de transits ») — EIA / MPA / AIS.
6. **Surcoût Lombok (jours / milles)** (_Alternatives_) — analyses sectorielles + calcul de route.
7. **Capacité pipeline Chine-Myanmar (Mb/j)** (_Alternatives_) — opérateur / EIA.
8. **Série d'incidents ReCAAP** (_Vulnérabilités_, seuil « Incidents sécuritaires ») — ReCAAP ISC.
9. **Part du GNL mondial** (_Flux_) — EIA / IEA.

## Candidats sourcés (recherche Perplexity du 2026-07-14 — CANDIDATS, non validés)

> Rapportés par Sylvain via Perplexity Recherche Avancée. Injectés dans `malacca.md` **avec** leur
> statut (FAIT / ESTIMATION / non documenté). Restent candidats tant que le gate `sources_ok` n'a
> pas été flippé après validation nominative (ADR 0046).

| Réf | Fait / estimation (périmètre)                                              | Source primaire       | Date     | Statut analytique          |
| --- | -------------------------------------------------------------------------- | --------------------- | -------- | -------------------------- |
| M1  | ≈ 23,2 Mb/j pétrole+liquides via Malacca ; 1ᵉʳ chokepoint pétrolier mondial (Ormuz ≈ 20,9) | US EIA (Vortexa) | 1S 2025  | estimation                 |
| M2  | Chine reçoit 48 % du pétrole de Malacca (≈ 7,9 Mb/j)                       | US EIA                | 1S 2025  | estimation                 |
| M3  | GNL ≈ 9,2 Gpi³/j via le détroit                                            | US EIA                | 1S 2025  | estimation                 |
| M4  | Singapour 41,12 M EVP (record)                                             | MPA Singapore (Annual Report) | 2024 | **fait** mesuré       |
| M5  | Incidents SOMS 108 en 2025 (+74 % vs 62 en 2024), plus haut depuis 2007 ; majorité CAT 4, aucun CAT 1 ; Asie 132 (+23 %) | ReCAAP ISC Annual Report | 2025 | **fait** mesuré |
| M6  | Pipeline Chine-Myanmar ≈ 400 000 b/j (GEM : 442 000) ≈ 5 % imports chinois | Reuters ; Global Energy Monitor | 2017 / 2025 | estimation (capacité nominale) |
| M7  | Canal de Kra : non réalisé, sans décision ferme (« à l'étude »)            | ERIA                  | 2020-25  | constat qualitatif         |
| M8  | Malaccamax ≈ 20,5–21 m tirant d'eau, ≈ 333 m, ≈ 300 000 tpl                | norme de design (non codifiée) | — | ordre de grandeur technique |
| —   | **Non documenté publiquement** : part imports Japon/Corée via Malacca ; part GNL mondial ; nombre de transits pour le seul détroit ; surcoût Lombok chiffré | — | — | à ne pas inventer |

## Complément — contradiction LLM (ADR 0039, finding Malacca sev 4)

> Objectif : chiffrer la **capacité d'absorption** des alternatives vs le **volume à dérouter**,
> pour étayer (ou nuancer) l'affirmation « report physiquement possible mais non substituable en
> capacité ». Le finding objecte à juste titre qu'aucune donnée chiffrée ne compare la capacité
> mensuelle de Lombok / du pipeline au volume dérouté potentiel. Résultats attendus = **candidats**.

### Prompt Perplexity Recherche Avancée — à coller tel quel

```
Tu es analyste en logistique maritime et sécurité énergétique. Question précise : si le détroit
de MALACCA devenait indisponible, quelle part du trafic pourrait RÉELLEMENT être absorbée par ses
alternatives, et quelle est la contrainte qui plafonne cette absorption ? J'ai besoin de chiffres
sourcés, chacun avec SOURCE PRIMAIRE, URL et DATE. Réponds EN FRANÇAIS. Pour chaque point : (a)
valeur ; (b) date ; (c) source primaire (organisme + document) ; (d) URL ; (e) FAIT mesuré ou
ESTIMATION. Si une donnée n'existe pas publiquement, dis-le explicitement — n'invente rien.
Distingue bien « capacité PHYSIQUE de transit » (le détroit peut-il laisser passer les navires ?)
et « capacité d'ABSORPTION systémique » (la route alternative peut-elle absorber le VOLUME sans
saturer flotte/ports/soutage ?).

VOLUME À DÉROUTER (baseline)
1. Volume de pétrole+liquides et nombre/tonnage de navires transitant Malacca aujourd'hui (rappel
   EIA ≈ 23,2 Mb/j au 1S 2025) — pour fixer l'ordre de grandeur du volume à réabsorber.

DÉTROIT DE LOMBOK
2. Le détroit de Lombok a-t-il une LIMITE physique de débit (profondeur, largeur, courants, trafic
   actuel en navires/an) ? Peut-il accueillir les plus grands pétroliers/porte-conteneurs (VLCC,
   ULCV) que Malacca ne prend pas ?
3. Quel est le trafic ACTUEL de Lombok (navires/an) et existe-t-il une estimation de sa capacité
   résiduelle disponible pour absorber un report depuis Malacca ?
4. Quelle est la contrainte réellement limitante d'un report massif par Lombok : distance/temps
   supplémentaire (donc immobilisation de flotte et baisse du nombre de rotations/an), soutage,
   infrastructure portuaire hors hub de Singapour ? Chiffres si disponibles (+NM, +jours, % de
   capacité de flotte « perdue » par l'allongement).

DÉTROIT DE LA SONDE (SUNDA)
5. Contraintes physiques de Sunda (profondeur, largeur) et types de navires exclus ; capacité
   d'appoint réaliste.

PIPELINE CHINE-MYANMAR (Kyaukphyu → Yunnan)
6. Capacité nominale (rappel ≈ 400 000–442 000 b/j) ET taux d'UTILISATION réel récent (2023-2025) :
   combien de b/j sont EFFECTIVEMENT détournés de Malacca ? Source sur les flux réels, pas seulement
   la capacité de design.

MODÉLISATION / ÉTUDES
7. Existe-t-il des études (universitaires, think tanks, EIA/IEA, IMO) qui MODÉLISENT explicitement
   la capacité d'absorption des alternatives à Malacca en cas de fermeture, avec un chiffre de « %
   du trafic Malacca réabsorbable » et le facteur limitant retenu ?

Termine par : (i) une synthèse « capacité d'absorption réaliste vs volume à dérouter » en une
phrase par alternative ; (ii) la liste des points où les données publiques manquent.
```

### Mapping fiche
Résultats → section _Alternatives / bypass_ (chiffrer Lombok/Sunda/pipeline) + seuil « Flux de brut »
et note _Confiance_.

### Candidats sourcés (recherche Perplexity du 2026-07-14, 2ᵉ salve — CANDIDATS)

| Réf | Fait / estimation (périmètre)                                                     | Source primaire            | Date    | Statut analytique              |
| --- | --------------------------------------------------------------------------------- | -------------------------- | ------- | ------------------------------ |
| M9  | 94 301 navires (détroits Malacca **+** Singapour)                                  | MPA Singapore              | 2024    | **fait** (agrégé, pas Malacca seul) |
| M10 | Lombok profond ≈ 1 000 m, accueille VLCC/gros vraquiers (capacité physique élevée) | littérature recherche-défense FR | —  | appréciation qualitative       |
| M11 | Contrainte plafonnante = **effet de flotte** (rotations perdues par le détour), pas le gabarit ; capacité résiduelle **non chiffrée** | analyse (déduction) | — | estimation analytique          |
| M12 | Pipeline Chine-Myanmar ≈ 1,7–1,9 % du débit total Malacca (23,2 Mb/j) à pleine capacité ; utilisation réelle 2023-25 **non trouvée** | calcul dérivé (capacité GEM/Reuters vs EIA) | — | calcul dérivé |
| —   | **Non documenté publiquement** : trafic annuel Lombok seul ; capacité résiduelle d'absorption ; perte de rotations en % ; contraintes Sunda pour VLCC/ULCV ; flux réels pipeline ; % réabsorbable modélisé | — | — | à ne pas inventer |

**Effet sur le finding ADR 0039 (Malacca sev 4) :** l'affirmation « non substituable en capacité »
est **étayée** (contrainte = effet de flotte, seule alternative quantifiée ≈ 2 %), avec réserve
assumée que la capacité résiduelle exacte n'existe pas en source primaire. Objection traitée sans
surinterprétation.

## Sites bloqués au bot / accès manuel requis

_(à compléter au fil de la collecte : PDF EIA/UNCTAD, portails portuaires derrière sélecteur, etc.)_

## Journal de validation humaine (ADR 0046) — append-only

_(À compléter par l'analyste : `Réf | Statut (candidat → validé/fait) | Fait attesté (périmètre) |
Réserve portée AVEC le fait | Validé par | Date`. Rappel : valider une source ne la promeut pas
automatiquement dans la fiche — l'édition markdown + le flip du gate `sources_ok` est une étape
éditoriale distincte.)_
