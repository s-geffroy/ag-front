# 0069 — Cockpit : publication 1-clic (flip frontmatter gardé + rebuild hôte)

- **Statut :** accepté (déclenchement rebuild = **watcher hôte automatique**, cf. décision tranchée)
- **Date :** 2026-07-15
- **Contexte connexe :** ADR 0010 (déploiement public Caddy), 0037 (Munich, garde build `check:munich`),
  0038/0039 (cockpit read-only sur le contenu), 0046 (traçabilité de validation), 0068 (LLM-juge +
  journal nominatif). Runbook : `docs/public-deploy.md`.

## Contexte

Dernière étape du pipeline éditorial, aujourd'hui **manuelle et hors cockpit** : pour mettre une fiche /
note / dossier en ligne, l'opérateur édite à la main le frontmatter du fichier markdown
(`published: true` pour atlas/dossiers, `draft: false` pour notes) dans `apps/public/src/content/…`, puis
reconstruit le site (`npm --workspace @ag/public run build`, qui lance `check:munich` en garde dure) et
relance Caddy (`up -d public`, qui sert `apps/public/dist`).

Avec l'ADR 0068, tous les gates se valident désormais nominativement _dans_ le cockpit. Il reste
l'incohérence : le franchissement final `candidat → public` — le plus lourd de conséquences — se fait
encore en éditant du markdown à la main, sans garde reliant les gates validés à la publication, et sans
trace nominative de la mise en ligne.

**Contrainte architecturale décisive.** Le service `cockpit` monte tout le dépôt en lecture-écriture
(`..:/workspace`) : il _peut_ écrire `apps/public/src/content/**`. L'invariant « cockpit read-only sur le
contenu » (ADR 0038/0039) est donc une **discipline codée** (`server/content.ts` volontairement read-only),
pas une limite de montage. En revanche, le **rebuild + `docker compose up -d public`** relève de `docker
compose` **côté hôte** : un conteneur applicatif ne doit pas (et ne peut pas sans socket Docker) le
déclencher. La publication se scinde donc nécessairement en deux temps : _flip du drapeau_ (cockpit) et
_mise en ligne_ (hôte).

## Décision proposée

Relâcher **étroitement** la discipline read-only : le cockpit peut écrire **le seul drapeau de
publication** du frontmatter, sous gardes, et journaliser l'acte. La mise en ligne reste un geste hôte.

- **Écriture chirurgicale du drapeau (cockpit).** Nouvel endpoint `POST /api/publish/:type/:slug`
  (body `{ decision: 'publish' | 'unpublish', validated_by, reserve? }`) qui modifie **uniquement** la
  ligne `published:`/`draft:` du frontmatter du fichier **public** (`apps/public/src/content/<type>/<slug>.md`),
  par édition ciblée de cette ligne — **jamais** un round-trip gray-matter qui reformaterait le fichier ou
  le corps. notes → `draft: false/true` (polarité inverse) ; atlas/dossiers → `published: true/false`. Le
  contenu (corps, autres champs) n'est jamais touché ; la version interne complète (`apps/cockpit/content`)
  non plus.
- **Garde de publication (serveur).** `publish` est **refusé** si le livrable lié n'a pas **tous** ses
  gates de validation à `true` (`sources_ok`, `contradiction_done`, `compliance_done`, `human_review_done`,
  et `cvi_justified` s'il s'applique) — donc adossé au journal nominatif ADR 0046/0068. Un document sans
  livrable lié, ou avec un gate manquant → `409 gates_incomplete` listant les gates manquants.
- **Acte nominatif journalisé.** La publication est elle-même un franchissement `candidat → fait` (mise en
  accès public). Elle s'inscrit dans `validation_journal.json` (append-only) avec un `target_kind` valant
  « publication », `before`/`after` (le drapeau), `validated_by`, `validated_at`, `reserve`. Dépublier se
  journalise pareillement.
