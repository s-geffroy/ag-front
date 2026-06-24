import {
  appendFile,
  mkdir,
  open,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { Contact, leadToContact, type LeadInput } from '@ag/schema/cockpit';

const here = dirname(fileURLToPath(import.meta.url));
// The lead lands in the cockpit's acquisition pipeline (shared, git-ignored runtime file). The
// tracked starting data ships as contacts.seed.json (so visitor PII never enters git).
const CONTACTS_FILE = resolve(here, '../../cockpit/data/contacts.json');
const CONTACTS_SEED = resolve(here, '../../cockpit/data/contacts.seed.json');
const LEDGER_DIR = resolve(here, '../data');
const LEDGER_FILE = resolve(LEDGER_DIR, 'leads.ndjson');

const ContactArray = z.array(Contact);

const LOCK_STALE_MS = 10_000;
/** Cross-process advisory lock (matches apps/cockpit/server/store.ts) so the cockpit and the
 *  lead-api never lose an update when both write contacts.json. */
async function withFileLock<T>(target: string, fn: () => Promise<T>): Promise<T> {
  const lock = `${target}.lock`;
  for (let attempt = 0; ; attempt++) {
    let fh;
    try {
      fh = await open(lock, 'wx');
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code !== 'EEXIST') throw err;
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

/**
 * Persist a validated lead:
 *  1) append-only ledger (so a lead is never lost, even if the contacts write fails — race-free);
 *  2) map to a cockpit Contact (stage `identified`) and append to contacts.json atomically, under a
 *     file lock shared with the cockpit (no lost updates), seeding from contacts.seed.json on first run.
 */
export async function recordLead(lead: LeadInput, now: Date): Promise<{ id: string }> {
  const id = `lead_${now.getTime().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
  const iso = now.toISOString();

  await mkdir(LEDGER_DIR, { recursive: true });
  await appendFile(LEDGER_FILE, JSON.stringify({ id, receivedAt: iso, lead }) + '\n', 'utf8');

  const contact = leadToContact(lead, id, iso);
  await withFileLock(CONTACTS_FILE, async () => {
    const raw = await readFile(CONTACTS_FILE, 'utf8').catch(async (err) => {
      if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') {
        return await readFile(CONTACTS_SEED, 'utf8').catch(() => '[]');
      }
      throw err;
    });
    const list = ContactArray.parse(JSON.parse(raw));
    list.push(contact);
    const tmp = `${CONTACTS_FILE}.tmp`;
    await writeFile(tmp, JSON.stringify(list, null, 2) + '\n', 'utf8');
    await rename(tmp, CONTACTS_FILE);
  });

  return { id };
}
