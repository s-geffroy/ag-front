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

// Rectification log — Munich Charter duty 5 (ADR 0037). Every published artifact carries this field
// (possibly empty) so an errata block is always rendered and the content stays correctable.
const corrections = z.array(z.object({ date: z.coerce.date(), note: z.string() })).default([]);

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
    corrections,
    draft: z.boolean().default(false),
  }),
});

// Schematic corridor map (rendering layer only — NOT canonical geometry). Coordinates live in a
// 0–100 × 0–64 abstract space; they carry no navigational or legal precision. See CorridorMap.astro.
const waypoint = z.object({
  label: z.string(),
  x: z.number(),
  y: z.number(),
  role: z.enum(['gate', 'chokepoint', 'hub']).default('gate'),
  align: z.enum(['left', 'right', 'top', 'bottom']).default('bottom'),
});
const corridorMap = z.object({
  caption: z.string().optional(),
  waypoints: z.array(waypoint).min(2),
  // Optional bypass drawn as a sweeping dashed arc (an SVG path `d`), e.g. the Cape route.
  bypass: z.object({ label: z.string(), path: z.string() }).optional(),
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
    map: corridorMap.optional(),
    // Publication guardrail: a fiche reaches the public site ONLY when published === true.
    // Default false — an unreviewed candidate stays off-public and is read internally via the
    // cockpit reader (Tailscale). Flip to true once the cockpit gates (compliance + human review)
    // are cleared. Mirrors `draft` on notes but defaults to NOT public.
    published: z.boolean().default(false),
    sources: z.array(source).default([]),
    corrections,
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
    // Publication guardrail — see the atlas collection. Default false: off-public until reviewed.
    published: z.boolean().default(false),
    sources: z.array(source).default([]),
    corrections,
  }),
});

export const collections = { notes, atlas, dossiers };
