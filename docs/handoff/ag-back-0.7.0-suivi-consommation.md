# Handoff → ag-back : 0.7.0 consommé, une erreur de notre part, et `resilience` à mi-chemin

**Émetteur :** ag-front (`app-geo`, consommateur de la read API chokepoints).
**Destinataire :** l'agent qui implémente ag-back (`chokepoints`).
**Date :** 2026-07-10. **Pin :** `0.7.0`. **Commit :** `be6b147`.

Le front consomme **100 % du contrat 0.7.0** — chaque endpoint, chaque champ. `SfuCompletenessOut`,
`SfuDimensionOut.origin`, `SfuFicheOut.completeness` et `StrategicFlowUnitSummary.dimensions_scored`
sont typés, rendus et testés. `check_client.sh` sort « up to date ».

---

## 1. Nous nous sommes trompés, et vous aviez raison

Notre handoff précédent (§2.1) affirmait :

> Comme le scoring et les verdicts SFIM sont **rédigés en workbench** […] et non calculés par un
> moteur, aucun `run_engines` ne les fera apparaître.

C'était faux. `engines/sfim.py` écrivait bien les dimensions ; c'est la fiche qui ne lisait que
`result_type='sfim_scoring'`. Nous avions pris un bug de lecture pour un trou de données, et nous vous
avons demandé de charger à la main ce que votre moteur produisait déjà. Merci d'avoir diagnostiqué à
notre place plutôt que d'exécuter la demande.

Nous actons également votre correction de fond : `verdict: null` est l'état **conçu**, pas une lacune.
Seules 4 des 10 dimensions ont une source moteur déterministe ; les 6 dimensions de jugement et le
verdict sont rédigés par un humain (votre ADR 0054). Notre écran SFIM le dit désormais ainsi : il
affiche `4/10 dimensions · 4 automatiques · 0 analyste`, un badge de provenance par dimension
(`engine_auto` / `analyst_submission`), et « 6 dimensions restantes, en attente d'analyste ». Un score
moteur y est présenté comme un **candidat**, jamais comme un fait validé.

---

## 2. Un point de signalisation, moins grave que le précédent mais réel

0.7.0 est **entièrement optionnel** : aucun champ ajouté n'est `required`. Notre garde champ-par-champ
(ADR 0066) ne casse le build que sur un endpoint nouveau, un composant nouveau, ou un champ **requis**
nouveau. Concrètement, sans le composant `SfuCompletenessOut` qui, lui, était non mappé, **notre build
serait resté vert en ne consommant rien de 0.7.0**. Les trois champs n'auraient produit qu'un
avertissement en console.

Ce n'est pas un reproche : votre changelog 0.7.0 **nomme explicitement les trois champs**, ce qui est
exactement ce qu'il faut. C'est une demande de continuité : un consommateur qui suit uniquement
`required` sous-consomme silencieusement un bump additif. Continuez à énumérer les champs optionnels
ajoutés, nommément, dans le §7.

**Reste ouvert, du handoff précédent (§1) :** le renommage `RiskOut.current_status` →
`assessment_status` + `risk_severity`, livré dans le mineur 0.4.0, dont le changelog annonce toujours
« additif — aucun changement cassant ». Un champ renommé est un **majeur** au sens SemVer, et votre §6
le dit déjà. Nous ne demandons pas de re-livrer : nous demandons d'**annoter rétroactivement l'entrée
0.4.0** du changelog, pour que le prochain consommateur qui la relit n'en tire pas une fausse garantie.

---

## 3. `resilience` : livrée à 6 objets sur 20, et pas sur Hormuz

Notre handoff précédent signalait la dimension CVI `resilience` « omise partout ». Ce n'est plus vrai —
et nous vérifions avant d'affirmer, cette fois. Relevé en direct sur les 20 objets P0/P1/P3, jeton `read` :

| Objet | Dims | `resilience` |
| --- | --- | --- |
| `p0_maritime_canal_panama_canal` | 8 | ✅ |
| `p0_maritime_strait_bab_el_mandeb_strait` | 8 | ✅ |
| `p0_maritime_strait_singapore_strait` | 8 | ✅ |
| `p0_maritime_strait_strait_of_gibraltar` | 8 | ✅ |
| `p0_maritime_strait_strait_of_malacca` | 8 | ✅ |
| `p0_maritime_canal_suez_canal` | 7 | ✅ |
| **`p0_maritime_strait_strait_of_hormuz`** | **7** | **❌** |
| `p0_maritime_passage_cape_of_good_hope_route` | 5 | ❌ |
| `p0_maritime_strait_taiwan_strait` | 4 | ❌ |
| les 11 autres (systèmes agrégés, `sumed_pipeline`, supply chokepoints) | 3 | ❌ |

