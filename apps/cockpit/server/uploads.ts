import { mkdirSync, readFileSync, writeFileSync, existsSync, renameSync, rmSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { z } from 'zod';

/**
 * Source deposits — let an analyst drop evidence files (PDF, saved HTML, screenshots…) into the
 * cockpit so they can feed a deliverable. Tailnet-only like the rest of the cockpit, but still
 * locked down (owasp): extension allowlist, size cap, random stored names (no caller-controlled
 * path), download served as an attachment with `nosniff` so a stored HTML can never execute on the
 * cockpit origin. Files + index live under data/ and are git-ignored.
 */
const here = dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = resolve(here, '../data/uploads');
const INDEX_FILE = resolve(here, '../data/uploads.json');

mkdirSync(UPLOADS_DIR, { recursive: true });

// Extension allowlist (SVG/HTML-as-script and executables are excluded). MIME is recorded, not
// trusted for the decision — browsers send it inconsistently; the extension gates acceptance.
const ALLOWED_EXT = new Set([
  '.pdf',
  '.html',
  '.htm',
  '.txt',
  '.md',
  '.csv',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.docx',
  '.xlsx',
]);
export const ALLOWED_EXT_LIST = [...ALLOWED_EXT].join(', ');
const MAX_BYTES = 25 * 1024 * 1024;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const UploadEntry = z.object({
  id: z.string(),
  original_name: z.string(),
  stored_name: z.string(),
  size: z.number(),
  mime: z.string(),
  ext: z.string(),
  uploaded_at: z.string(),
  deliverable_id: z.string().optional(),
  note: z.string().optional(),
});
export type UploadEntry = z.infer<typeof UploadEntry>;

export const UploadMeta = z.object({
  deliverable_id: z.string().max(200).optional(),
  note: z.string().max(2000).optional(),
});

function readIndex(): UploadEntry[] {
  if (!existsSync(INDEX_FILE)) return [];
  try {
    return z.array(UploadEntry).parse(JSON.parse(readFileSync(INDEX_FILE, 'utf8')));
  } catch {
    return [];
  }
}

function writeIndex(entries: UploadEntry[]): void {
  const tmp = `${INDEX_FILE}.${randomUUID()}.tmp`;
  writeFileSync(tmp, JSON.stringify(entries, null, 2));
  renameSync(tmp, INDEX_FILE);
}

export function listUploads(deliverableId?: string): UploadEntry[] {
  const all = readIndex().sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));
  return deliverableId ? all.filter((e) => e.deliverable_id === deliverableId) : all;
}

export function getUpload(id: string): UploadEntry | null {
  if (!UUID_RE.test(id)) return null;
  return readIndex().find((e) => e.id === id) ?? null;
}

/** Absolute path of a stored file, asserted to live inside UPLOADS_DIR (defense in depth). */
export function uploadPath(entry: UploadEntry): string {
  const abs = resolve(UPLOADS_DIR, entry.stored_name);
  if (dirname(abs) !== UPLOADS_DIR) throw new Error('invalid stored path');
  return abs;
}

export function addUploads(
  files: Express.Multer.File[],
  meta: z.infer<typeof UploadMeta>,
  now: string,
): UploadEntry[] {
  const entries = readIndex();
  const created = files.map((f) => {
    const id = f.filename.replace(extname(f.filename), '');
    return {
      id,
      original_name: f.originalname,
      stored_name: f.filename,
      size: f.size,
      mime: f.mimetype,
      ext: extname(f.filename).toLowerCase(),
      uploaded_at: now,
      ...(meta.deliverable_id ? { deliverable_id: meta.deliverable_id } : {}),
      ...(meta.note ? { note: meta.note } : {}),
    } satisfies UploadEntry;
  });
  writeIndex([...entries, ...created]);
  return created;
}

export function removeUpload(id: string): boolean {
  const entry = getUpload(id);
  if (!entry) return false;
  rmSync(uploadPath(entry), { force: true });
  writeIndex(readIndex().filter((e) => e.id !== id));
  return true;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  // Caller never controls the on-disk name: a fresh UUID + the (lowercased, allowlisted) extension.
  filename: (_req, file, cb) =>
    cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
});

export const uploadHandler = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_EXT.has(extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error(`type non autorisé (autorisés : ${ALLOWED_EXT_LIST})`));
  },
});
