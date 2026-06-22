import type { Deliverable, DeliverableType, Offer, Pillar, Priority, StatusId } from '@ag/schema/cockpit';

export type KanbanFilter = {
  priority: Priority[];
  type: DeliverableType[];
  pillar: Pillar[];
  offer: Offer[];
  withBlockerOnly: boolean;
  query: string;
};

export const emptyFilter: KanbanFilter = {
  priority: [],
  type: [],
  pillar: [],
  offer: [],
  withBlockerOnly: false,
  query: '',
};

export function filterActive(f: KanbanFilter): boolean {
  return (
    f.priority.length > 0 ||
    f.type.length > 0 ||
    f.pillar.length > 0 ||
    f.offer.length > 0 ||
    f.withBlockerOnly ||
    f.query.trim().length > 0
  );
}

export function applyFilter(items: Deliverable[], f: KanbanFilter): Deliverable[] {
  const q = f.query.trim().toLowerCase();
  return items.filter((d) => {
    if (f.priority.length && !f.priority.includes(d.priority)) return false;
    if (f.type.length && !f.type.includes(d.type)) return false;
    if (f.pillar.length && !f.pillar.includes(d.pillar)) return false;
    if (f.offer.length && !f.offer.includes(d.offer)) return false;
    if (f.withBlockerOnly && !(d.blocker && d.blocker.trim())) return false;
    if (q && !(d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

export function groupByStatus(items: Deliverable[], statuses: StatusId[]): Record<string, Deliverable[]> {
  const groups: Record<string, Deliverable[]> = {};
  for (const s of statuses) groups[s] = [];
  for (const d of items) (groups[d.status] ??= []).push(d);
  return groups;
}
