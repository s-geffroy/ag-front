#!/usr/bin/env node
/**
 * Consistent snapshot of the two SQLite databases, using the online backup API.
 *
 * WHY NOT `cp`: both databases run in WAL mode, and right now `hdde.sqlite` is 4 KB while
 * `hdde.sqlite-wal` holds 1.4 MB — every committed row lives in the write-ahead log, not yet in the
 * main file. Copying the `.sqlite` alone would therefore produce a **plausible, openable, and nearly
 * empty** database. That is the worst possible failure: a backup that looks like it worked. Copying
 * the three files together is no better, because they can be torn against a concurrent writer.
 *
 * `better-sqlite3`'s `backup()` wraps sqlite3_backup, which takes a read lock, walks the pages and
 * checkpoints the WAL into the destination. The result is one self-contained file, safe to copy, and
 * valid even if the API was mid-write.
 *
 * Runs inside the `tools` container (the Docker-only rule); `scripts/backup.sh` on the host is what
 * invokes it, because only the host has the cron and the destination directory.
 *
 * Usage: node scripts/backup-sqlite.mjs <outdir>
 */

import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');

const SOURCES = [
  { name: 'hdde', path: join(ROOT, 'apps/hdde-api/data/hdde.sqlite') },
  { name: 'verdict', path: join(ROOT, 'apps/verdict-api/data/verdict.sqlite') },
];

const outdir = process.argv[2];
if (!outdir) {
  console.error('usage: node scripts/backup-sqlite.mjs <outdir>');
  process.exit(2);
}
mkdirSync(outdir, { recursive: true });

let failures = 0;

for (const { name, path } of SOURCES) {
  if (!existsSync(path)) {
    console.error(`[backup] ABSENT ${name}: ${path}`);
    failures++;
    continue;
  }
  const dest = join(outdir, `${name}.sqlite`);
  try {
    // readonly: a backup must never be able to modify the live database.
    const db = new Database(path, { readonly: true, fileMustExist: true });
    await db.backup(dest);

    // Re-open the SNAPSHOT and make it prove itself. An unverified backup is a hope, not a backup:
    // integrity_check would catch a torn copy, and the table count catches the empty-file failure
    // that a plain `cp` of a WAL database produces.
    const check = new Database(dest, { readonly: true, fileMustExist: true });
    const integrity = check.pragma('integrity_check', { simple: true });
    const tables = check
      .prepare("SELECT count(*) AS n FROM sqlite_master WHERE type = 'table'")
      .get().n;
    check.close();
    db.close();

    if (integrity !== 'ok') throw new Error(`integrity_check = ${integrity}`);
    if (tables === 0) throw new Error('snapshot contains no table — suspected empty copy');

    // Opening the snapshot to verify it creates `-wal`/`-shm` beside it. They are empty and
    // redundant, but shipping them in the archive would put a restorer back in the situation this
    // script exists to avoid: a `.sqlite` flanked by side files, unsure which holds the data.
    for (const side of ['-wal', '-shm']) rmSync(`${dest}${side}`, { force: true });

    const kb = (statSync(dest).size / 1024).toFixed(0);
    console.log(`[backup] ${name}: ${tables} tables, ${kb} ko, integrity ok`);
  } catch (e) {
    console.error(`[backup] ÉCHEC ${name}: ${e.message}`);
    failures++;
  }
}

process.exit(failures === 0 ? 0 : 1);
