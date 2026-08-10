# 0075 — Le couplage plaquettes ↔ code est gardé par test, et l'état mesuré est écrit dans les decks

- **Statut** : accepté
- **Date** : 2026-08-10
- **Voisins** : [0073](0073-generateur-de-plaquettes.md) (générateur de plaquettes),
  [0066](0066-consommation-integrale-read-api.md) (consommation intégrale du contrat de lecture),
  [0027](0027-thinking-skills-guardrails.md) (candidats ≠ faits)

## Contexte

L'ADR 0073 fonde le générateur sur une règle : *ce qui a un jumeau ailleurs dans le monorepo est
importé, jamais retapé* — « une plaquette écrite à la main diverge à la première révision tarifaire,
une plaquette générée ne le peut pas ». Un audit des deux familles, avant toute publication, a montré
que la règle ne tenait que là où un test la tenait.

Trois défauts, tous vérifiés contre le code et contre l'API de lecture :

1. **Les quatre bandes de score VERDICT étaient retapées** dans `methode-copy.{fr,en}.ts` et
   imprimaient `≥ 80 / 65–79 / 50–64 / < 50`, quand le moteur (`packages/verdict/src/scoring.ts`),
   les libellés (`labels.ts`), `docs/methode-verdict.md` et la page publique `/methode-verdict`
   disent tous `≥ 80 / 60–79 / 40–59 / 0–39`. Les mauvaises chaînes étaient **dans le `.pptx`
   livré**. Le prix avait une garde (`publication.test.ts`) ; la méthode n'en avait pas.
2. **Les listes `includes`/`excludes` par palier étaient une seconde copie de `site.ts`**, déjà
   divergente sur cinq lignes — et rendues nulle part depuis la suppression des trois slides par
   palier. De la donnée morte qui avait l'air maintenue.
3. **Les mesures vieillissaient sans que rien ne le signale** — conséquence que 0073 avait
   explicitement acceptée. `backend.p0 = 22` alors que l'API en sert 30 ; ADR, tests et migrations
   avaient bougé.

Un quatrième point n'est pas un défaut de couplage mais d'honnêteté. Mesure directe sur la totalité
du corpus instruit (313 objets, API `0.18.0`, `include_tainted=false`) : **`global_level = critique`
sur 313/313**, **268/313 (86 %) ne portent que 3 des 8 dimensions**, 6 objets portent les huit,
`resilience` est servie sur 6 objets. Les deux plaquettes vendaient la jauge à quatre bandes et le
« voir OÙ se loge la vulnérabilité » sans dire cela. Dans des documents dont la signature est
*« un indice qui ne dit pas ses limites est une opinion chiffrée »*, l'omission était la faute la
plus lourde du lot.

## Décision

**1. Ce qui est canonique est importé, et un test le vérifie.** Les bandes viennent de
`verdictLabels`. Le contrat de traduction (`methode-copy.ts`) ne porte plus qu'un
`entries: Record<VerdictKey, { label, note }>` — une bande **ne peut plus** être écrite dans un
fichier de copy, le type l'interdit. `method-coupling.test.ts` asserte l'égalité des bandes, des sept
poids et des huit dimensions CVI contre `@ag/verdict` / `@ag/cvi`, pour FR et EN.

**2. Les mesures atteignent la copy comme arguments, jamais comme littéraux.** `backend-facts.ts` et
le nouveau `cvi-facts.ts` exposent leurs chiffres avec, ligne à ligne, la méthode de comptage et une
date de mesure. Les fonctions de copy les reçoivent en paramètre.

**3. La péremption devient un test rouge.** `MEASURED_ON` / `CVI_MEASURED_ON` sont gardés à 90 jours
par `backend-facts.test.ts`. Les tests d'avant ne prouvaient que la cohérence interne : un jeu de
chiffres entièrement périmé passait au vert.

**4. L'artefact livré est relu, pas seulement le modèle.** `artifact-freshness.test.ts` ouvre le
`.pptx` de `presentations/` et exige d'y trouver les prix courants de `site.ts` et les bandes de
`verdictLabels`, plus l'accord des `manifest.json` avec le nombre de slides que le générateur produit
aujourd'hui. C'est le rappel que 0073 constatait ne pas avoir : *« une révision tarifaire impose de
régénérer `commercial` — rien ne l'automatise »*.

**5. L'état mesuré est écrit dans les deux plaquettes**, là où l'échelle est vendue : la jauge
commerciale et la slide « ce que l'échelle vous donne » portent désormais la couverture réelle, et
l'agrégat 0–100 est présenté comme une condition **non remplie** (`methodology_documented` est câblé
à `False` côté producteur, l'`aggregate_score` n'est jamais servi) plutôt que comme une ligne de
catalogue.

**6. Deux corrections éditoriales**, conséquences du même audit :

- `commercial` — la slide de couverture devient un `split` portant les quatre mesures
  institutionnelles de Malacca (US EIA, MPA Singapore), empruntées au déroulé de `methode`. Un
  prospect froid n'avait jusqu'ici **aucun élément vérifiable** : toutes les fiches sont
  `published: false`, le deck ne lie donc rien, et la seule séquence démonstrative du corpus était
  dans le deck long, lu par les prospects déjà convaincus. La preuve était du mauvais côté. Le
  créneau vient de la suppression d'un second `statement` qui répétait l'argument du premier
  (16 → 15 slides).
- `methode` — la slide de contrat de lecture (`40 points d'accès · 51 schémas · 0.18.0`) est
  supprimée, son idée utile repliée dans la note de la slide provenance, et le panneau de celle-ci
  perd son compte de tests unitaires. Un acheteur B2B de géopolitique n'achète pas une discipline de
  développeurs. Le créneau finance une **4ᵉ slide de déroulé** : un seuil franchi entre dans le
  protocole VERDICT et ressort en test borné — le seul endroit où les deux méthodes se chaînent
  visiblement (29 → 29 slides).

## Conséquences

- Une bande, un poids, une dimension ou un prix qui divergent cassent le build. C'était déjà vrai des
  prix ; ça l'est maintenant de la méthode.
- **Deux mesures restent transcrites à la main** — celles de `backend-facts.ts` et `cvi-facts.ts`.
  Elles ne sont plus silencieuses en vieillissant, mais elles ne se rafraîchissent pas seules : la
  garde à 90 jours dit *quand* re-mesurer, la méthode de comptage écrite dit *comment*.
- `p0 = 30` est le chiffre **servi par l'API** ; le seed du producteur en compte encore 22. L'écart
  est côté producteur, il est noté dans le commentaire de provenance et n'est pas arbitré ici.
- Le `global_level = critique` à 100 % ressemble à un défaut de calibration des seuils côté
  producteur : un indice qui classe tout au maximum ne classe rien. À porter à ag-back via
  `scripts/exchange/deposit.sh`. Ce n'est pas un préalable : la plaquette dit l'état mesuré quelle
  qu'en soit la cause.
- Les deux familles restent `published: false`. La publication demeure un acte cockpit, humain.
