# Candidats-sources — Détroit de Malacca (fiche Atlas)

> **STATUT : CANDIDATS EN ATTENTE DE VALIDATION HUMAINE — PAS DES FAITS.**
> Registre ouvert le 2026-07-14 pour lever les marqueurs `[À SOURCER]` de
> `apps/public/src/content/atlas/malacca.md` (deliverable `deliv_atlas_malacca_fiche`).
> Aucune valeur ci-dessous ne doit être promue dans la fiche canonique ni présentée comme établie
> avant lecture, recoupement (≥ 2 sources primaires) et validation nominative par un analyste humain
> (ADR 0046). Les chiffres attendus sont **rapportés** par les sources, non confirmés par nous.
>
> Méthode retenue par Sylvain : **Perplexity Recherche Avancée** (prompt ci-dessous), puis
> escalade `agent-browser` (conteneur Docker `tools`) pour les PDF/pages bloquées.

---

## Prompt Perplexity Recherche Avancée — à coller tel quel

```
Tu es analyste en géopolitique des chaînes d'approvisionnement. Je prépare une fiche factuelle
sur le DÉTROIT DE MALACCA comme chokepoint énergétique et maritime. J'ai besoin de chiffres
sourcés, chacun avec sa SOURCE PRIMAIRE, une URL et une DATE. Réponds EN FRANÇAIS.

Pour CHAQUE point ci-dessous, donne : (a) la valeur chiffrée la plus récente ; (b) l'année/date
de la donnée ; (c) la source primaire (organisme + titre du document) ; (d) l'URL ; (e) précise
si c'est un FAIT mesuré ou une ESTIMATION. Si une donnée n'existe pas publiquement, dis-le
explicitement plutôt que d'inventer. Privilégie les sources primaires : US EIA, UNCTAD, IEA,
MPA Singapore, ReCAAP ISC, autorités portuaires ; évite les blogs.

FLUX ÉNERGÉTIQUES
1. Volume de pétrole (brut + produits) transitant par Malacca, en Mb/j (source EIA World Oil
   Transit Chokepoints), et son rang mondial parmi les chokepoints pétroliers.
2. Part (%) du brut importé par la Chine qui transite par Malacca. Idem Japon et Corée du Sud
   si disponible.
3. Part (%) du GNL maritime mondial transitant par le détroit.

TRAFIC & CONTENEURS
4. Nombre de transits de navires par an dans le détroit de Malacca.
5. Part (%) du commerce conteneurisé mondial passant par Malacca / le hub de Singapour, et débit
   annuel du port de Singapour en EVP (source MPA Singapore).
6. Norme de tirant d'eau « Malaccamax » (mètres) et tonnage/longueur maximaux associés.

ALTERNATIVES
7. Détroit de Lombok : surcoût en distance (milles) et en temps (jours) par rapport à Malacca
   pour un grand pétrolier / porte-conteneurs.
8. Capacité nominale du pipeline pétrole/gaz Chine-Myanmar (Kyaukphyu → Yunnan), en Mb/j, et
   part du brut chinois qu'il peut détourner de Malacca.
9. Statut actuel du projet de canal de Kra (isthme de Thaïlande) : réalisé ? à l'étude ? abandonné ?

SÉCURITÉ
10. Nombre d'incidents de piraterie / vol à main armée par an dans le détroit de Malacca et le
    détroit de Singapour (source ReCAAP ISC), tendance sur 3-5 ans.

Termine par une liste des points où les données publiques sont absentes ou contradictoires.
```

---

## À obtenir — liste de collecte priorisée (mappée sur les `[À SOURCER]` de la fiche)

1. **Flux de brut Mb/j + rang mondial** (section _Flux_, seuil « Flux de brut ») — EIA.
2. **Part du brut chinois via Malacca** (_Flux_, verdict) — EIA / IEA.
3. **Norme Malaccamax (tirant d'eau, m)** (_Nœuds_) — autorité portuaire / classification.
4. **Débit conteneurisé Singapour (EVP/an) + part mondiale** (_Nœuds_, _Flux_) — MPA Singapore, UNCTAD.
5. **Nombre de transits/an** (_Flux_, seuil « Volume de transits ») — EIA / MPA / AIS.
6. **Surcoût Lombok (jours / milles)** (_Alternatives_) — analyses sectorielles + calcul de route.
7. **Capacité pipeline Chine-Myanmar (Mb/j)** (_Alternatives_) — opérateur / EIA.
8. **Série d'incidents ReCAAP** (_Vulnérabilités_, seuil « Incidents sécuritaires ») — ReCAAP ISC.
9. **Part du GNL mondial** (_Flux_) — EIA / IEA.

## Candidats vérifiés (à remplir)

| Réf | Fait attesté (périmètre) | Source primaire | URL | Date | Type | Accès | Statut |
| --- | ------------------------ | --------------- | --- | ---- | ---- | ----- | ------ |
| M1  | _(à remplir)_            |                 |     |      |      |       | candidat |

## Sites bloqués au bot / accès manuel requis

_(à compléter au fil de la collecte : PDF EIA/UNCTAD, portails portuaires derrière sélecteur, etc.)_

## Journal de validation humaine (ADR 0046) — append-only

_(À compléter par l'analyste : `Réf | Statut (candidat → validé/fait) | Fait attesté (périmètre) |
Réserve portée AVEC le fait | Validé par | Date`. Rappel : valider une source ne la promeut pas
automatiquement dans la fiche — l'édition markdown + le flip du gate `sources_ok` est une étape
éditoriale distincte.)_
