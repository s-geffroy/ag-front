---
title: Ce que vous voyez n’est pas ce dont vous dépendez
date: 2026-07-15
summary: >-
  Une entreprise voit un fournisseur ou un point de passage ; le risque réel se
  loge dans les dépendances cachées derrière lui — l’écart entre résilience
  déclarée et résilience prouvée.
access: public
signals:
  - 'Alternative fournisseur déclarée mais non testée ni contractualisée — seuil : tant qu’aucun basculement réel n’a été éprouvé, la substitution reste une hypothèse'
  - 'Dépendance de rang-2 inconnue derrière un fournisseur visible — seuil : un composant ou prestataire unique en amont, non identifié'
  - 'Gatekeeper non cartographié (logistique, assurance, finance, régulateur) — seuil : un acteur capable de bloquer le flux sans être fournisseur'
decision_implication: >-
  Traiter la dépendance non comme le fournisseur visible mais comme la chaîne
  cachée derrière lui, et poser des seuils d’action (surveiller / préparer /
  agir / escalader).
blind_spot: >-
  HDDE ne prédit pas et ne remplace pas le jugement interne du client ; une
  suggestion de la red team (LLM) n’est jamais une preuve.
confidence: eleve
corrections: []
sources:
  - label: Méthode HDDE — Applied Geopolitics (poste d’entretien guidé)
    type: analyse_secondaire
  - label: Méthode CVI — vulnérabilité des corridors (Applied Geopolitics)
    type: analyse_secondaire
  - label: Modèle de divergence — résilience déclarée vs prouvée (méthode interne)
    type: analyse_secondaire
draft: true
---

Une entreprise sait nommer l’acteur dont elle dépend : un fournisseur, un organe de
certification, un point de passage. C’est l’acteur **visible**. Le risque qui la surprend se
loge presque toujours ailleurs — derrière lui, dans ce qu’elle ne regardait pas. La rupture,
quand elle arrive, ne vient pas du nom qu’on surveillait, mais du sous-traitant de rang deux,
de la juridiction qui contraint le flux, de l’assureur qui se retire.

Le visible n’est donc pas ce dont on dépend. L’exposition réelle naît de l’écart entre la
résilience **déclarée** — l’alternative qu’on croit avoir, le plan de repli sur le papier — et
la résilience **prouvée** : celle qui a été éprouvée. Plus cet écart est grand et moins il est
vu, plus la dépendance est dangereuse. C’est cet angle mort que HDDE, le *Hidden Dependency
Discovery Engine*, prend pour objet.

## Trois angles morts à interroger

- **Une alternative déclarée mais jamais éprouvée.** Tant qu’aucun basculement réel n’a été
  testé ni contractualisé, la substitution reste une hypothèse — pas une sécurité.
- **Une dépendance de rang deux ignorée.** Derrière un fournisseur visible peut se tenir un
  composant, un logiciel ou un prestataire unique, en amont, que personne n’a cartographié.
- **Un gatekeeper hors du radar.** Un acteur — logistique, assurance, finance, régulateur —
  peut bloquer le flux sans jamais être votre fournisseur. S’il n’est pas identifié, il ne peut
  pas être anticipé.

## Ce que HDDE rend visible

HDDE est un poste d’entretien guidé qui remonte, pas à pas, de l’acteur visible aux dépendances
cachées : rangs successifs, juridictions, gatekeepers, chokepoints. À chaque exposition il
attache une **posture graduée** — surveiller, préparer, agir, escalader — et le seuil qui
déclenche le passage de l’une à l’autre. Chaque élément porte sa source et sa fiabilité ; une
objection de la red team éclaire le raisonnement mais ne vaut jamais preuve. Le diagnostic
complet — packet sourcé, dimensions notées — relève des offres payantes ; ce que la méthode
donne à voir en public reste **qualitatif**.

> Diagnostic provisoire — HDDE ne prédit pas et ne remplace pas le jugement interne du client.
> Chaque sortie est un candidat en attente de validation humaine, jamais un fait.

## Pour aller plus loin

- La méthode en détail : [HDDE — révéler les dépendances cachées](/methode-hdde).
- Mesurer la vulnérabilité d’un corridor : [le Corridor Vulnerability Index](/methode-cvi).
- Du diagnostic à l’arbitrage : [la méthode VERDICT](/methode-verdict).
- Les niveaux d’accompagnement : [nos offres](/offres).
