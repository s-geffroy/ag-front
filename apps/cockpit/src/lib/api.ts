import type {
  Contact,
  ContradictionReport,
  Deliverable,
  Milestone,
  Scorecard,
} from '@ag/schema/cockpit';
import type {
  ChokepointAnalysis,
  ChokepointDetail,
  ChokepointList,
  CviAssessmentOut,
  DerivedRelationGraphOut,
  PerceptionSignalList,
  StrategicFlowUnitList,
  SfuFicheOut,
  SfuVerdictOut,
  SystemResilienceOut,
  VocabulariesOut,
} from '@ag/chokepoints';
import type { CockpitState } from '../types';

/** A candidate editorial artifact rendered for in-cockpit review (mirrors server/content.ts). */
export interface RenderedContent {
  type: 'atlas' | 'dossiers' | 'notes';
  slug: string;
  data: Record<string, unknown>;
  html: string;
  full: boolean;
}

/** One-line summary of an editorial artifact for the review index (mirrors server/content.ts). */
export interface ContentSummary {
  type: 'atlas' | 'dossiers' | 'notes';
  slug: string;
  title: string;
  published: boolean;
  access?: string;
  confidence?: string;
  sources: number;
  corrections: number;
  date?: string;
  full: boolean;
}

/** One-line summary of an internal reference doc (mirrors server/reference.ts). */
export interface ReferenceSummary {
  slug: string;
  title: string;
  summary?: string;
  updated?: string;
  order: number;
}

/** A rendered internal reference doc (mirrors server/reference.ts). */
export interface RenderedReference {
  slug: string;
  data: Record<string, unknown>;
  html: string;
}

/** A deposited source file (mirrors server/uploads.ts). */
export interface UploadEntry {
  id: string;
  original_name: string;
  stored_name: string;
  size: number;
  mime: string;
  ext: string;
  uploaded_at: string;
  deliverable_id?: string;
  note?: string;
}

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = '';
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status} ${res.statusText} ${detail}`);
  }
  // Guard against an HTML response (e.g. a stale server falling through to the SPA): parsing it as
  // JSON throws an opaque SyntaxError. Fail with an actionable message instead.
  if (!(res.headers.get('content-type') ?? '').includes('application/json')) {
    throw new Error('Réponse non-JSON du serveur — le cockpit doit probablement être redémarré.');
  }
  return (await res.json()) as T;
}

function put(body: unknown): RequestInit {
  return {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const api = {
  getState: () => fetch('/api/state').then(asJson<CockpitState>),
  putDeliverable: (d: Deliverable) =>
    fetch(`/api/deliverables/${encodeURIComponent(d.id)}`, put(d)).then(asJson<Deliverable>),
  putMilestone: (m: Milestone) =>
    fetch(`/api/milestones/${encodeURIComponent(m.id)}`, put(m)).then(asJson<Milestone>),
  putContact: (c: Contact) =>
    fetch(`/api/contacts/${encodeURIComponent(c.id)}`, put(c)).then(asJson<Contact>),
  putMetrics: (s: Scorecard) => fetch('/api/metrics', put(s)).then(asJson<Scorecard>),
  getChokepoints: (priority?: string) =>
    fetch(`/api/chokepoints${priority ? `?priority=${encodeURIComponent(priority)}` : ''}`).then(
      asJson<ChokepointList>,
    ),
  getChokepointDetail: (id: string) =>
    fetch(`/api/chokepoints/${encodeURIComponent(id)}`).then(asJson<ChokepointDetail>),
  listContent: () => fetch('/api/content').then(asJson<ContentSummary[]>),
  getContent: (type: string, slug: string) =>
    fetch(`/api/content/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`).then(
      asJson<RenderedContent>,
    ),
  listReferences: () => fetch('/api/reference').then(asJson<ReferenceSummary[]>),
  getReference: (slug: string) =>
    fetch(`/api/reference/${encodeURIComponent(slug)}`).then(asJson<RenderedReference>),
  listUploads: (deliverableId?: string) =>
    fetch(
      `/api/uploads${deliverableId ? `?deliverable_id=${encodeURIComponent(deliverableId)}` : ''}`,
    ).then(asJson<UploadEntry[]>),
  uploadFiles: (form: FormData) =>
    fetch('/api/uploads', { method: 'POST', body: form }).then(asJson<UploadEntry[]>),
  deleteUpload: (id: string) =>
    fetch(`/api/uploads/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(
      asJson<{ removed: boolean }>,
    ),
  uploadRawUrl: (id: string) => `/api/uploads/${encodeURIComponent(id)}/raw`,
  // Editorial contradiction (ADR 0039). The report is a candidate pending human validation.
  runContradiction: (type: string, slug: string) =>
    fetch(`/api/contradictions/${encodeURIComponent(type)}/${encodeURIComponent(slug)}/run`, {
      method: 'POST',
    }).then(asJson<ContradictionReport>),
  reviewContradiction: (type: string, slug: string, status: 'pending' | 'reviewed') =>
    fetch(
      `/api/contradictions/${encodeURIComponent(type)}/${encodeURIComponent(slug)}/review`,
      put({ status }),
    ).then(asJson<ContradictionReport>),
  // --- Read-API Explorateur (server-side proxy over the full Chokepoints read surface) ---
  // `path` is a pre-built relative path (e.g. "actors", "chokepoints/p0_x/fiche"); callers assemble
  // it from the resource registry. Returns parsed JSON, or raw text for the JSONL export.
  exploreResource: (path: string) => fetch(`/api/explore/${path}`).then(asJson<unknown>),
  // Typed reads of the endpoints the cockpit actually renders (the raw `exploreResource` stays for
  // the long tail surfaced as JSON in the Explorateur).
  getSystemResilience: () =>
    fetch('/api/explore/analytics/system-resilience').then(asJson<SystemResilienceOut>),
  getDerivedRelations: (params = 'limit=200') =>
    fetch(`/api/explore/derived/relations?${params}`).then(asJson<DerivedRelationGraphOut>),
  getCorridorCvi: (id: string) =>
    fetch(`/api/explore/chokepoints/${encodeURIComponent(id)}/cvi-assessment`).then(
      asJson<CviAssessmentOut>,
    ),
  getCorridorAnalysis: (id: string) =>
    fetch(`/api/explore/chokepoints/${encodeURIComponent(id)}/analysis`).then(
      asJson<ChokepointAnalysis>,
    ),
  getCorridorPerception: (id: string) =>
    fetch(`/api/explore/chokepoints/${encodeURIComponent(id)}/perception-signals`).then(
      asJson<PerceptionSignalList>,
    ),
  getStrategicFlows: () => fetch('/api/explore/strategic-flows').then(asJson<StrategicFlowUnitList>),
  getStrategicFlowFiche: (id: string) =>
    fetch(`/api/explore/strategic-flows/${encodeURIComponent(id)}/fiche`).then(asJson<SfuFicheOut>),
  getStrategicFlowVerdict: (id: string) =>
    fetch(`/api/explore/strategic-flows/${encodeURIComponent(id)}/verdict`).then(
      asJson<SfuVerdictOut | null>,
    ),
  getVocabularies: () => fetch('/api/explore/vocabularies').then(asJson<VocabulariesOut>),
  exploreText: (path: string) =>
    fetch(`/api/explore/${path}`).then((r) =>
      r.ok ? r.text() : Promise.reject(new Error(`${r.status} ${r.statusText}`)),
    ),
};
