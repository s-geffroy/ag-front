import { z } from 'zod';
import { accessLevels } from './vocab';
import { Provenance } from './source';

export const AccessLevel = z.enum(accessLevels);
export type AccessLevel = z.infer<typeof AccessLevel>;

/** Fields shared by every editorial artifact (note / fiche / dossier). */
const editorialBase = {
  slug: z.string(),
  title: z.string(),
  corridor_id: z.string().optional(),
  access: AccessLevel.default('public'),
  published: z.boolean().default(false),
  date: z.string().optional(),
  provenance: Provenance,
};

/** Short note (~2 min): hook, angle, 3 signals, decision implication, blind spot, sources. */
export const Note = z.object({
  ...editorialBase,
  kind: z.literal('note'),
  hook: z.string(),
  angle: z.string(),
  signals: z.array(z.string()).max(5).default([]),
  decision_implication: z.string(),
  blind_spot: z.string(),
});
export type Note = z.infer<typeof Note>;

/** Atlas fiche (4–8 pages): the 13-section structure starts with a strategic verdict. */
export const FicheAtlas = z.object({
  ...editorialBase,
  kind: z.literal('atlas_fiche'),
  verdict: z.string(),
  sections: z.array(z.object({ heading: z.string(), body: z.string() })).default([]),
});
export type FicheAtlas = z.infer<typeof FicheAtlas>;

/** Long dossier (15–25 pages): one strategic question, 2–3 scenarios, explicit limits. */
export const Dossier = z.object({
  ...editorialBase,
  kind: z.literal('dossier'),
  strategic_question: z.string(),
  executive_summary: z.string(),
  scenario_ids: z.array(z.string()).max(3).default([]),
  limits: z.array(z.string()).default([]),
  pdf_url: z.string().url().optional(),
});
export type Dossier = z.infer<typeof Dossier>;

export const ContentItem = z.discriminatedUnion('kind', [Note, FicheAtlas, Dossier]);
export type ContentItem = z.infer<typeof ContentItem>;
