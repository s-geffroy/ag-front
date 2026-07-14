# Template canonique — Perplexity « recherche approfondie » pour le sourcing des chokepoints

> **Provenance.** Ce template nous vient d'ag-back (`chokepoints`, `srv1305127`), reçu par le canal
> d'échange le 2026-07-12 (message `0007`, ADR 0067). Il est intégré ici quasi verbatim comme **compagnon
> opérationnel de la chaîne de sourcing ADR 0064** (`pplx` en amont d'`agent-browser`) : ADR 0064 fixe
> _quel outil pour quelle étape_ ; ce fichier fournit _le prompt à copier_. Toute amélioration se renvoie
> à ag-back par le canal (répondre au message `0007`), pour être relue des deux côtés.

> **Statut : outil, pas une source.** Ce que Perplexity renvoie est **médié par un modèle** : c'est du
> **triage**, jamais une citation. Toute citation destinée à une base ou à un registre de preuve sera
> ré-ouverte sur le document réel et **vérifiée mot à mot** avant tout enregistrement. Tout chiffre qui en
> sort est un **candidat en attente de validation humaine**, jamais un fait.

Ce fichier est le **prompt canonique unique** dont dérivent toutes les campagnes de sourcing (découverte,
2ᵉ source de plancher, renforcement). Il remplace la recopie manuelle du squelette d'une campagne à l'autre.
On l'utilise ainsi : **remplir le bloc `<<PERSONNALISATION>>`** (mission + périmètre + liste d'objets), puis
**copier le bloc délimité** ci-dessous dans Perplexity en mode recherche approfondie.

Côté ag-back, trois campagnes historiques (`prompt-sources-39-p2p3.md`, `prompt-sources-15-remaining.md`,
`prompt-sources-reinforcement.md`, dans _son_ dépôt) sont des **instances** de ce template et servent
d'exemples de remplissage. Elles ne sont pas versionnées dans ce dépôt (`app-geo`) — ce fichier est notre
skeleton canonique ; nos propres campagnes de sourcing viendront le remplir.

---

## Le pipeline (rappel — auto-suffisant, aucun repo requis)

Perplexity sert à **découvrir et trier** des sources candidates ; il n'établit **jamais** la citation
définitive :

1. **`pplx search` / recherche approfondie** — découvrir des sources candidates.
2. **`pplx fetch-url` / lecture rapide** — trier une candidate (résumé médié par modèle, jamais quotable).
3. **`agent-browser` / ouverture du document réel** — établir la **citation verbatim** qui, seule, entre
   dans la base.

## Barème de niveaux de source (S1 → S6)

**Exposés à Perplexity comme cibles acceptables : S1, S2, S3.** S4/S5/S6 servent en interne à
**rétrograder** une source trouvée (une source « presse » proposée en S1 est reclassée S5).

| Niveau | Nature | Exemples |
|---|---|---|
| **S1** | Institutionnel — IGO, agences publiques, banques centrales, régulateurs, ministères, cours internationales, programmes/datasets officiels | IEA, USGS, EIA, UNCTAD, Banque mondiale, BIS/CPMI, IAEA, Euratom Supply Agency, Commission européenne / JRC, US Space Force / GPS.gov, IANA/ICANN, ITU, ENTSO-E, MPA Singapore, Federal Reserve, IMO, BRO/Ministère de la Défense |
| **S2** | Opérateur ou autorité — exploitant de l'infrastructure ou son régulateur | rapport annuel d'entreprise, page « statistics » de l'opérateur, autorité aéroportuaire/portuaire, gestionnaire de réseau électrique, opérateur d'IXP |
| **S3** | Référence sectorielle — association de branche reconnue | World Nuclear Association, BIMCO, World Shipping Council, IG P&I Clubs, ACI World, PeeringDB |
| **S4** | Académique — article revu par les pairs, thèse | *(interne, downgrade)* |
| **S5** | Presse spécialisée / cabinet privé — Reuters, Bloomberg, FT, Lloyd's List, rapports de marché privés | *(interne, downgrade)* |
| **S6** | Inférence interne — déduction non sourcée | *(interne, jamais une source externe)* |

---

## Mode d'emploi — comment mener au mieux la recherche approfondie

