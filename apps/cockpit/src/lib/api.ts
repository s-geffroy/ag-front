import type { Contact, Deliverable, Milestone, Scorecard } from '@ag/schema/cockpit';
import type { CockpitState } from '../types';

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
  return (await res.json()) as T;
}

function put(body: unknown): RequestInit {
  return { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
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
};
