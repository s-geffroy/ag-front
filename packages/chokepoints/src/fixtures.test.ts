import { describe, expect, it } from 'vitest';
import {
  FIXTURE_RECORD_IDS,
  isFixtureRecord,
  mayBeTruncated,
  toPublicFeatureCollection,
  type GeoJsonFeatureCollection,
} from './schema';

const feature = (id: string) => ({
  type: 'Feature',
  geometry: null,
  properties: { id, name: `node ${id}`, family: 'maritime_strait' },
});

describe('isFixtureRecord', () => {
  it('flags the producer fixtures we know about', () => {
    // `cp_alpha` ("Alpha Strait") shipped publicly until 2026-08-10 — this is the regression.
    expect(isFixtureRecord('cp_alpha')).toBe(true);
    for (const id of FIXTURE_RECORD_IDS) expect(isFixtureRecord(id)).toBe(true);
  });

  it('leaves real corridors alone', () => {
    expect(isFixtureRecord('p0_maritime_strait_strait_of_hormuz')).toBe(false);
    expect(isFixtureRecord('p0_maritime_canal_suez_canal')).toBe(false);
    // Matching is exact: a real id that merely contains a fixture id must survive.
    expect(isFixtureRecord('p0_cp_alpha_real_corridor')).toBe(false);
  });

  it('tolerates a missing id rather than throwing mid-build', () => {
    expect(isFixtureRecord(null)).toBe(false);
    expect(isFixtureRecord(undefined)).toBe(false);
  });
});

describe('toPublicFeatureCollection', () => {
  it('drops fixture features and keeps the real ones', () => {
    const fc: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: [feature('cp_alpha'), feature('p0_maritime_canal_suez_canal')],
    };
    const out = toPublicFeatureCollection(fc);
    expect(out.features).toHaveLength(1);
    expect((out.features[0].properties as Record<string, unknown>).id).toBe(
      'p0_maritime_canal_suez_canal',
    );
  });

  it('still projects onto the public property allowlist', () => {
    const fc: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: null,
          properties: { id: 'p0_maritime_canal_suez_canal', internal_note: 'secret' },
        },
      ],
    };
    const props = toPublicFeatureCollection(fc).features[0].properties as Record<string, unknown>;
    expect(props).not.toHaveProperty('internal_note');
    expect(props.id).toBe('p0_maritime_canal_suez_canal');
  });

  it('survives a feature with no properties at all', () => {
    const fc: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: null, properties: null }],
    };
    expect(() => toPublicFeatureCollection(fc)).not.toThrow();
    expect(toPublicFeatureCollection(fc).features).toHaveLength(1);
  });
});

describe('mayBeTruncated', () => {
  // Mesuré le 2026-08-10 : Ormuz rend exactement `limit` à 500, 900 et 2000 ; Malacca rend 53 quelle
  // que soit la limite. Les deux réponses ont la même forme — c'est tout le problème.
  it('doute d’une page pleine, et seulement d’elle', () => {
    expect(mayBeTruncated(new Array(500), 500)).toBe(true);
    expect(mayBeTruncated(new Array(53), 500)).toBe(false);
    expect(mayBeTruncated([], 500)).toBe(false);
  });

  it('doute aussi si l’amont rend PLUS que demandé — on ne suppose pas qu’il obéit', () => {
    expect(mayBeTruncated(new Array(501), 500)).toBe(true);
  });
});
