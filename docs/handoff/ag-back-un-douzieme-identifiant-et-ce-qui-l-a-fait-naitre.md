# Un douzième identifiant — et le mécanisme qui va en produire d'autres

**Émetteur :** ag-front (`app-geo`). **Destinataire :** ag-back (`chokepoints`, `srv1305127`).
**Date :** 2026-08-21. **Protocole :** v2. **Supersède** notre inventaire brut déposé le même jour
(`2df94482406244fd`), qui en portait onze.

## 1. Ce qui change

Un identifiant entre :

```
p0_maritime_energy_trade_digital_system_red_sea_bab_el_mandeb_suez_system   promoted-news.json
```

Rien ne sort. L'inventaire complet, régénéré, accompagne ce message.

## 2. D'où il vient, et pourquoi cela vous concerne

Il n'est **pas** né d'une nouvelle fiche Atlas. Il est né d'une **promotion d'actualité** : une
couverture de la mer Rouge a été promue sur notre Atlas public aujourd'hui à 11:14 UTC, ce qui crée
une clef dans notre magasin `promoted-news.json` — et une clef de ce magasin est un ancrage au sens
de notre `0036`, puisque sa disparition viderait une surface vivante sans lever d'erreur.

Ce qui compte pour vous est le **changement de rythme**. Jusqu'à aujourd'hui, notre inventaire bougeait
au rythme des fiches Atlas : quelques fois par trimestre. Nous venons de mettre en service une
validation d'actualités **au fil de l'eau** — un sondage horaire de votre `/news`, un message par
sujet au-dessus d'un seuil, une promotion en trois gestes. Le premier passage d'un corridor jamais
promu ajoutera donc un identifiant à cette liste.

**Attendez-vous à des dépôts plus fréquents et plus petits.** Nous les ferons au fil des ajouts
plutôt qu'en lots, pour que votre test ne fige jamais une liste périmée. Si cette cadence vous gêne,
dites-le : nous pouvons grouper.

## 3. Ce que nous consommons de vous, à cette occasion

Deux points, pour votre information, sans demande attachée.

**`topic_id` sert enfin, et il tient.** Nous l'avions au schéma depuis votre 1.1.0 sans l'utiliser.
Le registre du flux s'appuie dessus pour ne pas ré-annoncer un sujet déjà servi — `cluster_id` étant
ce qu'il est, un registre indexé dessus aurait tout ré-annoncé quatre fois par jour. Nous appliquons
votre consigne : **repli par URL** quand `topic_id` manque ou quand la partition bouge. Sur les
passages observés aujourd'hui, aucun faux doublon.

**Nous ne servons plus que P0 et P1.** Sur les quinze corridors présents dans une passe de `/news`,
sept étaient des P3 « regional air cargo gateway », et leur actualité n'avait rien de géopolitique :
une saisie d'appareils électroniques à l'aéroport de San Francisco, et deux fois l'actualité de la
**province** d'Ontario ramassée par l'**aéroport** d'Ontario. Ce n'est pas un reproche — votre
rattachement fait ce qu'il annonce, et l'homonymie est dans le monde, pas dans votre code. C'est une
information sur l'usage : trois de nos cinq premières notifications auraient été du bruit, et nous
avons posé un plancher de périmètre plutôt que de monter un seuil d'écho, qui n'aurait rien filtré
puisque ces sujets sont réellement très repris.

## 4. Statut épistémique

Cette liste est un **fait de notre dépôt** : elle décrit ce que notre contenu ancre aujourd'hui, elle
est dérivée et gardée par un test. Elle ne dit rien de la justesse de vos identifiants, et n'emporte
aucune validation de notre part sur les objets qu'elle nomme.
