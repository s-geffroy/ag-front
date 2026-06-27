/**
 * Munich Charter machine checks (ADR 0037). Fails the build/CI when a *published* editorial artifact
 * violates the machine-checkable duties. Pure logic (`checkArtifact`) is unit-tested; the runner
 * scans the content tree and exits non-zero on any violation.
 *
 *   node apps/public/scripts/munich-check.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const here = dirname(fileURLToPath(import.meta.url));
export const CONTENT_DIR = join(here, '../src/content');

// R1 provenance — minimum sources by artifact weight (duties 1 & 3).
const MIN_SOURCES = { notes: 1, atlas: 2, dossiers: 3 };
const CONFIDENCE = ['bas', 'moyen', 'eleve'];

/** A note is public unless drafted; atlas/dossier reach the public site only when published. */
export function isPublished(type, data) {
  if (type === 'notes') return data.draft !== true;
  return data.published === true;
}

/** Returns the list of Munich machine-check violations for one artifact (empty = compliant). */
export function checkArtifact(type, data, body) {
  const issues = [];

  // R1 — provenance (duties 1, 3)
  const min = MIN_SOURCES[type] ?? 1;
  const sources = Array.isArray(data.sources) ? data.sources : [];
  if (sources.length < min) {
    issues.push(`R1 provenance : ${sources.length} source(s) < minimum ${min} pour ${type}`);
  }
  sources.forEach((s, i) => {
    if (!s || !s.label || !s.type) issues.push(`R1 provenance : source #${i + 1} sans label/type`);
  });

  // R2 — uncertainty (duty 1)
  if (data.confidence !== undefined && !CONFIDENCE.includes(data.confidence)) {
    issues.push(`R2 incertitude : confidence invalide « ${data.confidence} »`);
  }
  if (type === 'dossiers' && !/##\s*Limites|angles?\s*morts/i.test(body)) {
    issues.push('R2 incertitude : dossier sans section « Limites / angles morts »');
  }

  // R3 — rectificability (duty 5): the corrections field must be declared (array, possibly empty).
  if (!Array.isArray(data.corrections)) {
    issues.push('R3 rectificabilité : champ `corrections` absent ou non-tableau');
  }

  return issues;
}

/** Scan every published artifact under the content tree. */
export function scanAll(root = CONTENT_DIR) {
  const results = [];
  for (const type of ['notes', 'atlas', 'dossiers']) {
    let files = [];
    try {
      files = readdirSync(join(root, type)).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }
    for (const file of files) {
      const { data, content } = matter(readFileSync(join(root, type, file), 'utf8'));
      if (!isPublished(type, data)) continue;
      results.push({ file: `${type}/${file}`, issues: checkArtifact(type, data, content) });
    }
  }
  return results;
}

// Run as a CLI when invoked directly.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const results = scanAll();
  const failed = results.filter((r) => r.issues.length);
  for (const r of results) {
    if (r.issues.length) {
      console.error(`✗ ${r.file}`);
      r.issues.forEach((i) => console.error(`    - ${i}`));
    } else {
      console.log(`✓ ${r.file}`);
    }
  }
  console.log(
    `\nCharte de Munich — contrôle machine : ${results.length} artefact(s) publié(s), ${failed.length} en violation.`,
  );
  if (failed.length) process.exit(1);
}
