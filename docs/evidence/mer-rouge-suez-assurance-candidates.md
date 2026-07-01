# Candidats-sources — Assurance maritime, corridor Mer Rouge / Suez

> **STATUT : CANDIDATS EN ATTENTE DE VALIDATION HUMAINE — PAS DES FAITS.**
> Collectés le 2026-06-27 pour débloquer le gate `sources_ok` du dossier
> `deliv_red_sea_suez_dossier`. Aucune de ces sources ni de ces valeurs ne doit être promue dans le
> dossier canonique ni présentée comme établie avant lecture, recoupement et validation par un
> analyste humain. Les chiffres ci-dessous sont **rapportés** par les sources, non confirmés par nous.
>
> Méthode : découverte via recherche web ; **fetch/vérification via `agent-browser`** (conteneur
> Docker `tools`). Plusieurs sources renvoient un blocage anti-bot (403 / Access Denied / Cloudflare) —
> elles sont marquées `accès manuel requis` et restent à récupérer à la main.

## À obtenir — validation humaine (liste de collecte priorisée)

> Ce qu'il faut trouver/fournir pour hisser la fiche **et** le dossier au niveau universitaire. Priorité
> décroissante. Tant que le point 1 n'est pas levé, le construct **Z** (§3 du dossier) et la thèse
> « assurance-dominé » restent hypothétiques.

1. **CRUCIAL — Trajectoire des primes _war-risk_ (axe 1 / construct Z).** Récupérer manuellement les
   articles bloqués au bot : **S&P Global** (`[C5]`, « Access Denied ») **et Argus Media** (`[C7]`,
   paywall probable). C'est le verrou n°1 : sans trajectoire vérifiée, « retour durable » n'est pas
   démontrable.
2. **Série primaire SCA (`[C16]`).** Télécharger les rapports *Navigation Statistics* de la Suez Canal
   Authority (derrière sélecteur) et extraire la série de transits → recoupement officiel de l'axe 4.
3. **Circulaire JWLA datée (`[C3]`).** Obtenir le périmètre/coordonnées exacts de la zone « High Risk »
   (complète la désignation Joint War Committee).
4. **Communiqué Aspides daté (`[C13]`).** Confirmer les chiffres de protection (≈700 navires, ≈410
   escortes) aujourd'hui seulement « rapportés ».
5. **Série de fréquence d'incidents** Bab el-Mandeb / golfe d'Aden → fonde le seuil « ≥ 1/sem. »
   (actuellement **zéro source**).
6. **Données de durée de fermeture / quasi-fermeture** → fonde le seuil « > 4 sem. » (**zéro source**).
7. **Valider les chiffres exacts** des candidats recoupés : −50 % transit, +74 % Cap, −82 % tonnage,
   586 navires déroutés, surcoût fret ~1 500 → > 4 000 $, conteneurs −66 %, parts 15 % / 22 %.
8. **PDF à lire à la main (403)** : UNCTAD *Navigating troubled waters* (`[C1]`), UNCTAD *RMT 2024* ch.2
   (`[C4]`), IUMI *Stats Report 2024* (`[C9]`) — pour les chiffres exacts.
9. **Benchmark de prime primaire.** Le marché est fragmenté (courtier/navire/cargaison) : arbitrer un
   référentiel unique (surprime zone JWC, coque standard, transit 7 j) pour rendre Z mesurable.

Détails, URLs et blocages : voir la table « Sites bloqués au bot » et « Prochaines actions (humain) » en
bas de ce registre.

---

## Axes de preuve visés (ce que le dossier doit étayer)

1. Niveau **et trajectoire** de la prime _war-risk_ (en % de la valeur coque).
2. **Désignation** de zone à risque de guerre (qui décide, quel périmètre).
3. **Disponibilité** de la couverture (contredit ou confirme « possible indisponibilité »).
4. **Baselines** transit Suez / déroutement Cap (volumes, %, dates).
5. **Charte-partie / force majeure** (hypothèses concurrentes au seul facteur assurance).

---

## Candidats vérifiés via agent-browser (page vivante + chiffre constaté)

### C1 — UNCTAD, _Navigating troubled waters_ (institutionnel) ✅ vérifié

- **URL (page)** : https://unctad.org/publication/navigating-troubled-waters-impact-global-trade-disruption-shipping-routes-red-sea-black
- **URL (PDF)** : https://unctad.org/system/files/official-document/osginf2024d2_en.pdf · **Date : février 2024**
- **Type** : `institutionnel` · **Accès** : libre
- **Étaye (axe 4)** : « container tonnage crossing the canal fell by **82 %** » ; « **586** container vessels had been rerouted » (1ʳᵉ quinzaine février 2024) ; « **22 %** of global seaborne container trade » via Suez en 2023.
- **Note** : la page HTML s'ouvre ; le PDF bloque WebFetch (403) → confirmer les chiffres exacts dans le PDF à la main.

