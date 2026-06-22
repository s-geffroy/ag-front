/** Qualitative vulnerability scale (public / Basic level). */
export const vulnerabilityLevels = ['bas', 'modere', 'eleve', 'critique'] as const;
export type VulnerabilityLevel = (typeof vulnerabilityLevels)[number];

/** Confidence levels attached to any structuring claim (data-integrity rule). */
export const confidenceLevels = ['bas', 'moyen', 'eleve'] as const;
export type ConfidenceLevel = (typeof confidenceLevels)[number];

/**
 * Map a 0–5 dimension score to the qualitative vulnerability level.
 * Throws on out-of-range or non-integer input — scores are bounded by design.
 */
export function levelFromScore(score: number): VulnerabilityLevel {
  if (!Number.isInteger(score) || score < 0 || score > 5) {
    throw new RangeError(`CVI dimension score must be an integer in [0,5], got ${score}`);
  }
  if (score <= 1) return 'bas';
  if (score === 2) return 'modere';
  if (score === 3) return 'eleve';
  return 'critique'; // 4–5
}
