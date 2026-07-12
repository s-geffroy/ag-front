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

### C23 — Suez Canal Authority, _Suez Canal Statistics for 2025 Compared to 2024_ (source primaire institutionnelle) ✅ pplx `supported`

- **URL (PDF)** : https://www.suezcanal.gov.eg/English/Downloads/DownloadsDocLibrary/Navigation%20Reports/Annual%20Reports/2025.pdf ⚠️ **URL instable** (404 en téléchargement direct 2026-07-12 ; le chemin publié contient des caractères de largeur nulle — récupération à la main requise).
- **Type** : `institutionnel` (autorité gestionnaire) · **Accès** : contenu confirmé via le snippet du PDF SCA (index `pplx`) + FreightWaves.
- **Étaye (axe 4 — série primaire, ce que l'ancien C16 laissait derrière un sélecteur)** : **12 758** navires en 2025 vs **13 213** en 2024 (**−3,4 %**) ; tonnage net **522,1** vs **524,5 M.t** (−0,5 %). Les deux années restent très en deçà de 2023.
- **Recoupement primaire** : le WSC (C25) cite les statistiques officielles SCA — **26 434** transits en 2023 (record) — ce qui ancre la chute 2024/2025. → base 2023 recoupée.
- **Note** : fournit le chiffre primaire SCA réclamé aux points 2 / 4 de la liste humaine. Reste à **télécharger le PDF SCA à la main** (URL instable) pour figer la décomposition par type.

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

### État du recoupement par axe (mise à jour 2026-07-12)

- **Axe 1** (niveau **et trajectoire** des primes) : **désormais recoupé** — baseline (C17), pic juil. 2025
  (C18 + 3 relais), décrue post-cessez-le-feu (C19, ex-C5 débloquée). Ne restait « gap » depuis 2026-06-28.
  → validation humaine + série primaire JWC/LMA pour promotion.
- **Axe 2 / seuil incidents** : magnitude annuelle recoupée (C20/C21, ACLED) + garde-fou primaire (C22, MARAD).
  → **série hebdomadaire/mensuelle encore à extraire** avant de lever la mention « Hypothèse — non sourcé »
  du tableau de seuils de la fiche.
- **Axe 4** : **PDF/pages primaires lus (2026-07-12)** — WSC (C25, doc janv. 2026 : décomposition par taille) et
  EIA (C24, page primaire : 4,0 vs 8,7 mb/j) ; base SCA 2023 (26 434) recoupée via WSC. Reste à **télécharger le
  PDF SCA 2025** (URL instable) pour la décomposition par type. Chiffres exacts figés, à valider par un humain.
- **Gouvernance / Aspides** : escalade `agent-browser` faite → **négatif** (chiffres en vidéo, non extractibles).
- **Durée de fermeture (seuil « > 4 sem. »)** : **toujours zéro source** — non couvert par cette salve.

### Prochaines actions (humain) — mise à jour

1. **Escalade `agent-browser`** (conteneur `tools`) pour les sources primaires encore bloquées au bot :
   JWLA-032 complet (LMA/IUA), IUMI Stats, série S&P/Platts, chiffres EUNAVFOR Aspides.
2. ✅ **Fait (2026-07-12)** : PDF/pages primaires WSC (C25) et EIA (C24) lus, chiffres figés ci-dessus. **Reste** à
   télécharger à la main le **PDF SCA 2025** (C23, URL instable) pour la décomposition par type de navire.
3. **Extraire de la base ACLED** une série d'incidents mensuelle/hebdomadaire pour fonder (ou corriger) le
   seuil « ≥ 1/semaine » — condition pour lever « Hypothèse — non sourcé » dans la fiche.
4. **Ne pas** promouvoir ces valeurs dans la fiche/dossier tant que la validation nominative (ADR 0046) n'est
   pas enregistrée ; les rejets actés (Tavvishi 2026, 28 incidents T1 2026, repricing arcaneintel) ne doivent
   pas réapparaître.
