# 0071 — Atlas public : consensus Polymarket dérivé (live) + couverture média promue (hybride)

- **Statut :** accepté — **mise en ligne publique du volet Polymarket conditionnée** à la confirmation
  de redistribution par ag-back (dépôt `cf9303ef`, canal ADR 0067). Le volet news promues n'est pas
  conditionné.
- **Date :** 2026-07-25
- **Contexte connexe :** **amende** ADR 0013 (`read_tainted` interne uniquement). S'appuie sur ADR 0066
  (consommation intégrale garantie au build), 0067 (canal d'échange ag-back), 0068/0046 (LLM-juge +
  journal nominatif), 0069 (publication 1-clic + watcher hôte), 0070 (consommation news/counterfactual),
  0042 (une news plafonne à `stress`, jamais une fermeture), 0035 (HDDE en scope `read`). Côté producteur :
  ADR 0079 (perception resserrée), 0080/0081 (matière news).

## Contexte

L'« Atlas stratégique des corridors » public (`www.applied-geopolitics.com`) présente aujourd'hui des
fiches quasi statiques. Le cockpit interne, lui, affiche déjà par corridor deux couches de **signaux
vivants** consommées de la read API — la **couverture média** (`/news`) et le **consensus de marchés de
prédiction** Polymarket — mais l'ADR 0013 les verrouille en `cockpit`-only (candidats non validés, source
potentiellement *tainted*, jamais republiés sur un site ouvert et indexé).

Décision produit (arbitrée avec le propriétaire) : **enrichir chaque corridor de l'Atlas public** de ces
deux signaux, cadrés explicitement comme **candidats** (jamais « incident confirmé »). Trois arbitrages :

| Sujet | Choix |
| --- | --- |
| Surface | Atlas public, orientation *live* (assume l'amendement d'ADR 0013) |
| News | **Hybride** : flux complet en cockpit ; seuls les clusters **promus à la main** passent en public |
| Polymarket | **Consensus dérivé** uniquement (`prediction_consensus`), jamais les marchés bruts |
| Placement | Les **deux couches** de l'Atlas : fiches éditoriales `/atlas/{slug}` et pages BDD `/atlas/chokepoints/{id}` |

## Ce qu'on a vérifié sur l'API réelle (0.12.0, token `read` clair)

- Le consensus dérivé n'est **pas** un champ racine de `/analysis` : c'est un **moteur** dans
  `analysis.engines[]`, `key = "prediction_consensus"`, `columns = [signal_family, market_count,
  consensus_probability, max_probability_change_24h, total_liquidity]`, un `row` par famille. Présent pour
  les corridors à marchés (Panama, Suez, Cap, Bab-el-Mandeb, Hormuz, Malacca, Taïwan).
- Ce moteur est **servi au token `read` clair** (HTTP 200). Les marchés **bruts**
  (`/perception-signals`) renvoient **403** au même token (gate `read_tainted` inconditionnel).
- Sa `description` porte « Polymarket P3 perception consensus (**uncleared source**) » — la *provenance*
  est non-cleared, d'où la question de redistribution déposée à ag-back avant mise en ligne publique.

## Décision

### 1. Amendement d'ADR 0013 (carve-out, pas abrogation)

ADR 0013 interdit de republier des données **tainted**. On précise sa portée :

- **Le consensus dérivé lu au token `read` clair n'est pas tainted** — le producteur l'a rendu
  clair-accessible par construction (200 sur `read`, 403 sur le brut). Le republier en public est
  **compatible** avec le cœur d'ADR 0013. **Les marchés bruts restent internes** (cockpit, `read_tainted`),
  **inchangés**.
- Ceci **desserre** la posture générale « aucun candidat dérivé en public » sur laquelle s'appuyait
  ADR 0070 — nommément et étroitement, pour ce seul agrégat.

### 2. Frontière de gouvernance de contrat

- `CONSUMERS['/chokepoints/{id}/analysis']` passe à `['public', 'cockpit', 'hdde']`, mais le build public
  ne lit `/analysis` **que** via la projection étroite `getChokepointConsensus` (les seules `rows` du
  moteur consensus ; jamais engines/relations/claims). `/news` et `/perception-signals` **restent
  `['cockpit']`** — aucun changement de contrat pour les news.
