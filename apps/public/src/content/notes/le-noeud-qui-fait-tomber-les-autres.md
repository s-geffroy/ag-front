---
title: 'Le nœud qui fait tomber les autres : centralité et cascade'
date: 2026-07-15
summary: >-
  Dans un réseau de corridors, tous les nœuds ne se valent pas. Nous calculons lequel,
  s’il cède, entraîne une cascade — pour savoir où intervenir en priorité.
access: public
signals:
  - 'Centralité — combien de chemins du réseau passent par le nœud (intermédiarité, PageRank pondéré) ?'
  - 'Point d’articulation — sa disparition fragmente-t-elle le réseau en sous-ensembles isolés ?'
  - 'Cascade — combien de nœuds en aval dépendent de lui en cas de retrait ?'
decision_implication: >-
  Traiter tous les points de passage à égalité gaspille l’effort : sécuriser — ou
  contourner — le nœud contraignant a plus de levier que d’agir partout à la fois.
blind_spot: >-
  La centralité est topologique : elle décrit une structure de dépendance sur un graphe
  curé et candidat, pas la probabilité qu’un nœud tombe. Analyse en attente de validation humaine.
confidence: eleve
corrections: []
sources:
  - label: 'Brandes (2001), « A Faster Algorithm for Betweenness Centrality »'
    type: analyse_secondaire
    url: 'https://doi.org/10.1080/0022250X.2001.9990249'
  - label: 'Théorie des contraintes (Goldratt 1984) ; points de levier (Meadows 1999)'
    type: analyse_secondaire
  - label: 'Centralité réseau & cascade au retrait — méthode Applied Geopolitics'
    type: analyse_secondaire
draft: true
---

Dans un réseau de corridors, tous les nœuds ne se valent pas. Certains ne portent qu’eux-mêmes ;
d’autres, s’ils cèdent, entraînent une cascade. Savoir lequel est le **nœud contraignant** vaut mieux
que traiter tous les points de passage à égalité.

Nous traitons les relations entre chokepoints comme un graphe orienté et calculons, pour chaque nœud,
plusieurs mesures de **centralité** : l’*intermédiarité* (Brandes, 2001) — combien de chemins du
réseau passent par lui —, un PageRank pondéré, une centralité de vecteur propre. Nous testons ensuite
s’il est un **point d’articulation** : sa disparition fragmente-t-elle le réseau en morceaux isolés ?
Enfin, une **cascade au retrait** compte les nœuds qui, en aval, dépendent de lui. C’est la lecture
d’un système par sa contrainte (Goldratt, 1984) et par ses points de levier (Meadows, 1999).

## Trois signaux à suivre

- **Centralité** — combien de chemins du réseau passent par le nœud (intermédiarité, PageRank
  pondéré) ?
- **Point d’articulation** — sa disparition fragmente-t-elle le réseau en sous-ensembles isolés ?
- **Cascade** — combien de nœuds, en aval, dépendent de lui en cas de retrait ?

## Classer, pas prédire

Le calcul **ordonne** les nœuds du plus au moins contraignant ; il ne prédit aucun événement. Un point
d’articulation à forte intermédiarité est un candidat d’intervention prioritaire — pour le sécuriser,
ou pour bâtir son contournement. En lecture publique, ce classement s’exprime qualitativement ; le
détail chiffré et la pondération des liens restent réservés aux offres payantes. La limite est
topologique : la centralité décrit une **structure de dépendance** sur un graphe curé et candidat, pas
la probabilité qu’un nœud tombe.

> Diagnostic provisoire — la centralité dit où une défaillance ferait le plus mal, pas qu’elle
> surviendra. Analyse dérivée, candidate en attente de validation humaine.

## Pour aller plus loin

- La grille de vulnérabilité : [le Corridor Vulnerability Index](/methode-cvi).
- Pourquoi raisonner en corridors : [un corridor n’est pas une route](/notes/un-corridor-nest-pas-une-route).
- Les corridors travaillés : [l’Atlas stratégique](/atlas).
