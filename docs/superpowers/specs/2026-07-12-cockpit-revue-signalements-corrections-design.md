# Spec — Cockpit : revue éditoriale par signalements (corrections déléguées)

- **Date :** 2026-07-12
- **Statut :** design validé (avant plan d'implémentation)
- **Doctrine liée :** ADR 0037 (Munich, `compliance_done`), ADR 0046 (traçabilité de la validation
  humaine), ADR 0027 (candidat ≠ fait), ADR 0005 (cockpit Tailscale, pas d'auth).
- **Précédents de code réutilisés :** feature *contradictions* (`apps/cockpit/server/api.ts`,
  `apps/cockpit/data/contradictions.json`, `ContradictionPanel.tsx`), matrice Munich
  (`MunichMatrix.tsx`), moteur de persistance `apps/cockpit/server/store.ts`.

## 1. Contexte & problème

La relecture d'un livrable éditorial (Fiche Atlas, Dossier, Note) dans le cockpit se fait aujourd'hui
sur un **lecteur en lecture seule** (`apps/cockpit/src/pages/ContentReaderPage.tsx`, route
`/lire/:type/:slug`) qui injecte un **blob HTML** rendu côté serveur
(`dangerouslySetInnerHTML`, `server/markdown.ts` via `marked` + `sanitizeHtml`). Il n'existe **aucun
ancrage mot/ligne** et aucun moyen de signaler une correction depuis le cockpit.

Le relecteur humain veut **signaler** des points à corriger — pas les corriger lui-même. Deux gestes :
**sélectionner des mots** (passage précis en prose) et **cocher une ligne** (bloc discret). Les
signalements doivent être **persistés** dans une file durable que **l'agent (Claude) traite ensuite**.
Selon la catégorie, la correction est soit appliquée directement, soit **proposée puis validée**
(candidat→fait, ADR 0046).

## 2. Objectifs / Non-objectifs

**Objectifs**

- Poser un signalement depuis le lecteur : sélection de mots **ou** case cochée par bloc.
- Chaque signalement porte : **ancre + catégorie (`factuel`/`style`/`source`/`structure`) + note libre**.
- Persistance sidecar en JSON, **jamais** dans le `.md` (les `.md` sont la source du site public).
- Ancre **robuste** à un doc qui a évolué entre le signalement et le traitement.
- Boucle de traitement **mixte par catégorie** : `style`/`structure` auto-appliqués ; `factuel`/`source`
  proposés puis validés par l'humain (capture `validated_by`/`validated_at`).
- Générique (piloté par `config.json#output_types`), **validé d'abord sur `atlas/mer-rouge-suez`**.

**Non-objectifs (YAGNI pour cette itération)**

- Journal append-only immuable d'ADR 0046 (reste une *cible* ; on capture acteur+horodatage sur
  acceptation, sans historique complet).
- Authentification du cockpit (inexistante par design, ADR 0005) → identité = **nom d'opérateur
  configuré**, pas une vraie auth.
- Écriture des `.md` par le serveur cockpit (c'est l'agent qui édite, hors process serveur).
- Mise à jour automatique des gates `deliverables` / Munich à partir des signalements.

## 3. Décisions de cadrage (validées)

1. **Contenu d'un signalement** : ancre + **catégorie** (`factuel`/`style`/`source`/`structure`) + **note** libre.
2. **Granularité « cocher une ligne »** : **une case par bloc** (paragraphe, puce, **ligne de tableau**,
   entrée de source, titre). La **sélection de mots** reste possible en plus, pour un passage précis.
3. **Boucle de traitement** : **mixte par catégorie** — `style`/`structure` appliqués directement ;
   `factuel`/`source` proposés (diff) puis validés dans le cockpit avant d'atterrir.

## 4. Architecture

### 4.1 Modèle de données — nouvelle collection `annotations`

Fichier `apps/cockpit/data/annotations.json`, schéma `packages/schema/src/cockpit/annotation.ts`
(nouveau), enregistré dans l'allowlist `collectionSchemas` de `apps/cockpit/server/store.ts`. Clé
d'ancrage documentaire identique aux contradictions : `doc_id = ${content_type}/${slug}`.

```ts
// packages/schema/src/cockpit/annotation.ts (forme cible)
Annotation = {
  id: string,                         // ex. "an_<hash court>"
  doc_id: string,                     // `${content_type}/${slug}`
  content_type: string,
  slug: string,
  anchor: {
    kind: 'block' | 'span',
    block_id: string,                 // ex. "b12" ou "b12.r3" (ligne 3 du tableau 12)
    block_hash: string,               // hash court du texte source du bloc (détecte la dérive)
    quote?: string,                   // span : texte sélectionné ; block : incipit
    prefix?: string,                  // ~30 car. avant (re-localisation floue)
    suffix?: string,                  // ~30 car. après
    char_offset?: number,             // indice dans la source du bloc (indice, non contrat)
  },
  category: 'factuel' | 'style' | 'source' | 'structure',
  note?: string,
  status: 'open' | 'proposed' | 'accepted' | 'rejected' | 'applied' | 'done' | 'obsolete',
  created_at: string,
  created_by?: string,                // nom d'opérateur configuré (pas d'auth)
  proposed_patch?: {                  // rempli par l'agent pour factuel/source
    before: string, after: string, rationale: string, at: string,
  },
  resolution?: { by: 'agent', at: string, action: string },  // ce que l'agent a fait
  validation?: { validated_by: string, validated_at: string },  // ADR 0046, à l'acceptation
}
```

### 4.2 Ancrage (le seul vrai net-new)

- Le serveur découpe la **source markdown** (déjà exposée par `readContentSource`,
  `apps/cockpit/server/content.ts`) en **blocs** via le lexer `marked` déjà utilisé. Blocs = tokens de
  premier niveau, **sauf** tableaux et listes qui se **développent par ligne / par item**
  (`block_id` de la forme `b12.r3`). Cela donne « une case par bloc » y compris **lignes de tableau de
  seuils** et **entrées de sources**.
- Chaque bloc porte `block_id` (chemin stable) et `block_hash` (hash court du texte source normalisé).
  Le HTML rendu enveloppe chaque bloc dans un conteneur `data-block-id` / `data-block-hash`.
- **Sélection de mots** : capture `{block_id, quote, prefix, suffix, char_offset}`.
- **Re-localisation au traitement** (agent) : (1) bloc par `block_id` si `block_hash` concorde →
  exact ; (2) sinon recherche du `quote` (span) / du texte de bloc, désambiguïsé par `prefix`/`suffix` ;
  (3) introuvable → `status='obsolete'`, signalé à l'humain (jamais d'édition aveugle).

