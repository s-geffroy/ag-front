# Audit de fraîcheur des fiches Atlas — 2026-08-10

> **CANDIDATS SOURCÉS EN ATTENTE DE VALIDATION HUMAINE.** Contrôle déclenché après la découverte
> qu'un fait publié de la fiche Mer Rouge était devenu faux (voir
> `mer-rouge-suez-reprise-attaques-2026-07.md`). Objet : les deux autres fiches fondatrices sont-elles
> dans le même cas ?

## Verdict : non. Malacca et Taïwan tiennent.

### Malacca — aucune affirmation contredite

La fiche décrit les incidents SOMS comme **majoritairement de faible intensité (CAT 4), au coût plus
assurantiel que systémique**, sans incident de catégorie 1 en 2025. Les bulletins ReCAAP ISC de
juillet 2026 (dont un abordage dans le rail est du dispositif de séparation du détroit de Singapour,
23 juillet) rapportent exactement ce profil : vols à main armée CAT 4, pas d'escalade de catégorie.
**La caractérisation reste juste.**

Les grandeurs énergétiques (≈ 23,2 Mb/j au 1S 2025) sont **correctement datées et attribuées** (US
EIA / Vortexa). Elles n'ont pas été invalidées ; elles ont vieilli, ce qui est différent.

### Taïwan — aucune affirmation contredite ; un chiffre qui sous-estime

La fiche donne **67,6 %** de part de marché fonderie pour TSMC (T1 2025, TrendForce). Les données
plus récentes situent TSMC à **70,4 % au T4 2025**, voire 71 %. Le chiffre de la fiche est **daté et
attribué**, donc non faux — mais il **sous-estime** désormais la concentration. L'erreur, s'il faut
la nommer, va dans le sens prudent : elle affaiblit la thèse plutôt que de la gonfler.

Même chose pour le 2 nm : la fiche s'appuie sur la ventilation T4 2024 ; depuis, le N2 contribue
réellement au chiffre d'affaires et la capacité mensuelle approche 90–100 k wafers. **La thèse de
concentration s'en trouve renforcée, pas contredite.**

---

## Ce que l'audit a trouvé d'autre, et qui est plus grave

### Le détroit d'Ormuz est en crise depuis cinq mois, et notre site public n'en dit rien

Sources concordantes : trafic restreint de **plus de 90 %** (≈ 10 Mb/j de production affectée) ;
« attaques iraniennes périodiques contre la navigation et frappes américaines de représailles ont
sévèrement perturbé le trafic pendant l'essentiel des cinq derniers mois, début août 2026 » ; Reuters
compte **33 navires du lundi au jeudi** la semaine du 7 août, contre 50 la semaine précédente.

**Notre propre pipeline porte le signal.** Métrique PortWatch servie par l'API de lecture, période
`2026-08`, relevée sur nos pages publiques :

| Chokepoint | Transits/jour (2026-08) |
| --- | --- |
| **Ormuz** | **2,5** |
| Suez | 36,5 |
| Malacca | 230,5 |
| Taïwan | 248 |

Deux ordres de grandeur d'écart, même métrique, même mois. Le signal est sans ambiguïté.

**Le défaut.** La page publique `/atlas/chokepoints/…strait_of_hormuz/` affiche en tête les flux EIA
**2024** (14,6 Mb/j de brut, etc.) et relègue « 2,5 vessels_per_day · 2026-08 » parmi les « métriques
de référence », sans un mot indiquant qu'il s'agit d'un effondrement. Les risques y sont listés
« Elevated · Assessed », c'est-à-dire la mention générique.

Un lecteur arrivant aujourd'hui sur notre page Ormuz y lit des volumes de 2024 présentés comme le
fait principal, et repart sans savoir que le détroit est quasi fermé depuis cinq mois.

**Pourquoi ce n'est pas un simple oubli.** Ces pages sont **délibérément non éditoriales** : l'Atlas
sert la base de données telle quelle (ADR 0013 ; « les strates larges restent une base, pas des
centaines de pages éditoriales »). La page est donc honnête sur ce qu'elle est. Mais un chiffre
d'effondrement servi sans contexte est, pour un site qui vend l'analyse de vulnérabilité des
corridors, **pire qu'une absence** : il donne l'apparence de la couverture sans l'information.

**Ce qui n'est pas établi ici.** L'ampleur exacte du report, l'effet sur les prix, la durée attendue,
et l'articulation avec la campagne houthie en mer Rouge (mêmes semaines, acteurs liés) — rien de tout
cela n'est mesuré dans ce document. Ne rien en conclure sans mesure.

**À décider (humain).** Trois options non exclusives : (a) un encart de contexte automatique sur les
chokepoints dont une métrique récente s'écarte fortement de sa base ; (b) une fiche Atlas éditoriale
Ormuz, qui ferait de la crise un objet traité et non subi ; (c) ne rien changer et assumer que
l'Atlas-base ne commente pas. Le choix engage la doctrine, pas seulement la page.
