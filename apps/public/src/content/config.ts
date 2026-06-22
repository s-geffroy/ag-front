import { defineCollection, z } from 'astro:content';

// Schemas mirror the product model documented in @ag/schema/content. Astro requires its own `z`,
// so we restate the shapes here. Every record carries provenance: sources + confidence.
const source = z.object({
  label: z.string(),
  type: z.enum([
    'institutionnel',
    'donnees_ouvertes',
    'presse_specialisee',
    'rapport_entreprise',
    'reglementaire',
    'carte',
    'analyse_secondaire',
    'source_contradictoire',
    'signal_faible',
  ]),
  url: z.string().url().optional(),
});

const access = z.enum(['public', 'basic', 'standard', 'premium']).default('public');
const confidence = z.enum(['bas', 'moyen', 'eleve']).default('moyen');

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    access,
    corridor: z.string().optional(),
    signals: z.array(z.string()).max(5).default([]),
    decision_implication: z.string().optional(),
    blind_spot: z.string().optional(),
    confidence,
    sources: z.array(source).default([]),
    draft: z.boolean().default(false),
  }),
});

const atlas = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    verdict: z.string(),
    family: z.string(),
    priority: z.enum(['P0', 'P1', 'P2']),
    regions: z.array(z.string()).default([]),
    access,
    updated: z.coerce.date(),
    confidence,
    cvi_level: z.enum(['bas', 'modere', 'eleve', 'critique']).optional(),
    sources: z.array(source).default([]),
  }),
});

const dossiers = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    strategic_question: z.string(),
    summary: z.string(),
    access,
    confidence,
    pdf: z.string().optional(),
    sources: z.array(source).default([]),
  }),
});

export const collections = { notes, atlas, dossiers };