### C2 — IUMI via _The Maritime Executive_ (presse spécialisée rapportant l'IUMI) ✅ vérifié

- **URL** : https://maritime-executive.com/article/as-war-risk-spikes-in-red-sea-iumi-says-cover-remains-affordable
- **Type** : `presse_specialisee` (rapporte une déclaration **IUMI** = `institutionnel`) · **Accès** : libre
- **Étaye (axes 1 & 3)** : prime _war-risk_ Red Sea passée d'« about **0.01 %** of vessel value in early December » à « as much as **1.0 %** in recent weeks » ; IUMI : couverture « at affordable prices », disponible pour Suez **et** route du Cap. → **nuance la thèse d'« indisponibilité de couverture »**.

### C3 — Joint War Committee (LMA/IUA), _Listed Areas — Hull War, Piracy, Terrorism_ (réglementaire/marché) ✅ vérifié

- **URL (comité)** : https://lmalloyds.com/committee/joint-war-committee/
- **Type** : `institutionnel` / `reglementaire` (référence de désignation de zone) · **Accès** : libre
- **Étaye (axes 2 & 3)** : Southern Red Sea & Gulf of Aden classés **« High Risk »** ; couverture hull war « remains in place and available in the London market ». C'est **la** source canonique de la désignation de zone à risque de guerre.
- **À compléter** : circulaire JWLA datée (périmètre géographique précis, coordonnées) — voir liste « accès manuel ».

---

## Candidats attestés par la recherche — à fetcher/vérifier (dont sites bloqués au bot)

### C4 — UNCTAD, _Review of Maritime Transport 2024_, ch. 2 « Navigating maritime chokepoints » (institutionnel)

- **URL (PDF)** : https://unctad.org/system/files/official-document/rmt2024ch2_en.pdf · **Date : 2024**
- **Type** : `institutionnel` · **Accès** : libre · **Étaye (axe 4)** : chokepoints, déroutement, coûts. **PDF à lire à la main** (WebFetch 403).

### C5 — S&P Global, _Maritime war risk premiums fall in Red Sea, rise in Black Sea_ (presse spécialisée) — ⛔ `accès manuel requis`

- **URL** : https://www.spglobal.com/energy/en/news-research/latest-news/shipping/120425-maritime-war-risk-premiums-fall-in-red-sea-rise-in-black-sea-amid-changing-security-dynamics
- **Bloqué** : « Access Denied » au bot · **Date apparente** : déc. 2025
- **Étaye (axe 1 — trajectoire / « retour durable »)** : baisse des primes Red Sea → **crucial** pour la question stratégique. À récupérer manuellement.

### C6 — NorthStandard (P&I), _Red Sea and Gulf of Aden — Insurance and Charterparty Considerations_ — ⛔ `accès manuel requis`

- **URL** : https://north-standard.com/insights-and-resources/resources/articles/red-sea-and-gulf-of-aden-insurance-and-charterparty-considerations
- **Bloqué** : 403 Forbidden au bot
- **Type** : `rapport_entreprise` (club P&I, source praticienne) · **Étaye (axe 5)** : assurance **+ charte-partie / force majeure** → couvre l'angle « hypothèses concurrentes ».

### C7 — Argus Media, _Red Sea war risk premiums soar_ (presse spécialisée)

- **URL** : https://www.argusmedia.com/en/news-and-insights/latest-market-news/2521129-red-sea-war-risk-premiums-soar
- **Type** : `presse_specialisee` · **Accès** : probablement restreint (à confirmer) · **Étaye (axe 1)** : montée des primes.

### C8 — Policyholder Pulse (cabinet d'avocats), _Red Sea Transit — Premiums and Coverage Exclusions_ (analyse secondaire)

- **URL** : https://www.policyholderpulse.com/red-sea-transit-insurance-premiums-coverage-exclusions/ · **Date : 26 fév. 2024**
- **Type** : `analyse_secondaire` · **Étaye (axes 1 & 3)** : trajectoire 0.05 % → 0.7 % → 1 % ; **exclusions de couverture**.

### C9 — IUMI, _Stats Report 2024_ (source primaire institutionnelle)

- **URL (PDF)** : https://iumi.com/wp-content/uploads/2024/12/IUMI-Stats-Report-2024.pdf (domaine réel **iumi.com**, pas `.org`)
- **Type** : `institutionnel` / `rapport_entreprise` · **Étaye (axe 1, contexte marché)** : prime marine mondiale ~USD 38,9 Md (2023) ; ocean hull ~USD 9,2 Md. **PDF à valider à la main.**

---

## Candidats ouverts récupérés via agent-browser (2026-06-28) — recoupement indépendant

