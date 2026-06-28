import { describe, it, expect } from 'vitest';
import { ContradictionAnalysis } from '@ag/schema/cockpit';
import { facade, llmAvailable } from './contradiction';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';

describe('contradiction facade', () => {
  it('returns a schema-valid analysis labelled as offline (never mistaken for a real run)', () => {
    const a = facade();
    // Re-parsing proves it satisfies the canonical schema.
    expect(() => ContradictionAnalysis.parse(a)).not.toThrow();
    expect(a.do_not_conclude.length).toBeGreaterThan(0);
    expect(a.summary.toLowerCase()).toContain('façade');
  });

  it('is unavailable without an explicit key + flag (offline by default)', () => {
    // No LLM env is set in the test runner, so the tool must fall back to the facade.
    expect(llmAvailable()).toBe(false);
  });
});

describe('contradiction prompt', () => {
  it('forbids inventing facts and forces a single JSON object', () => {
    expect(SYSTEM_PROMPT).toMatch(/N'invente aucun fait/);
    expect(SYSTEM_PROMPT).toMatch(/UN objet JSON/);
  });

  it('embeds the document title and body in the user prompt', () => {
    const p = buildUserPrompt({
      contentType: 'dossiers',
      title: 'Mer Rouge / Suez',
      body: 'Le contournement par le Cap est une alternative crédible.',
    });
    expect(p).toContain('Mer Rouge / Suez');
    expect(p).toContain('contournement par le Cap');
    expect(p).toContain('dossiers');
  });
});
