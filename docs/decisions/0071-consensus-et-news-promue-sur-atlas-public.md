# 0071 — Atlas public : consensus Polymarket dérivé (live) + couverture média promue (hybride)

- **Statut :** accepté — **mise en ligne publique du volet Polymarket conditionnée**. La confirmation
  de redistribution par ag-back est **arrivée le 2026-07-26** (leur `0018`, `e3518308`, en réponse à
  notre `cf9303ef`) : **oui, sous conditions** — le blocage restant est **propriétaire** (usage
  commercial) et **d'affichage** (Panama/Suez seulement). Voir « Réponse reçue » en Conséquences. Le
  volet news promues n'est pas conditionné.
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
  moteur consensus ; jamais engines/relations/claims). — **Repris le 2026-07-26** : retour à
  `['cockpit', 'hdde']` et projection supprimée, l'endpoint dédié 0.15.0 l'ayant rendue inutile (voir
  la section « migration » en Conséquences). `/news` et `/perception-signals` **restent
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
### Réponse reçue (ag-back `0018`, `e3518308`, 2026-07-26) — oui qualifié

La question 1 du dépôt `cf9303ef` est tranchée : `polymarket_gamma` est **`cleared_with_attribution`**
dans leur ledger (décision propriétaire 2026-07-12, `license_taint=False`), et l'agrégat dérivé — sans
marché individuel — « divulgue *moins* que le brut ». Le « (uncleared source) » de la `description`
qualifie la **provenance**, pas une interdiction : leur libellé n'avait jamais été réconcilié avec le
flip du 12-07, ils le corrigent. **Trois conditions non négociables avant mise en ligne :**

1. **Attribution Polymarket obligatoire** (pas optionnelle) portée avec l'agrégat + disclaimer
   **S5 / faible fiabilité** (perception de foule, jamais preuve d'événement).
2. **Ne publier que Panama et Suez.** Leur moteur `prediction_consensus` agrège encore tout
   l'historique retenu sans appliquer le plancher `ATTACH_FLOOR=2` d'ADR 0079 — l'attache par acteur
   avait **12 % de précision**. Les ~5 corridors supplémentaires que nous voyions (Hormuz, Taïwan, Cap,
   Bab-el-Mandeb, Malacca) sont ce **bruit pré-plancher conservé**, pas une couverture de marché. Le
   correctif moteur est planifié ; **d'ici là le filtre est de notre responsabilité, à l'affichage.**
   C'est aussi l'explication de l'écart brut↔agrégat que nous avions relevé — attendu, pas une panne.
3. **Feu vert propriétaire sur l'usage commercial** : `commercial_use_allowed` reste
   `needs_legal_review` et `redistribution_allowed` reste `to_verify` (ToS Polymarket non vérifiée ;
   leur clearance est une acceptation propriétaire assumée). Un site public ouvert et indexé peut
   constituer un contexte commercial. **Cette réserve remonte au propriétaire, pas à l'agent.**

Deux facilités accordées, en travaux additifs de leur côté : `observed_window_end` ajouté à la liste
d'affichage du bloc `/analysis` (le label « consensus au <date> » honnête), et l'endpoint dédié
`GET /chokepoints/{id}/prediction-consensus` **planifié** (ils préviendront par le canal). Les 5
colonnes du moteur sont **épinglées par un test de contrat** chez eux : ni renommage ni suppression
sans bump — on peut typer dessus sans casse silencieuse ; seul l'**ajout** de colonnes est sans bump.

- Reste bloquant : le point 3 (décision propriétaire). Le volet news promues, lui, reste livrable.

### Conditions 1 et 2 implémentées (2026-07-26)

- **Liste blanche** `CONSENSUS_PUBLIC_ALLOWLIST` (`apps/public/src/lib/atlas-data.ts`) = exactement
  `p0_maritime_canal_panama_canal` + `p0_maritime_canal_suez_canal`. Testée contre l'API réelle : sur
  les **12** objets dont l'`id` contient `panama` ou `suez` (catalogue de 2 218), **ces deux-là seuls**
  portent le moteur `prediction_consensus` — les systèmes agrégés et les 9 atterrages de câbles ne
  l'ont pas. Le filtre est posé **avant l'appel réseau**, dans l'unique chemin de chargement que
  traversent les deux couches de l'Atlas : un corridor qu'on n'a pas le droit de publier n'est même
  pas lu. Il **échoue fermé** (un `id` inconnu ne rend rien).
- **Attribution + S5** portés **dans le même bloc que les chiffres** (`ConsensusBlock.astro`), rendus
  inconditionnellement, depuis `CONSENSUS_ATTRIBUTION` / `CONSENSUS_RELIABILITY` : pastille
  « Fiabilité S5 », mention « anticipation de la foule […] ni une preuve d'événement ni un conseil »,
  et pied de bloc « Source : Polymarket […] agrégat dérivé […] redistribué avec attribution
  obligatoire » + lien. Le crédit ne peut pas dériver loin de ce qu'il licencie.
- **10 tests** (`atlas-data.test.ts`) gardent les deux conditions : un corridor hors liste renvoie
  `null` **et** ne déclenche aucun appel API, la liste vaut exactement Panama+Suez (l'élargir est une
  décision ag-back annoncée sur le canal, pas la nôtre), l'attribution nomme Polymarket, le disclaimer
  porte S5/faible. Vérifié en rendu réel (dev, flag forcé à `1`) : Panama et Suez rendent le bloc avec
  pastille + attribution + lien, Hormuz ne rend rien.
- **Conséquence à connaître** : aucune fiche éditoriale n'a aujourd'hui un `chokepoint_id` de la liste
  (malacca, taïwan, bab-el-mandeb) — au go-live, le bloc consensus n'apparaîtra donc que sur les
  **pages BDD** de Panama et de Suez. Rien à corriger : c'est la couverture honnête.
- **Retrait du filtre** : quand ag-back appliquera le plancher `attachment_rule` à l'agrégat (correctif
  moteur annoncé), la liste blanche perd sa raison d'être et se supprime en une ligne. Ne pas la
  retirer avant l'annonce sur le canal.