> Collectés le 2026-06-28 pour fournir des **secondes sources indépendantes** là où les axes ne
> reposaient que sur une source (axe 4 = UNCTAD seul ; axe 2 = JWC seul ; axe 5 = NorthStandard, bloquée).
> Mêmes réserves : **candidats, chiffres rapportés, non confirmés**, à recouper avant toute promotion.

### C10 — IMF, _Red Sea Attacks Disrupt Global Trade_ / plateforme **PortWatch** (institutionnel) ✅ vérifié

- **URL (blog)** : https://www.imf.org/en/blogs/articles/2024/03/07/red-sea-attacks-disrupt-global-trade · **Date : 7 mars 2024**
- **URL (plateforme)** : https://portwatch.imf.org · **Type** : `institutionnel` / `donnees_ouvertes` · **Accès** : libre (blog OK ; dashboard = JS/ArcGIS, données via API)
- **Étaye (axe 4)** : transit Suez **−50 %** en glissement annuel sur les 2 premiers mois 2024 ; trafic au Cap de Bonne-Espérance **+74 %** ; ~**15 %** du commerce maritime mondial passe normalement par Suez ; délais +**10 jours** ou plus.
- **Note** : **2ᵉ source indépendante d'UNCTAD** sur la chute de transit (méthode high-frequency transit estimates, distincte d'UNCTAD). Débloque le recoupement de l'axe 4.

### C11 — Kiel Institute, _Kiel Trade Indicator 12/23 — Cargo volume in the Red Sea collapses_ (institutionnel) ✅ vérifié

- **URL** : https://www.kielinstitut.de/publications/news/cargo-volume-in-the-red-sea-collapses/ · **Date : décembre 2023**
- **Type** : `institutionnel` (institut de recherche) · **Accès** : libre
- **Étaye (axe 4)** : volume de conteneurs en Mer Rouge **~66 % sous** le volume attendu (réf. 2017-2019) ; **~200 000** conteneurs/jour (déc. 2023) contre **~500 000** en novembre ; détour par le Cap **+7 à 20 jours** ; fret 40′ Chine→Europe du Nord **~1 500 $ → >4 000 $**.
- **Note** : 3ᵉ angle indépendant (méthode propre Kiel, distincte d'UNCTAD et d'IMF) — conforte l'axe 4.

### C12 — gCaptain, _IMF PortWatch: Suez Canal Trade Cut in Half_ (presse spécialisée) ✅ vérifié

- **URL** : https://gcaptain.com/imf-portwatch-suez-canal-trade-cut-in-half/
- **Type** : `presse_specialisee` (relaie IMF PortWatch) · **Accès** : libre
- **Étaye (axe 4)** : reprend **−50 %** Suez / **+74 %** Cap / **−32 %** Panama (premier trimestre 2024). Recoupement presse libre des chiffres IMF.

### C13 — EEAS, _About Operation EUNAVFOR ASPIDES_ + Conseil de l'UE (institutionnel / réglementaire) ✅ vérifié

- **URL (EEAS)** : https://www.eeas.europa.eu/eunavfor-aspides/about-operation-eunavfor-aspides_en
- **URL (Conseil — extension mandat)** : https://www.consilium.europa.eu/en/press/press-releases/2026/02/23/red-sea-council-extends-the-mandate-of-operation-aspides-to-safeguard-freedom-of-navigation/
- **Type** : `institutionnel` / `reglementaire` · **Accès** : libre
- **Étaye (axe 2 + seuils)** : attaques Houthis sur navires marchands en **Mer Rouge, Golfe d'Aden et Mer d'Arabie** depuis oct. 2023 ; **UNSC Rés. 2722** (10 janv. 2024) ; opération lancée le **19 fév. 2024**, mandat prolongé jusqu'au **28 fév. 2026**. Recoupe la désignation de zone du JWC (C3) par une autorité distincte.
- **Note** : les chiffres de protection (≈700 navires accompagnés, ≈410 escortes rapprochées, missiles/drones interceptés) sont **rapportés par l'EU Naval Force / la presse** → candidat à confirmer sur communiqué Aspides daté.

### C14 — BIMCO, _War Risks Clause for Time Chartering 2013 (CONWARTIME 2013)_ (réglementaire / marché) ✅ vérifié

- **URL** : https://www.bimco.org/contractual-affairs/bimco-clauses/earlier-clauses-list/war_risks_clause_for_time_charters_2013/ · **Note** : la page signale une édition plus récente **CONWARTIME 2025**.
- **Type** : `institutionnel` / `reglementaire` (clause-type de marché) · **Accès** : libre
- **Étaye (axe 5)** : l'armateur n'est **pas tenu** de transiter une « Area » où le navire/cargaison/équipage **peut être exposé** à des _war risks_, selon le **jugement raisonnable** du Master/Owners, que le risque ait existé ou non à la signature ; l'affréteur **rembourse les surprimes** war-risk. Base contractuelle de l'angle force majeure / refus d'ordre.

