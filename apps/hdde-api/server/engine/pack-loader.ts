// Domain-pack loader: reads + validates the YAML pack and computes a stable pack_hash.
// Port of the starter pack's services/pack_loader.py — the hash algorithm is kept byte-compatible
// (sorted REQUIRED_FILES, filename bytes then file bytes) so a TS-loaded pack hashes identically to
// the Python reference, preserving traceability of which pack produced which diagnostic (ADR 0032).

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import type { DomainPack } from './types';

export const REQUIRED_FILES = [
  'pack.yaml',
  'dimensions.yaml',
  'diagnostic_patterns.yaml',
  'interview_blocks.yaml',
  'questions.yaml',
  'red_flags.yaml',
  'scoring_rules.yaml',
  'verdict_rules.yaml',
  'evidence_types.yaml',
  'actor_types.yaml',
  'red_team_personas.yaml',
] as const;

/** sha256 over sorted REQUIRED_FILES: for each, hash the filename then its raw bytes. */
export function computePackHash(packDir: string): string {
  const digest = createHash('sha256');
  for (const fileName of [...REQUIRED_FILES].sort()) {
    digest.update(Buffer.from(fileName, 'utf-8'));
    digest.update(readFileSync(join(packDir, fileName)));
  }
  return 'sha256:' + digest.digest('hex');
}

// --- Pragmatic validation: assert the shapes the engine relies on; tolerate extra fields. ---
const dimensionSchema = z.object({
  id: z.string(),
  label_fr: z.string(),
  label_en: z.string(),
  scale: z.string(),
});

const questionSchema = z.object({
  id: z.string(),
  block_id: z.string(),
  order: z.number(),
  required: z.boolean().default(true),
  type: z.enum(['categorical', 'free_text', 'ordinal_scale']),
  text_fr: z.string(),
  answer_options: z.array(z.string()).optional(),
  targets: z
    .object({
      dimensions: z.array(z.object({ id: z.string(), weight: z.number() })).optional(),
      patterns: z.array(z.object({ id: z.string(), weight: z.number() })).optional(),
    })
    .optional(),
  followups: z.array(z.object({ trigger: z.string(), question_id: z.string() })).optional(),
});

const scoringRuleSchema = z.object({
  id: z.string(),
  if: z.object({
    question_id: z.string(),
    evidence_quality_lte: z.number().optional(),
    answer_in: z.array(z.string()).optional(),
  }),
  then: z.object({
    adjust_dimension: z.record(z.string(), z.number()).optional(),
    activate_pattern: z.string().optional(),
    add_red_flag: z.string().optional(),
  }),
});

const verdictRuleSchema = z.object({
  id: z.string(),
  if: z.record(z.string(), z.number()),
  verdict: z.enum(['monitor', 'prepare', 'act', 'escalate']),
});

const redFlagSchema = z.object({ id: z.string(), severity: z.number(), message_fr: z.string() });
const patternSchema = z.object({
  id: z.string(),
  label_fr: z.string(),
  label_en: z.string().optional(),
  description_fr: z.string().optional(),
});
const personaSchema = z.object({
  id: z.string(),
  label_fr: z.string(),
  attacks: z.array(z.string()),
});

function readYaml(packDir: string, file: string): unknown {
  return parseYaml(readFileSync(join(packDir, file), 'utf-8')) ?? {};
}

/** Load + validate the domain pack from a directory. Throws on missing files or invalid shapes. */
export function loadPack(packDir: string): DomainPack {
  const missing = REQUIRED_FILES.filter((f) => {
    try {
      readFileSync(join(packDir, f));
      return false;
    } catch {
      return true;
    }
  });
  if (missing.length) {
    throw new Error(`Missing domain pack files: ${missing.join(', ')}`);
  }

  const packMeta = readYaml(packDir, 'pack.yaml') as Record<string, unknown>;
  const dimensions = z
    .array(dimensionSchema)
    .parse((readYaml(packDir, 'dimensions.yaml') as { dimensions?: unknown }).dimensions ?? []);
  const questions = z
    .array(questionSchema)
    .parse((readYaml(packDir, 'questions.yaml') as { questions?: unknown }).questions ?? []);
  const scoringRules = z
    .array(scoringRuleSchema)
    .parse((readYaml(packDir, 'scoring_rules.yaml') as { rules?: unknown }).rules ?? []);
  const verdictRules = z
    .array(verdictRuleSchema)
    .parse((readYaml(packDir, 'verdict_rules.yaml') as { rules?: unknown }).rules ?? []);
  const redFlags = z
    .array(redFlagSchema)
    .parse((readYaml(packDir, 'red_flags.yaml') as { red_flags?: unknown }).red_flags ?? []);
  const patterns = z
    .array(patternSchema)
    .parse(
      (readYaml(packDir, 'diagnostic_patterns.yaml') as { patterns?: unknown }).patterns ?? [],
    );
  const personas = z
    .array(personaSchema)
    .parse((readYaml(packDir, 'red_team_personas.yaml') as { personas?: unknown }).personas ?? []);
  const evidenceTypesRaw =
    (readYaml(packDir, 'evidence_types.yaml') as { evidence_types?: unknown }).evidence_types ?? [];
  const actorTypesDoc = readYaml(packDir, 'actor_types.yaml') as {
    actor_types?: string[];
    actor_roles?: string[];
  };
  const interviewBlocks =
    (readYaml(packDir, 'interview_blocks.yaml') as { blocks?: unknown }).blocks ?? [];

  return {
    id: String(packMeta.pack_id),
    version: String(packMeta.version),
    uiLanguage: String(packMeta.ui_language ?? 'fr'),
    outputLanguages: (packMeta.output_languages as string[]) ?? ['fr', 'en'],
    dimensions,
    questions,
    scoringRules,
    verdictRules,
    redFlags,
    patterns,
    personas,
    evidenceTypes: evidenceTypesRaw as DomainPack['evidenceTypes'],
    actorTypes: actorTypesDoc.actor_types ?? [],
    actorRoles: actorTypesDoc.actor_roles ?? [],
    interviewBlocks: interviewBlocks as DomainPack['interviewBlocks'],
    packHash: computePackHash(packDir),
  };
}