*(Section portable, écrite pour tout opérateur — y compris une équipe qui n'a pas ce dépôt.)*

1. **Choisir le bon mode.** Lancer en **Deep Research / Pro** ; focus **Academic** quand la cible est
   institutionnelle ou normée. Le choix du mode pèse souvent plus que la formulation.
2. **Une mission par run.** Ne pas mélanger « découverte » et « renforcement » dans le même passage : le
   bloc `<<PERSONNALISATION>>` porte **une** mission à la fois.
3. **Donner une cible chiffrée par objet.** « ce que la source doit affirmer » + le **chiffre attendu**
   (part de marché, capacité, tonnage, débit, rang mondial). Un objet sans cible précise ramène du bruit.
4. **Amorcer le vocabulaire de la page visée.** La spécificité de la requête améliore directement la
   récupération : glisser les termes qui figurent réellement sur le document cible — *annual report*,
   *traffic statistics*, *throughput*, *TEU*, *tonnes handled*, *installed capacity*, *enrichment
   capacity* — pour viser la source primaire plutôt qu'un commentaire qui la cite.
5. **Scinder les gros lots.** Si un run sature, découper par groupe thématique (cf. les groupes A–D du
   fichier renforcement) plutôt que tout envoyer d'un coup.
6. **Itérer par relances courtes** plutôt que tout recharger : « laquelle de ces sources est la plus
   primaire ? », « trouve une source qui **nuance** le point 3 », « re-cible l'objet X : la citation ne
   porte pas de chiffre ».
7. **Ce que le retour EST et n'est PAS.** C'est du **triage**, un candidat. Avant tout usage : ré-ouvrir
   l'URL, vérifier que la **citation est mot à mot** sur la page, que l'**URL profonde résout** (pas de
   404), et **requalifier le niveau** (presse → S5, cabinet privé → S5).
8. **Boucle de retour.** Une amélioration du prompt ou une source de meilleure qualité se renvoie par le
   canal d'échange (répondre à ce message), pour être relue.

---

## Le prompt — à copier tel quel dans Perplexity (mode recherche approfondie)

Remplir d'abord le bloc `<<PERSONNALISATION>>`, puis copier de la première à la dernière ligne du bloc.

````
Tu es documentaliste pour une base de données stratégique sur les points de passage obligés
(chokepoints) du commerce, de l'énergie, de la finance et des chaînes d'approvisionnement critiques.

═══════════════════════════════════════════════════════════════════════
PERSONNALISATION — à remplir selon la recherche en cours
═══════════════════════════════════════════════════════════════════════
MISSION : <choisir UNE variante et supprimer les autres>
  • DÉCOUVERTE — trouver N source(s) de haute qualité pour chaque objet.
      Règle d'or : respecter le PLANCHER de sourcing ci-dessous. Si tu n'atteins pas le plancher,
      dis-le explicitement pour l'objet concerné.
  • 2ᵉ SOURCE (plancher) — chaque objet a déjà 1 source ; ajoute-en une SECONDE, INDÉPENDANTE.
      Règle d'or : indépendance réelle — pas la même organisation, pas une page qui recite la première.
  • RENFORCEMENT — chaque objet a déjà une source FAIBLE (S3 seule, proxy, exception, qualitatif sans
      chiffre, ou datée). Trouve une source STRICTEMENT MEILLEURE (S1 > S2 > S3) qui, au choix, REMPLACE
      le proxy/l'exception par une source visant DIRECTEMENT le fait, ou AJOUTE le chiffre manquant.
      Règle d'or : ne RÉTROGRADE jamais l'existant. Si tu ne trouves rien de mieux, écris-le explicitement
      (« PAS MIEUX QUE L'EXISTANT ») — ne recopie pas l'actuelle et ne comble pas avec une source inférieure.

DOMAINE / PÉRIMÈTRE : <ex. passerelles de fret aérien ; IXP ; matériaux critiques…>
ANCRAGE TEMPOREL : privilégie l'état le plus récent (2026) ; signale et écarte tout chiffre périmé.
PLANCHER DE SOURCE : <ex. P0 = 2 sources indépendantes de haut niveau ; P1–P3 = 1 source>

LISTE D'OBJETS — une entrée par objet. Gabarit (adapter les champs entre crochets à la mission) :
  <id_de_l_objet> → <nom>
    [RENFORCEMENT uniquement] Source actuelle à battre : <titre / éditeur> (<niveau S…>)
    CIBLE : <ce que la source doit affirmer VERBATIM> — chiffre attendu : <part / capacité / tonnage /
            débit / rang mondial>
    [option] Piste primaire : <URL ou organisme déjà pressenti>
    Agrégat/concept ? : <oui/non — si oui, sourcer la CONCENTRATION du secteur, pas un site unique>

<Exemple minimal de remplissage — mission RENFORCEMENT :
  p1_global_air_cargo_gateway_frankfurt_fra → Francfort (FRA)
    Source actuelle à battre : ACI World airport traffic (S3, aucun tonnage chiffré)
    CIBLE : le tonnage de fret manutentionné (tonnes/an) ET/OU le rang mondial — chiffre attendu : tonnes/an
    Piste primaire : rapport de trafic de l'autorité aéroportuaire (Fraport, S2)
    Agrégat/concept ? : non >
═══════════════════════════════════════════════════════════════════════

QUALITÉ DES SOURCES — c'est le cœur de la mission. Ordre de préférence S1 > S2 > S3.
  S1 — Institutionnel : IGO, agences publiques, banques centrales, régulateurs, ministères, cours de
       justice internationales, programmes et datasets officiels. Ex. : IEA, USGS, EIA, UNCTAD, Banque
       mondiale, BIS/CPMI, IAEA, Euratom Supply Agency, Commission européenne / JRC, US Space Force /
       GPS.gov, IANA/ICANN, ITU, ENTSO-E, MPA Singapore, Federal Reserve, IMO, BRO/Ministère de la Défense.
  S2 — Opérateur ou autorité : exploitant de l'infrastructure ou son régulateur (rapport annuel
       d'entreprise, page « statistics » de l'opérateur, autorité aéroportuaire/portuaire, gestionnaire de
       réseau électrique, opérateur d'IXP).
  S3 — Référence sectorielle : association de branche reconnue (World Nuclear Association, BIMCO, World
       Shipping Council, IG P&I Clubs, ACI World, PeeringDB). NB : un appui S3 seul est souvent
       insuffisant — préfère S1/S2, ou au minimum un S3 qui porte le CHIFFRE attendu.

SONT REFUSÉS, sans exception :
  - Wikipédia, wikis, agrégateurs, encyclopédies
  - presse généraliste et spécialisée (Reuters, Bloomberg, FT, Lloyd's List *articles*…)
  - blogs, LinkedIn, Medium, communiqués marketing, « rapports de marché » de cabinets privés
  - toute page qui ne fait que citer une autre source : remonte à la source primaire

RÈGLES ABSOLUES
1. N'INVENTE JAMAIS de métadonnée. Non vérifié sur la page = écris « à confirmer ». Une métadonnée
   plausible mais non vue est une faute plus grave qu'une case vide.
2. L'URL doit être un LIEN PROFOND vers le document précis (PDF, page de chapitre, tableau de
   statistiques), pas la page d'accueil. PDF → numéro de page. Vérifie que l'URL RÉSOUD (pas de 404).
3. La CITATION doit être VERBATIM, mot à mot, dans sa langue d'origine, entre guillemets, présente telle
   quelle sur la page. Elle sera re-vérifiée automatiquement : une reformulation fait échouer la source.
4. La citation doit soutenir le RÔLE DE CHOKEPOINT (part, capacité, dépendance, absence d'alternative,
   rang mondial, tonnage, débit), pas décrire l'objet.
5. RIEN de convenable trouvé ? Écris « AUCUNE SOURCE ACCEPTABLE » (ou, en mission RENFORCEMENT, « PAS MIEUX
   QUE L'EXISTANT ») + une phrase sur ce que tu as cherché. Dis-le franchement PLUTÔT QUE de substituer une
   source voisine, inférieure ou hors-sujet.
6. Objet AGRÉGAT/CONCEPT (aubes de turbine, cales sèches, racine DNS) : source la CONCENTRATION du secteur
   (3-4 acteurs mondiaux, part cumulée), pas une usine / un site unique.
7. Signale paywall / inscription. Indique la date de publication ou de dernière mise à jour ; à défaut de
   date récente, dis-le et cherche plus récent.
8. DIVULGATION DES PRESQUE-CONCORDANCES. Si un résultat est proche mais NON concordant — autre année,
   société MÈRE au lieu de l'entité visée, FILIALE, unité ou périmètre différents — énonce explicitement
   l'écart. Ne le fais jamais passer pour la bonne source.
9. STRESS-TEST. Quand elle existe, fournis au moins une source qui NUANCE ou CONTREDIT l'affirmation. Si
   les citations disponibles sont faibles, restreins-toi aux SOURCES PRIMAIRES et LISTE les limites.

FORMAT DE SORTIE — un bloc par objet, sans préambule ni conclusion :

### <id_de_l_objet>
- Nom : <nom>
- [RENFORCEMENT] Source actuelle à battre : <…> (niveau)
- Meilleure source trouvée
  - Niveau proposé : S1 | S2 | S3 — pourquoi en une ligne
  - Titre exact : <tel qu'affiché>
  - Éditeur / organisation : <…>
  - Année ou date de mise à jour : <…> (ou « à confirmer »)
  - URL profonde : <…>
  - Page / section : <…>
  - Accès : libre | inscription | paywall
  - Citation verbatim : « … »
  - Ce qu'elle étaye (et, en RENFORCEMENT, en quoi elle bat l'actuelle) : <une phrase>
- Presque-concordances écartées (le cas échéant) : <autre année / société mère / filiale / unité>
- (si rien) : « AUCUNE SOURCE ACCEPTABLE » / « PAS MIEUX QUE L'EXISTANT » — <ce que tu as cherché>

Termine par un tableau récapitulatif :
  - missions DÉCOUVERTE / 2ᵉ SOURCE : id | source trouvée ? (oui/non) | niveau obtenu | plancher atteint ?
  - mission RENFORCEMENT : id | meilleure source ? (oui/non) | niveau obtenu | bat l'actuelle ? (oui/non)
````

---

## Après le retour de Perplexity

Vérifier **chaque citation sur le document réel** (`agent-browser` / pypdf / Wayback), requalifier les
niveaux si besoin (presse → S5, cabinet privé → S5), puis — **seulement si la source tient** — enregistrer
en **écriture ciblée** (jamais un `load_seed` complet : le seed peut diverger de la base sur la géométrie),
et mettre à jour la bibliographie (`docs/references.bib`, `note` pointant vers l'objet citant). Rien n'est
rétrogradé : si Perplexity ne trouve pas mieux, l'appui actuel reste.
