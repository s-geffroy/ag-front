# 0070 — Consommation de `/news`, `/analytics/cvi-counterfactual` et de l'alerte `media_attention_spike`

- **Statut :** accepté (Lot 1 — consommation ; UI typée en Lot 2)
- **Date :** 2026-07-21
- **Contexte connexe :** ADR 0066 (consommation intégrale garantie au build), ADR 0062 (contrat
  épinglé), ADR 0013 (`read_tainted` interne uniquement), ADR 0042 (une news plafonne à `stress`,
  jamais une fermeture). Côté producteur : ADR 0076 (agrégation news live), 0077 (`media_attention_spike`),
  0078–0081 (matière derrière news/perception). Handoffs ag-back : `0008`, `0012`–`0017`.

## Contexte

Depuis notre pin **0.8.0**, le producteur a livré, additivement, trois surfaces et fait glisser le
contrat jusqu'à **0.12.0** :

- **0.9.0** — `GET /analytics/cvi-counterfactual` : le « glissement de substitution » CVI servi comme
  **décompte agrégé vivant** (réponse à notre 0012), et non plus un `SELECT` déposé.
- **0.10.0** — `GET /news` + `GET /chokepoints/{id}/news` : la couche **lisible** des articles média,
  regroupés par événement.
- **0.11.0** — nouveau `alert_type` `media_attention_spike` (sur `/alerts`, inchangé par ailleurs) +
  champ `NewsFeedOut.run_notes`.
- **0.12.0** — bascule du modèle news (`gpt-4o` → `gpt-5.6-terra`), **sans changement de schéma**.

Notre garde de couverture (ADR 0066) échoue au build dès qu'on épingle cette surface tant qu'on ne la
consomme pas — c'est le déclencheur voulu.

### Discordance de littéral 0.11.0 vs 0.12.0

Le `/openapi.json` **servi** porte `info.version = 0.11.0`, alors qu'ag-back nous demande (handoff 0017)
de **« pinner 0.12.0 »**. La 0.12.0 étant purement data/modèle (aucun changement de schéma), le spec
0.11.0 servi **est schema-identique** à ce qu'ils appellent 0.12.0. Conformément à la doctrine
(« lire le changelog du producteur, pas seulement le diff » — CLAUDE.md, et ADR 0066 : un bump
schema-identique existe), nous **épinglons les octets réellement servis** (littéral 0.11.0) — on ne
fabrique jamais un littéral de version producteur — et nous **signalons la traîne de littéral** à
ag-back sur le canal. La garde de couverture porte sur les *chemins* et *champs*, pas sur la chaîne de
version : elle reste juste.

**Résolu le 2026-07-26 (handoff ag-back `0019`).** La cause était opérationnelle, pas contractuelle :
leur conteneur uvicorn tournait depuis ~10 jours, chargé quand le code était en `0.11.0`, et n'avait
pas rechargé après le bump. API redémarrée, `/openapi.json` servi rend désormais `info.version =
0.12.0`. Nous avons **repinné les octets servis** (`sync_contract.sh` → `DRIFT-KIND: soft`,
`version: 0.11.0 → 0.12.0`, une seule ligne changée dans le spec) et régénéré le client. La doctrine
tient inchangée : on épingle ce qui est servi, jamais un littéral fabriqué — c'est le producteur qui a
aligné son littéral sur son code. Leur baseline publiée `docs/openapi.published.json` reste
délibérément à `0.8.0` (acte de release, leur ADR 0050) ; rien de ce que nous consommons n'en dépend.

## Décision

**Consommer les trois surfaces, cockpit-only, en respectant la frontière de confiance news.**

1. **Pin sur les octets servis** + régénération du client de drift (littéral `0.11.0` au Lot 1,
   repinné `0.12.0` le 2026-07-26 — voir la résolution ci-dessus ; spec schema-identique).
2. **Cinq schémas zod** ajoutés (`schema.ts`) — `CviCounterfactualOut`, `NewsFeedOut`, `NewsClusterOut`,
   `NewsSourceRef`, `NewsClusterChokepoint` — tous `.passthrough()`, chaque propriété **requise**
   déclarée, optionnelles déclarées aussi (dont `run_notes`).
