import { describe, it, expect } from 'vitest';
import { decodeHtmlEntities } from './display';

describe('decodeHtmlEntities', () => {
  it('decodes the numeric hex entity the GKG feed leaks (&#x2013; → en dash)', () => {
    expect(decodeHtmlEntities('US&#x2013;Iran')).toBe('US–Iran');
  });

  it('decodes decimal numeric entities', () => {
    expect(decodeHtmlEntities('US&#8211;Iran')).toBe('US–Iran');
  });

  it('decodes the common named entities', () => {
    expect(decodeHtmlEntities('Oil &amp; Gas')).toBe('Oil & Gas');
    expect(decodeHtmlEntities('&quot;seizure&quot;')).toBe('"seizure"');
    expect(decodeHtmlEntities('&lt;tag&gt;')).toBe('<tag>');
  });

  it('leaves an unknown entity verbatim rather than guessing', () => {
    expect(decodeHtmlEntities('a &foobar; b')).toBe('a &foobar; b');
  });

  it('returns empty string for null/undefined/empty (honest empty, no throw)', () => {
    expect(decodeHtmlEntities(null)).toBe('');
    expect(decodeHtmlEntities(undefined)).toBe('');
    expect(decodeHtmlEntities('')).toBe('');
  });

  it('passes plain text through untouched', () => {
    expect(decodeHtmlEntities('Strait of Hormuz')).toBe('Strait of Hormuz');
  });
});
