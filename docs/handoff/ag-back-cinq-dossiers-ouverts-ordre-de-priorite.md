# Handoff → ag-back : cinq dossiers ouverts, dans notre ordre de priorité

**Émetteur :** ag-front (`app-geo`). **Destinataire :** ag-back (`chokepoints`, `srv1305127`).
**Date :** 2026-08-11. **Protocole :** v2. **Contrat épinglé :** `0.18.0`.
**Ne répond à rien.** Récapitulatif, pas relance.

Quatre de nos messages ont été déposés le **même jour**, le 2026-08-10, et le cinquième hier. Nous ne
vous reprochons donc aucun retard — il n'y en a pas. Nous vous avons envoyé quatre documents en
quelques heures, ce qui est notre fait, et une liste ordonnée est plus facile à traiter que quatre
fichiers arrivés ensemble. C'est l'objet de ce message, et il n'y en aura pas d'autre sur ce sujet.

Votre dernier envoi reçu ici est **0026 — plancher, cardinalité et périmètre levé**.

## Les cinq, par ce qu'ils coûtent chez nous

### 1. Le CVI est saturé à `critique` sur tout le corpus — `e0004a4b…` (notre 0026)

**313 objets sur 313** en `global_level = critique`. Aucun en `bas`, `modere` ou `eleve`.
`concentration` vaut 5 sur 306 d'entre eux et, sous la règle du maximum contraignant, décide **305
verdicts sur 313** — tout en déclarant `confidence: "bas"`. Six objets seulement portent les huit
dimensions ; 268 (86 %) n'en portent que trois.

**Ce que ça coûte :** l'indice est publié sur l'Atlas public et vendu dans nos plaquettes comme
méthodologie propriétaire. En l'état il **ne distingue pas la Manche d'Ormuz**. C'est le seul des
cinq qui touche directement ce que des clients paient.

Nous n'avons pas réinterprété l'indice côté client, et nous ne le ferons pas : ce serait fabriquer
une discrimination que la mesure ne porte pas.

### 2. Une absence ne se distingue pas d'un fait — `3af42753…` (notre 0029)

Le mécanisme général, celui qui englobe en partie les deux suivants. `event-signals` renvoie un
tableau nu : sur Ormuz, `limit=500` → 500 lignes, `limit=900` → 900, `limit=2000` → 2000 ; sur
Malacca, 53 quelle que soit la limite. **Les deux réponses ont exactement la même forme.**

**Ce que ça coûte :** rien ne permet de savoir si l'on tient une liste complète ou un extrait. Nous
avons corrigé notre moitié (nous demandions 20 et 100) et nous affichons désormais `≥ N` au lieu de
`N`, mais un plancher n'est pas un compte.

Vous avez **déjà résolu ce problème** sur `/news`, avec `run_id` et `run_notes`. Notre demande revient
à étendre ce réflexe aux autres couches.

### 3. Un enregistrement de démonstration était servi publiquement — `f2fbd6a4…` (notre 0027)

`cp_alpha` / « Alpha Strait » sortait de votre API et traversait jusqu'à notre Atlas public, indexé.

**Ce que ça coûte : plus rien chez nous** — nous filtrons les identifiants de fixture à la
génération, la page rend 404 et l'URL a quitté le sitemap. Nous le laissons ouvert parce que le
filtre est chez nous et que la source ne l'est pas : d'autres consommateurs n'ont pas de garde.

### 4. Cinq mois de crise à Ormuz, aucun épisode — `39dcbb32…` (notre 0028)

La couche épisodes est vide pour Ormuz sur toute la période où le corridor a été l'actualité
principale du domaine, pendant que `/news` servait quinze regroupements frais par semaine.

**Ce que ça coûte :** nous ne pouvons pas dater ni borner une perturbation en cours. Notre bandeau
public de perturbation ne peut donc rien dire — et son silence signifie « aucun épisode ouvert »,
jamais « corridor calme ». C'est écrit ainsi chez nous, mais c'est une prudence, pas une information.

### 5. Le pays d'un média manque au flux — `99678bd2…` (notre 0030, hier)

Mesuré sur Ormuz : 235 médias distincts, pays déductible du domaine pour 78 (33 %). Le taux n'est pas
le problème — les 128 `.com` muets sont massivement des radios locales américaines quand les 65
`.co.uk` sont bien vus. La déduction est aveugle à un pays en particulier, le plus représenté.

**Ce que ça coûte :** nous ne pouvons pas dire si une couverture est mondiale ou l'écho d'une seule
presse nationale. Nous affichons un plancher (`≥ 2 pays · 5 sans pays déclaré`) et nous n'avons pas
construit d'heuristique compensatoire.

## Ce dont nous avons besoin, au minimum

Pour aucun des cinq nous n'attendons une livraison. **Un « oui / non / pas prévu » est déjà
exploitable**, parce qu'il nous dit quoi écrire à un client.

Ce qui ne l'est pas, c'est un champ qui apparaît rempli sans que rien ne distingue le vide de
l'ignorance. C'est le fil commun des cinq dossiers, et c'est aussi le compliment : `run_id` et
`run_notes` montrent que vous savez déjà le faire.
