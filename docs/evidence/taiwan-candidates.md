# Candidats-sources — Taïwan : semi-conducteurs & routes maritimes (fiche Atlas)

> **STATUT : CANDIDATS EN ATTENTE DE VALIDATION HUMAINE — PAS DES FAITS.**
> Registre ouvert le 2026-07-14 pour lever les marqueurs `[À SOURCER]` de
> `apps/public/src/content/atlas/taiwan.md` (deliverable `deliv_atlas_taiwan_fiche`).
> Aucune valeur ci-dessous ne doit être promue dans la fiche canonique ni présentée comme établie
> avant lecture, recoupement (≥ 2 sources primaires) et validation nominative par un analyste humain
> (ADR 0046). Les chiffres attendus sont **rapportés** par les sources, non confirmés par nous.
>
> Méthode retenue par Sylvain : **Perplexity Recherche Avancée** (prompt ci-dessous), puis
> escalade `agent-browser` (conteneur Docker `tools`) pour les PDF/rapports bloqués (TSMC, SEMI).

---

## Prompt Perplexity Recherche Avancée — à coller tel quel

```
Tu es analyste en géopolitique des chaînes d'approvisionnement technologiques. Je prépare une
fiche factuelle sur TAÏWAN comme double chokepoint : (1) production de semi-conducteurs avancés
et (2) routes maritimes du détroit de Taïwan. J'ai besoin de chiffres sourcés, chacun avec sa
SOURCE PRIMAIRE, une URL et une DATE. Réponds EN FRANÇAIS.

Pour CHAQUE point ci-dessous, donne : (a) la valeur chiffrée la plus récente ; (b) l'année/date
de la donnée ; (c) la source primaire (organisme + titre du document) ; (d) l'URL ; (e) précise
si c'est un FAIT mesuré ou une ESTIMATION. Si une donnée n'existe pas publiquement, dis-le
explicitement plutôt que d'inventer. Privilégie les sources primaires : rapports annuels TSMC,
SEMI, TrendForce, IC Insights/Counterpoint, Rhodium Group, Bloomberg Economics, autorités
portuaires taïwanaises ; évite les blogs.

PRODUCTION DE SEMI-CONDUCTEURS
1. Part (%) de la production mondiale de puces logiques avancées (nœuds < 7 nm) fabriquée à
   Taïwan. Idem pour les nœuds de pointe < 5 nm et < 3 nm.
2. Part (%) du marché mondial de la fonderie sous contrat détenue par TSMC (source TrendForce ou
   TSMC).
3. Part (%) de la capacité de fonderie de nœuds AVANCÉS située hors de Taïwan aujourd'hui, et
   trajectoire attendue avec CHIPS Act (Arizona) et Japon (Kumamoto/JASM).

MARITIME
4. Part (%) de la flotte mondiale de porte-conteneurs qui transite par le détroit de Taïwan sur
   une année (chiffre Bloomberg ou équivalent, avec méthode).
5. Débit conteneurisé annuel du port de Kaohsiung (EVP) et son rang mondial.
6. Surcoût (distance / temps) d'un reroutage par la façade est (Pacifique) de Taïwan par rapport
   au détroit, si documenté.

IMPACT & CASCADE
7. Estimation du coût économique d'un blocus/quarantaine de Taïwan, en points de PIB mondial ou
   en milliards de USD (source Rhodium Group, Bloomberg Economics), avec le périmètre de
   l'estimation.
8. Délais d'approvisionnement (lead-time) actuels des composants avancés, baseline, et amplitude
   observée lors de la pénurie 2021-2023 (secteur automobile notamment).
9. Dépendance amont : part de marché d'ASML dans la lithographie EUV et rôle dans la fabrication
   des nœuds avancés à Taïwan.

Termine par une liste des points où les données publiques sont absentes, datées ou contradictoires.
```

---

## À obtenir — liste de collecte priorisée (mappée sur les `[À SOURCER]` de la fiche)

