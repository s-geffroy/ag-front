# Cockpit — Revue éditoriale par signalements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter au cockpit un outil de revue où le relecteur **signale** des points à corriger (sélection de mots ou case par bloc, avec catégorie + note), persistés en JSON sidecar, que l'agent traite ensuite (style/structure appliqués, factuel/source proposés puis validés).

**Architecture:** Une nouvelle collection `annotations` (allowlist `store.ts`, JSON sidecar par `doc_id`), des routes REST calquées sur la feature *contradictions*, un découpage du markdown en **blocs** (id + hash) côté serveur, et un lecteur par bloc avec cases + popover catégorie/note + panneau latéral d'acceptation. Le serveur n'écrit jamais les `.md` ; l'agent applique les corrections hors process.

**Tech Stack:** TypeScript, Express, zod, `marked` (lexer), `sanitize-html`, React + Vite, Tailwind, vitest. Docker-only (service `tools`).

## Global Constraints

- **Docker-only.** Tout build/lint/test/script tourne dans le conteneur `tools` :
  `docker compose -f docker/docker-compose.yml run --rm tools <cmd>`. Jamais sur l'hôte.
- **Redéploiement cockpit** après changement : `scripts/redeploy-cockpit.sh` (front `--build-only`, serveur `--restart-only`, les deux sinon). Health-check `http://127.0.0.1:8787/api/health`.
- **Ne jamais lancer `prettier --write`** pour ranger — formater ses lignes à la main (dette prettier connue).
- **Commits conventionnels** ; chaque message se termine par le pied
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **Le serveur n'écrit aucun `.md`.** Les signalements vivent uniquement dans `apps/cockpit/data/annotations.json`.
- **Pas d'auth** (ADR 0005, loopback/Tailscale) → `created_by`/`validated_by` = nom d'opérateur libre.
- Copie UI **en français**.
- Spec de référence : `docs/superpowers/specs/2026-07-12-cockpit-revue-signalements-corrections-design.md`.

---

## File Structure

**Créés**

