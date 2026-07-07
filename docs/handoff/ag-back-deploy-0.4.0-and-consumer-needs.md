# Handoff → ag-back : déployer 0.4.0 & garantir les sorties consommées par ag-front

**Émetteur :** ag-front (`app-geo`, consommateur de la read API chokepoints).
**Destinataire :** le LLM/agent qui implémente ag-back (`chokepoints`), avec accès complet à ce repo.
**Contexte :** ag-front va porter sa consommation à **100 % de la surface 0.4.0** (usage maximal,
décision produit). Ce document liste ce qu'ag-back doit **déployer et peupler** pour que ce câblage
ne bute pas sur des 404 / réponses vides.

---

## 0. Constat de départ (mesuré côté consommateur)

- **Repo ag-back (HEAD)** = contrat **0.4.0** (release 2026-07-01, `api/version.py`, `docs/openapi.json`).
- **Instance déployée** `https://srv1305127.tail880531.ts.net/api` = **0.2.0** (vérifié par
  `curl /openapi.json` → `"version":"0.2.0"`).
- Conséquence : tout ce qui a été construit en **0.3.0 et 0.4.0 n'est pas en ligne**, donc
  inconsommable. Le drift-check du consommateur est « vert » uniquement parce qu'il diffe le
  déployé (0.2.0), pas le repo.

**Impact bloquant côté ag-front, déjà écrit et aujourd'hui mort en prod :**
`GET /chokepoints/{id}/cvi-assessment` est déjà câblé (client, HDDE, prefill VERDICT) et **404 en
prod** → `packet.corridor_cvi` toujours `null` → la branche CVI la plus riche de VERDICT est inerte.

---

## 1. Objectif principal — déployer 0.4.0 sur `srv1305127`

Mettre l'instance déployée au niveau du repo (0.2.0 → 0.4.0). Le déploiement est **additif** (aucun
changement cassant vs 0.2.0, cf. changelog §7) : les consommateurs 0.2.0 existants continuent de
fonctionner.

Étapes attendues (adapter aux procédures réelles du repo — tu as l'accès) :
1. `alembic upgrade head` (schéma à jour).
2. Recalculer **toutes** les analytics dérivées, dans l'ordre de dépendances :
   - `python -m tools.derive_relations` **avant** les engines de graphe (les engines
     `network_centrality` et `system_resilience` lisent l'UNION relations canoniques + dérivées —
     cf. `tools/derive_relations.py`).
   - `python -m tools.run_engines` (les 20 engines, dont `corridor_vulnerability`=CVI,
     `system_resilience`, `network_centrality`, `weaponizability_composite`, `exposed_trade_loss`,
     `control_concentration`, etc.).
3. Redéployer le service `api` et vérifier `GET /openapi.json` → `"version":"0.4.0"`.
4. S'assurer que `docs/openapi.json` **déployé == snapshot 0.4.0 du repo** (le consommateur re-pin
   dessus et fait un drift-check strict ; toute divergence casse son pipeline).

---

## 2. Sorties qui DOIVENT renvoyer des données (pas seulement exister)

ag-front va consommer ces endpoints à fond. Merci de garantir qu'ils renvoient des données peuplées
au moins pour les corridors **P0/P1** (pas des listes vides ni des 404 « until computed ») :

| Endpoint | Attendu par ag-front | Dépend de |
|---|---|---|
| `GET /chokepoints/{id}/cvi-assessment` | 8 dimensions CVI peuplées (score 0–5, rationale, confidence) | engine `corridor_vulnerability` (+ les 7 SFD engines amont) |
| `GET /chokepoints/{id}/analysis` | les 15 blocs typés non vides (criticality, substitution, `network_centrality` incl. `articulation_point`, `control_concentration` HHI, `weaponizability`, `exposed_trade_loss`, regime, event_pressure, corroboration, flow_value…) | `run_engines` + `derive_relations` |
| `GET /analytics/system-resilience` | 200 avec régime ENA global (`brittle`/`window_of_vitality`/`redundant`, `robustness`, `ascendency`) — **pas 404** | engine `system_resilience` (ADR 0057) + `derive_relations` |
| `GET /strategic-flows` + `/{sfu_id}/verdict` + `/{sfu_id}/fiche` | SFIM : liste avec `verdict`/`verdict_status`, verdict détaillé (decision, rationale, required_actions, rejected_verdicts), fiche (routes, control_actors, value_chain, scoring, red_team) | **SFIM scoring/verdict sont authored en workbench, PAS auto-calculés** (`tools/load_strategic_flow_units.py`, `tools/sfim_redteam.py`) → il faut qu'au moins **1 SFU de référence** soit chargé + scoré + verdict rempli, sinon la couche est vide côté consommateur |
| `GET /chokepoints/{id}/fiche` | fiche CCM 16 sections peuplée | engines CCM (`run_ccm`) |
| `GET /chokepoint-analyses/{id}/{doc}` | markdown `synthesis` / `theory-of-constraints` / `leverage-points` | fichiers d'analyse présents pour les chokepoints P0/P1 |
| `GET /alerts`, `/vocabularies`, `/sources`, `/analytics/engine-runs` | non vides (alertes ouvertes, vocabulaires contrôlés, registre de sources, historique de runs) | pipeline nominal |
| `GET /chokepoints/{id}/perception-signals` | `consensus[]` + `signals[]` exploités (pas seulement `count`) — **scope `read_tainted`** | collecte Polymarket (best-effort, peut rester vide) |

