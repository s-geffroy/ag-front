import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { COVERED_PATHS, CONSUMERS } from './client';
import * as schemas from './schema';

/**
 * The guard that makes "the app consumes the whole API" a build-time property.
 *
 * Three levels, each closing a gap the level above cannot see:
 *
 *  1. PATH coverage    — every pinned endpoint has a TS client method (`COVERED_PATHS`).
 *  2. FIELD coverage   — every *required* property of every pinned schema is DECLARED in the
 *                        corresponding zod object. Because every schema is `.passthrough()`, an
 *                        undeclared field survives parsing but is invisible to consumers, so it is
 *                        never rendered. Path coverage alone is blind to this: it is exactly how the
 *                        0.4.0 `current_status` → `assessment_status` rename silently blanked two live
 *                        UIs, and how `ChokepointDetail.metrics[]` went unread for four minor versions.
 *  3. CONSUMER coverage — every pinned endpoint is claimed by at least one product surface, so an
 *                        endpoint cannot be "wired but unused".
 *
 * Deliberately shallow: we check top-level required properties of each component schema, and do not
 * recurse through unions/records. Deep structural comparison is brittle and low value; the producer
 * adds optional fields additively, so optional gaps are reported as a soft warning, never a failure.
 */

const PIN_PATH = fileURLToPath(
  new URL('../../../scripts/consumer/contract/openapi.json', import.meta.url),
);

type OpenApiSchema = {
  properties?: Record<string, unknown>;
  required?: string[];
};

type Spec = {
  paths?: Record<string, unknown>;
  components?: { schemas?: Record<string, OpenApiSchema> };
};

function spec(): Spec {
  return JSON.parse(readFileSync(PIN_PATH, 'utf8')) as Spec;
}

function pinnedPaths(): string[] {
  return Object.keys(spec().paths ?? {}).sort();
}

/**
 * Contract component → the zod object that models it. A component absent from this map is one we
 * have consciously decided not to model as a standalone type (see EXEMPT_COMPONENTS).
 */
const SCHEMA_MAP: Record<string, z.ZodTypeAny> = {
  ActorControlOut: schemas.ActorControlOut,
  ActorOut: schemas.ActorOut,
  AlertOut: schemas.AlertOut,
  AlternativeOut: schemas.AlternativeOut,
  AnalyticalResultOut: schemas.AnalyticalResultOut,
  ChokepointAnalysisDetail: schemas.ChokepointAnalysisDetail,
  ChokepointAnalysisList: schemas.ChokepointAnalysisList,
  ChokepointAnalysisSummary: schemas.ChokepointAnalysisSummary,
  ChokepointDetail: schemas.ChokepointDetail,
  ChokepointEpisodeOut: schemas.ChokepointEpisodeOut,
  ChokepointList: schemas.ChokepointList,
  ChokepointSummary: schemas.ChokepointSummary,
  CviAssessment: schemas.CviAssessmentOut,
  DerivedRelationGraphOut: schemas.DerivedRelationGraphOut,
  DerivedRelationOut: schemas.DerivedRelationOut,
  DimensionScore: schemas.CviDimensionScoreOut,
  EngineRunOut: schemas.EngineRunOut,
  EpisodeDetail: schemas.EpisodeDetail,
  EpisodeMemberOut: schemas.EpisodeMemberOut,
  EpisodeOut: schemas.EpisodeOut,
  EventSignalOut: schemas.EventSignalOut,
  FlowChokepointOut: schemas.FlowChokepointOut,
  FlowOut: schemas.FlowOut,
  GeometryOut: schemas.GeometryOut,
  MetricOut: schemas.MetricOut,
  PerceptionConsensusOut: schemas.PerceptionConsensusOut,
  PerceptionSignalList: schemas.PerceptionSignalList,
  PerceptionSignalOut: schemas.PerceptionSignalOut,
  RelationOut: schemas.RelationOut,
  RerouteDeltaOut: schemas.RerouteDeltaOut,
  RiskChokepointOut: schemas.RiskChokepointOut,
  RiskOut: schemas.RiskOut,
  SfuCompletenessOut: schemas.SfuCompletenessOut,
  SfuDimensionOut: schemas.SfuDimensionOut,
  SfuFicheOut: schemas.SfuFicheOut,
  SfuVerdictOut: schemas.SfuVerdictOut,
  SourceOut: schemas.SourceOut,
  StrategicFlowUnitList: schemas.StrategicFlowUnitList,
  StrategicFlowUnitSummary: schemas.StrategicFlowUnitSummary,
  StrategicSystemDetail: schemas.StrategicSystemDetail,
  StrategicSystemOut: schemas.StrategicSystemOut,
  SystemMemberOut: schemas.SystemMemberOut,
  SystemResilienceOut: schemas.SystemResilienceOut,
};

/** Components we intentionally do not model, each with the reason. */
const EXEMPT_COMPONENTS: Record<string, string> = {
  HTTPValidationError: 'FastAPI error envelope, never a success payload.',
  ValidationError: 'FastAPI error envelope, never a success payload.',
};

