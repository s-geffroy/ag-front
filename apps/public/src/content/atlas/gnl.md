---
title: Corridors GNL
verdict: >-
  SQUELETTE — À RÉÉCRIRE AVANT TOUTE PUBLICATION. Thèse de cadrage, non sourcée :
  Le GNL n'est pas un corridor mais une cargaison, et sa vulnérabilité n'est pas celle du pétrole qui l'accompagne : à Ormuz, le brut a deux contournements, le gaz n'en a aucun.
family: énergie
priority: P0
regions:
  - Golfe Persique
  - Asie de l'Est
  - Atlantique Nord
access: public
published: false
corrections: []
updated: 2026-08-21
confidence: bas
---

<!--
  Squelette créé le 2026-08-21, après dégel. Cadrage : docs/cadrage-atlas/gnl.md — le lire AVANT
  d'écrire.

  AUCUN chokepoint_id, et c'est la THÈSE, pas une lacune. Le GNL se lit par coupe transversale
  (GET /chokepoints/by-flow/LNG, 28 objets dont 15 P0 au 2026-08-21), il n'a pas de nœud à nommer :
  ses nœuds sont ceux des autres corridors. Ancrer sur Ormuz ferait doubler ormuz.md ; ancrer sur un
  terminal ferait passer une grappe pour un corridor. Donc : ni bloc consensus, ni actualité promue,
  ni lien vers /atlas/chokepoints/<id>.

  NE JAMAIS SOMMER les volumes entre objets : deux objets d'un même passage produisent un double
  compte — l'amont vient d'en retirer deux pour cette raison (contrat 4.0.0).
  Chaîne : docs/notes-pipeline-redaction.md. Aucune porte ne se coche sans un humain nommé.
-->

## Définition du corridor

<!-- à rédiger : le GNL comme cargaison traversant des passages déjà décrits ailleurs — dire d'emblée pourquoi cette fiche est une coupe et non un corridor -->

## Nœuds principaux

<!-- à rédiger : les 15 P0 portant le flux LNG, par importance déclarée sur CE flux (Ormuz 5, système golfe Persique 5, puis Malacca / Singapour / Panama / mer de Chine méridionale / Taïwan 4…). L'importance_score ordonne une liste, il ne mesure PAS un volume -->

## Flux concernés

<!-- à rédiger : GNL seul, distingué du brut qui emprunte les mêmes passages — c'est la distinction qui porte la fiche -->

## Vulnérabilités

<!-- à rédiger : l'ASYMÉTRIE. À fermeture égale d'Ormuz, la part gazière est intégralement exposée quand la part pétrolière ne l'est qu'en partie. À RE-SOURCER : l'absence de gazoduc de contournement est aujourd'hui une note de flux de l'amont, pas une source primaire -->

## Alternatives / bypass

<!-- à rédiger : brut — oléoduc Est-Ouest saoudien vers Yanbu, conduite d'Abou Dabi vers Fujairah, avec leurs capacités. GNL — à démontrer qu'il n'y en a pas, plutôt qu'à l'affirmer -->

## Seuils d’alerte

<!-- à rédiger : tableau à 4 colonnes — seuil, mécanisme, ce qu'il déclenche, statut/fondement (Adossé / Partiel / Repère opérationnel / Repère hypothétique) -->

## Scénarios

<!-- à rédiger : deux ou trois trajectoires avec leurs conditions de bascule, jamais une prévision -->

## Effets systémiques

<!-- à rédiger : ce qu'une interruption gazière fait aux importateurs qui n'ont pas de substitut de court terme -->

## Niveau de confiance

<!-- à rédiger : bas. Aucun volume valorisé en base (les prix GNL sont une fixture chez eux, ils omettent plutôt que multiplier), et le fait central reste à re-sourcer -->

> **Fait / analyse.** À COMPLÉTER à la rédaction : distinguer les valeurs de source primaire (faits
> **rapportés**, non reconfirmés par nos soins), les estimations et ordres de grandeur, et ce qui relève
> de l'**analyse** (seuils, scénarios). Ce qui n'est pas documenté publiquement est signalé comme tel.

> Fiche Atlas — version publique (Basic). Le scoring CVI 0–5 par dimension est réservé à l'offre Standard.
> Géométrie schématique, sans valeur navigationnelle ou juridique.
> Candidat en attente de validation humaine.
