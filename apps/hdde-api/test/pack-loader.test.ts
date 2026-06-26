import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadPack, computePackHash } from '../server/engine';

const packDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'domain_packs',
  'enterprise_hidden_dependency_discovery',
);

describe('domain pack loader', () => {
  it('loads and validates the enterprise pack', () => {
    const pack = loadPack(packDir);
    expect(pack.id).toBe('enterprise_hidden_dependency_discovery');
    expect(pack.version).toBe('1.0.0');
    expect(pack.dimensions.length).toBe(9);
    expect(pack.questions.length).toBeGreaterThanOrEqual(9);
    expect(pack.personas.length).toBe(8);
    expect(pack.verdictRules.length).toBeGreaterThanOrEqual(3);
  });

  it('computes a stable sha256 pack hash', () => {
    const pack = loadPack(packDir);
    expect(pack.packHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    // Deterministic: recomputing yields the same hash.
    expect(computePackHash(packDir)).toBe(pack.packHash);
  });

  it('throws on a missing pack directory', () => {
    expect(() => loadPack('/nonexistent/pack/dir')).toThrow(/Missing domain pack files/);
  });
});