3. **Trois méthodes client** (`getCviCounterfactual`, `listNews`, `getChokepointNews`), trois entrées
   `COVERED_PATHS`, trois entrées `CONSUMERS = ['cockpit']`, cinq entrées `SCHEMA_MAP`.
4. **`media_attention_spike` ne coûte aucun changement de couverture** : `AlertOut.alert_type` est
   `z.string()` (pas un enum). La distinction d'affichage (jamais une disruption) est du Lot 2.
5. **Trois routes proxy cockpit** (`/explore/analytics/cvi-counterfactual`, `/explore/news`,
   `/explore/chokepoints/:id/news`) + entrées dans les listes de ressources de l'Explorateur
   (rendu **JSON brut** en Lot 1 pour que la surface soit réellement lue ; panneaux typés en Lot 2).

### Frontière de confiance news (portée par les commentaires de schéma, appliquée en Lot 2 UI)

- La **prose du modèle** (`headline`, `summary_text`, `event_category`, `geographic_scope`,
  `salience_score`) **peut être fausse** ; `articles[]` et `affected_chokepoints[]` sont recalculés
  serveur et **fiables** — en cas de conflit, **croire les articles**.
- Une news **ne prouve jamais** une fermeture (plafond `stress`, ADR 0042) — jamais affichée comme
  incident confirmé. `media_attention_spike` répond « quelque chose à regarder ? », pas « disruption ? ».
- **Snapshot, pas historique** : `cluster_id` n'est pas persisté (change à chaque run) ; suivi par
  `articles[].url`.
- Le **taint partitionne** (`cleared_only` XOR `all_sources`), ne cumule pas.
- **Attribution requise** : `outlet` + lien `url` ; `source_id='gdelt_gkg'` distingué du slate audité.
- `run_notes` **doit être affiché** : échantillon vs résumé, plafond de troncature, couverture modèle.
- Faisceau étroit (Hormuz-lourd) : **ne pas classer/comparer les objets sur les compteurs `gdelt_gkg`**.

### Postures maintenues

- **Cockpit-only.** News et contrefactuel sont des **candidats en attente de validation**, surfacés sur
  la console d'exploration interne (Tailscale) — jamais republiés sur le site public (ADR 0013). Le
  cockpit détient le jeton `read_tainted` ; le taint partitionne côté producteur.
- **public / HDDE / VERDICT inchangés** : aucune de ces surfaces ne consomme ces endpoints (ADR 0042
  pour VERDICT).

## Conséquences

- Build re-vert : `contract-coverage.test.ts` passe sur le pin (0.11.0 au Lot 1, `0.12.0` depuis le
  2026-07-26 — même surface : 39 chemins, PATH + FIELD + CONSUMER inchangés), et
  `client.test.ts` couvre les trois méthodes + la frontière de confiance (articles fiables, run_notes
  préservé, `count:0` avec `run_id` = feed honnête).
- `/perception-signals` : sa couverture **chute** (Panama/Suez) suite à ADR 0079 côté producteur — **ce
  n'est pas une panne**, ne pas alerter.
- **Lot 2 (suivi)** : panneaux typés (`NewsPanel` calqué sur `PerceptionPanel`), affichage `run_notes`,
  section `media_attention_spike` distincte, décodage des entités HTML (`&#x2013;`), retrait de nos
  éventuels « selon la presse » redondants (la prose terra est déjà attribuée).

## Alternatives écartées

- **Fabriquer un `info.version = 0.12.0`** dans le pin pour coller à la demande d'ag-back : refusé —
  on n'invente pas un littéral producteur. On épingle les octets servis et on signale la traîne.
- **Surfacer la news sur le site public** « avec disclaimer » : ADR 0013 — un disclaimer ne transforme
  pas un candidat média en donnée publiable, a fortiori une couverture qui ne prouve aucun fait.
- **Typer 17 vues news** d'emblée : le Lot 1 débloque le build et rend la surface lisible (JSON brut) ;
  la vue typée est un travail de design (Lot 2), pas un prérequis de couverture.