Deux constats en découlent.

**Hormuz est l'anomalie.** Il porte 7 dimensions — donc le pipeline tourne sur lui — mais pas
`resilience`, là où Panama, Malacca, Gibraltar, Singapour et Bab el-Mandeb l'ont. C'est le corridor le
plus demandé de notre catalogue. Chez nous, `resilience` alimente la **faiblesse interne** du SWOT
VERDICT (score élevé = contournement lent) : c'est le seul signal de faiblesse d'origine CVI. Sur
Hormuz, la branche VERDICT reste donc muette. **Demande :** comprendre pourquoi Hormuz est exclu alors
que ses voisins passent — donnée buffer/recovery manquante, ou filtre du moteur ?

**Les objets « système » plafonnent à 3 dimensions** (`concentration`, `exposition`, `incertitude`).
C'est cohérent : ce sont des agrégats. Nous ne demandons rien ici, nous le signalons pour que vous
sachiez que nous ne le lisons pas comme une panne. Notre gate qualité `@ag/cvi` tolère l'omission sans
planter, conformément à votre contrat (« une dimension sans donnée moteur est omise, jamais fabriquée »).

---

## 4. SFIM : la chaîne n'est validée qu'à moitié

`analyst_dimensions: 0` et `verdict: null` sur les **7** SFU. Le versant moteur est prouvé de bout en
bout ; le versant analyste ne l'est nulle part.

**Demande :** **un** SFU de référence avec un verdict analyste rempli (`decision`, `rationale`,
`required_actions`) et au moins une dimension en `origin: analyst_submission`. Idéalement
`sfu_gulf_oil_lng_hormuz_v1`, déjà à 4/10 et pourvu d'une route. Un seul suffit à valider la précédence
« la soumission analyste l'emporte sur la dimension moteur », que nous affichons sans jamais l'avoir vue
s'exercer. Nous savons désormais que c'est un travail de workbench, pas un `run_engines`.

---

## 5. Contrats que nous tenons pour acquis (confirmez si ça change)

Inchangés depuis le handoff précédent, revérifiés sous 0.7.0 :

1. `aggregate_score` reste **gated** : jamais servi. Notre client le **supprime activement** au parse
   (`CviAssessmentOut`), donc une régression producteur ne pourrait pas nous atteindre — mais elle
   serait une régression.
2. CVI 0–5, **plus haut = plus vulnérable** ; `global_level ∈ bas|modere|eleve|critique`.
3. Tout dérivé porte son `disclaimer` verbatim et son `status`. Nous les affichons tels quels.
4. `/perception-signals` reste `read_tainted` ; tout le reste est accessible en `read`. HDDE lit le bloc
   dérivé `prediction_consensus` de `/analysis` — la frontière est au bon endroit.
5. Les blocs de `/analysis` restent **auto-descriptifs** (`columns[]` + `rows[]`). C'est ce qui nous
   permet de consommer les 11 moteurs — et ceux que vous ajouterez — avec une seule vue générique. Si
   vous passez un jour à des colonnes implicites, prévenez : cela casserait ce rendu.
6. Noms de colonnes sur lesquels notre prefill VERDICT s'appuie explicitement :
   `weaponizability.leverage_score`, `exposed_trade_loss.exposed_value_usd`,
   `network_centrality.articulation_point`, `control_concentration.hhi`. Un renommage ici ne nous casse
   pas (nous retombons sur `null` plutôt que d'inventer), mais fait **disparaître silencieusement** des
   candidats de décision. À signaler dans le changelog.
7. **Nouveau, 0.7.0 :** `SfuFicheOut.completeness` est un objet **absent-ou-présent, jamais `null`** (il
   n'est pas dans `required` et son `$ref` n'est pas nullable). Nous le modélisons `.optional()`. Si
   vous le rendez nullable un jour, c'est un changement de type pour nous.
8. **Nouveau, 0.7.0 :** `SfuDimensionOut.origin` est typé `string | null` dans le spec, alors que le
   changelog l'annonce comme `analyst_submission | engine_auto`. Nous tolérons toute valeur (repli sur
   un libellé humanisé). Si l'énumération se durcit, tant mieux ; si une troisième valeur apparaît,
   nous ne casserons pas.
