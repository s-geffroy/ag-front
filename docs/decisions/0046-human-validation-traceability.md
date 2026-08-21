# 0046 — Traçabilité de la validation humaine

- **Statut :** accepté (garde HDDE→VERDICT **faite** ; journal validateur **fait côté cockpit** — ADR 0068 ;
  reste cible côté HDDE/VERDICT)
- **Date :** 2026-07-01 (amendé le 2026-07-15 : journal cockpit implémenté, ADR 0068)
- **Contexte connexe :** ADR 0027 (candidat ≠ fait), 0037 (Munich, `compliance_done`), 0034 (red team
  accept/reject), 0040 (divergence HDDE), 0041/0042 (VERDICT, audit veto), 0068 (LLM-juge de
  pré-validation cockpit), methode-verdict. Registre : `apps/cockpit/reference/workflow-commercial.md` §7.2.

## Contexte

La doctrine impose une **validation humaine** à chaque saut **candidat → fait** : acceptation/rejet des
suggestions red team (HDDE, ADR 0034), validation de packet (`validated_by`/`validated_at`), audit
hard-veto VERDICT, revue Munich (`compliance_done`, ADR 0037). Deux failles :

1. **Le garde-fou n'était pas tenu au passage HDDE→VERDICT** : l'API interne servait le *dernier* packet
   sans filtrer `status='validated'` — un **brouillon** était ingérable, contournant la « validation
   humaine obligatoire ».
2. **L'évidence de la validation n'est pas capturée uniformément** : `compliance_done` est un **booléen
   sans signataire** ; l'audit veto stocke statut + codes mais pas **qui/quand** ; il n'existe pas de
   **journal immuable** de qui a validé quoi.

## Décision

Faire de la **traçabilité de la validation** une garde de premier ordre.

- **Garde « packet validé » (faite).** L'API interne HDDE (`internal.ts`) ne sert que le **dernier packet
  `validated`** (sinon `404 no_validated_packet`) ; VERDICT (`integrations/hdde.ts`) **revérifie** le
  statut avant ingestion (défense en profondeur). Codifié ici, amende **ADR 0042**. Couvert par tests
  (HDDE : brouillon → 404, validé → 200 ; VERDICT : brouillon → ingest 502).
- **Identité + horodatage du validateur (cible).** Tout franchissement candidat→fait capte
  **`validated_by` (identité)** + **`validated_at`** : validation de packet (déjà partiellement présent),
  acceptation red team, audit veto VERDICT, et `compliance_done` Munich (qui gagne un **signataire**).
- **Journal append-only (cible).** Un journal **immuable** (append-only) enregistre chaque décision de
  validation (acteur, objet, horodatage, avant/après), rejouable pour l'audit.

## Garde-fous obligatoires

- Aucune donnée ne devient un **fait** (quitte le statut `candidate`) sans un enregistrement de
  validation nominatif (ADR 0027).
- Le journal est **append-only** : pas de réécriture rétroactive d'une validation.
- Cohérent avec **Munich** (ADR 0037) : `compliance_done` reste coché **après** revue humaine, désormais
  **avec** le signataire.

## Conséquences

- La garde HDDE→VERDICT est **effective** (code + tests).
- **Journal validateur cockpit : implémenté (ADR 0068).** Le franchissement `candidate → fact` sur un gate
  éditorial (gates du livrable + contrôles Munich) passe désormais par `POST /api/deliverables/:id/validate`,
  qui, en un flux atomique, coche la cible **et** écrit une entrée dans la collection **append-only**
  `validation_journal.json` (git-trackée) : `deliverable_id`, `target_kind`, `target_id`, `decision`,
  `reserve`, `before`/`after`, `judge_verdict_snapshot` (le candidat LLM confirmé/écarté, ADR 0068),
  `validated_by`, `validated_at`. Le serveur **refuse** toute mutation/suppression d'une entrée existante,
  et refuse `compliance_done` tant que les 10 contrôles Munich ne sont pas `ok`. Cela remplace le tableau
  markdown tenu à la main dans `docs/evidence/*-gates-review.md`.
- **Limite d'identité (honor-system).** Le cockpit n'a pas d'authentification — il n'est joignable que sur
  le tailnet (Tailscale, ADR 0005) par un opérateur unique. `validated_by` est donc déclaratif : il provient
  d'une identité `operator` configurée (`config.json`) et confirmée par action, **jamais** dérivée
  silencieusement de l'utilisateur OS. Une future couche d'auth durcirait ce point ; en l'état, le journal
  append-only reste une piste d'audit rejouable et suffisante pour un mono-opérateur.
- Reste **cible** côté HDDE et VERDICT : identité systématique + journal immuable sur l'acceptation red team
  et l'audit hard-veto.
- Léger surcoût de schéma (colonnes validateur + table de journal), justifié par l'auditabilité exigée
  par la posture anti-prédiction et la valeur Premium.

## Exception consignée — 2026-08-21 : une réécriture rétroactive, autorisée nommément

Le garde-fou ci-dessus (« pas de réécriture rétroactive d'une validation ») a été **enfreint une
fois**, sur autorisation explicite de l'opérateur, et cette section est la trace que le journal ne
porte plus lui-même.

**Ce qui a été réécrit.** L'entrée `val_0d38faa3-fea9-4e40-88e0-591236f7bc92`
(`news_promotion`, cluster `84b80f1f-1a1e-4e1f-a2f6-d40020d33130`, canal de Panama,
`validated_at: 2026-08-21T13:08:57.144Z`) portait `validated_by: "sge (via Slack)"`. Elle porte
désormais `"Sylvain Geffroy (via Slack)"`. **Rien d'autre n'a changé** : ni la décision, ni
l'horodatage, ni l'avant/après, ni `note_origin`. La personne n'a jamais varié — seule la
configuration qui la nommait avait changé.

**Pourquoi l'écart plutôt qu'une entrée de correction.** Le schéma `ValidationEntry` n'a pas de champ
pour cela, et il n'est pas `strict()` : un champ ajouté à la main serait **silencieusement supprimé**
à la première réécriture du magasin par le serveur. Une entrée d'annulation-remplacement, elle,
aurait demandé un `target_kind` que l'énumération ne prévoit pas. La trace ne pouvait donc pas vivre
dans le fichier ; elle vit ici et dans l'historique git.

**Comment.** Édition directe du fichier, hors serveur : `POST /api/deliverables/:id/validate` refuse
par construction toute mutation d'une entrée existante, et cette garde n'a pas été touchée.

**La cause, qui reste à traiter.** L'identité du validateur a **deux sources indépendantes** —
`config.json#operator` pour le cockpit, `SLACK_OPERATOR_NAME` pour le slackbot. Rien ne les lie, donc
rien n'empêche qu'elles divergent, et c'est exactement ce qui s'est produit. Tant que la seconde ne
dérive pas de la première, l'incident peut se reproduire.
