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

## Candidats vérifiés (à remplir)

| Réf | Fait attesté (périmètre) | Source primaire | URL | Date | Type | Accès | Statut |
| --- | ------------------------ | --------------- | --- | ---- | ---- | ----- | ------ |
| T1  | _(à remplir)_            |                 |     |      |      |       | candidat |

## Sites bloqués au bot / accès manuel requis

_(à compléter : rapports TSMC/SEMI en PDF, TrendForce derrière inscription, notes Rhodium, etc.)_

## Journal de validation humaine (ADR 0046) — append-only

_(À compléter par l'analyste : `Réf | Statut (candidat → validé/fait) | Fait attesté (périmètre) |
Réserve portée AVEC le fait | Validé par | Date`. Rappel : valider une source ne la promeut pas
automatiquement dans la fiche — l'édition markdown + le flip du gate `sources_ok` est une étape
éditoriale distincte.)_