/**
 * Properties we intentionally refuse to declare, each with the reason. This is the ONLY place a
 * field may be knowingly left unconsumed, and every entry is a deliberate, reviewable decision.
 */
const EXEMPT_PROPERTIES: Record<string, Record<string, string>> = {
  CviAssessment: {
    // Hard gate, ADR 0049: no 0–100 aggregate without a documented methodology. The producer never
    // serves it; `CviAssessmentOut` actively strips it so a producer regression cannot leak it.
    aggregate_score: 'ADR 0049 — never served, and structurally stripped by CviAssessmentOut.',
  },
};

/** Unwrap the wrappers zod puts between us and the underlying ZodObject shape. */
function declaredKeys(schema: z.ZodTypeAny): Set<string> | null {
  let s: z.ZodTypeAny = schema;
  // `.transform()` (CviAssessmentOut) and `.default()` wrap the object.
  for (let i = 0; i < 10; i++) {
    const def = (s as unknown as { _def: Record<string, unknown> })._def;
    if (s instanceof z.ZodObject) return new Set(Object.keys(s.shape));
    if (def?.schema) s = def.schema as z.ZodTypeAny;
    else if (def?.innerType) s = def.innerType as z.ZodTypeAny;
    else return null;
  }
  return null;
}

describe('contract coverage — paths', () => {
  it('every pinned contract path has a TS client method (COVERED_PATHS)', () => {
    const covered = new Set<string>(COVERED_PATHS);
    const missing = pinnedPaths().filter((p) => !covered.has(p));
    expect(missing, `pinned contract paths with no TS client method: ${missing.join(', ')}`).toEqual(
      [],
    );
  });

  it('COVERED_PATHS has no duplicates', () => {
    expect(COVERED_PATHS.length).toBe(new Set(COVERED_PATHS).size);
  });
});

describe('contract coverage — fields', () => {
  const components = spec().components?.schemas ?? {};

  it('every pinned component schema is modelled or explicitly exempt', () => {
    const unmodelled = Object.keys(components).filter(
      (name) => !(name in SCHEMA_MAP) && !(name in EXEMPT_COMPONENTS),
    );
    expect(
      unmodelled,
      `contract components with no zod schema (add to SCHEMA_MAP or EXEMPT_COMPONENTS): ${unmodelled.join(', ')}`,
    ).toEqual([]);
  });

  it('every REQUIRED property of every pinned schema is declared in zod', () => {
    const gaps: string[] = [];
    for (const [name, zodSchema] of Object.entries(SCHEMA_MAP)) {
      const component = components[name];
      if (!component) continue; // pin is older than the client — allowed (pin ⊆ covered)
      const declared = declaredKeys(zodSchema);
      if (!declared) {
        gaps.push(`${name}: could not introspect zod shape`);
        continue;
      }
      const exempt = EXEMPT_PROPERTIES[name] ?? {};
      for (const prop of component.required ?? []) {
        if (!declared.has(prop) && !(prop in exempt)) gaps.push(`${name}.${prop}`);
      }
    }
    expect(gaps, `required contract fields not declared in zod: ${gaps.join(', ')}`).toEqual([]);
  });

  it('reports optional properties not yet consumed (soft — never fails the build)', () => {
    const soft: string[] = [];
    for (const [name, zodSchema] of Object.entries(SCHEMA_MAP)) {
      const component = components[name];
      if (!component) continue;
      const declared = declaredKeys(zodSchema);
      if (!declared) continue;
      const required = new Set(component.required ?? []);
      const exempt = EXEMPT_PROPERTIES[name] ?? {};
      for (const prop of Object.keys(component.properties ?? {})) {
        if (required.has(prop) || declared.has(prop) || prop in exempt) continue;
        soft.push(`${name}.${prop}`);
      }
    }
    // Optional additions are backward-compatible by contract, so this is a signal, not a gate.
    if (soft.length) console.warn(`[contract] optional fields not yet consumed: ${soft.join(', ')}`);
    expect(true).toBe(true);
  });

  it('aggregate_score is never declared, and is stripped at parse time (ADR 0049)', () => {
    expect(declaredKeys(schemas.CviAssessmentOut)?.has('aggregate_score')).toBe(false);
    const parsed = schemas.CviAssessmentOut.parse({
      chokepoint_id: 'p0_x',
      scale: '0-100',
      aggregate_score: 87,
      methodology_documented: true,
      dimensions: {},
    });
    expect('aggregate_score' in parsed).toBe(false);
  });
});

describe('contract coverage — product consumers', () => {
  it('every pinned contract path is claimed by at least one product surface', () => {
    const orphans = pinnedPaths().filter((p) => !CONSUMERS[p]?.length);
    expect(
      orphans,
      `pinned paths wired in the client but consumed by no product surface: ${orphans.join(', ')}`,
    ).toEqual([]);
  });

  it('CONSUMERS only references paths that exist in the pin', () => {
    const pinned = new Set(pinnedPaths());
    const stale = Object.keys(CONSUMERS).filter((p) => !pinned.has(p));
    expect(stale, `CONSUMERS entries not present in the pinned contract: ${stale.join(', ')}`).toEqual(
      [],
    );
  });
});
