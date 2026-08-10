# presentations/

Client-facing decks, generated and **versioned**. A plaquette sent to a prospect is a dated
deliverable, which is why it lives here and not in `dist/`. Architecture and rationale:
[ADR 0073](../docs/decisions/0073-generateur-de-plaquettes.md).

Two families today, each published independently:

| Famille      | Slides | Pour qui                                                                    |
| ------------ | ------ | --------------------------------------------------------------------------- |
| `commercial` | 16     | Prospection à froid. Le problème, la doctrine, le socle en chiffres, les offres. |
| `methode`    | 29     | Prospect engagé. Le backend, le CVI, HDDE, VERDICT, et la méthode déroulée.  |

```
presentations/
  fonts/                       OFL fonts to ship WITH the .pptx (see "Fonts" below)
  <family>/
    manifest.json              date, languages, slide count, publication flag
    fr/<family>.fr.pptx|pdf
    en/<family>.en.pptx|pdf
    preview/                   QA renders — git-ignored, regenerated on every build
```

## Regenerating

```bash
scripts/build-deck.sh                                # ALL families, fr+en, today
scripts/build-deck.sh --deck methode --lang fr
scripts/build-deck.sh --date 2026-08-10              # reproducible: same date, same bytes
scripts/build-deck.sh --pptx-only                    # fast loop; leaves the PDFs STALE
scripts/build-deck.sh --substitution-qa              # also render as a client without our fonts
```

The content is **not** written here. It is assembled by `packages/deck` from what already exists:

- `apps/public/src/lib/site.ts` — positioning, doctrine chain, offers and **prices**;
- `@ag/cvi` and `@ag/verdict` — the CVI dimensions, the seven V·E·R·D·I·C·T moves and their weights;
- `packages/deck/src/backend-facts.ts` — the chokepoints backend figures, each with how it was counted;
- `copy.{fr,en}.ts` and `methode-copy.{fr,en}.ts` — only what has no FR/EN twin elsewhere.

Editing a price means editing `site.ts`. There is no second copy to keep in sync, by design.

⚠️ The corollary: **a price change on `/offres` requires regenerating `commercial`**, or the site and
the document disagree. Nothing reminds you.

Pass `--date` explicitly when you want a reproducible rebuild: it stamps both the deck metadata and
the PDF timestamps, so the same date yields byte-identical files and no spurious diff.

## Which file to send

- **PDF — the reference.** Fonts embedded, identical everywhere. Send this one.
- **PPTX — the editable one.** On a machine without Inter/Fraunces, the substitution shifts glyph
  widths and the composition moves slightly. Ship `fonts/` alongside it when that matters.

## Fonts

`fonts/` holds static cuts of Inter, Fraunces and IBM Plex Mono, all SIL Open Font License (the OFL
text of each is included). They are **not** the `@fontsource*` packages in `node_modules`, which ship
woff2 only — unusable by both LibreOffice and PowerPoint. `docker/slides.Dockerfile` instantiates them
from the Google Fonts variable originals with `fonttools`, because LibreOffice renders a variable font
at its default instance and fakes every other weight.

Newsreader is deliberately absent: on the site it is the long-form reading face, and a slide is not
long-form.

## Publication

Each family's `manifest.json#published` is its own gate. The public page lists the published families;
when **none** is published, `apps/public/integrations/plaquette.mjs` pulls `/plaquette` out of the
served build entirely and parks it in `apps/public/.plaquette-preview/`, so the cockpit can review the
exact bytes that would ship.

Flipping a flag is a **cockpit act**, per family, nominative and journalled (ADR 0046/0069):
`https://srv1100990.tail880531.ts.net/commercial/plaquette`. Rebuilding a deck never changes the flag
in either direction. Going live still needs the host rebuild — the watcher runs
`scripts/redeploy-public.sh` within ~2 min.

## The one thing the tests cannot check

The `methode` deck walks the method through Malacca, whose Atlas fiche is still `published: false`. It
uses only that fiche's public institutional figures and publishes no CVI score, and two tests enforce
that: every walkthrough slide carries the "not a published diagnosis" caveat, and none names a CVI
band. What no test catches is a sentence that is merely too assertive. Read the walkthrough before
publishing.
