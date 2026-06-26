// Structural diff between two diagnostic-packet payloads: verdict change + per-dimension score deltas
// + pattern/red-flag set changes. Used to compare versions (api_contract: diff endpoint).

interface ScoreLike {
  dimension_id: string;
  value: number;
  confidence: string;
}
interface PayloadLike {
  operational_verdict: string;
  confidence: string;
  scores: ScoreLike[];
  activated_patterns: { id: string }[];
  red_flags: { id: string }[];
}

export interface PacketDiff {
  verdict: { from: string; to: string; changed: boolean };
  confidence: { from: string; to: string; changed: boolean };
  scores: { dimension_id: string; from: number; to: number; delta: number }[];
  patterns_added: string[];
  patterns_removed: string[];
  red_flags_added: string[];
  red_flags_removed: string[];
}

export function diffPackets(from: PayloadLike, to: PayloadLike): PacketDiff {
  const fromScores = new Map(from.scores.map((s) => [s.dimension_id, s.value]));
  const dims = new Set([...from.scores, ...to.scores].map((s) => s.dimension_id));
  const scores = [...dims].map((id) => {
    const a = fromScores.get(id) ?? 0;
    const b = to.scores.find((s) => s.dimension_id === id)?.value ?? 0;
    return { dimension_id: id, from: a, to: b, delta: b - a };
  });

  const setDiff = (a: { id: string }[], b: { id: string }[]): string[] => {
    const bs = new Set(b.map((x) => x.id));
    return a.map((x) => x.id).filter((id) => !bs.has(id));
  };

  return {
    verdict: {
      from: from.operational_verdict,
      to: to.operational_verdict,
      changed: from.operational_verdict !== to.operational_verdict,
    },
    confidence: {
      from: from.confidence,
      to: to.confidence,
      changed: from.confidence !== to.confidence,
    },
    scores: scores.filter((s) => s.delta !== 0),
    patterns_added: setDiff(to.activated_patterns, from.activated_patterns),
    patterns_removed: setDiff(from.activated_patterns, to.activated_patterns),
    red_flags_added: setDiff(to.red_flags, from.red_flags),
    red_flags_removed: setDiff(from.red_flags, to.red_flags),
  };
}
