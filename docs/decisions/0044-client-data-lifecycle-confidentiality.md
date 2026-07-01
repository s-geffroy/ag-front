# 0044 — Cycle de vie & confidentialité des données clients (HDDE/VERDICT)

- **Statut :** proposé (doctrine arrêtée ; implémentation = cible)
- **Date :** 2026-07-01
- **Contexte connexe :** ADR 0036 (modèle entreprise HDDE), 0034 (red team OpenAI), 0013 (taint
  interne), 0042 (contrat HDDE↔VERDICT), 0006/0011 (lead-capture, obligations RGPD différées),
  0027 (candidat ≠ fait), 0037 (Munich). Registre : `apps/cockpit/reference/workflow-commercial.md` §7.2.

## Contexte

HDDE stocke un **roster d'entreprises tierces sensibles** (fournisseurs, clients, banques, assureurs,
régulateurs… avec `jurisdiction_risk`, `share_pct`, `country`, `single_source` — ADR 0036), puis VERDICT
en **copie** les champs utiles dans sa propre base (ADR 0042). Or :

- La seule obligation RGPD documentée concerne les **prospects** (lead-capture) et elle est **différée**
  (« à détailler quand l'endpoint sera construit », ADR 0006). Aucune ADR ne couvre la **donnée
  diagnostique client** (rétention, purge, suppression, résidence, chiffrement-au-repos).
- Le modèle **`taint`** (ADR 0013) est un mécanisme de **licence de redistribution de source**, **pas**
  un mécanisme de **confidentialité client** — les deux sont aujourd'hui conflés ou hors périmètre.
- La **red team** envoie un résumé du roster (acteurs + pays) à **OpenAI `gpt-4o`** (ADR 0034) sans note
  de traitement (DPA, résidence, minimisation). Faits externes : l'API OpenAI **n'entraîne pas** sur les
  données (engagement entreprise), rétention **30 j** par défaut puis suppression, **Zero Data
  Retention** (ZDR) et **DPA** disponibles sur accord entreprise. Côté RGPD : art. 28 impose une durée de
  rétention + suppression en fin de contrat ; rétention contractuelle = durée du contrat + prescription
  (3–6 ans FR) ; la CNIL sanctionne activement les défauts de rétention.

## Décision

Introduire une **classification « donnée-client »** distincte du `taint`, et un **cycle de vie** explicite
des données diagnostiques dans HDDE **et** VERDICT.

- **Classification.** La donnée-client (roster, cas, packet, décision) est une classe de confidentialité
  propre — **jamais** exposée hors app-auth, **jamais** republiée, indépendante du `taint` de source.
- **Rétention & suppression.** Durée = **durée du contrat + période de prescription** ; **purge
  automatique** à l'échéance ; **suppression sur demande** (DSAR) traçable côté HDDE et VERDICT (la copie
  VERDICT doit être purgeable avec l'original). **Chiffrement-au-repos** des bases SQLite ; **résidence
  UE**.
- **Sous-traitant OpenAI.** **DPA signé** + **exclusion d'entraînement** + **ZDR** ; à défaut de ZDR,
  **minimisation** : la red team n'envoie qu'une **abstraction** du roster (types + pays agrégés), jamais
  les **noms** d'entreprises. Le prompt reste durci (pas d'invention, pas d'action irréversible, ADR 0034).
- **DPA client.** Applied Geopolitics signe un DPA avec le client (sous-traitant), listant OpenAI comme
  sous-traitant ultérieur, avec les durées de rétention et le droit de vérifier la suppression.

## Garde-fous obligatoires

- La donnée-client **ne sort jamais** de la surface app-auth (HDDE/VERDICT) ; aucune fuite via exports
  publics, logs, ou l'API interne `read` chokepoints.
- Une suppression client **cascade** HDDE → copie VERDICT (pas d'orphelin).
- Aucune donnée canonique HDDE/CVI/chokepoints n'est mutée (ADR 0027) ; ce cycle de vie porte sur la
  **donnée-client**, pas sur les faits canoniques.

## Conséquences

- Chiffrement-au-repos + purge planifiée + endpoints DSAR à implémenter (HDDE et VERDICT).
- Contractuel : DPA client + revue du DPA OpenAI + demande de ZDR (ou bascule minimisation).
- La minimisation du roster peut réduire la finesse de la red team — arbitrage assumé au profit de la
  confidentialité.
