import type {
  Contact,
  ContradictionReport,
  Deliverable,
  JudgeGateVerdict,
  JudgeReport,
  Milestone,
  Scorecard,
  ValidationEntry,
} from '@ag/schema/cockpit';
import type {
  AlertOut,
  ChokepointAnalysis,
  ChokepointDetail,
  ChokepointList,
  CviAssessmentOut,
  CviCounterfactualOut,
  DerivedRelationGraphOut,
  NewsFeedOut,
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

/** Payload for a nominative gate validation (mirrors the server's ValidateBody, ADR 0046 / 0068). */
export interface ValidatePayload {
  target_kind: 'gate' | 'munich' | 'cvi';
  target_id: string;
  decision: 'validated' | 'rejected';
  reserve?: string;
  validated_by: string;
  judge_verdict_snapshot?: JudgeGateVerdict;
}

/** Plaquette state (mirrors server/plaquette.ts, ADR 0073). */
export interface PlaquetteLanguageStatus {
  lang: 'fr' | 'en';
  slides: number;
  pptx: { file: string; bytes: number | null };
  pdf: { file: string; bytes: number | null };
  previews: string[];
  substitutionPreviews: string[];
}
export interface PlaquetteFamilyStatus {
  family: string;
  updated: string;
  published: boolean;
  languages: PlaquetteLanguageStatus[];
}
export interface PlaquetteStatus {
  families: PlaquetteFamilyStatus[];
  pageBuilt: boolean;
  /** 'served' = live in dist, 'withheld' = built but gated, 'none' = site not rebuilt since the deck. */
  previewSource: 'served' | 'withheld' | 'none';
  /** Families the CURRENTLY BUILT public page contains — not the same as those published now. */
  pageContains: string[];
}

/** Payload for a one-click publish / unpublish (mirrors the server, ADR 0069). */
export interface PublishPayload {
  decision: 'publish' | 'unpublish';
  validated_by: string;
  reserve?: string;
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
  // Editorial LLM judge / pré-validation (ADR 0068). The report is a candidate pending human validation.
  runJudgement: (type: string, slug: string) =>
    fetch(`/api/judgements/${encodeURIComponent(type)}/${encodeURIComponent(slug)}/run`, {
      method: 'POST',
    }).then(asJson<JudgeReport>),
  reviewJudgement: (type: string, slug: string, status: 'pending' | 'reviewed') =>
    fetch(
      `/api/judgements/${encodeURIComponent(type)}/${encodeURIComponent(slug)}/review`,
      put({ status }),
    ).then(asJson<JudgeReport>),
  // Nominative gate validation: ticks one gate AND writes the append-only journal (ADR 0046 / 0068).
  validateGate: (deliverableId: string, payload: ValidatePayload) =>
    fetch(`/api/deliverables/${encodeURIComponent(deliverableId)}/validate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(asJson<{ entry: ValidationEntry; deliverable: Deliverable }>),
  // One-click publish (ADR 0069): flips the frontmatter flag (gated), journals it, touches the host
  // rebuild sentinel. Going live still needs the host rebuild (watcher, ~2 min).
  publishDoc: (type: string, slug: string, payload: PublishPayload) =>
    fetch(`/api/publish/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(asJson<{ published: boolean; entry: ValidationEntry; pending_rebuild: boolean }>),
  // Plaquette review (ADR 0073). The deck is produced by scripts/build-deck.sh; the cockpit only reads
  // its state, serves the artifacts for review, and records the publication decision.
  getPlaquette: () => fetch('/api/plaquette').then(asJson<PlaquetteStatus>),
  publishPlaquette: (family: string, payload: PublishPayload) =>
    fetch(`/api/plaquette/${encodeURIComponent(family)}/publish`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(asJson<{ published: boolean; entry: ValidationEntry; pending_rebuild: boolean }>),
  // Promote / unpromote a news cluster to the public Atlas (ADR 0071). The server re-fetches the feed
  // and takes the reliable fields from THAT, refuses a tainted cluster, journals the nominative act, and
  // touches the host rebuild sentinel. Going live still needs the host rebuild (watcher, ~2 min).
  promoteNews: (
    corridorId: string,
    payload: {
      cluster_id?: string;
      article_urls?: string[];
      validated_by: string;
      reserve?: string;
    },
  ) =>
    fetch(`/api/promote-news/${encodeURIComponent(corridorId)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(asJson<{ promoted: unknown; entry: ValidationEntry; pending_rebuild: boolean }>),
  unpromoteNews: (corridorId: string, key: string, validated_by: string) =>
    fetch(`/api/promote-news/${encodeURIComponent(corridorId)}/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ validated_by }),
    }).then(asJson<{ unpromoted: boolean; entry: ValidationEntry; pending_rebuild: boolean }>),
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
  getStrategicFlows: () =>
    fetch('/api/explore/strategic-flows').then(asJson<StrategicFlowUnitList>),
  getStrategicFlowFiche: (id: string) =>
    fetch(`/api/explore/strategic-flows/${encodeURIComponent(id)}/fiche`).then(asJson<SfuFicheOut>),
  getStrategicFlowVerdict: (id: string) =>
    fetch(`/api/explore/strategic-flows/${encodeURIComponent(id)}/verdict`).then(
      asJson<SfuVerdictOut | null>,
    ),
  getVocabularies: () => fetch('/api/explore/vocabularies').then(asJson<VocabulariesOut>),
  // Live chokepoint news (ADR 0070). Candidates, never confirmed incidents. `run_notes` must be shown.
  getNews: (params = 'since=7&limit=50') =>
    fetch(`/api/explore/news?${params}`).then(asJson<NewsFeedOut>),
  getCorridorNews: (id: string) =>
    fetch(`/api/explore/chokepoints/${encodeURIComponent(id)}/news`).then(asJson<NewsFeedOut>),
  getCviCounterfactual: (scope = 'core') =>
    fetch(`/api/explore/analytics/cvi-counterfactual?scope=${encodeURIComponent(scope)}`).then(
      asJson<CviCounterfactualOut>,
    ),
  getAlerts: () => fetch('/api/explore/alerts').then(asJson<AlertOut[]>),
  exploreText: (path: string) =>
    fetch(`/api/explore/${path}`).then((r) =>
      r.ok ? r.text() : Promise.reject(new Error(`${r.status} ${r.statusText}`)),
    ),
};