- **Le flag `ATLAS_CONSENSUS_PUBLIC` reste à 0** : la condition 3 (usage commercial) n'est pas levée.

### Tout s'est débloqué le même jour — migration sur l'endpoint dédié (2026-07-26, ag-back `0020`/`0021`)

ag-back a livré, en quelques heures, ce que leur `0018` annonçait comme « planifié », et leur
propriétaire a tranché la réserve d'usage commercial (leur **ADR 0083** : accepté, avec attribution +
S5). **Le nôtre a tranché dans le même sens.** Réponse de fond déposée (`14bd88c9d606`).

| Livraison | Effet chez nous |
| --- | --- |
| **0.13.0** — plancher ADR 0079 appliqué **côté serveur** | notre liste blanche d'affichage devient redondante |
| **0.14.0** — colonne `observed_window_end` | le label « Consensus au \<date\> » s'affiche enfin |
| **0.15.0** — `GET /chokepoints/{id}/prediction-consensus` (clair, `PredictionConsensusList`) | la projection intérimaire sur `/analysis` est retirée |

Séquence exécutée, dans cet ordre :

1. **Pin `0.12.0` → `0.15.0`** (octets servis) + client de drift régénéré. Dérive **structurelle**
   cette fois — un chemin ajouté, un schéma ajouté ; `PerceptionSignalList` n'a bougé que par sa
   description (libellé « uncleared » corrigé).
2. **Consommation du nouvel endpoint** : zod `PredictionConsensusList`, méthode
   `getChokepointPredictionConsensus`, entrées `COVERED_PATHS` / `CONSUMERS` / `SCHEMA_MAP`. La garde
   ADR 0066 a fait exactement son travail : rouge au repin (composant non modélisé), verte une fois
   consommé.
3. **`'public'` retiré de `CONSUMERS['/chokepoints/{id}/analysis']`** → `['cockpit', 'hdde']`. La
   projection `getChokepointConsensus` est **supprimée** : elle était l'intérim réversible, la reprise
   est le point du registre. Le payload large ne traverse plus vers un consommateur public.
4. **`CONSENSUS_PUBLIC_ALLOWLIST` supprimée** — le plancher serveur la remplace. Ce qu'on garde, c'est
   la **lecture du vide** : `consensus: []` = *pas de couverture de marché*, jamais une erreur, jamais
   un zéro rendu (testé).
5. *(non fait)* Activation du flag = mise en ligne publique — décision d'exploitation distincte.

Effet de bord utile : `extractPredictionConsensus` n'ayant plus de client, HDDE l'utilise désormais au
lieu d'un `rows as PerceptionFamily[]` aveugle — un cast de moins, un extracteur partagé de plus.

Vérifié en rendu réel contre l'API `0.15.0` (dev, flag forcé) : Panama et Suez rendent le bloc +
pastille S5 + attribution + lien + « Consensus au 26 juillet 2026 » ; **Hormuz et Taïwan ne rendent
rien** — c'est le plancher serveur, plus notre filtre. Suite complète verte, `typecheck` 0 erreur.

**Fait dans la foulée** : HDDE lit désormais le consensus par l'endpoint dédié, plus par `/analysis`
(ADR 0035 — même preuve, moins de surface : il ne tire plus engines/relations/claims pour un seul bloc).
`CONSUMERS['/chokepoints/{id}/prediction-consensus'] = ['public', 'hdde']` ; `/analysis` garde
`['cockpit', 'hdde']`, HDDE le lisant encore par `fetchCorridorAnalysis` (vue moteurs). Plus aucun
consommateur typé ne passant par le moteur de `/analysis`, `extractPredictionConsensus` est **supprimé** :
une seconde porte d'entrée serait une seconde chose à mettre au plancher. Un `consensus: []` devient chez
HDDE une **absence de preuve**, jamais une récupération en échec (testé).
