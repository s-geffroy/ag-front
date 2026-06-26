// SQLite connection (better-sqlite3, synchronous). WAL + foreign keys on. A single shared instance
// is created lazily so tests can point HDDE_DB_PATH at a throwaway file.

import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from '../config';
import { SCHEMA_SQL } from './schema';

export type DB = Database.Database;

let instance: DB | null = null;

export function migrate(db: DB): void {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA_SQL);
}

/** Open (and migrate) a database at an explicit path — used by tests and the seeder. */
export function openDb(path: string): DB {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  migrate(db);
  return db;
}

/** Shared application database (path from config). */
export function getDb(): DB {
  if (!instance) instance = openDb(config.dbPath);
  return instance;
}

/** Generate an id without pulling a uuid dependency (crypto is in the runtime). */
export function newId(): string {
  return randomUUID();
}
