import { open, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  Config,
  Contact,
  Contradictions,
  Deliverable,
  Judgements,
  Milestone,
  QualityGates,
  Scorecard,
  ValidationJournal,
} from '@ag/schema/cockpit';

const here = dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = resolve(here, '../data');

/** Schema for the whole content of each JSON file. */
export const collectionSchemas = {
  config: Config,
  deliverables: z.array(Deliverable),
  milestones: z.array(Milestone),
  metrics: Scorecard,
  contacts: z.array(Contact),
  quality_gates: QualityGates,
  contradictions: Contradictions,
  // LLM judge candidate reports (ADR 0068) — regenerable, git-ignored (seed = []).
  judgements: Judgements,
  // Append-only human-validation journal (ADR 0046/0068) — git-tracked audit trail.
  validation_journal: ValidationJournal,
} as const;

export type CollectionName = keyof typeof collectionSchemas;
export const collectionNames = Object.keys(collectionSchemas) as CollectionName[];

/** Array collections whose items are addressable by `id` (and writable one at a time). */
export const itemSchemas = {
  deliverables: Deliverable,
  milestones: Milestone,
  contacts: Contact,
} as const;
export type ItemCollectionName = keyof typeof itemSchemas;
export const itemCollectionNames = Object.keys(itemSchemas) as ItemCollectionName[];

function fileFor(name: CollectionName): string {
  // name is constrained to the allowlist above — no path traversal possible.
  return resolve(DATA_DIR, `${name}.json`);
}

/** Read a collection's raw JSON, falling back to its tracked `*.seed.json` on first boot.
 *  Runtime state files (e.g. `contacts.json`, which holds visitor PII and is git-ignored) ship
 *  only as a seed; the live file is materialised on first write. */
async function readRaw(name: CollectionName): Promise<string> {
  try {
    return await readFile(fileFor(name), 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') {
      const seed = await readFile(resolve(DATA_DIR, `${name}.seed.json`), 'utf8').catch(() => null);
      if (seed !== null) return seed;
    }
    throw err;
  }
}

export async function readCollection<N extends CollectionName>(
  name: N,
): Promise<z.infer<(typeof collectionSchemas)[N]>> {
  return collectionSchemas[name].parse(JSON.parse(await readRaw(name))) as z.infer<
    (typeof collectionSchemas)[N]
  >;
}

const LOCK_STALE_MS = 10_000;

/**
 * Run `fn` while holding a cross-process advisory lock on `${target}.lock` (O_EXCL create).
 * Prevents lost updates when two writers touch the same JSON file — notably `contacts.json`, which
 * both the cockpit (`PUT /contacts/:id`) and the public lead-api (`POST /api/lead`) mutate.
 */
export async function withFileLock<T>(target: string, fn: () => Promise<T>): Promise<T> {
  const lock = `${target}.lock`;
  for (let attempt = 0; ; attempt++) {
    let fh;
    try {
      fh = await open(lock, 'wx'); // wx = O_CREAT | O_EXCL → fails if the lock is held
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code !== 'EEXIST') throw err;
      // Held: steal it if stale (a crashed holder), else back off and retry.
      const st = await stat(lock).catch(() => null);
      if (st && Date.now() - st.mtimeMs > LOCK_STALE_MS) {
        await unlink(lock).catch(() => {});
        continue;
      }
      if (attempt > 400) throw new Error(`lock timeout: ${lock}`);
      await new Promise((r) => setTimeout(r, 25));
      continue;
    }
    await fh.close();
    try {
      return await fn();
    } finally {
      await unlink(lock).catch(() => {});
    }
  }
}

/** Validate then write atomically (tmp file + rename) so a crash never leaves a half-written file. */
async function writeCollectionRaw<N extends CollectionName>(
  name: N,
  value: unknown,
): Promise<z.infer<(typeof collectionSchemas)[N]>> {
  const parsed = collectionSchemas[name].parse(value);
  const file = fileFor(name);
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
  await rename(tmp, file);
  return parsed as z.infer<(typeof collectionSchemas)[N]>;
}

/** Validate + atomic write under the collection's file lock. */
export async function writeCollection<N extends CollectionName>(
  name: N,
  value: unknown,
): Promise<z.infer<(typeof collectionSchemas)[N]>> {
  return withFileLock(fileFor(name), () => writeCollectionRaw(name, value));
}

/** Atomic read-modify-write under one lock — the safe primitive for "update item by id". */
export async function mutateCollection<N extends CollectionName>(
  name: N,
  mutator: (current: z.infer<(typeof collectionSchemas)[N]>) => unknown,
): Promise<z.infer<(typeof collectionSchemas)[N]>> {
  return withFileLock(fileFor(name), async () =>
    writeCollectionRaw(name, mutator(await readCollection(name))),
  );
}

export async function readState() {
  const [
    config,
    deliverables,
    milestones,
    metrics,
    contacts,
    quality_gates,
    contradictions,
    judgements,
    validation_journal,
  ] = await Promise.all([
    readCollection('config'),
    readCollection('deliverables'),
    readCollection('milestones'),
    readCollection('metrics'),
    readCollection('contacts'),
    readCollection('quality_gates'),
    readCollection('contradictions'),
    readCollection('judgements'),
    readCollection('validation_journal'),
  ]);
  return {
    config,
    deliverables,
    milestones,
    metrics,
    contacts,
    quality_gates,
    contradictions,
    judgements,
    validation_journal,
  };
}