- **Mise en ligne hôte, explicite.** Nouveau script hôte `scripts/redeploy-public.sh` (hors règle
  Docker-only comme `redeploy-cockpit.sh`) : build (`check:munich` **reste la garde dure** — un contenu non
  conforme casse le build et n'est pas servi) puis `up -d public`. Le cockpit **n'exécute jamais** ce
  script ; il signale seulement « N document(s) au drapeau modifié en attente de mise en ligne — lancer
  `scripts/redeploy-public.sh` » (l'opérateur peut le lancer via l'affordance `!` de la session).
- **Aperçu avant application (UI).** Le bouton « Publier » ouvre une confirmation montrant le diff du
  drapeau (avant → après) et l'état des gates ; un gate manquant désactive le bouton et pointe ce qui reste
  à valider.

## Garde-fous obligatoires

- **Défense en profondeur, pas de contournement de Munich.** La garde build `check:munich` (ADR 0037)
  reste l'arbitre final au rebuild ; la garde serveur (gates complets, dont `compliance_done` ⇒ 10 contrôles
  Munich `ok`, ADR 0068) empêche en amont de publier un brouillon. Publier ne _remplace_ jamais ces gardes.
- **Écriture minimale.** Seule la ligne du drapeau est modifiée ; anti-traversal sur le slug (réutiliser
  `resolveDocPath`), type allowlisté, cible asservie à `apps/public/src/content`. Aucune autre mutation du
  contenu canonique — la donnée reste éditée hors cockpit ; seul son **état de publication** devient pilotable.
- **Nominatif + append-only.** Pas de mise en ligne sans enregistrement `validated_by` (honor-system
  tailnet, ADR 0046) ; le journal ne se réécrit pas.
- **Frontière de conteneur préservée.** Le cockpit ne déclenche aucun `docker compose` ni build ; la mise
  en ligne reste un geste hôte traçable. Aucun socket Docker exposé au conteneur.
- **Réversible.** `unpublish` rétablit le drapeau (off-public au prochain build) et se journalise.

## Conséquences

- Le pipeline se ferme **dans** le cockpit : valider les gates (ADR 0068) puis « Publier » (drapeau +
  journal), l'opérateur finissant par un `scripts/redeploy-public.sh`. Plus d'édition manuelle de
  frontmatter, plus d'oubli du build — tout en gardant la revue Munich au build comme filet.
- Nouvelle surface d'écriture cockpit sur `apps/public/src/content` (une ligne de frontmatter), assumée et
  bornée ; `content.ts` reste read-only, l'écriture passe par un module dédié `server/publish.ts` (logique
  pure d'édition du drapeau, testable comme `validate.ts`).
- `target_kind` du journal étendu à `'publication'` (schéma `validation.ts`, ADR 0046).
- Réversible et étroit : si l'écriture cockpit-sur-contenu se révèle indésirable, l'endpoint se retire sans
  toucher au reste (le flux manuel `docs/public-deploy.md` reste valable).

## Décision tranchée — déclenchement du rebuild : watcher hôte automatique (option 2)

La mise en ligne reste un geste **hôte** (le conteneur ne déclenche pas `docker compose`), mais elle est
**automatisée** pour une vraie expérience 1-clic de bout en bout :

- **Sentinelle d'intention.** À chaque publish/unpublish réussi, le cockpit met à jour une sentinelle
  git-ignorée `apps/public/.publish-pending` (horodatage + compteur) — le seul « signal » qui traverse la
  frontière conteneur→hôte, via le montage partagé.
- **Script hôte** `scripts/redeploy-public.sh` (hors règle Docker-only, comme `redeploy-cockpit.sh`) :
  mode `--if-pending` = ne rebuild (build `check:munich` **garde dure** → `up -d public`) **que** si la
  sentinelle est plus récente que le dernier build, puis marque `apps/public/.last-build`. Sans argument :
  rebuild inconditionnel (usage manuel de secours).
- **Watcher** : une entrée cron hôte (utilisateur `deploy`, `flock`) lance `redeploy-public.sh --if-pending`
  toutes les ~2 min — même patron que les crons `consumer`/`redteam`. Un contenu non conforme casse le
  build (Munich) sans mettre le brouillon en ligne ; l'échec est visible dans le log du cron.

L'option 1 (commande manuelle) reste disponible gratuitement : c'est `redeploy-public.sh` sans argument.
Le watcher n'ajoute qu'une ligne de cron par-dessus.
