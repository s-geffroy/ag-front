import { readFile, writeFile, rename } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { Config, Contact, Deliverable, Milestone, QualityGates, Scorecard } from '@ag/schema/cockpit';

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

export async function readCollection<N extends CollectionName>(
  name: N,
): Promise<z.infer<(typeof collectionSchemas)[N]>> {
  const raw = await readFile(fileFor(name), 'utf8');
  return collectionSchemas[name].parse(JSON.parse(raw)) as z.infer<(typeof collectionSchemas)[N]>;
}

/** Validate then write atomically (tmp file + rename) so a crash never leaves a half-written file. */
export async function writeCollection<N extends CollectionName>(
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

export async function readState() {
  const [config, deliverables, milestones, metrics, contacts, quality_gates] = await Promise.all([
    readCollection('config'),
    readCollection('deliverables'),
    readCollection('milestones'),
    readCollection('metrics'),
    readCollection('contacts'),
    readCollection('quality_gates'),
  ]);
  return { config, deliverables, milestones, metrics, contacts, quality_gates };
}