1. **Part de Taïwan dans la logique avancée < 7 nm / < 5 nm** (_Flux_, _Nœuds_, verdict) — TrendForce/SEMI.
2. **Part TSMC de la fonderie mondiale** (_Nœuds_) — TSMC / TrendForce.
3. **Part de flotte conteneurs transitant le détroit** (_Nœuds_, _Flux_) — Bloomberg / AIS.
4. **Estimation de choc PIB mondial d'un blocus** (_Vulnérabilités_, _Effets systémiques_) — Rhodium/Bloomberg.
5. **Part de capacité avancée hors Taïwan** (_Alternatives_, seuil) — SEMI World Fab Forecast.
6. **Lead-time composants avancés (baseline + amplitude)** (seuil « Délais d'appro ») — sectoriel.
7. **Débit Kaohsiung (EVP) + rang** (_Nœuds_) — autorité portuaire.
8. **Surcoût reroutage Est** (_Alternatives_) — analyses de route.
9. **Part de marché ASML EUV** (_Vulnérabilités_ amont) — ASML / analystes.

## Candidats sourcés (recherche Perplexity du 2026-07-14 — CANDIDATS, non validés)

> Rapportés par Sylvain via Perplexity Recherche Avancée. Injectés dans `taiwan.md` **avec** leur
> statut (FAIT / ESTIMATION / DÉDUCTION / non documenté). Restent candidats tant que le gate
> `sources_ok` n'a pas été flippé après validation nominative (ADR 0046).

| Réf | Fait / estimation (périmètre)                                              | Source primaire            | Date     | Statut analytique          |
| --- | -------------------------------------------------------------------------- | -------------------------- | -------- | -------------------------- |
| T1  | TSMC = 67,6 % du marché fonderie pure-play                                  | TrendForce (via Focus Taiwan) | T1 2025  | estimation (revenus)       |
| T2  | Taïwan ≈ 68 % capacité mondiale nœuds avancés (16/14 nm+) ; ≈ 80 % « EUV gen » (7 nm+) | TrendForce           | 2023     | estimation (capacité)      |
| T3  | Mix revenus TSMC : 3 nm 26 % / 5 nm 34 % / 7 nm 14 %                        | TSMC earnings call         | Q4 2024  | **fait** (interne TSMC)    |
| T4  | TSMC 70–80 % du marché 5 nm ; > 90 % du 3 nm                               | TrendForce                 | 2023-24  | estimation (par nœud)      |
| T5  | Taïwan ≈ 80–90 % production < 5 nm ; > 90 % < 3 nm                          | déduction TSMC+TrendForce  | 2023-24  | **déduction** (pas officiel) |
| T6  | ≈ 48 % des 5 400 porte-conteneurs mondiaux transitent le détroit ; 88 % du décile sup. | Bloomberg (AIS)     | jan-jui 2022 | estimation (AIS)         |
| T7  | Kaohsiung 9,3 M EVP ; ≈ 17ᵉ rang mondial                                   | MoTC Taïwan / DG Trésor    | 2023     | **fait** mesuré            |
| T8  | Capacité avancée hors Taïwan 32 % (2023) → 59 % (2027) ; Taïwan 68 %→41 %   | TrendForce                 | proj. 2027 | estimation / projection    |
| T9  | Choc blocus : « milliers de milliards $ » / plusieurs pts PIB mondial (5–10 % guerre totale) | HCSS (comp. Rhodium/Bloomberg) | 2024 | estimations scénarisées   |
| T10 | Lead-times : baseline 8–12 sem. ; pic 2021-22 46–47 (extr. 70–130) ; retour 8–12 en 2023 | BFM/Gys, Groupe Alpha, S&P | 2021-23  | estimations sectorielles   |
| T11 | Lithographie EUV = monopole de fait ASML ; marché EUV 11,4 Md$             | Global Market Insights     | 2024     | fait (monopole) + estimation (marché) |
| —   | **Non documenté publiquement** : production < 7/5/3 nm ventilée par pays ; surcoût reroutage Est ; chiffre unique de coût de blocus | —                     | —        | à ne pas inventer          |

## Traitement des findings de contradiction (ADR 0039)

| Finding | Sév | Traitement dans `taiwan.md`                                                                 | Statut          |
| ------- | --- | ------------------------------------------------------------------------------------------ | --------------- |
| 1 — prod <5/3 nm = déduction | 4 | Contre-argument ajouté : part = **plafond** non 100 % (Samsung 3 nm en Corée dès 2022, Intel 18A aux É.-U.) | traité (nuancé) |
| 2 — coût blocus non chiffré  | 3 | Ancré sur l'estimation nommée la plus citée : **Bloomberg Economics 2024 ≈ 10 000 Md$ / ~10 % PIB (guerre)**, blocus moindre ; reste scénarisé | traité (ancré)  |
| 3 — surcoût reroutage non documenté | 3 | Caractérisé : détroit = route directe, contournement Est = distance limitée mais **plus exposé aux typhons** (ASPI) → coût de risque/météo, pas de kilométrage ; chiffre agrégé toujours non public | traité (qualifié) |

> Aucune de ces objections n'était une contradiction interne : elles re-signalaient des zones déjà
> marquées estimation/déduction/non documenté. Traitement = renforcement (contre-argument, ancrage,
> qualification), sans invention de chiffre. Nouveaux candidats : **T12** (Samsung/Intel bornent la
> déduction), **T13** (Bloomberg Economics 10 000 Md$), **T14** (ASPI reroutage/typhons).

### Relance (2ᵉ passe) — convergence

La 2ᵉ passe re-signale les mêmes lacunes inhérentes (prod par pays, coût de blocus scénarisé, surcoût
reroutage) — **normal : la fiche les déclare honnêtement, la donnée n'existe pas publiquement**. Un
seul finding nouveau et actionnable, traité :

| Finding v2 | Sév | Traitement | Statut |
| ---------- | --- | ---------- | ------ |
| Substitution « longue (années) » sans exemple | 3 | Cas documentés ajoutés : **TSMC Arizona** (2020→~2024-25), **Kumamoto/JASM** (2022→fin 2024) = 3-5 ans (T15) | traité |
| Prod <5/3 nm = déduction | 4 | inhérent — déjà nuancé (plafond, Samsung/Intel) ; donnée par pays inexistante | assumé |
| Coût blocus scénarisé | 4 | inhérent — déjà ancré (Bloomberg) + marqué scénarisé | assumé |
| Surcoût reroutage | 3 | inhérent — déjà qualifié (ASPI/typhons) ; chiffre agrégé non public | assumé |

> **Convergence actée** : les findings résiduels sont des lacunes publiques assumées, pas des défauts
> de contenu. On ne relance plus (chaque passe les re-signalera). Prêt pour revue humaine.

## Sites bloqués au bot / accès manuel requis

_(à compléter : rapports TSMC/SEMI en PDF, TrendForce derrière inscription, notes Rhodium, etc.)_

## Journal de validation humaine (ADR 0046) — append-only

_(À compléter par l'analyste : `Réf | Statut (candidat → validé/fait) | Fait attesté (périmètre) |
Réserve portée AVEC le fait | Validé par | Date`. Rappel : valider une source ne la promeut pas
automatiquement dans la fiche — l'édition markdown + le flip du gate `sources_ok` est une étape
éditoriale distincte.)_