### 4.3 Serveur (Express)

Routes calquées sur *contradictions* (`apps/cockpit/server/api.ts`), persistées via `mutateCollection`
(verrou `withFileLock` + écriture atomique tmp+rename + validation zod — `store.ts`) :

- `GET  /content/:type/:slug` — **enrichi** pour renvoyer aussi la **carte des blocs**
  (`blocks: [{ block_id, block_hash, html }]`) en plus du `html` actuel, sans casser les consommateurs.
- `GET  /annotations/:type/:slug` — liste les signalements d'un doc.
- `POST /annotations/:type/:slug` — crée un signalement.
- `PUT  /annotations/:id` — met à jour statut/note ; **accepter** un `proposed` écrit `validation`.
- `DELETE /annotations/:id` — retire un signalement.

Le serveur **n'écrit aucun `.md`**. `content.ts` garde son durcissement de chemin (`resolveDocPath`).

### 4.4 UI lecteur (`ContentReaderPage.tsx`)

- Rendu **par bloc** (à partir de `blocks[]`) avec **case dans la marge** de chaque bloc.
- **Sélection de texte** dans un bloc → petit **popover « Signaler »** : puces catégorie (4) + champ note.
- **Panneau latéral** listant les signalements du doc (réemploi du style `ContradictionPanel.tsx`),
  avec statut ; pour un `proposed` (`factuel`/`source`), affiche le **diff avant/après** de l'agent avec
  **Accepter / Refuser**. Accepter demande / applique le **nom d'opérateur** (→ `validation`).
- Style et interaction « cliquer une case → PUT → recharger » repris de `MunichMatrix.tsx`.

### 4.5 Boucle de traitement (agent)

Sur « traite la file » pour un doc : l'agent lit les signalements `open`, les **re-localise** (§4.2),
puis **route par catégorie** :

- `style` / `structure` → l'agent **édite directement le `.md`**, écrit `resolution`, passe `done`.
- `factuel` / `source` → l'agent **calcule** la correction et écrit un `proposed_patch`
  (`before`/`after`/`rationale`), passe `proposed`. L'humain **Accepte** dans le cockpit
  (→ `validation.validated_by/at`), puis l'agent **applique** et passe `done` ; ou **Refuse** → `rejected`.
- Ancre introuvable → `obsolete`, rapportée.

Git est le filet (annulable) ; la fiche reste `published: false` pendant la revue.

## 5. Cycle de vie d'un signalement

```
open ──(style/structure)──▶ applied ──▶ done
  │
  └──(factuel/source)──▶ proposed ──(Accepter)──▶ accepted ──▶ applied ──▶ done
                            │
                            └──────────(Refuser)──▶ rejected
(à tout moment, ancre perdue au traitement) ──▶ obsolete
```

