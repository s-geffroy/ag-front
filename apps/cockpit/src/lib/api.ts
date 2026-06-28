import type {
  Contact,
  ContradictionReport,
  Deliverable,
  Milestone,
  Scorecard,
} from '@ag/schema/cockpit';
import type { ChokepointDetail, ChokepointList } from '@ag/chokepoints';
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
};
