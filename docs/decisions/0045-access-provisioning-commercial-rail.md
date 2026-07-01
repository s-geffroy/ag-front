# 0045 — Provisioning d'accès & rail commercial

- **Statut :** proposé (doctrine arrêtée ; implémentation = cible)
- **Date :** 2026-07-01
- **Contexte connexe :** ADR 0033 (HDDE public + app-auth, pas de self-signup), 0041 (VERDICT dédié),
  0006/0011 (lead-capture), 0044 (données clients/RGPD), 0038 (cockpit métier). Registre :
  `apps/cockpit/reference/workflow-commercial.md` §7.1 + §7.3.

## Contexte

La page d'offres vend trois tiers **`€/mois`** (Basic/Standard/Premium), mais entre « un lead existe » et
« un client paie et a un accès scoping », **tout est manquant** :

- **Aucun rail de paiement** (ni Stripe/Paddle, ni abonnement, ni facture) — les trois CTA pointent vers
  `/contact`. Les tiers priced sont donc **invendables en l'état**.
- **Provisioning manuel** : un compte HDDE/VERDICT se crée à la main (`seed:user`) ; rôles
  `owner_admin|analyst` seulement, **aucun tier codé**, **aucune identité client/tenant**.
- **Pipeline commercial** sans stade post-vente (`won/active/churn`) ni KPIs revenus (MRR/ARR,
  conversion, rétention). Le pilote « 6–8 sem. » est de la **prose** (1 stade + 1 KPI).
- **Newsletter** vendue en Basic mais **inexistante** (pas de formulaire ni de consentement).

Rappel doctrinal (ADR 0033) : **pas de self-signup**. Le provisioning reste **déclenché par
l'encaissement**, pas par une inscription libre.

## Décision

Établir un **rail commercial** reliant paiement → identité client → accès scoping, et **instrumenter** le
cycle de vie.

- **Paiement / abonnement.** Adopter un fournisseur d'abonnement (Stripe recommandé, à confirmer) **ou**
  une facturation manuelle assumée pour le B2B haut de gamme ; dans les deux cas, un **encaissement**
  devient un événement de provisioning.
- **Identité client & tier.** Introduire une **identité client/tenant** portant l'**offre** souscrite ;
  le compte analyste HDDE/VERDICT est **rattaché** à ce client. Le tier reste **non verrouillant côté
  code** (la frontière Basic/Standard/Premium demeure commerciale, cf. workflow-commercial.md §4), mais
  l'identité et le tier sont **enregistrés** pour l'audit et la facturation.
- **Provisioning.** Un encaissement (ou une validation de deal) **déclenche** la création de compte +
  **invitation e-mail** (remplace le `seed:user` manuel). Pas de self-signup (ADR 0033).
- **Cycle de vie & KPIs.** Ajouter les stades `won/active/churn` au pipeline et les **KPIs revenus**
  (MRR/ARR, conversion, rétention) au scorecard commercial.
- **Pilote 6–8 sem.** Outiller un **cycle de vie de pilote** (checklist, timeline, livrables, caps : 1
  corridor, 2–3 flux, 3–5 signaux, 1 restitution).
- **Newsletter.** Formulaire + **opt-in RGPD stocké** (consentement horodaté), aligné sur ADR 0044.

## Garde-fous obligatoires

- **Pas de self-signup** : tout accès naît d'un encaissement/validation humaine (ADR 0033).
- Le stockage paiement/consentement respecte **ADR 0044** (résidence UE, rétention, DSAR).
- Le tier n'introduit **pas** de verrouillage de fonctionnalité côté code sans décision explicite — il
  reste un attribut commercial + d'audit.

## Conséquences

- Intégration d'un fournisseur de paiement (ou processus de facturation) + webhooks de provisioning.
- Modèle de données : entité client/tenant + tier + abonnement ; extension du pipeline et des KPIs.
- La boucle post-verdict (seuil/date de revue, workflow-commercial.md §7.3) s'appuiera sur cette identité
  client pour notifier le bon interlocuteur.