## 6. Rattachement à la doctrine

- **ADR 0046** : l'acceptation d'un signalement `factuel`/`source` **est** l'acte candidat→fait ; on
  capture `validated_by` + `validated_at`. Le **journal append-only** reste une cible (non couvert ici) —
  on documente cette dette. C'est un pas *vers* la traçabilité pour le contenu éditorial (aujourd'hui
  `Provenance.validation_status` bascule sans acteur ni horodatage).
- **ADR 0037 (Munich)** : les signalements alimentent la revue humaine ; ils **ne cochent pas
  automatiquement** `compliance_done` / `human_review_done` (décision humaine explicite, hors scope).
- **Errata `corrections[]`** (`apps/public/src/content/config.ts`) : quand une correction `factuel`
  atterrit dans une fiche **publiée**, l'agent ajoute aussi l'entrée `{date, note}` d'errata (devoir
  Munich 5). Pour un draft `published:false`, pas d'errata.

## 7. Portée / MVP

- Construit **générique** (tous les `content_type` via `config.json`), mais **livré et validé d'abord
  sur `atlas/mer-rouge-suez`**.
- Découpage en tranches : (T1) schéma + collection + routes serveur + découpage en blocs ;
  (T2) lecteur par bloc + cases + popover + POST ; (T3) panneau latéral + `proposed`/Accepter/Refuser ;
  (T4) boucle de traitement agent (re-localisation + routage catégorie).

## 8. Tests (TDD)

- **Unitaires schéma/store** : création/liste par `doc_id`, mise à jour de statut, écriture atomique,
  rejet d'un `content_type` hors allowlist.
- **Unitaires ancrage** : découpage en blocs déterministe ; `block_id`/`block_hash` stables au reflow
  (espaces/retours) ; re-localisation par `quote`+contexte quand `block_hash` dérive ; `obsolete` quand
  le texte a disparu.
- **Unitaires routage** : `category → politique` (auto-apply vs proposed).
- **E2E** (supertest, cf. `apps/hdde-api/test/api.e2e.test.ts`) : POST crée, GET liste, PUT *Accepter*
  écrit `validation.*` ; un flag `style` finit auto-appliqué, un flag `factuel` part en `proposed`.
- **Vérif UI** : parcours réel dans le conteneur `tools` via `agent-browser` (poser un flag, voir le
  diff, accepter) sur la fiche Mer Rouge.

## 9. Limites & travaux ultérieurs

- **Pas d'auth** (ADR 0005) → `created_by`/`validated_by` = nom d'opérateur configuré, non authentifié.
- **Pas de journal append-only** (cible ADR 0046) : on capture acteur+horodatage à l'acceptation, sans
  historique immuable — lot ultérieur.
- **Pas d'auto-mise à jour des gates** Munich/deliverables — décision humaine explicite conservée.
- L'ancrage `char_offset` est un **indice**, jamais un contrat (la re-localisation repose sur
  `block_hash` + `quote`/contexte).

## 10. Fichiers touchés (indicatif)

- **Nouveau** : `packages/schema/src/cockpit/annotation.ts` ; `apps/cockpit/data/annotations.json` ;
  composants lecteur (`apps/cockpit/src/components/review/*`) ; `apps/cockpit/src/lib/annotation.ts`.
- **Modifié** : `apps/cockpit/server/store.ts` (allowlist) ; `apps/cockpit/server/api.ts` (routes) ;
  `apps/cockpit/server/content.ts` + `markdown.ts` (découpage en blocs + carte des blocs) ;
  `apps/cockpit/src/pages/ContentReaderPage.tsx` (rendu par bloc + cases + popover + panneau) ;
  `apps/cockpit/src/lib/api.ts` (client) ; `packages/schema/src/cockpit/index.ts` (export).

## 11. Sécurité

- Le HTML **par bloc** renvoyé par `GET /content/:type/:slug` doit rester **sanitizé côté serveur** via
  le `sanitizeHtml` déjà appliqué dans `markdown.ts` — le découpage en blocs ne doit pas court-circuiter
  la sanitisation. Le lecteur continue d'injecter du HTML **déjà nettoyé** (le contenu est notre propre
  markdown interne, pas une entrée utilisateur, mais la sanitisation reste la ligne de défense).
- `note` et `created_by` (saisis par l'humain) sont du **texte** : rendus en texte (jamais en HTML),
  et validés par zod (longueur bornée) au POST/PUT.
- Cockpit loopback + Tailscale, sans auth (ADR 0005) : pas d'exposition publique de ces routes.