- `packages/schema/src/cockpit/annotation.ts` — schéma zod `Annotation` + `Annotations`.
- `packages/schema/src/cockpit/annotation.test.ts` — tests du schéma.
- `apps/cockpit/data/annotations.json` — collection persistée (démarre `[]`).
- `apps/cockpit/server/annotations.ts` — réducteurs purs (add/patch/remove/byDoc).
- `apps/cockpit/server/annotations.test.ts` — tests des réducteurs.
- `apps/cockpit/server/blocks.ts` — `splitBlocks` + `hashBlock`.
- `apps/cockpit/server/blocks.test.ts` — tests du découpage.
- `apps/cockpit/server/anchor.ts` — `relocateBlock` (re-localisation d'ancre).
- `apps/cockpit/server/anchor.test.ts` — tests de re-localisation.
- `apps/cockpit/src/components/review/BlockReader.tsx` — rendu par bloc + cases + sélection.
- `apps/cockpit/src/components/review/FlagPopover.tsx` — popover catégorie + note.
- `apps/cockpit/src/components/review/AnnotationPanel.tsx` — liste + accepter/refuser un `proposed`.
- `apps/cockpit/src/lib/annotation.ts` — types/labels client.

**Modifiés**

- `packages/schema/src/cockpit/index.ts` — export du nouveau schéma.
- `apps/cockpit/server/store.ts` — enregistre `annotations` dans `collectionSchemas`.
- `apps/cockpit/server/content.ts` — `RenderedContent.blocks` via `splitBlocks`.
- `apps/cockpit/server/api.ts` — routes `GET/POST/PUT/DELETE /annotations`.
- `apps/cockpit/src/lib/api.ts` — méthodes client + `RenderedContent.blocks`.
- `apps/cockpit/src/pages/ContentReaderPage.tsx` — utilise `BlockReader` + `AnnotationPanel`.

**Note testing (posture du dépôt).** Le cockpit ne teste pas ses routes HTTP (aucun harnais supertest) ; il teste des **fonctions pures** en vitest. On suit cette posture : tests unitaires exhaustifs des modules purs (schéma, réducteurs, blocs, ancre), puis **vérification e2e réelle via `agent-browser`** (Task 9). Les routes sont de la glu fine au-dessus de réducteurs testés.

---

### Task 1: Schéma `Annotation`

**Files:**

- Create: `packages/schema/src/cockpit/annotation.ts`
- Test: `packages/schema/src/cockpit/annotation.test.ts`
- Modify: `packages/schema/src/cockpit/index.ts`

**Interfaces:**

- Consumes: `ContentTypeId` de `./contradiction`.
- Produces: `Annotation`, `Annotations`, `AnnotationCategory`, `AnnotationStatus`, `AnnotationAnchor` (types + schémas zod).

- [ ] **Step 1: Write the failing test**

```ts
// packages/schema/src/cockpit/annotation.test.ts
import { describe, it, expect } from 'vitest';
import { Annotation } from './annotation';

const base = {
  id: 'an_deadbeef0001',
  doc_id: 'atlas/mer-rouge-suez',
  content_type: 'atlas',
  slug: 'mer-rouge-suez',
  anchor: { kind: 'block', block_id: 'b3', block_hash: 'abc123abc123' },
  category: 'factuel',
  created_at: '2026-07-12T10:00:00.000Z',
};

describe('Annotation', () => {
  it('parses a minimal open flag and defaults status/note/created_by', () => {
    const a = Annotation.parse(base);
    expect(a.status).toBe('open');
    expect(a.note).toBe('');
    expect(a.created_by).toBe('');
  });

  it('rejects an unknown category', () => {
    expect(() => Annotation.parse({ ...base, category: 'typo' })).toThrow();
  });

  it('accepts a proposed patch and a validation record', () => {
    const a = Annotation.parse({
      ...base,
      status: 'proposed',
      proposed_patch: { before: 'x', after: 'y', rationale: 'r', at: base.created_at },
      validation: { validated_by: 'sg', validated_at: base.created_at },
    });
    expect(a.proposed_patch?.after).toBe('y');
    expect(a.validation?.validated_by).toBe('sg');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace @ag/schema run test -- annotation`
Expected: FAIL — cannot find module `./annotation`.

- [ ] **Step 3: Write the schema**

```ts
// packages/schema/src/cockpit/annotation.ts
import { z } from 'zod';
import { ContentTypeId } from './contradiction';

/** How the reviewer classified the correction — drives the processing policy (spec §4.5). */
export const AnnotationCategory = z.enum(['factuel', 'style', 'source', 'structure']);
export type AnnotationCategory = z.infer<typeof AnnotationCategory>;

/** Lifecycle (spec §5). Benign → applied→done ; factual/source → proposed→accepted→applied→done. */
export const AnnotationStatus = z.enum([
  'open',
  'proposed',
  'accepted',
  'rejected',
  'applied',
  'done',
  'obsolete',
]);
export type AnnotationStatus = z.infer<typeof AnnotationStatus>;

/** Robust anchor: block id + hash (drift detection) + quote/context for fuzzy re-location. */
export const AnnotationAnchor = z.object({
  kind: z.enum(['block', 'span']),
  block_id: z.string(),
  block_hash: z.string(),
  quote: z.string().max(2000).optional(),
  prefix: z.string().max(200).optional(),
  suffix: z.string().max(200).optional(),
  char_offset: z.number().int().nonnegative().optional(),
});
export type AnnotationAnchor = z.infer<typeof AnnotationAnchor>;

/** The agent's proposed change for a factual/source flag, shown as a diff for human acceptance. */
export const ProposedPatch = z.object({
  before: z.string(),
  after: z.string(),
  rationale: z.string(),
  at: z.string(), // ISO 8601
});
export type ProposedPatch = z.infer<typeof ProposedPatch>;

export const Annotation = z.object({
  id: z.string(),
  doc_id: z.string(), // `${content_type}/${slug}`
  content_type: ContentTypeId,
  slug: z.string(),
  anchor: AnnotationAnchor,
  category: AnnotationCategory,
  note: z.string().max(2000).default(''),
  status: AnnotationStatus.default('open'),
  created_at: z.string(), // ISO 8601
  created_by: z.string().max(120).default(''), // operator name (no auth, ADR 0005)
  proposed_patch: ProposedPatch.optional(),
  resolution: z
    .object({ by: z.literal('agent'), at: z.string(), action: z.string() })
    .optional(),
  validation: z
    .object({ validated_by: z.string(), validated_at: z.string() })
    .optional(), // ADR 0046 candidate→fact
});
export type Annotation = z.infer<typeof Annotation>;

export const Annotations = z.array(Annotation);
export type Annotations = z.infer<typeof Annotations>;
```

- [ ] **Step 4: Export it**

```ts
// packages/schema/src/cockpit/index.ts — add after the contradiction export
export * from './annotation';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace @ag/schema run test -- annotation`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add packages/schema/src/cockpit/annotation.ts packages/schema/src/cockpit/annotation.test.ts packages/schema/src/cockpit/index.ts
git commit  # feat(schema): Annotation — signalement de correction éditoriale (+ footer Co-Authored-By)
```

---

### Task 2: Réducteurs d'annotations (purs) + collection

**Files:**

- Create: `apps/cockpit/server/annotations.ts`, `apps/cockpit/server/annotations.test.ts`
- Create: `apps/cockpit/data/annotations.json` (contenu : `[]`)
- Modify: `apps/cockpit/server/store.ts`

**Interfaces:**

- Consumes: `Annotation`, `Annotations` de `@ag/schema/cockpit`.
- Produces: `annotationId(seed)`, `addAnnotation(list, a)`, `patchAnnotation(list, id, patch)`, `removeAnnotation(list, id)`, `annotationsByDoc(list, docId)`.

- [ ] **Step 1: Write the failing test**

```ts
// apps/cockpit/server/annotations.test.ts
import { describe, it, expect } from 'vitest';
import {
  annotationId,
  addAnnotation,
  patchAnnotation,
  removeAnnotation,
  annotationsByDoc,
} from './annotations';
import type { Annotation } from '@ag/schema/cockpit';

const mk = (id: string, doc = 'atlas/mer-rouge-suez'): Annotation => ({
  id,
  doc_id: doc,
  content_type: 'atlas',
  slug: 'mer-rouge-suez',
  anchor: { kind: 'block', block_id: 'b1', block_hash: 'h1' },
  category: 'style',
  note: '',
  status: 'open',
  created_at: '2026-07-12T10:00:00.000Z',
  created_by: '',
});

describe('annotation reducers', () => {
  it('derives a stable, prefixed id from a seed', () => {
    expect(annotationId('seed')).toMatch(/^an_[0-9a-f]{12}$/);
    expect(annotationId('seed')).toBe(annotationId('seed'));
  });

  it('adds, patches by id, filters by doc, and removes', () => {
    let list = addAnnotation([], mk('an_1'));
    list = addAnnotation(list, mk('an_2', 'notes/x'));
    expect(annotationsByDoc(list, 'atlas/mer-rouge-suez')).toHaveLength(1);

    const patched = patchAnnotation(list, 'an_1', { status: 'done', note: 'fait' });
    expect(patched.updated?.status).toBe('done');
    expect(patched.updated?.note).toBe('fait');
    expect(patched.list.find((a) => a.id === 'an_1')?.status).toBe('done');

    const missing = patchAnnotation(list, 'nope', { status: 'done' });
    expect(missing.updated).toBeUndefined();

    const removed = removeAnnotation(patched.list, 'an_1');
    expect(removed.removed).toBe(true);
    expect(removed.list).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace apps/cockpit run test -- server/annotations`
Expected: FAIL — cannot find `./annotations`.

- [ ] **Step 3: Write the reducers**

```ts
// apps/cockpit/server/annotations.ts
import { createHash } from 'node:crypto';
import type { Annotation } from '@ag/schema/cockpit';

/** Content-addressed id so re-posting the same anchor+time is idempotent-ish and debuggable. */
export function annotationId(seed: string): string {
  return 'an_' + createHash('sha256').update(seed).digest('hex').slice(0, 12);
}

export function addAnnotation(list: Annotation[], a: Annotation): Annotation[] {
  return [...list, a];
}

/** Patch a subset of fields on the annotation with `id`. Returns the new list + the updated item. */
export function patchAnnotation(
  list: Annotation[],
  id: string,
  patch: Partial<Annotation>,
): { list: Annotation[]; updated?: Annotation } {
  let updated: Annotation | undefined;
  const next = list.map((a) => {
    if (a.id !== id) return a;
    updated = { ...a, ...patch, id: a.id, doc_id: a.doc_id }; // id/doc_id are immutable
    return updated;
  });
  return { list: next, updated };
}

export function removeAnnotation(
  list: Annotation[],
  id: string,
): { list: Annotation[]; removed: boolean } {
  const next = list.filter((a) => a.id !== id);
  return { list: next, removed: next.length !== list.length };
}

export function annotationsByDoc(list: Annotation[], docId: string): Annotation[] {
  return list.filter((a) => a.doc_id === docId);
}
```

- [ ] **Step 4: Register the collection + seed file**

```ts
// apps/cockpit/server/store.ts — import
import {
  Annotations,
  Config,
  Contact,
  Contradictions,
  Deliverable,
  Milestone,
  QualityGates,
  Scorecard,
} from '@ag/schema/cockpit';

// apps/cockpit/server/store.ts — collectionSchemas, add the line:
//   contradictions: Contradictions,
//   annotations: Annotations,
```

Create `apps/cockpit/data/annotations.json` with exactly:

```json
[]
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace apps/cockpit run test -- server/annotations`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add apps/cockpit/server/annotations.ts apps/cockpit/server/annotations.test.ts apps/cockpit/server/store.ts apps/cockpit/data/annotations.json
git commit  # feat(cockpit): collection annotations + réducteurs purs
```

---

### Task 3: Découpage en blocs (`splitBlocks`)

**Files:**

- Create: `apps/cockpit/server/blocks.ts`, `apps/cockpit/server/blocks.test.ts`
- Modify: `apps/cockpit/server/content.ts`, `apps/cockpit/src/lib/api.ts`

**Interfaces:**

- Consumes: `marked` (lexer), `renderMarkdown` de `./markdown`.
- Produces: `DocBlock = { block_id: string; block_hash: string; kind: string; html: string }`, `splitBlocks(md): Promise<DocBlock[]>`, `hashBlock(raw): string`. `RenderedContent` gagne `blocks: DocBlock[]`.

- [ ] **Step 1: Write the failing test**

```ts
// apps/cockpit/server/blocks.test.ts
import { describe, it, expect } from 'vitest';
import { splitBlocks, hashBlock } from './blocks';

const MD = `# Titre

Un paragraphe.

| Indicateur | Seuil |
| --- | --- |
| A | > 30 % |

- item un
- item deux`;

describe('splitBlocks', () => {
  it('splits into ordered blocks with sequential ids and a kind per block', async () => {
    const blocks = await splitBlocks(MD);
    expect(blocks.map((b) => b.block_id)).toEqual(['b0', 'b1', 'b2', 'b3']);
    expect(blocks.map((b) => b.kind)).toEqual(['heading', 'paragraph', 'table', 'list']);
    expect(blocks[0].html).toContain('Titre');
    expect(blocks[2].html).toContain('<table');
  });

  it('skips blank "space" tokens (no empty blocks)', async () => {
    const blocks = await splitBlocks('a\n\n\n\nb');
    expect(blocks).toHaveLength(2);
  });
});

describe('hashBlock', () => {
  it('is stable across whitespace/indentation reflow', () => {
    expect(hashBlock('Un   paragraphe.\n')).toBe(hashBlock('Un paragraphe.'));
  });
  it('changes when the text changes', () => {
    expect(hashBlock('Un paragraphe.')).not.toBe(hashBlock('Un paragraphe modifié.'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace apps/cockpit run test -- server/blocks`
Expected: FAIL — cannot find `./blocks`.

- [ ] **Step 3: Write `splitBlocks`**

```ts
// apps/cockpit/server/blocks.ts
import { createHash } from 'node:crypto';
import { marked } from 'marked';
import { renderMarkdown } from './markdown';

export interface DocBlock {
  block_id: string; // sequential, e.g. "b3" (index among non-space top-level tokens)
  block_hash: string; // short hash of the block's normalized source — detects drift
  kind: string; // marked token type: heading | paragraph | table | list | blockquote | code | ...
  html: string; // sanitized HTML for this block only
}

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

/** Short, stable hash of a block's source text (whitespace-insensitive). */
export function hashBlock(raw: string): string {
  return createHash('sha256').update(normalize(raw)).digest('hex').slice(0, 12);
}

/** Split repo-authored markdown into ordered, individually-rendered blocks. Blank "space" tokens are
 *  dropped so block ids stay dense and stable. Each block's HTML is sanitized (renderMarkdown). */
export async function splitBlocks(md: string): Promise<DocBlock[]> {
  const tokens = marked.lexer(md);
  const out: DocBlock[] = [];
  let i = 0;
  for (const t of tokens) {
    if (t.type === 'space') continue;
    const raw = (t as { raw?: string }).raw ?? '';
    out.push({ block_id: `b${i}`, block_hash: hashBlock(raw), kind: t.type, html: await renderMarkdown(raw) });
    i++;
  }
  return out;
}
```

- [ ] **Step 4: Expose blocks on `RenderedContent`**

```ts
// apps/cockpit/server/content.ts — import
import { splitBlocks, type DocBlock } from './blocks';

// RenderedContent interface — add:
//   /** The body split into individually-addressable blocks for review anchoring. */
//   blocks: DocBlock[];

// readContent(): after `const html = await renderMarkdown(content);`
//   const blocks = await splitBlocks(content);
//   return { type, slug, data: data as Record<string, unknown>, html, blocks, full };
```

Mirror the client type in `apps/cockpit/src/lib/api.ts`:

```ts
// apps/cockpit/src/lib/api.ts — add above RenderedContent
export interface DocBlock {
  block_id: string;
  block_hash: string;
  kind: string;
  html: string;
}
// RenderedContent interface — add `blocks: DocBlock[];`
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace apps/cockpit run test -- server/blocks`
Expected: PASS (4 tests).

- [ ] **Step 6: Typecheck**

Run: `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace apps/cockpit run typecheck`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/cockpit/server/blocks.ts apps/cockpit/server/blocks.test.ts apps/cockpit/server/content.ts apps/cockpit/src/lib/api.ts
git commit  # feat(cockpit): découpage du doc en blocs adressables (ancrage revue)
```

---

### Task 4: Re-localisation d'ancre (`relocateBlock`)

**Files:**

- Create: `apps/cockpit/server/anchor.ts`, `apps/cockpit/server/anchor.test.ts`

**Interfaces:**

- Consumes: `DocBlock` de `./blocks`.
- Produces: `relocateBlock(anchor, blocks): DocBlock | null` où `anchor = { block_id, block_hash, quote? }`. Retourne le bloc courant qui porte le signalement, ou `null` (→ `obsolete`).

- [ ] **Step 1: Write the failing test**

```ts
// apps/cockpit/server/anchor.test.ts
import { describe, it, expect } from 'vitest';
import { relocateBlock } from './anchor';
import type { DocBlock } from './blocks';

const blocks: DocBlock[] = [
  { block_id: 'b0', block_hash: 'h0', kind: 'heading', html: '<h2>Titre</h2>' },
  { block_id: 'b1', block_hash: 'h1new', kind: 'paragraph', html: '<p>Prime war-risk à 0,2 %.</p>' },
];

describe('relocateBlock', () => {
  it('matches by hash first (exact)', () => {
    expect(relocateBlock({ block_id: 'bX', block_hash: 'h0' }, blocks)?.block_id).toBe('b0');
  });
  it('falls back to a quote match when the hash drifted', () => {
    const hit = relocateBlock({ block_id: 'bX', block_hash: 'stale', quote: 'war-risk à 0,2' }, blocks);
    expect(hit?.block_id).toBe('b1');
  });
  it('falls back to block_id when nothing else matches', () => {
    expect(relocateBlock({ block_id: 'b0', block_hash: 'stale' }, blocks)?.block_id).toBe('b0');
  });
  it('returns null when the passage is gone (→ obsolete)', () => {
    expect(relocateBlock({ block_id: 'bZ', block_hash: 'stale', quote: 'disparu' }, blocks)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace apps/cockpit run test -- server/anchor`
Expected: FAIL — cannot find `./anchor`.

- [ ] **Step 3: Write `relocateBlock`**

```ts
// apps/cockpit/server/anchor.ts
import type { DocBlock } from './blocks';

export interface AnchorLike {
  block_id: string;
  block_hash: string;
  quote?: string;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Re-locate the block an annotation points at, robust to a doc that has since changed:
 *  (1) exact by block_hash, (2) fuzzy by quote against block text, (3) fallback by block_id,
 *  (4) null → the passage is gone (caller marks the annotation `obsolete`). */
export function relocateBlock(anchor: AnchorLike, blocks: DocBlock[]): DocBlock | null {
  const byHash = blocks.find((b) => b.block_hash === anchor.block_hash);
  if (byHash) return byHash;
  if (anchor.quote && anchor.quote.trim()) {
    const q = anchor.quote.trim();
    const byQuote = blocks.find((b) => stripTags(b.html).includes(q));
    if (byQuote) return byQuote;
  }
  return blocks.find((b) => b.block_id === anchor.block_id) ?? null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace apps/cockpit run test -- server/anchor`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/cockpit/server/anchor.ts apps/cockpit/server/anchor.test.ts
git commit  # feat(cockpit): re-localisation robuste d'une ancre de signalement
```

---

### Task 5: Routes serveur `/annotations`

**Files:**

- Modify: `apps/cockpit/server/api.ts`

**Interfaces:**

- Consumes: `Annotation`, `Annotations`, `AnnotationAnchor`, `AnnotationCategory`, `AnnotationStatus` (schéma) ; `readCollection`, `mutateCollection` (store) ; réducteurs de Task 2 ; `isContentType` (content).
- Produces (routes) : `GET /annotations/:type/:slug` → `Annotation[]` ; `POST /annotations/:type/:slug` (body `{ anchor, category, note?, created_by? }`) → `Annotation` (201) ; `PUT /annotations/:id` (body partiel `{ status?, note?, proposed_patch?, validation?, resolution? }`) → `Annotation` ; `DELETE /annotations/:id` → `{ removed: true }`.

- [ ] **Step 1: Add imports**

```ts
// apps/cockpit/server/api.ts — extend the @ag/schema/cockpit import
import { Annotation, AnnotationAnchor, AnnotationCategory, AnnotationStatus, ContradictionReport } from '@ag/schema/cockpit';
// extend the './store' import with readCollection
import { itemSchemas, mutateCollection, readCollection, readState, writeCollection, type ItemCollectionName } from './store';
// add
import { addAnnotation, annotationId, annotationsByDoc, patchAnnotation, removeAnnotation } from './annotations';
```

- [ ] **Step 2: Add the routes (place just after the contradiction PUT `/contradictions/:type/:slug/review` block, before "Source deposits")**

```ts
  // --- Signalements de correction (revue éditoriale) ---------------------------------------------
  // Le relecteur SIGNALE des points à corriger ; l'agent les traite ensuite (spec 2026-07-12).
  // Sidecar JSON par doc — le serveur n'écrit JAMAIS le .md. Pas d'auth (ADR 0005) : created_by libre.
  const AnnotationCreate = z.object({
    anchor: AnnotationAnchor,
    category: AnnotationCategory,
    note: z.string().max(2000).optional(),
    created_by: z.string().max(120).optional(),
  });
  const AnnotationPatch = z
    .object({
      status: AnnotationStatus,
      note: z.string().max(2000),
      proposed_patch: Annotation.shape.proposed_patch,
      resolution: Annotation.shape.resolution,
      validation: Annotation.shape.validation,
    })
    .partial();

  r.get('/annotations/:type/:slug', async (req: Request, res: Response, next: NextFunction) => {
    const { type, slug } = req.params;
    if (!isContentType(type)) {
      res.status(404).json({ error: 'unknown content type' });
      return;
    }
    try {
      const all = await readCollection('annotations');
      res.json(annotationsByDoc(all, `${type}/${slug}`));
    } catch (err) {
      next(err);
    }
  });

  r.post('/annotations/:type/:slug', async (req: Request, res: Response, next: NextFunction) => {
    const { type, slug } = req.params;
    if (!isContentType(type)) {
      res.status(404).json({ error: 'unknown content type' });
      return;
    }
    const body = AnnotationCreate.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: 'validation', issues: body.error.issues });
      return;
    }
    const now = new Date().toISOString();
    const docId = `${type}/${slug}`;
    const annotation = Annotation.parse({
      id: annotationId(docId + JSON.stringify(body.data.anchor) + now),
      doc_id: docId,
      content_type: type,
      slug,
      anchor: body.data.anchor,
      category: body.data.category,
      note: body.data.note ?? '',
      status: 'open',
      created_at: now,
      created_by: body.data.created_by ?? '',
    });
    try {
      await mutateCollection('annotations', (list) =>
        addAnnotation(list as z.infer<typeof Annotation>[], annotation),
      );
      res.status(201).json(annotation);
    } catch (err) {
      respond(err, res, next);
    }
  });

  r.put('/annotations/:id', async (req: Request, res: Response, next: NextFunction) => {
    const patch = AnnotationPatch.safeParse(req.body);
    if (!patch.success) {
      res.status(400).json({ error: 'validation', issues: patch.error.issues });
      return;
    }
    try {
      let updated: z.infer<typeof Annotation> | undefined;
      await mutateCollection('annotations', (list) => {
        const out = patchAnnotation(list as z.infer<typeof Annotation>[], req.params.id, patch.data);
        updated = out.updated;
        return out.list;
      });
      if (!updated) {
        res.status(404).json({ error: 'not found' });
        return;
      }
      res.json(updated);
    } catch (err) {
      respond(err, res, next);
    }
  });

  r.delete('/annotations/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      let removed = false;
      await mutateCollection('annotations', (list) => {
        const out = removeAnnotation(list as z.infer<typeof Annotation>[], req.params.id);
        removed = out.removed;
        return out.list;
      });
      if (!removed) {
        res.status(404).json({ error: 'not found' });
        return;
      }
      res.json({ removed: true });
    } catch (err) {
      respond(err, res, next);
    }
  });
```

- [ ] **Step 3: Typecheck**

Run: `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace apps/cockpit run typecheck`
Expected: no errors.

- [ ] **Step 4: Smoke-test the routes live (server change → restart)**

```bash
scripts/redeploy-cockpit.sh --restart-only
```

```bash
# create → list → delete a throwaway flag, asserting each step
curl -s -X POST localhost:8787/api/annotations/atlas/mer-rouge-suez \
  -H 'content-type: application/json' \
  -d '{"anchor":{"kind":"block","block_id":"b1","block_hash":"deadbeef"},"category":"style","note":"test"}' | tee /tmp/an.json
ID=$(node -e "process.stdout.write(require('/tmp/an.json').id)")
curl -s localhost:8787/api/annotations/atlas/mer-rouge-suez        # must contain $ID
curl -s -X DELETE localhost:8787/api/annotations/$ID                # {"removed":true}
```
Expected: POST returns 201 JSON with an `id`; GET lists it; DELETE returns `{"removed":true}`. Confirm `apps/cockpit/data/annotations.json` is back to `[]`.

- [ ] **Step 5: Commit**

```bash
git add apps/cockpit/server/api.ts
git commit  # feat(cockpit): routes REST /annotations (signalements de correction)
```

---

### Task 6: Client — méthodes API + types

**Files:**

- Modify: `apps/cockpit/src/lib/api.ts`
- Create: `apps/cockpit/src/lib/annotation.ts`

**Interfaces:**

- Consumes: `Annotation` de `@ag/schema/cockpit`.
- Produces: `api.listAnnotations`, `api.createAnnotation`, `api.updateAnnotation`, `api.deleteAnnotation` ; `CATEGORY_LABELS`, `CATEGORY_ORDER`.

- [ ] **Step 1: Add the client methods**

```ts
// apps/cockpit/src/lib/api.ts — extend the type import
import type { Annotation, Contact, ContradictionReport, Deliverable, Milestone, Scorecard } from '@ag/schema/cockpit';

// inside the `api` object, after reviewContradiction:
  listAnnotations: (type: string, slug: string) =>
    fetch(`/api/annotations/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`).then(
      asJson<Annotation[]>,
    ),
  createAnnotation: (
    type: string,
    slug: string,
    body: Pick<Annotation, 'anchor' | 'category'> & { note?: string; created_by?: string },
  ) =>
    fetch(`/api/annotations/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).then(asJson<Annotation>),
  updateAnnotation: (id: string, patch: Partial<Annotation>) =>
    fetch(`/api/annotations/${encodeURIComponent(id)}`, put(patch)).then(asJson<Annotation>),
  deleteAnnotation: (id: string) =>
    fetch(`/api/annotations/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(
      asJson<{ removed: boolean }>,
    ),
```

- [ ] **Step 2: Add category labels**

```ts
// apps/cockpit/src/lib/annotation.ts
import type { AnnotationCategory } from '@ag/schema/cockpit';

export const CATEGORY_ORDER: AnnotationCategory[] = ['factuel', 'source', 'style', 'structure'];

export const CATEGORY_LABELS: Record<AnnotationCategory, string> = {
  factuel: 'Factuel',
  source: 'Source',
  style: 'Style',
  structure: 'Structure',
};

/** Benign categories the agent applies directly ; the others go through propose→validate. */
export const AUTO_APPLY: AnnotationCategory[] = ['style', 'structure'];
```

- [ ] **Step 3: Typecheck**

Run: `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace apps/cockpit run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/cockpit/src/lib/api.ts apps/cockpit/src/lib/annotation.ts
git commit  # feat(cockpit): client API annotations + libellés de catégorie
```

---

### Task 7: Lecteur par bloc (`BlockReader` + `FlagPopover`)

**Files:**

- Create: `apps/cockpit/src/components/review/BlockReader.tsx`, `apps/cockpit/src/components/review/FlagPopover.tsx`
- Modify: `apps/cockpit/src/pages/ContentReaderPage.tsx`

**Interfaces:**

- Consumes: `DocBlock`, `RenderedContent` (api) ; `api.createAnnotation` ; `CATEGORY_ORDER`, `CATEGORY_LABELS` ; `Card`, `Badge` (ui).
- Produces: `<BlockReader type slug blocks onFlagged />`, `<FlagPopover draft onSubmit onCancel />`. Emits a created `Annotation` to `onFlagged` so the panel (Task 8) refreshes.

- [ ] **Step 1: Write `FlagPopover`**

```tsx
// apps/cockpit/src/components/review/FlagPopover.tsx
import { useState } from 'react';
import type { AnnotationAnchor, AnnotationCategory } from '@ag/schema/cockpit';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/annotation';

export interface FlagDraft {
  anchor: AnnotationAnchor;
  preview: string; // short human preview of the target (row/selection/block text)
}

interface Props {
  draft: FlagDraft;
  onSubmit: (category: AnnotationCategory, note: string) => void;
  onCancel: () => void;
  busy?: boolean;
}

export function FlagPopover({ draft, onSubmit, onCancel, busy }: Props) {
  const [category, setCategory] = useState<AnnotationCategory>('factuel');
  const [note, setNote] = useState('');
  return (
    <div className="rounded-md border border-line bg-surface p-3 shadow-lg" role="dialog" aria-label="Signaler une correction">
      <p className="mb-2 line-clamp-2 text-xs text-muted">« {draft.preview} »</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {CATEGORY_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded px-2 py-0.5 text-xs ${category === c ? 'bg-accent text-white' : 'bg-subtle text-muted'}`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <textarea
        className="mb-2 w-full rounded border border-line bg-surface p-2 text-xs"
        rows={2}
        placeholder="Note (facultatif) — ce qui ne va pas / quoi corriger"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button type="button" className="text-xs text-muted" onClick={onCancel}>
          Annuler
        </button>
        <button
          type="button"
          className="rounded bg-accent px-2 py-1 text-xs text-white disabled:opacity-50"
          disabled={busy}
          onClick={() => onSubmit(category, note)}
        >
          Signaler
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `BlockReader`**

```tsx
// apps/cockpit/src/components/review/BlockReader.tsx
import { useRef, useState } from 'react';
import type { Annotation, AnnotationAnchor, AnnotationCategory } from '@ag/schema/cockpit';
import type { DocBlock } from '@/lib/api';
import { api } from '@/lib/api';
import { FlagPopover, type FlagDraft } from './FlagPopover';

interface Props {
  type: string;
  slug: string;
  blocks: DocBlock[];
  operator: string; // configured operator name (no auth)
  onFlagged: (a: Annotation) => void;
}

function text(html: string): string {
  const el = document.createElement('div');
  el.innerHTML = html;
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function BlockReader({ type, slug, blocks, operator, onFlagged }: Props) {
  const [draft, setDraft] = useState<FlagDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Word-selection → flag the containing block, quoting the selection + context.
  function onMouseUp() {
    const sel = window.getSelection();
    const q = sel?.toString().trim();
    if (!sel || !q || sel.rangeCount === 0) return;
    const node = sel.anchorNode as Node | null;
    const host = (node instanceof Element ? node : node?.parentElement)?.closest('[data-block-id]');
    if (!host) return;
    const block_id = host.getAttribute('data-block-id') ?? '';
    const block_hash = host.getAttribute('data-block-hash') ?? '';
    const full = text(host.innerHTML);
    const at = full.indexOf(q);
    setDraft({
      anchor: {
        kind: 'span',
        block_id,
        block_hash,
        quote: q,
        prefix: at > 0 ? full.slice(Math.max(0, at - 30), at) : undefined,
        suffix: at >= 0 ? full.slice(at + q.length, at + q.length + 30) : undefined,
        char_offset: at >= 0 ? at : undefined,
      },
      preview: q,
    });
  }

  // Block checkbox → flag the whole block.
  function flagBlock(b: DocBlock) {
    const anchor: AnnotationAnchor = { kind: 'block', block_id: b.block_id, block_hash: b.block_hash, quote: text(b.html).slice(0, 200) };
    setDraft({ anchor, preview: text(b.html).slice(0, 120) });
  }

  async function submit(category: AnnotationCategory, note: string) {
    if (!draft) return;
    setBusy(true);
    try {
      const created = await api.createAnnotation(type, slug, { anchor: draft.anchor, category, note, created_by: operator });
      onFlagged(created);
      setDraft(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={rootRef} onMouseUp={onMouseUp} className="relative">
      {blocks.map((b) => (
        <div key={b.block_id} className="group flex gap-2">
          <input
            type="checkbox"
            aria-label={`Signaler le bloc ${b.block_id}`}
            className="mt-2 opacity-30 group-hover:opacity-100"
            checked={false}
            onChange={() => flagBlock(b)}
          />
          {/* b.html is sanitized server-side (sanitize-html in server/markdown.ts). */}
          <div
            data-block-id={b.block_id}
            data-block-hash={b.block_hash}
            className="content-prose min-w-0 flex-1"
            dangerouslySetInnerHTML={{ __html: b.html }}
          />
        </div>
      ))}
      {draft ? (
        <div className="fixed bottom-6 right-6 z-50 w-80">
          <FlagPopover draft={draft} busy={busy} onSubmit={submit} onCancel={() => setDraft(null)} />
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: Wire it into `ContentReaderPage`**

```tsx
// apps/cockpit/src/pages/ContentReaderPage.tsx
// import { BlockReader } from '@/components/review/BlockReader';
// import { AnnotationPanel } from '@/components/review/AnnotationPanel'; // Task 8
// Replace the <article dangerouslySetInnerHTML …/> inside <CardContent> with:
//   <BlockReader
//     type={doc.type}
//     slug={doc.slug}
//     blocks={doc.blocks}
//     operator="opérateur"           // Task 8 makes this a small prompt/field
//     onFlagged={() => setRefresh((n) => n + 1)}
//   />
// Add near the top of the component:  const [refresh, setRefresh] = useState(0);
// Below the card, alongside ContradictionPanel, add:
//   <AnnotationPanel type={doc.type} slug={doc.slug} refreshKey={refresh} />
```

- [ ] **Step 4: Build the front + typecheck**

Run: `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace apps/cockpit run typecheck`
Then: `scripts/redeploy-cockpit.sh --build-only`
Expected: typecheck clean, build succeeds. (`AnnotationPanel` import is added in Task 8 — do Task 8 before the final build/verify, or temporarily stub it.)

- [ ] **Step 5: Commit**

```bash
git add apps/cockpit/src/components/review/BlockReader.tsx apps/cockpit/src/components/review/FlagPopover.tsx apps/cockpit/src/pages/ContentReaderPage.tsx
git commit  # feat(cockpit): lecteur par bloc — cases + sélection → popover de signalement
```

---

### Task 8: Panneau des signalements + accepter/refuser un `proposed`

**Files:**

- Create: `apps/cockpit/src/components/review/AnnotationPanel.tsx`

**Interfaces:**

- Consumes: `api.listAnnotations`, `api.updateAnnotation`, `api.deleteAnnotation` ; `Annotation` ; `CATEGORY_LABELS` ; `Card`, `Badge` (ui).
- Produces: `<AnnotationPanel type slug refreshKey />`. « Accepter » d'un `proposed` demande le nom d'opérateur → `updateAnnotation(id, { status:'accepted', validation:{ validated_by, validated_at } })` ; « Refuser » → `{ status:'rejected' }`.

- [ ] **Step 1: Write `AnnotationPanel`**

```tsx
// apps/cockpit/src/components/review/AnnotationPanel.tsx
import { useEffect, useState } from 'react';
import type { Annotation } from '@ag/schema/cockpit';
import { api } from '@/lib/api';
import { CATEGORY_LABELS } from '@/lib/annotation';
import { Badge, Card, CardContent } from '@/components/ui';

interface Props {
  type: string;
  slug: string;
  refreshKey: number;
}

export function AnnotationPanel({ type, slug, refreshKey }: Props) {
  const [items, setItems] = useState<Annotation[]>([]);

  function reload() {
    api.listAnnotations(type, slug).then(setItems).catch(() => setItems([]));
  }
  useEffect(reload, [type, slug, refreshKey]);

  async function decide(a: Annotation, accept: boolean) {
    const patch = accept
      ? {
          status: 'accepted' as const,
          validation: { validated_by: prompt('Nom du validateur ?') ?? '', validated_at: new Date().toISOString() },
        }
      : { status: 'rejected' as const };
    await api.updateAnnotation(a.id, patch);
    reload();
  }

  async function remove(a: Annotation) {
    await api.deleteAnnotation(a.id);
    reload();
  }

  if (items.length === 0) {
    return <p className="text-xs text-muted">Aucun signalement. Sélectionnez du texte ou cochez un bloc pour en créer un.</p>;
  }

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <h3 className="text-sm font-medium">Signalements ({items.length})</h3>
        {items.map((a) => (
          <div key={a.id} className="rounded border border-line p-2 text-xs">
            <div className="mb-1 flex items-center gap-2">
              <Badge tone="neutral">{CATEGORY_LABELS[a.category]}</Badge>
              <Badge tone={a.status === 'done' ? 'on_track' : a.status === 'rejected' || a.status === 'obsolete' ? 'blocked' : 'at_risk'}>
                {a.status}
              </Badge>
              <span className="truncate text-muted">« {a.anchor.quote ?? a.anchor.block_id} »</span>
            </div>
            {a.note ? <p className="mb-1 text-muted">{a.note}</p> : null}
            {a.status === 'proposed' && a.proposed_patch ? (
              <div className="mb-1 rounded bg-subtle p-2">
                <p className="text-status-blocked line-through">{a.proposed_patch.before}</p>
                <p className="text-status-on_track">{a.proposed_patch.after}</p>
                <p className="mt-1 text-muted">{a.proposed_patch.rationale}</p>
                <div className="mt-2 flex gap-2">
                  <button className="rounded bg-accent px-2 py-0.5 text-white" onClick={() => decide(a, true)}>
                    Accepter
                  </button>
                  <button className="rounded bg-subtle px-2 py-0.5" onClick={() => decide(a, false)}>
                    Refuser
                  </button>
                </div>
              </div>
            ) : null}
            <button className="text-muted hover:text-status-blocked" onClick={() => remove(a)}>
              Supprimer
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Confirm the `ContentReaderPage` import from Task 7 resolves; typecheck + build**

Run: `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace apps/cockpit run typecheck`
Then: `scripts/redeploy-cockpit.sh --build-only`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add apps/cockpit/src/components/review/AnnotationPanel.tsx
git commit  # feat(cockpit): panneau des signalements + accepter/refuser un diff proposé
```

---

### Task 9: Vérification e2e (agent-browser) + procédure de traitement (agent)

**Files:** none (verification + runbook).

- [ ] **Step 1: Redeploy full and health-check**

```bash
scripts/redeploy-cockpit.sh
curl -s localhost:8787/api/health   # {"status":"ok"}
```

- [ ] **Step 2: Drive the reader in a real browser**

```bash
docker compose -f docker/docker-compose.yml run --rm tools bash -lc '
  agent-browser open "http://host.docker.internal:8787/lire/atlas/mer-rouge-suez" || \
  agent-browser open "http://172.17.0.1:8787/lire/atlas/mer-rouge-suez"
  agent-browser wait --load networkidle
  agent-browser screenshot /workspace/scratch-reader.png
  agent-browser snapshot -i | head -60
'
```
Read `scratch-reader.png` (host path `apps? → /home/deploy/app-geo/scratch-reader.png`) to confirm: blocks render, margin checkboxes present, the seuils table shows. Then delete the screenshot.

Expected: the fiche renders block-by-block with checkboxes; the annotation panel shows "Aucun signalement."

- [ ] **Step 3: Create a flag via the API and confirm it surfaces**

```bash
curl -s -X POST localhost:8787/api/annotations/atlas/mer-rouge-suez -H 'content-type: application/json' \
  -d '{"anchor":{"kind":"span","block_id":"b1","block_hash":"x","quote":"filtre tarifé"},"category":"style","note":"vérifier la formule","created_by":"sg"}'
curl -s localhost:8787/api/annotations/atlas/mer-rouge-suez   # contains the flag
```
Expected: the flag appears in the panel on reload; `apps/cockpit/data/annotations.json` holds it.

- [ ] **Step 4: Clean the test flag**

```bash
ID=$(curl -s localhost:8787/api/annotations/atlas/mer-rouge-suez | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s)[0].id))")
curl -s -X DELETE localhost:8787/api/annotations/$ID
```
Confirm `annotations.json` is back to `[]`.

- [ ] **Step 5: Document the agent processing runbook (this file, appended)**

Add a short `## Procédure de traitement (agent)` section capturing:
1. `GET /api/annotations/:type/:slug`, prendre les `open`.
2. Recharger la source `.md`, `splitBlocks(source)`, `relocateBlock(anchor, blocks)` pour chaque flag.
   Introuvable → `PUT /annotations/:id {status:'obsolete'}`, signaler.
3. `style`/`structure` → éditer le `.md`, `PUT {status:'done', resolution:{by:'agent',at,action}}`.
4. `factuel`/`source` → calculer la correction, `PUT {status:'proposed', proposed_patch:{before,after,rationale,at}}` ;
   l'humain Accepte (→ `validation`), puis l'agent applique et `PUT {status:'done'}`.
5. Si la fiche est **publiée**, ajouter aussi l'entrée d'errata `corrections[] {date, note}` (devoir Munich 5).

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/plans/2026-07-12-cockpit-revue-signalements-corrections.md
git commit  # docs(plan): procédure de traitement agent + vérif e2e
```

---

## Self-Review

**Spec coverage :** §4.1 modèle → T1/T2 ; §4.2 ancrage → T3/T4 ; §4.3 routes → T5 ; §4.4 UI → T7/T8 ; §4.5 boucle → T9 runbook ; §5 cycle de vie → statuts T1 + panel T8 ; §6 doctrine (ADR 0046) → `validation` T1/T8, errata T9 ; §7 portée générique + MVP fiche → routes génériques + vérif sur `atlas/mer-rouge-suez` ; §8 tests → T1-T4 unitaires + T9 e2e ; §11 sécurité → HTML par bloc sanitizé (T3 réutilise `renderMarkdown`), `note`/`created_by` texte + zod (T5).

**Placeholders :** aucun `TBD`/`TODO` ; code complet dans chaque étape testable.

**Cohérence des types :** `DocBlock` (T3) consommé identiquement en T4/T7 ; `Annotation`/`AnnotationAnchor`/`AnnotationCategory`/`AnnotationStatus` (T1) réutilisés T2/T5/T6/T7/T8 ; réducteurs `addAnnotation/patchAnnotation/removeAnnotation/annotationsByDoc` (T2) appelés tels quels en T5 ; `api.createAnnotation/listAnnotations/updateAnnotation/deleteAnnotation` (T6) appelés en T7/T8.
