/**
 * Reading a list response's own account of itself.
 *
 * A read-API list can arrive as a bare array or as an envelope that declares its limits. The bare
 * array is the dangerous one: measured on `event-signals` (2026-08-10), Hormuz returns exactly the
 * requested limit at 500, 900 and 2000 while Malacca returns 53 whatever we ask — the two responses
 * are indistinguishable, so a capped list reads as a complete one (ADR 0077, handoff 0029).
 *
 * The cockpit's proxy now wraps that endpoint and computes `may_be_truncated`. This turns the
 * envelope into what the UI must say, and exists as a pure function so the rule is tested rather
 * than trusted to JSX.
 */

export interface ListAccount {
  /** Rows in hand: the length for a bare array, `count` for an envelope, null when unknowable. */
  count: number | null;
  /** True only when the producer's answer may be hiding rows. */
  truncated: boolean;
  /** The limit we asked for, when the envelope says so. */
  requestedLimit: number | null;
}

export function readListAccount(result: unknown): ListAccount {
  if (Array.isArray(result)) {
    // A bare array declares nothing. We do not guess: unknown is not "complete".
    return { count: result.length, truncated: false, requestedLimit: null };
  }
  if (!result || typeof result !== 'object') {
    return { count: null, truncated: false, requestedLimit: null };
  }
  const e = result as { count?: unknown; may_be_truncated?: unknown; requested_limit?: unknown };
  return {
    count: typeof e.count === 'number' ? e.count : null,
    truncated: e.may_be_truncated === true,
    requestedLimit: typeof e.requested_limit === 'number' ? e.requested_limit : null,
  };
}

/** What the badge shows: a floor when the list may be cut, an exact count otherwise. */
export function countLabel(a: ListAccount): string | null {
  if (a.count === null) return null;
  return a.truncated ? `≥ ${a.count}` : String(a.count);
}
