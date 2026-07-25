import { z } from 'zod';

// Promoted media-coverage store (ADR 0071). A human, in the cockpit, promotes a news cluster from the
// (cockpit-only) /news feed onto the PUBLIC Atlas. The chosen clusters are written here — a git-tracked,
// app-owned content store the public SSG build reads. This schema is deliberately DECOUPLED from the
// producer's evolving NewsClusterOut: it captures only the public-safe subset, so a producer change
// never silently reshapes what the public site renders. Everything here is a CANDIDATE, never a fact,
// and never an "incident" — coverage caps at attention (ADR 0042).

/** Only http/https URLs may reach the public site — reject javascript:/data:/etc. at parse time. */
const httpUrl = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), { message: 'url must be http(s)' });

/** One source article (server-recalculated at promotion — reliable, unlike model prose). */
export const PromotedArticle = z.object({
  title: z.string().default(''),
  url: httpUrl,
  outlet: z.string().default(''),
  /** 'gdelt_gkg' = the untrusted GDELT long tail (flag it in the UI); anything else = audited slate. */
  source_id: z.string().default(''),
  observed_on: z.string().default(''), // ISO date
});
export type PromotedArticle = z.infer<typeof PromotedArticle>;

/** A chokepoint this cluster is (server-)linked to. */
export const PromotedAffectedChokepoint = z.object({
  chokepoint_id: z.string(),
  canonical_name: z.string().default(''),
  relevance: z.string().default(''),
});
export type PromotedAffectedChokepoint = z.infer<typeof PromotedAffectedChokepoint>;

/**
 * One promoted cluster. Split by trust: `articles`/`affected_chokepoints`/counts are server-recalculated
 * and re-fetched at promotion time (reliable); `headline`/`summary_text`/`event_category`/`salience_score`
 * are model prose (candidate — the UI frames them as such). Provenance carries WHO promoted and WHEN.
 */
export const PromotedNewsItem = z.object({
  // Reliable (server-recalculated) ------------------------------------------------------------------
  articles: z.array(PromotedArticle).default([]),
  affected_chokepoints: z.array(PromotedAffectedChokepoint).default([]),
  article_count: z.number().nullish(),
  first_seen: z.string().default(''),
  last_seen: z.string().default(''),
  generated_at: z.string().default(''),
  // Model prose (candidate) -------------------------------------------------------------------------
  headline: z.string().default(''),
  summary_text: z.string().default(''),
  event_category: z.string().default(''),
  salience_score: z.number().nullish(),
  // Provenance / audit ------------------------------------------------------------------------------
  cluster_id: z.string().default(''),
  run_id: z.string().default(''),
  /** Must be 'cleared_only' to be promotable — enforced by the writer; parsed defensively here too. */
  taint_class: z.string().default(''),
  promoted_by: z.string(),
  promoted_at: z.string(), // ISO 8601
});
export type PromotedNewsItem = z.infer<typeof PromotedNewsItem>;

/**
 * The whole store: chokepoint_id → promoted clusters. `.catch({})` makes the PUBLIC read total — a
 * malformed or empty file degrades to "no promoted news" instead of breaking a static build.
 */
export const PromotedNewsStore = z.record(z.string(), z.array(PromotedNewsItem)).catch({});
export type PromotedNewsStore = z.infer<typeof PromotedNewsStore>;
