import { appendFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { Contact, leadToContact, type LeadInput } from '@ag/schema/cockpit';

const here = dirname(fileURLToPath(import.meta.url));
// The lead lands in the cockpit's acquisition pipeline (shared data file).
const CONTACTS_FILE = resolve(here, '../../cockpit/data/contacts.json');
const LEDGER_DIR = resolve(here, '../data');
const LEDGER_FILE = resolve(LEDGER_DIR, 'leads.ndjson');

const ContactArray = z.array(Contact);

/**
 * Persist a validated lead:
 *  1) append-only ledger (so a lead is never lost, even if the contacts write fails);
 *  2) map to a cockpit Contact (stage `identified`) and append to contacts.json atomically.
 */
export async function recordLead(lead: LeadInput, now: Date): Promise<{ id: string }> {
  const id = `lead_${now.getTime().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
  const iso = now.toISOString();

  await mkdir(LEDGER_DIR, { recursive: true });
  await appendFile(LEDGER_FILE, JSON.stringify({ id, receivedAt: iso, lead }) + '\n', 'utf8');

  const contact = leadToContact(lead, id, iso);
  const raw = await readFile(CONTACTS_FILE, 'utf8').catch(() => '[]');
  const list = ContactArray.parse(JSON.parse(raw));
  list.push(contact);

  const tmp = `${CONTACTS_FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(list, null, 2) + '\n', 'utf8');
  await rename(tmp, CONTACTS_FILE);

  return { id };
}