Si l'une de ces sorties reste structurellement vide (ex. données Polymarket absentes, dimension CVI
`resilience` sans données buffer/recovery), **documente-le** (voir §3) plutôt que de laisser le
consommateur deviner.

---

## 3. Contrats à confirmer noir sur blanc (le consommateur code dessus)

1. **`aggregate_score` CVI reste gated** (jamais servi tant que la méthodo 0–100 n'est pas documentée).
   → ag-front n'affichera **jamais** un score CVI 0–100 agrégé ; il présente les 8 dimensions +
   `global_level` (binding constraint). Confirme que c'est bien la posture 0.4.0.
2. **Dimension CVI `resilience` souvent omise** (pas de données buffer/recovery). → ag-front doit
   tolérer son absence sans planter. Confirme.
3. **Sémantique des scores** : CVI 0–5, **plus haut = plus vulnérable** ; `global_level`
   ∈ `bas|modere|eleve|critique`. Confirme.
4. **Tout dérivé = candidat** (analytics, CVI, analysis, SFIM verdict, system-resilience) : le
   `disclaimer` verbatim et le `status` doivent rester présents dans chaque réponse — ag-front les
   affiche tels quels (candidate ≠ fact). Confirme qu'aucun dérivé n'est présenté comme canonique.
5. **Scopes** : ag-front utilise un token `read` (public/HDDE/tools) et un token `read_tainted`
   (cockpit tailnet only). Confirme que `/perception-signals` reste `read_tainted` et que les
   endpoints ci-dessus (hors perception) sont accessibles en `read`.
6. **SemVer** : si tu ajoutes/renommes au-delà de 0.4.0, bump le contrat + Changelog §7 ; ag-front
   pin + diffe le snapshot, un renommage/suppression de champ est un **breaking** à annoncer.

---

## 4. Vérification (à lancer côté ag-back après déploiement)

```bash
# version en ligne
curl -s https://srv1305127.tail880531.ts.net/api/openapi.json | grep -o '"version":"[^"]*"'
# → "version":"0.4.0"

# un corridor P0 : CVI peuplé (8 dims)
curl -s -H "Authorization: Bearer <read>" \
  https://srv1305127.tail880531.ts.net/api/chokepoints/<P0-id>/cvi-assessment | jq '.dimensions | keys'

# system-resilience calculé (≠ 404)
curl -s -H "Authorization: Bearer <read>" \
  https://srv1305127.tail880531.ts.net/api/analytics/system-resilience | jq '.regime, .robustness'

# SFIM : au moins un SFU avec verdict
curl -s -H "Authorization: Bearer <read>" \
  https://srv1305127.tail880531.ts.net/api/strategic-flows | jq '.items[] | {id, verdict, verdict_status}'
```

---

## 5. Ce que fait ag-front ensuite (pour info, aucune action ag-back requise)

Après ton déploiement, ag-front : re-pin le contrat sur 0.4.0 + drift vert ; ajoute au client TS les
méthodes/schémas manquants (`/strategic-flows/*`, `/analytics/system-resilience`, typage `FicheOut`) ;
injecte CVI 8 dims, `/analysis`, `/relations`, SFIM et system-resilience dans le packet HDDE et le
prefill VERDICT ; et ajoute un test de couverture qui échoue si un endpoint du contrat n'a pas de
consommateur produit. **Le seul prérequis de notre côté, c'est que 0.4.0 soit déployé et peuplé.**
