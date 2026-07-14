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

---

## Salve Perplexity Recherche Approfondie (2026-07-12) — vérifiée via `pplx`, renumérotée C17+

> **STATUT : CANDIDATS EN ATTENTE DE VALIDATION HUMAINE — PAS DES FAITS.** Moisson issue d'un prompt
> Perplexity Deep Research (voir plan de session), puis **triée et vérifiée** via la chaîne de sourcing
> ADR 0064 (`pplx verify --answer --fresh` / `fetch-url`). Numérotation **C17+** pour ne pas écraser le
> registre C1–C16 ci-dessus (la sortie brute rouvrait C1, avec un sens différent). Les verdicts `pplx`
> qualifient chaque claim ; ils **ne valent pas validation humaine**. Chiffres **rapportés**, non confirmés.
>
> **Rejets actés (confabulation du moteur) — ne pas ressaisir :**
>
> - Frappes « M/V Tavvishi / M/V Norderney, golfe d'Aden, 8-9 juin **2026** » (source *The Ops Con*) :
>   événement **réel de juin 2024** (Reuters, France24, CENTCOM), recyclé en 2026. **Rejeté.**
> - « **28 incidents** d'attaques au T1 2026 » (source *Turqoa*) : **contredit** par la MARAD Advisory
>   2026-006 (« *the Houthi… has not attacked commercial ships since the Israel-Gaza ceasefire agreement
>   in October 2025* »). **Rejeté.**
> - « Repricing JWC multi-théâtre, avril 2026 » (*arcaneintel.net*, auto-tagué `signal_faible`) : non
>   recoupé, domaine à faible notoriété. **Écarté** (à ne reprendre que sur source institutionnelle).
> - Renvois internes de la synthèse Perplexity vers « C79 / C86 / C98 » : **identifiants inexistants**
>   (registre s'arrêtant à C45) → signal de confabulation, ignorés.

### Axe 1 — Trajectoire de la prime _war-risk_ (le **verrou n°1**, désormais recoupé)

### C17 — Reuters, _War risk insurance rates edge up after surge in Red Sea ship attacks_ (presse spécialisée) ✅ pplx `supported`

- **URL** : https://www.reuters.com/world/middle-east/war-risk-insurance-rates-edge-up-after-surge-red-sea-ship-attacks-2023-12-04/ · **Date : 4 déc. 2023**
- **Type** : `presse_specialisee` · **Accès** : libre
- **Étaye (axe 1 — baseline / départ de trajectoire)** : primes _war-risk_ Red Sea « **0.05 % to 0.1 %** of the value of a ship, from around **0.03 %** » avant la vague d'attaques. Point bas de la trajectoire.
- **Recoupement** : cohérent avec l'ancien C2 (IUMI/Maritime Executive : « 0.01 % → 1 % ») et C8 (Policyholder Pulse : « 0.05 % → 0.7 % → 1 % »).

### C18 — Reuters, _Red Sea insurance soars after deadly Houthi ship attacks_ (presse spécialisée) ✅ pplx `supported`

- **URL** : https://www.reuters.com/business/autos-transportation/red-sea-insurance-soars-after-deadly-houthi-ship-attacks-2025-07-10/ · **Date : 10 juil. 2025**
- **Type** : `presse_specialisee` · **Accès** : libre
- **Étaye (axe 1 — pic de juillet 2025)** : « War risk premiums have risen to around **0.7 %** of the value of a ship, from around **0.3 %** last week », à la suite du naufrage des _Magic Seas_ et _Eternity C_ (6-7 juil. 2025).
- **Recoupement (≥ 3 sources indépendantes)** : programbusiness (« 0.3 % → 0.7 %, some quoting up to 1 % »), shippingwatch/Financial Times (« **1 %** of hull value from about **0.4 %** before the first attack on July 6 »), Pole Star. → **niveau ET spike recoupés**.

### C19 — S&P Global (Platts), _Maritime war risk premiums fall in Red Sea, rise in Black Sea_ (presse spécialisée) ✅ pplx `supported` — **débloque l'ancien C5**

- **URL** : https://www.spglobal.com/energy/en/news-research/latest-news/shipping/120425-maritime-war-risk-premiums-fall-in-red-sea-rise-in-black-sea-amid-changing-security-dynamics · **Date : 4 déc. 2025**
- **Type** : `presse_specialisee` (relaie Platts / sources marché) · **Accès** : ⚠️ page bloquée au bot (ancien C5 « Access Denied »), **mais contenu extrait via `pplx`**.
- **Étaye (axe 1 — décrue post-cessez-le-feu, la question stratégique « retour durable »)** : « The rate has fallen to around **0.2 %** of hull value from **0.5 %** before the ceasefire, a UK-based insurance source told Platts » (cessez-le-feu Gaza, oct. 2025).
- **Note** : c'est **la** donnée qui manquait à l'axe 1 (trajectoire de décrue). Reste une valeur **rapportée** par une source de marché anonyme → à valider ; idéalement recouper sur la série primaire JWC/LMA (voir sites bloqués).

> **Trajectoire consolidée (rapportée, à valider)** : ~0,03–0,05 % (avant oct. 2023) → 0,3–0,5 % (déc. 2023,
> C17) → jusqu'à ~1 % (début 2024, C2/C8) → ~0,3 % → 0,7 %/jusqu'à 1 % (juil. 2025, C18) → ~0,2 % (après le
> cessez-le-feu d'oct. 2025, C19). Verdict `pplx` d'ensemble : `partially_supported` (paliers solides ;
> valeurs de **pic** ponctuelles plus fragiles). **L'axe 1 passe de « gap » à « recoupé, en attente de
> validation humaine ».**

### Axe 2 — Série de fréquence d'incidents (fondait un seuil **« ≥ 1/semaine »** auparavant **zéro source**)

### C20 — ACLED, _Regional power struggles fuel simmering tensions across the Red Sea_ (institutionnel / données ouvertes) ✅ pplx `supported`

- **URL** : https://acleddata.com/report/regional-power-struggles-fuel-simmering-tensions-across-red-sea · **Date : 11 déc. 2025**
- **Type** : `institutionnel` / `donnees_ouvertes` · **Accès** : libre (résumé ; base ACLED complète sur inscription)
- **Étaye (axe 2 — intensité de la menace, tendance annuelle)** : « The sharp drop in Houthi attacks on commercial vessels — only **seven in 2025**, compared to **150 in 2024** » ; « ACLED records **84 %** fewer Houthi attacks in the Red Sea than in all of 2024 ».
- **Caveat** : totaux **annuels**, pas une série hebdomadaire — étaye la *magnitude* du seuil « incidents », pas directement le pas « ≥ 1/semaine sur 3 semaines » de la fiche. Une série mensuelle/hebdomadaire reste à extraire de la base ACLED avant de lever la mention « Hypothèse — non sourcé ».

### C21 — ACLED, _A Red Sea hall of mirrors: US and Houthi statements vs. actions_ (institutionnel) ✅ pplx `supported`

- **URL** : https://acleddata.com/report/red-sea-hall-mirrors-us-and-houthi-statements-vs-actions · **Date : 26 juin 2025**
- **Type** : `institutionnel` · **Accès** : libre
- **Étaye (axe 2 — volumétrie de la campagne)** : « more than **520 attacks** — targeting at least **176 ships** » sur ~18 mois ; « **774 airstrike events**… between 12 January 2024 and 6 May 2025 » (frappes US/coalition sur le Yémen — à distinguer des attaques maritimes).

### Menace / rafraîchissement — source primaire d'autorité

### C22 — US MARAD (Maritime Administration), _Advisory 2026-006 — Red Sea, Bab el-Mandeb, Gulf of Aden…_ (institutionnel / réglementaire) ✅ pplx vérifiée (existence + contenu)

- **URL** : https://www.maritime.dot.gov/msci/2026-006-red-sea-bab-el-mandeb-strait-gulf-aden-arabian-sea-and-somali-basin-houthi-attacks · **Date : 26 mars 2026** (active jusqu'au 22 sept. 2026)
- **Type** : `institutionnel` / `reglementaire` · **Accès** : libre
- **Étaye (axes 2 & 3 — statut de la menace, chronologie officielle)** : « On **July 6-8, 2025**, the Houthis attacked and sank **two commercial vessels** in the southern Red Sea, killing **four seafarers** » ; « the Houthi… **has not attacked commercial ships since the Israel-Gaza ceasefire agreement in October 2025** ». (Perplexity rapporte en sus « **more than 100 incidents** between Nov. 2023 and Oct. 2025 affecting vessels from over 60 nations » — à confirmer sur le texte.)
- **Note** : source **primaire** qui **invalide** deux candidats bruts (frappes « juin 2026 » et « 28 incidents T1 2026 ») → sert de garde-fou chronologique.

### Axe 4 — Baselines transit / flux énergétiques (recoupement/actualisation)

### C23 — Suez Canal Authority, _Suez Canal Traffic Statistics — Annual Report 2025_ (source primaire institutionnelle) ✅ **PDF primaire lu en entier (2026-07-12)**

- **URL (PDF)** : `https://www.suezcanal.gov.eg/English/Downloads/DownloadsDocLibrary/Navigation Reports/Annual Reports<U+200B×3>/2025.pdf` — ⚠️ **le chemin publié contient trois espaces de largeur nulle** (`%E2%80%8B`) entre « Annual Reports » et « /2025.pdf » ; le chemin « propre » renvoie 404. Téléchargé avec le chemin exact (http 200, 932 ko, SCA « Planning & Research Dept. »).
- **Type** : `institutionnel` (autorité gestionnaire) · **Accès** : PDF public (récupéré à la main).
- **Étaye (axe 4 — série primaire officielle, décomposition par type)** :
  - **Total transits** (Table 1) : 2023 = **26 434** (record ; 1 568 Mt net ; 72,4/jour) → 2024 = **13 213** (524,5 Mt) → 2025 = **12 758** (522,1 Mt ; 35,0/jour). Soit 2025 vs 2023 = **−51,7 %** en navires et **−66,7 %** en tonnage net.
  - **Par type de navire, 2024 → 2025** (Table 3) : Tankers 4 954 → 4 991 (+0,7 %) ; **LNG 119 → 282 (+137 %)** ; Bulk −16,6 % ; Container 1 748 → 1 840 (**+5,3 % en nombre**, mais **−3,1 % en tonnage net** → navires plus petits) ; Car Carr. +46,7 % ; Général −7,2 %.
  - **Parts 2025** (par nombre) : Tankers 39 %, Bulk 27 %, **Container 15 %**, Général 11 %, LNG 2 %.
  - **Cargo par sens** (Table 4) : Nord→Sud −5,4 %, Sud→Nord +20,4 %, total +1,4 %.
- **Nuance décisive** : les deltas **2025 vs 2024** sont faibles (deux années déjà effondrées) et **ne doivent pas se lire comme une reprise** — vs **2023**, la chute reste massive (−52 % navires). Le « +5,3 % conteneurs » SCA (tous conteneurs, feeders inclus) est cohérent avec le WSC (C25) : petits porteurs revenus, gros porteurs (≥ 7 500 EVP) quasi absents.
- **Recoupement** : total 2023 = 26 434 confirmé aussi par le WSC (C25). Chiffres primaires figés ; validation humaine avant promotion.

### Escalade `agent-browser` (2026-07-12) — EUNAVFOR Aspides : résultat négatif consigné

- **Cible** : pages primaires EEAS « **Operation in Numbers** » (16.05.2026) et « **2025 Year in Review** » (25.02.2026), réclamées au point 4 de la liste humaine (chiffres de protection ≈ 700 navires / ≈ 410 escortes).
- **Méthode** : `agent-browser` dans le conteneur `tools` (ouverture + `wait networkidle` + snapshot texte + capture pleine page).
- **Résultat** : **les figures chiffrées sont enfermées dans une vidéo** ; le texte des pages ne contient **aucun nombre** (« *2025 marked the 2nd year of EUNAVFOR ASPIDES* »). → les chiffres de protection **restent non confirmés sur la source primaire** ; la mention « rapportés par la presse » (ancien C13) tient. Prochaine tentative : communiqué PDF/infographie Aspides daté, ou lecture de la vidéo.

### C24 — US EIA, _Fewer tankers transit the Red Sea in 2024_ (institutionnel) ✅ **PDF/page primaire lue (2026-07-12)**

- **URL (primaire)** : https://www.eia.gov/todayinenergy/detail.php?id=63446 · **Date réelle : ~oct. 2024** (et **non** « mars 2026 » comme l'indiquait la sortie brute — correction).
- **Type** : `institutionnel` (EIA, calculs Vortexa) · **Accès** : page vivante (lue à la main via curl, http 200) ; relais libres safety4sea / NAM / Mansfield.
- **Étaye (axe 4 — flux énergétique Bab el-Mandeb)** : « Oil trade flows through the Bab el-Mandeb Strait averaged **4.0 million b/d in 2024 through August** compared with **8.7 million b/d** » (2023) ; flux contournant le **Cap de Bonne-Espérance** « increased to **9.2 million b/d** ».
- **Caveat** : le « 4,0 mb/j » porte sur **2024 jusqu'à août**, pas l'année pleine. Chiffres **rapportés** (Vortexa/AIS ; possible sous-estimation des tankers « dark »).

### C25 — World Shipping Council, _Red Sea: Overview of necessary capacity and current transit_ (rapport primaire) ✅ **PDF primaire lu (2026-07-12)**

- **URL (PDF)** : https://static1.squarespace.com/static/5ff6c5336c885a268148bdcc/t/696636194507fd634e6cc377/1768306201173/WSC+Red+Sea+Data+Sheet_June+2026.pdf · **Date du document : janvier 2026** (le nom de fichier « June 2026 » est trompeur — se fier à l'en-tête interne).
- **Type** : `rapport_entreprise` / `donnees_ouvertes` (WSC, d'après Alphaliner, Lloyd's List, IMF PortWatch) · **Accès** : libre (PDF téléchargé et lu).
- **Étaye (axe 4 — baselines et décomposition par taille, chiffres exacts)** :
  - SCA officiel : **26 434** transits en 2023 (record) ; porte-conteneurs ≈ 22 %, soit **5 847** navires (~16/jour).
  - Porte-conteneurs Suez **globaux 2025 ≈ 32 % de 2023** ; **nov. 2025 ≈ 31 %** de nov. 2023 → « two out of three » déroutés par le Cap. *(Résout l'ambiguïté du verdict `pplx` : le « 32 % » vaut pour les conteneurs **globaux**, pas le DWT.)*
  - **Divergence par taille** : gros porte-conteneurs (≥ 7 500 EVP) Suez 2025 = **5,7 % de 2023** (nov. 6,3 %) ; **seulement 9 transits** ≥ 7 500 EVP via Bab el-Mandeb sur toute 2025 → retrait quasi total des lignes Asie-Europe. Petits (< 7 500 EVP) = **91 % de 2023** (nov. ~98 %, quasi normalisés).
  - Bab el-Mandeb (Lloyd's List, sept.–nov. 2025) : tous cargos ≈ **43–48 % de 2023** ; par tonnage de port en lourd **35–39 %**.
  - IMF PortWatch (beta) : Bab el-Mandeb 2025 ≈ **45 %** du pré-crise (nov. ≈ 49 %) ; Suez nov. 2025 ≈ **56 %** ; en tonnes, Bab el-Mandeb ≈ **35 %**, Suez ≈ **41 %** de 2023.
- **Note** : source **primaire** consolidant l'axe 4 par segment. Chiffres à valider par un humain avant promotion, mais **la fourchette « 14–32 % » que `pplx` opposait est ici résolue** (conteneurs globaux 32 %, gros porteurs 5,7 %).

### Clôture des points ouverts (2026-07-12) — C26 à C28

### C26 — EUNAVFOR Aspides : navires protégés — **corrige l'ancien C13** (« ≈ 700 » était le plafond de troupes) ⚠️ pplx `partially_supported` (medium)

- **Sources** : CIMSEC, _« With the Shield, or On It? »_ (analyse navale, https://cimsec.org/with-the-shield-or-on-it-aspides-and-the-eu-aspirations-for-sea-control/, 2026-04-07) ; communiqué du Conseil UE (https://north-africa-middle-east-gulf.ec.europa.eu/news/red-sea-council-extends-mandate-operation-aspides-safeguard-freedom-navigation-2026-02-23_en, 2026-02-23) ; gCaptain.
- **Type** : `analyse_secondaire` (CIMSEC) + `institutionnel` (Conseil UE) · **Accès** : libre.
- **Étaye (axe 2 / gouvernance)** : Aspides « provided support to **over 1,200 ships** » (CIMSEC, avr. 2026) ; mandat prolongé jusqu'au **28 fév. 2027**, ~**15 M€** (Conseil UE, gCaptain).
- **Correction actée** : l'ancien C13 donnait « ≈ 700 navires » — c'est en fait le **plafond de militaires allemands** (Bundeswehr), pas un compte de navires. Le bon ordre de grandeur est **> 1 000 navires**.
- **Caveat** : le « 1 200 » vient d'une **analyse secondaire** ; le **communiqué officiel du Conseil ne publie pas le compte en texte** → le nombre exact officiel (et les protections rapprochées / menaces interceptées) reste dans la **vidéo/infographie EEAS « Operation in Numbers »**, à extraire pour un chiffre primaire.

### C27 — Cadence d'attaques au pic — fonde le seuil « ≥ 1/semaine » (ancienne « Hypothèse — non sourcé ») ✅ pplx `supported`

- **Sources** : CNBC (https://www.cnbc.com/2024/01/09/houthi-militias-launch-biggest-attack-to-date-on-merchant-vessels-in-red-sea.html, 2024-01-09) ; USNI News (_Top Stories 2024_, 2025-01-02) ; Wikipedia _Houthi attacks on commercial vessels_.
- **Type** : `presse_specialisee` / `institutionnel` · **Accès** : libre.
- **Étaye (axe 2 — seuil de fréquence)** : CNBC parle de la « **26th Houthi attack** on commercial shipping lanes in the Red Sea since Nov. 19 » au **9 janv. 2024** → ~26 attaques en ~51 jours ≈ **3,6/semaine** ; USNI : « the first couple of months of 2024 saw **nonstop** Houthi attacks ». Le seuil « ≥ 1/semaine sur 3 semaines » est **largement dépassé** au pic (déc. 2023 – printemps 2024).
- **Note** : fonde la **plausibilité** du seuil ; une **série hebdomadaire continue** (base ACLED) reste souhaitable pour le calibrer finement avant de lever la mention dans la fiche.

### C28 — Précédent de fermeture longue — fonde le seuil « durée > 4 semaines » (ancienne « Hypothèse — non sourcé ») ✅ pplx `supported`

- **Sources** : Wikipedia _Closure of the Suez Canal (1967-1975)_ ; CEPR / VoxEU ; Atlantic Council (_A lifeline under threat_, 2025-03-20) ; ScienceDirect (Feyrer, natural experiment).
- **Type** : `institutionnel` / `analyse_secondaire` · **Accès** : libre.
- **Étaye (axe 4 — seuil de durée / scénario « rupture »)** : le canal a été **totalement fermé 8 ans** (5 juin 1967 → 5 juin 1975), « a disruption unprecedented in the canal's history » ; précédent secondaire : fermeture nov. 1956 → avr. 1957 (~5 mois, crise de Suez).
- **Nuance décisive** : l'épisode Houthi **n'est pas une fermeture** (le canal reste ouvert) mais un **déroutage** ; le seuil « > 4 sem. » vise l'événement rare de fermeture — les précédents 1967-75 / 1956-57 en établissent la **réalité historique**, pas une occurrence actuelle.

### État du recoupement par axe (mise à jour 2026-07-12)

- **Axe 1** (niveau **et trajectoire** des primes) : **désormais recoupé** — baseline (C17), pic juil. 2025
  (C18 + 3 relais), décrue post-cessez-le-feu (C19, ex-C5 débloquée). Ne restait « gap » depuis 2026-06-28.
  → validation humaine + série primaire JWC/LMA pour promotion.
- **Axe 2 / seuil incidents** : magnitude annuelle recoupée (C20/C21, ACLED) + garde-fou primaire (C22, MARAD)
  + **cadence de pic fondée** (C27 : ~3,6 attaques/sem. au 9 janv. 2024) → le seuil « ≥ 1/sem. » n'est plus
  « non sourcé ». Reste une **série hebdomadaire continue** (base ACLED) pour le calibrage fin.
- **Axe 4** : **3 PDF/pages primaires lus (2026-07-12)** — SCA _Annual Report 2025_ (C23, décomposition par type +
  série 1975-2025), WSC janv. 2026 (C25, décomposition par taille), EIA (C24, 4,0 vs 8,7 mb/j). Base 2023
  (26 434) recoupée SCA×WSC. **Chiffres exacts figés**, à valider par un humain avant promotion.
- **Gouvernance / Aspides** : escalade `agent-browser` → chiffres officiels en vidéo ; **contournée en texte** (C26 :
  > 1 200 navires, CIMSEC) qui **corrige l'ancien « ≈ 700 »** (= plafond de troupes). Compte officiel exact encore
  à extraire de la vidéo/infographie EEAS.
- **Durée de fermeture (seuil « > 4 sem. »)** : **fondée par précédent historique** (C28 : fermeture 8 ans 1967-75 ;
  ~5 mois 1956-57). Nuance : l'épisode actuel est un **déroutage**, pas une fermeture.

### Prochaines actions (humain) — mise à jour

1. **Escalade `agent-browser`** (conteneur `tools`) pour les sources primaires encore bloquées au bot :
   JWLA-032 complet (LMA/IUA), IUMI Stats, série S&P/Platts, chiffres EUNAVFOR Aspides.
2. ✅ **Fait (2026-07-12)** : les 3 primaires (SCA C23, WSC C25, EIA C24) sont téléchargés/lus, chiffres figés
   ci-dessus — dont la décomposition SCA par type de navire. Le chemin PDF SCA exact (avec 3 espaces de largeur
   nulle) est consigné dans C23 pour re-téléchargement.
3. **Extraire de la base ACLED** une série d'incidents mensuelle/hebdomadaire pour fonder (ou corriger) le
   seuil « ≥ 1/semaine » — condition pour lever « Hypothèse — non sourcé » dans la fiche.
4. **Ne pas** promouvoir ces valeurs dans la fiche/dossier tant que la validation nominative (ADR 0046) n'est
   pas enregistrée ; les rejets actés (Tavvishi 2026, 28 incidents T1 2026, repricing arcaneintel) ne doivent
   pas réapparaître.

---

## Salve Perplexity Recherche Approfondie (2026-07-14) — mission RENFORCEMENT, vérifiée pdf/page réelle, renumérotée C29+

> **STATUT : CANDIDATS EN ATTENTE DE VALIDATION HUMAINE — PAS DES FAITS.** Campagne **RENFORCEMENT**
> (prompt monté depuis `docs/research/prompt-perplexity-canonique.md`, 5 objets G1–G5) lancée en
> Perplexity Deep Research, puis **vérifiée sur le document réel** : les trois PDF (JWLA-033, JMIC,
> IUMI) ont été **téléchargés et lus dans le conteneur `tools`** (`pdf-parse`, chemin Docker-only) ;
> la page EEAS via `pplx fetch-url`. Chiffres **rapportés**, non promus. Objectif : **battre** les
> appuis presse/rapportés par des sources primaires — **aucune rétrogradation**.
>
> **URL résolues (curl, 2026-07-14)** : JWLA-033 `200 application/pdf`, JMIC `200 application/pdf`,
> EEAS mandate `200 text/html`, IUMI 2025 `200 application/pdf`. S&P/Platts (axe 1, ci-dessous) reste
> **`403` au bot**.

### C29 — Joint War Committee (LMA/IUA), _JWLA-033 — JWC Listed Areas_ (réglementaire / autorité de marché) ✅ **PDF primaire lu (2026-07-14)** — **bat l'ancien C3**

- **URL (PDF)** : https://lmalloyds.com/wp-content/uploads/2026/03/JWLA-033_Iran.pdf · **Date : 3 mars 2026** · **Accès** : libre (4 p.).
- **Type** : `reglementaire` / `institutionnel` (Joint War Committee — LMA/IUA) · **Niveau proposé : S2** (autorité de désignation du marché war-risk londonien).
- **Étaye (axe 2 — désignation de zone, périmètre chiffré)** — citation **verbatim** :
  « **Persian/Arabian Gulf, Gulf of Oman, Indian Ocean, Gulf of Aden and Southern Red Sea** — The waters
  enclosed by the following boundaries: a) On the northwest, by the Red Sea, south of **Latitude 18°N**;
  b) On the northeast, from Pakistan coastline at **25°19'15"N, 65°E**; c) On the east, by a line to high
  seas point **10°48'N, 65°E**, thence to high seas point **10°48'N, 60°15'E**, thence to high seas point
  **6°45'S, 48°45'E**; d) and on the southwest, by the Somalia border at **1°40'S, 41°34'E**, to high seas
  point at 6°45'S, 48°45'E. » En-tête : « JWLA-033 / 3rd March 2026 / Neil Roberts, Secretary ».
- **En quoi elle bat l'ancien C3** : fournit **le numéro (JWLA-033), la date et les coordonnées** que la
  page-comité (C3) ne portait pas. C'est **la** circulaire datée réclamée au point 3 de la liste humaine.
- **⚠ Nuance décisive (presque-concordance à ne pas masquer)** : JWLA-033 est une **modification**
  (« Added: Bahrain, Djibouti, Kuwait, Oman, Qatar » ; « Amended: … ») **déclenchée par la situation
  iranienne** (nom de fichier `_Iran`). La « Southern Red Sea & Gulf of Aden » n'est **plus une zone
  autonome** : elle est fondue dans une **zone combinée élargie** (golfe Persique/Arabique, golfe d'Oman,
  côte pakistanaise à 25°N). Le périmètre cité couvre donc **plus** que notre corridor — à préciser au
  moment de la promotion. Le prédécesseur **JWLA-032 (18 déc. 2023)** avait une délimitation antérieure.

### C30 — JMIC / Combined Maritime Forces, _Monthly Statistics for the Middle East — Jan 2026_ (institutionnel militaire) ✅ **PDF primaire lu (2026-07-14)** — **complète l'axe 2 (série continue)**

- **URL (PDF)** : https://mscio.eu/media/documents/JMIC_Monthly_Statistics_-_Jan_2026.pdf · **Date : janv. 2026** (couvre 19 nov. 2023 → 31 janv. 2026) · **Accès** : libre (13 p., 1,1 Mo).
- **Type** : `institutionnel` / `donnees_ouvertes` (Joint Maritime Information Centre, entité analytique des Combined Maritime Forces — coalition navale multinationale sous NAVCENT) · **Niveau proposé : S1**.
- **Étaye (axe 2 — série d'incidents datée, ce qui manquait pour le seuil « ≥ 1/sem. »)** — anchors **verbatim confirmés dans le texte** :
  - Graphique p. 8 : « **Trending of Houthi-related Maritime Incidents** » ; « **19 Nov 2023 – 31 Jan 2026** ».
  - Légende : « **Month-on-Month Comparison of All Reported Houthi Activity Towards Merchant Vessels (since 19 Nov 2023)** ».
  - « **In 2025, we have observed a total of 16 incidents.** » ; « Since the start of 2026, we have observed **0** incident. »
  - Heatmap CMF AOR : « **Total number of Incidents: 127** » depuis le 19 nov. 2023.
  - Panneau « Last 6 months » (**périmètre CMF AOR, tous incidents**) : Aug 2025 = 0, **Sep 2025 = 4**, Oct 2025 = 1, **Nov 2025 = 2** (« one related to piracy and one state related activity »), Dec 2025 = 1, Jan 2026 = 0.
- **En quoi elle bat l'actuel** : première **série mensuelle continue** d'une **autorité primaire opérant dans la zone**, en remplacement des totaux annuels ACLED (C20/C21) et du pic ponctuel CNBC (C27). Permet de dater le pic (déc. 2023 – printemps 2024) et la décrue à zéro en 2026.
- **Vecteur mensuel — CONFIRMÉ verbatim (escalade 2026-07-14).** Les valeurs du graphique en barres sont
  **présentes en texte vectoriel** dans le PDF (labels de barres + axe daté « Nov 23 … Jan 26 », 27 mois).
  Série lue mois-par-mois (Houthi activity **towards merchant vessels**, 19 nov. 2023 → 31 janv. 2026) :
  **3, 19, 11, 13, 7, 7, 4, 17, 7, 10, 3, 5, 5, 1, 1, 0, 0, 1, 0, 0, 2, 1, 2, 0, 0, 0, 0** (somme = **119**).
  → **concorde exactement** avec la transcription Perplexity : celle-ci passe de « candidat lu au modèle »
  à **vérifiée sur le PDF**. **Correction** : le pic mensuel est **déc. 2023 = 19** (juin 2024 = 17 en
  second), et non « juin 2024 » comme le résumait Perplexity.
- **⚠ Ne pas confondre les deux séries** : ce vecteur vise « Houthi activity **towards merchant vessels** »
  (somme 119), distinct du panneau « CMF AOR / **127** incidents » (périmètre plus large : piraterie,
  activité étatique, suspecte). D'où l'écart JMIC (16 en 2025) vs ACLED (7 en 2025) : périmètres
  différents, déjà noté en C20. Reste candidat quant à la **validation humaine** (ADR 0046), non promu.

### C31 — EEAS, _EUNAVFOR ASPIDES Mandate_ (institutionnel) ✅ **page primaire vérifiée (`pplx fetch-url`, 2026-07-14)** — **corrige/bat C13 & C26**

- **URL** : https://www.eeas.europa.eu/eunavfor-aspides/eunavfor-aspides-mandate-0_en · **Date de page : 27 mai 2026** · **Accès** : libre.
- **Type** : `institutionnel` (Service européen pour l'action extérieure) · **Niveau proposé : S1**.
- **Étaye (axe 2 / gouvernance — chiffres de protection EN TEXTE)** — citation **verbatim** :
  « Since its launch in February 2024, Aspides mission has **supported over 1960 merchant vessels**, ensuring
  their safe transit and **provided protection to more than 650 ships**. »
- **En quoi elle bat C13/C26** : source **primaire EEAS**, chiffres **en texte** (non plus en vidéo),
  datée et plus récente que l'analyse secondaire CIMSEC (« > 1 200 » d'avr. 2026, C26). Deux métriques
  distinctes : **navires accompagnés (> 1 960)** vs **protection rapprochée (> 650)**.
- **⚠ Verrou vidéo — CONFIRMÉ définitivement (escalade `agent-browser`, 2026-07-14).** La page
  « Operation in Numbers » (https://www.eeas.europa.eu/eunavfor-aspides/eunavfor-aspides-operation-numbers_en,
  maj 16.05.2026) a été ouverte et défilée dans le conteneur `tools` : son contenu chiffré est une **vidéo
  de 13 s** (lecteur `0:00 / 0:13`) suivie d'un seul paragraphe **sans chiffre**. Les **menaces interceptées**
  (missiles/UAV/USV) ne sont donc **pas extractibles en texte ni en image statique** → cul-de-sac hors
  lecture de la vidéo. Fiches connexes trouvées (via `pplx search`) mais **chiffres également en graphique** :
  fact sheet EEAS _EUNAVFOR OPERATION ASPIDES_ (nov. 2025, PDF 1 p.,
  https://www.eeas.europa.eu/sites/default/files/2025/documents/EUNAVFOR_OPERATION_ASPIDES_2025%5B1%5D.pdf) —
  texte mandat lisible, mais compteurs (nations, effectifs, navires, menaces) rendus en **infographie**.
- **Piste texte primaire pour l'existence des interceptions (early, non cumulatif)** : page EEAS
  « One month since the launch » (19 mars 2024) rapporte, en **texte**, « close protection of **35** merchant
  vessels … shooting down **8** UAVs and repelling **3** other UAV attacks » — snapshot **précoce** (pas un
  cumul), **breadcrumb `pplx search` à re-vérifier** avant tout usage. Les cumuls Perplexity (« 4 missiles
  balistiques, 18 UAV, 20 USV » via _Maritime Executive_, S5) **restent non vérifiés** — non consignés.
  L'URL Borrell « 4 juil. 2024 » proposée par Perplexity est **tronquée/non résolue** → écartée.

### C32 — IUMI, _Stats Report 2025_ (référence sectorielle — source primaire) ✅ **PDF primaire lu (2026-07-14)** — **débloque l'ancien C9**

- **URL (PDF)** : https://iumi.com/wp-content/uploads/2025/11/IUMI-Stats-Report-2025.pdf · **Date : octobre 2025** (données **2024**) · **Accès** : libre (46 p., 2,2 Mo).
- **Type** : `institutionnel` / `rapport_entreprise` (International Union of Marine Insurance, Facts & Figures Committee) · **Niveau proposé : S3** (association de branche portant le chiffre).
- **Étaye (axe 1 — contexte de marché, chiffres exacts)** — citations **verbatim confirmées** :
  « Global marine insurance premiums in 2024 totalled **USD39.92 billion** — a **1.5 %** uplift on 2023. » ;
  « Ocean hull premiums were reported at **USD9.67 billion**, up by **3.5 %** on the previous year. » ;
  « … hostilities in the **Red Sea region** continue to present substantial risks for international trade… ».
- **En quoi elle bat C9** : remplace le « PDF candidat non lu » (C9, données 2023) par la version **2025
  lue et citée page à page** (données 2024, les plus récentes) — prime marine mondiale **39,92 Md USD**,
  ocean hull **9,67 Md USD**.
- **⚠ Caveat (stress-test)** : IUMI **n'isole aucune ligne de prime war-risk** (mention seulement
  qualitative de la Mer Rouge) → ne fournit **pas** la trajectoire de prime (axe 1 / construct Z). Pour un
  chiffre war-risk, il faut les bilans syndicats Lloyd's / Cefor / réassurance — non trouvés en accès libre.

### g1 — Trajectoire de la prime war-risk : **PAS MIEUX QUE L'EXISTANT** (source primaire de taux)

- **Verdict RENFORCEMENT** : aucune **source S1/S2 en accès libre** ne publie une **série datée** de la
  surprime war-risk en % de valeur coque. Les circulaires JWC/LMA (C29) **listent la zone mais pas les
  taux** ; l'IUMI Stats (C32) **n'isole pas la war-risk** ; les indices courtiers (Marsh/WTW) ne sont pas
  publics ; S&P/Platts (ex-C5/C19) **reste `403` au bot**. La trajectoire reste adossée à la presse
  (Reuters C17/C18, Platts C19) — **valeurs de marché anonymes rapportées**, non primaires.
- **Ajout non vérifié rapporté par Perplexity** : un point intermédiaire S&P/Platts (« AWRP … around
  **0.5 %** of H&M value … for seven days », daté **12 mars 2025**). Non confirmé (page 403) → **candidat
  faible, non promu** ; à récupérer manuellement / `agent-browser` si l'axe 1 doit gagner ce palier.
- **Conclusion** : **ne rétrograde pas** l'existant ; l'axe 1 demeure « recoupé (presse) — en attente
  d'une série primaire de taux », verrou structurel déjà noté au 2026-07-12.

### État du recoupement par axe (mise à jour 2026-07-14)

- **Axe 1** (trajectoire de prime) : **inchangé** — pas de série primaire de taux en accès libre (g1 =
  PAS MIEUX). Reste presse (C17/C18/C19). Verrou structurel.
- **Axe 2 — désignation de zone** : **renforcé** — circulaire **primaire datée JWLA-033** (C29, coord.
  verbatim) **bat** la page-comité C3. ⚠ Zone désormais **combinée/élargie** (extension iranienne).
- **Axe 2 — série d'incidents** : **renforcé** — **série mensuelle primaire JMIC/CMF** (C30) en
  remplacement des totaux annuels ACLED ; anchors texte confirmés (127 total CMF AOR ; 16 en 2025 ;
  décrue à 0 en 2026). Vecteur mensuel exact = candidat (graphique image) à re-lire.
- **Gouvernance / Aspides** : **renforcé** — chiffres EEAS **en texte** (C31 : > 1 960 accompagnés /
  > 650 protégés) **corrigent** C13/C26. Menaces interceptées **toujours en vidéo** (non consigné).
- **Contexte marché assurance** : **débloqué** — IUMI Stats 2025 lu (C32 : 39,92 / 9,67 Md USD 2024).

### Prochaines actions (humain) — 2026-07-14

1. ✅ **Fait (escalade 2026-07-14)** : (a) **graphique JMIC** — vecteur mensuel exact **confirmé** (texte
   vectoriel du PDF, cf. C30) ; (b) **EEAS « Operation in Numbers »** — escaladé : contenu en **vidéo 13 s**,
   menaces interceptées **non extractibles** (cul-de-sac). Reste, si un humain veut le cumul de menaces
   interceptées : lire la vidéo EEAS, ou trouver un communiqué EEAS daté portant ces cumuls **en texte**.
2. **Récupérer manuellement** l'article S&P/Platts du **12 mars 2025** (403) pour figer le palier 0,5 %
   de l'axe 1, si ce point intermédiaire est jugé utile.
3. **Préciser à la promotion** que JWLA-033 (C29) décrit une **zone combinée élargie** (Iran) et non la
   seule « Southern Red Sea & Gulf of Aden » — citer JWLA-032 (18 déc. 2023) si le périmètre historique
   du corridor est requis.
4. **Ne pas** promouvoir ces valeurs dans la fiche/dossier tant que la **validation nominative (ADR 0046)**
   n'est pas enregistrée. Rejets actés antérieurs (Tavvishi « 2026 », « 28 incidents T1 2026 »,
   arcaneintel, IDs C79/C86/C98) toujours **à ne pas réintroduire**.

---

## Journal de validation humaine (ADR 0046) — append-only

> Enregistrement **nominatif** du saut **candidat → fait** (ADR 0027/0046). **Append-only** : aucune
> réécriture rétroactive d'une ligne. Chaque entrée atteste que le validateur a revu la **citation
> verbatim sur le document réel** (consignée plus haut) et en accepte l'usage **dans le périmètre exact**
> noté. La validation porte sur la **source et sa citation** — elle **n'emporte pas** promotion automatique
> dans le dossier : l'édition du markdown et la bascule des gates (`sources_ok`, `human_review_done`,
> `cvi_justified`) restent une **étape éditoriale distincte** (ag-front).

### 2026-07-14 — Validateur : **Sylvain Geffroy** (analyste, propriétaire du dépôt)

| Réf | Statut | Fait attesté (périmètre) | Réserve portée AVEC le fait |
| --- | --- | --- | --- |
| **C29** JWLA-033 | candidat → **validé (fait)** | Circulaire JWC/LMA **JWLA-033, 3 mars 2026** désignant la zone war-risk, coordonnées verbatim (18°N ; 25°19'15"N 65°E ; 10°48'N 65°E→60°15'E→6°45'S 48°45'E ; Somalie 1°40'S 41°34'E). | Zone **combinée élargie** (extension Iran) : « Southern Red Sea & Gulf of Aden » **n'est plus autonome**. Pour le seul corridor historique, citer **JWLA-032 (18 déc. 2023)**. |
| **C30** JMIC Jan 2026 | candidat → **validé (fait)** | Série mensuelle d'incidents **Houthi → navires marchands, 19 nov 2023 → 31 janv 2026** (vecteur verbatim, somme 119, **pic déc 2023 = 19**) ; « **16** incidents en 2025 » ; « **127** » incidents CMF AOR. | Deux séries à **ne pas confondre** (Houthi-vs-MV ≠ CMF AOR). Écart de périmètre JMIC(16)/ACLED(7) en 2025 assumé. |
| **C31** EEAS Mandate | candidat → **validé (fait)** | EEAS (27.05.2026), verbatim : « supported **over 1960** merchant vessels … provided protection to **more than 650** ships ». | **Menaces interceptées non couvertes** (vidéo) — hors périmètre de ce fait. |
| **C32** IUMI Stats 2025 | candidat → **validé (fait)** | IUMI (oct 2025, données **2024**), verbatim : prime marine mondiale **USD 39,92 Md** (+1,5 %) ; **ocean hull USD 9,67 Md** (+3,5 %). | IUMI **n'isole aucune ligne war-risk** : n'en déduire aucun chiffre de prime war-risk. |

**Explicitement NON validés au 2026-07-14 (pas prêts — restent `candidat`) :**

- **Axe 1 / trajectoire de prime (g1, C17/C18/C19, S&P)** : appuis **presse/courtier (S5)**, valeurs de
  marché **rapportées** (dont sources anonymes). Restent **recoupés mais non promus en fait**. Aucune série
  de taux primaire. → à revalider seulement si une source primaire/nominative datée est obtenue.
- **Menaces interceptées EUNAVFOR Aspides** : enfermées en **vidéo** EEAS — non attestables en texte.
- **Candidats `pplx`-only / presse antérieurs** (C2, C5, C7, C8, C12, C20, C21, C22, C26, C27, C28) :
  verdicts `pplx` ou relais presse — **ne valent pas** validation humaine (rappel des salves C17+).
- **Primaires PDF lus le 2026-07-12** (C23 SCA, C24 EIA, C25 WSC) : au **même standard** que C29–C32 et
  **prêts à valider** — non inclus ici faute d'instruction explicite sur ce périmètre ; à ajouter au
  journal sur simple accord (nouvelle entrée datée, jamais en réécrivant celle-ci).

### 2026-07-14 (complément) — Validateur : **Sylvain Geffroy** — primaires PDF C23/C24/C25

| Réf | Statut | Fait attesté (périmètre) | Réserve portée AVEC le fait |
| --- | --- | --- | --- |
| **C23** SCA Annual Report 2025 | candidat → **validé (fait)** | Transits totaux Suez : **26 434** (2023) → 13 213 (2024) → **12 758** (2025), soit **−51,7 %** navires / −66,7 % tonnage net vs 2023 ; décomposition par type (Table 3). | Deltas **2025 vs 2024** faibles (deux années effondrées) : **ne pas lire comme une reprise** — la référence est 2023. |
| **C24** US EIA (Bab el-Mandeb) | candidat → **validé (fait)** | Flux de brut Bab el-Mandeb **≈ 4,0 mb/j** (2024, jan.–août) vs **8,7 mb/j** (2023) ; contournement Cap ≈ 9,2 mb/j. | « 4,0 mb/j » = **2024 jusqu'à août**, pas l'année pleine ; données Vortexa/AIS (sous-estimation « dark » possible). |
| **C25** WSC (janv. 2026) | candidat → **validé (fait)** | Conteneurs Suez 2025 ≈ **32 %** de 2023 ; **gros porteurs ≥ 7 500 EVP à 5,7 %** de 2023 (9 transits via BaM en 2025) ; petits porteurs ≈ **91 %**. | Chiffres d'après Alphaliner/Lloyd's List/IMF PortWatch (secondaire consolidé) ; base 2023 recoupée SCA×WSC. |