- **Handoff producteur idéal (non bloquant)** : un endpoint clair dédié
  `GET /chokepoints/{id}/prediction-consensus` permettrait de n'ouvrir au public qu'une surface étroite au
  lieu de tout `/analysis`. La projection self-serve est l'intérim **réversible** (retirer `'public'` d'une
  ligne du ledger). Demande incluse au dépôt `cf9303ef`.

### 3. News en public = **promotion**, jamais flux automatique

- `/news` reste cockpit-only. Le site public lit un **store commité dans le dépôt**
  (`apps/public/src/data/promoted-news.json`), **écrit par le cockpit** lors d'une promotion **humaine**,
  sous les mêmes gardes qu'ADR 0069 : gate de validation adossé au LLM-juge (ADR 0068), acte **nominatif**
  journalisé (`target_kind: 'news_promotion'`, ADR 0046), sentinelle `.publish-pending` + watcher hôte.
- **Frontière de confiance** : la prose de modèle (`headline`, `summary_text`, `event_category`,
  `salience_score`) est un **candidat** ; les champs fiables (`articles[]`, `affected_chokepoints[]`,
  compteurs) sont **re-fetchés côté serveur au moment de la promotion**, jamais pris du corps client.
  Seuls des clusters `taint_class = 'cleared_only'` sont promouvables.

### 4. Cadence « live » sur un site SSG

- Le consensus est tiré **au build**. Un nouveau mode `scripts/redeploy-public.sh --refresh-signals`
  rebuild **inconditionnellement** (garde `check:munich` maintenue, garde d'intervalle min), déclenché par
  un **cron hôte horaire** (`max_probability_change_24h` est une métrique 24 h → l'horaire suffit). Le
  watcher `--if-pending` 2 min reste inchangé et sert les news promues.
- **Fraîcheur honnête** : label « consensus au <date> » ; si le rafraîchissement échoue, le loader retourne
  `null` et le bloc **disparaît** plutôt que d'afficher un chiffre périmé comme courant.

## Garde-fous obligatoires

- **Jamais de token au navigateur** : loaders au build / lecture de fichier ; composants = HTML statique.
- **Défense en profondeur taint** : scope `read`, `include_tainted` jamais posé ; rejet explicite de tout
  item `taint_class !== 'cleared_only'` ou portant `license_taint`, à l'écriture **et** à la lecture.
- **XSS stocké (OWASP A03)** : les URLs d'articles (source médias/GKG) sont validées `http|https` (drop
  `javascript:`/`data:`) à l'écriture **et** au rendu, `rel="noreferrer"` ; la prose est **échappée** (et
  les entités HTML non décodées `&#x2013;` signalées par ag-back en 0017 nettoyées).
- **Cadrage candidat** : plafond « couverture », jamais « fermeture » (ADR 0042) ; disclaimers producteur
  repris **verbatim**.
- **Frontière conteneur→hôte préservée** (ADR 0069) : le cockpit n'exécute aucun `docker compose`.
- **Réversible** : retirer `'public'` du ledger + les rendus désactive le volet Polymarket ; vider le store
  désactive les news ; le watcher horaire se retire d'une ligne de cron.

## Conséquences

- Nouvelle surface publique de signaux par corridor, sur les deux couches de l'Atlas. Le site public
  devient un consommateur **live** (rebuild horaire) au lieu d'un pur instantané éditorial.
- Nouvelle surface d'écriture cockpit bornée (`promoted-news.json`), sur le patron ADR 0069.
- `ValidationEntry.target_kind` étendu à `'news_promotion'` (schéma `@ag/schema`).
- **Dépendance externe** : la mise en ligne **publique** du consensus Polymarket attend le **oui** d'ag-back
  à la question 1 du dépôt `cf9303ef`. En cas de **non**, on garde le consensus en cockpit et on abandonne
  le volet public Polymarket — le volet news promues, lui, reste livrable.
