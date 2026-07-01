# 0046 — Traçabilité de la validation humaine

- **Statut :** accepté (garde HDDE→VERDICT **faite** ; journal validateur = cible)
- **Date :** 2026-07-01
- **Contexte connexe :** ADR 0027 (candidat ≠ fait), 0037 (Munich, `compliance_done`), 0034 (red team
  accept/reject), 0040 (divergence HDDE), 0041/0042 (VERDICT, audit veto), methode-verdict. Registre :
  `apps/cockpit/reference/workflow-commercial.md` §7.2.

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

- La garde HDDE→VERDICT est **effective** (code + tests). Le reste (identité systématique + journal
  immuable) est un lot à implémenter côté HDDE et VERDICT.
- Léger surcoût de schéma (colonnes validateur + table de journal), justifié par l'auditabilité exigée
  par la posture anti-prédiction et la valeur Premium.