### C15 — Skuld (club P&I), _Houthi attacks on Red Sea shipping: Charterparty implications_ (praticien) ✅ vérifié

- **URL** : https://www.skuld.com/topics/legal/pi-and-defence/houthi-attacks-on-red-sea-shipping-charterparty-implications/
- **Type** : `rapport_entreprise` (club P&I, source praticienne) · **Accès** : libre
- **Étaye (axe 5)** : motifs **contractuels et de common law** pour refuser un ordre de transit / dérouter ; une déviation non justifiée = **breach** + possible mise **off-hire**. **2ᵉ source praticienne** indépendante de NorthStandard (C6, bloquée).

### C16 — Suez Canal Authority, _Navigation Statistics_ (source primaire institutionnelle) ⚠️ accès partiel

- **URL** : https://www.suezcanal.gov.eg/English/Navigation/Pages/NavigationStatistics.aspx
- **Type** : `institutionnel` (autorité gestionnaire) · **Accès** : page vivante, mais les séries (nombre/tonnage par type, statistiques annuelles) sont derrière un **sélecteur de rapport / téléchargements** → pas de chiffre extractible en l'état.
- **Étaye (axe 4)** : **source primaire** du transit Suez — à extraire à la main depuis les rapports téléchargeables pour un recoupement officiel des baselines.

---

## Sites bloqués au bot (à fournir manuellement)

| Source                                      | URL                                                                                                                                                                       | Blocage                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| S&P Global (primes Red Sea/Black Sea)       | https://www.spglobal.com/energy/en/news-research/latest-news/shipping/120425-maritime-war-risk-premiums-fall-in-red-sea-rise-in-black-sea-amid-changing-security-dynamics | Access Denied                |
| NorthStandard (assurance + charte-partie)   | https://north-standard.com/insights-and-resources/resources/articles/red-sea-and-gulf-of-aden-insurance-and-charterparty-considerations                                   | 403 Forbidden                |
| UNCTAD — _Navigating troubled waters_ (PDF) | https://unctad.org/system/files/official-document/osginf2024d2_en.pdf                                                                                                     | WebFetch 403 (page HTML OK)  |
| UNCTAD — RMT 2024 ch.2 (PDF)                | https://unctad.org/system/files/official-document/rmt2024ch2_en.pdf                                                                                                       | À vérifier (probable 403)    |
| UNCTAD — moteur de recherche interne        | https://unctad.org/search?keys=Red%20Sea                                                                                                                                  | Cloudflare « Just a moment » |
| IUMI — Stats Report 2024 (PDF)              | https://iumi.com/wp-content/uploads/2024/12/IUMI-Stats-Report-2024.pdf                                                                                                    | À vérifier                   |
| Argus Media                                 | https://www.argusmedia.com/en/news-and-insights/latest-market-news/2521129-red-sea-war-risk-premiums-soar                                                                 | Paywall probable             |

## État du recoupement par axe (au 2026-06-28)

- **Axe 4** (baselines Suez / déroutage) : désormais **3 sources indépendantes** d'UNCTAD — IMF/PortWatch (C10), Kiel (C11), gCaptain/IMF (C12) ; SCA (C16) = source primaire à extraire. → **condition « ≥ 2 sources » satisfaite**, reste la validation humaine des chiffres exacts.
- **Axe 2** (désignation de zone) : JWC (C3) **+** EEAS/Aspides + Conseil UE (C13). → recoupé.
- **Axe 5** (charte-partie / force majeure) : BIMCO CONWARTIME (C14) **+** Skuld (C15), indépendamment de NorthStandard (C6, bloquée). → recoupé.
- **Axe 1** (niveau **et trajectoire** des primes) : encore dépendant de C2/C8 (niveau) et de C5/C7 **bloquées** (trajectoire « retour durable »). → **gap restant**, voir sites bloqués.

## Prochaines actions (humain)

1. Fournir manuellement le contenu des sites bloqués pour l'**axe 1** en priorité (S&P C5, Argus C7) et l'angle praticien d'origine (NorthStandard C6) ; PDF UNCTAD/IUMI pour chiffres exacts.
2. Recouper/valider chaque chiffre des candidats ouverts (C10–C16) — rappel : valeurs **rapportées**, non confirmées.
3. Récupérer la **circulaire JWLA datée** (périmètre/coordonnées) et un **communiqué Aspides daté** (chiffres de protection) pour la désignation/intensité de zone.
4. Extraire les séries de transit depuis les **rapports SCA** (C16) pour un recoupement officiel de l'axe 4.
5. Une fois validé : intégrer au dossier avec citation normée + incertitude par affirmation, et passer `sources_ok = true`.
