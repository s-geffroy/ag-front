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

## Prochaines actions (humain)

1. Fournir manuellement le contenu des sites bloqués (S&P, NorthStandard, PDF UNCTAD/IUMI).
2. Recouper chaque chiffre dans **≥ 2** sources indépendantes avant promotion.
3. Récupérer la **circulaire JWLA datée** (périmètre/coordonnées) pour la désignation de zone.
4. Une fois validé : intégrer au dossier avec citation normée + incertitude par affirmation, et passer `sources_ok = true`.
