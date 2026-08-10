# presentations/

Client-facing decks, generated and **versioned**. A plaquette sent to a prospect is a dated
deliverable, which is why it lives here and not in `dist/`. Architecture and rationale:
[ADR 0073](../docs/decisions/0073-generateur-de-plaquettes.md).

```
presentations/
  fonts/                       OFL fonts to ship WITH the .pptx (see "Fonts" below)
  commercial/
    manifest.json              date, languages, slide count, publication flag
    fr/commercial.fr.pptx|pdf
    en/commercial.en.pptx|pdf
    preview/                   QA renders — git-ignored, regenerated on every build
```

## Regenerating

```bash
scripts/build-deck.sh                                # commercial, fr+en, today
scripts/build-deck.sh --lang fr --date 2026-08-10
scripts/build-deck.sh --pptx-only                    # fast loop; leaves the PDFs STALE
scripts/build-deck.sh --substitution-qa              # also render as a client without our fonts
```

The content is **not** written here. It is assembled by `packages/deck` from
`apps/public/src/lib/site.ts` (positioning, doctrine chain, offers, **prices**) plus the FR/EN copy in
`packages/deck/src/copy.{fr,en}.ts`. Editing a price means editing `site.ts`; there is no second copy
to keep in sync, by design.

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

`manifest.json#published` is the gate. While it is `false`, `apps/public/integrations/plaquette.mjs`
pulls `/plaquette` out of the served build entirely and parks it in `apps/public/.plaquette-preview/`,
so the cockpit can review the exact bytes that would ship.

Flipping it is a **cockpit act**, nominative and journalled (ADR 0046/0069):
`https://srv1100990.tail880531.ts.net/commercial/plaquette`. Rebuilding a deck never changes the flag
in either direction. Going live still needs the host rebuild — the watcher runs
`scripts/redeploy-public.sh` within ~2 min.
