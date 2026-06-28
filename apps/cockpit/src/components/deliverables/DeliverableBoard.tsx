import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Deliverable, DeliverableType, StatusId } from '@ag/schema/cockpit';
import { useCockpit } from '@/store';
import { applyFilter, emptyFilter, groupByStatus, type KanbanFilter } from '@/lib/filters';
import { formatDate, gateLabel, typeLabel } from '@/lib/display';
import {
  Button,
  inputClass,
  Label,
  Progress,
  selectClass,
  Separator,
  Sheet,
} from '@/components/ui';
import { GateBadge, OfferBadge, PriorityBadge, TypeBadge } from '@/components/common';

const GATE_FIELDS: { key: keyof Deliverable['gates']; label: string }[] = [
  { key: 'sources_ok', label: 'Sources OK' },
  { key: 'llm_draft_done', label: 'Brouillon LLM' },
  { key: 'contradiction_done', label: 'Contradiction LLM' },
  { key: 'compliance_done', label: 'Conformité' },
  { key: 'human_review_done', label: 'Revue humaine' },
  { key: 'cvi_justified', label: 'CVI justifié' },
];

/**
 * The shared production board (backlog → publié) with its filter bar and per-item edit sheet.
 * - `forcedType` locks the board to a single output type and hides the type selector (per-type
 *   advancement inside an output workspace).
 * - `showTypeFilter` exposes the "all types" dropdown (global pipeline in Suivi projet).
 * Tracking status/gates is allowed here — this is project tracking, not content authoring.
 */
export function DeliverableBoard({
  forcedType,
  showTypeFilter = false,
}: {
  forcedType?: DeliverableType;
  showTypeFilter?: boolean;
}) {
  const { state, saveDeliverable } = useCockpit();
  const [filter, setFilter] = useState<KanbanFilter>(emptyFilter);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // forcedType always wins over the dropdown so an output workspace stays scoped to its type.
  const effectiveFilter = useMemo<KanbanFilter>(
    () => (forcedType ? { ...filter, type: [forcedType] } : filter),
    [filter, forcedType],
  );
  const filtered = useMemo(
    () => (state ? applyFilter(state.deliverables, effectiveFilter) : []),
    [state, effectiveFilter],
  );
  if (!state) return <p className="text-sm text-muted">Chargement…</p>;

  const statuses = state.config.statuses;
  const groups = groupByStatus(filtered, statuses.map((s) => s.id) as StatusId[]);
  const selected = state.deliverables.find((d) => d.id === selectedId) ?? null;

  const togglePriority = (p: Deliverable['priority']) =>
    setFilter((f) => ({
      ...f,
      priority: f.priority.includes(p) ? f.priority.filter((x) => x !== p) : [...f.priority, p],
    }));

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          className={inputClass('h-8 w-56')}
          placeholder="Rechercher…"
          value={filter.query}
          onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
        />
        <div className="flex gap-1">
          {(['P0', 'P1', 'P2', 'P3'] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={filter.priority.includes(p) ? 'default' : 'outline'}
              onClick={() => togglePriority(p)}
            >
              {p}
            </Button>
          ))}
        </div>
        {showTypeFilter ? (
          <select
            className={selectClass('h-8 w-40')}
            value={filter.type[0] ?? ''}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                type: e.target.value ? [e.target.value as Deliverable['type']] : [],
              }))
            }
          >
            <option value="">Tous les types</option>
            {state.config.types.map((t) => (
              <option key={t} value={t}>
                {typeLabel[t] ?? t}
              </option>
            ))}
          </select>
        ) : null}
        <Button
          size="sm"
          variant={filter.withBlockerOnly ? 'default' : 'outline'}
          onClick={() => setFilter((f) => ({ ...f, withBlockerOnly: !f.withBlockerOnly }))}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Avec blocage
        </Button>
      </div>

      {/* Board */}
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
        {statuses.map((s) => {
          const items = groups[s.id] ?? [];
          return (
            <div key={s.id} className="flex w-72 shrink-0 flex-col rounded-md bg-subtle">
              <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted">
                <span>{s.label}</span>
                <span className="rounded-full bg-surface px-1.5 py-0.5 tabular-nums">
                  {items.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
                {items.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    className="block w-full rounded-md border border-line bg-surface p-2.5 text-left shadow-sm hover:border-accent/40"
                  >
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={d.priority} />
                      <TypeBadge type={d.type} />
                    </div>
                    <div className="mt-1.5 text-sm font-medium leading-snug">{d.title}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={d.progress} />
                      <span className="text-[11px] text-muted tabular-nums">{d.progress}%</span>
                    </div>
                    {d.blocker ? (
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-status-blocked">
                        <AlertTriangle className="h-3 w-3" />
                        Bloqué
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Sheet
        open={selected !== null}
        onOpenChange={(o) => !o && setSelectedId(null)}
        title={selected?.title}
      >
        {selected ? (
          <DeliverableDetail
            key={selected.id}
            deliverable={selected}
            statuses={statuses}
            onSave={async (d) => {
              await saveDeliverable(d);
              setSelectedId(null);
            }}
          />
        ) : null}
      </Sheet>
    </div>
  );
}

function DeliverableDetail({
  deliverable,
  statuses,
  onSave,
}: {
  deliverable: Deliverable;
  statuses: { id: string; label: string }[];
  onSave: (d: Deliverable) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Deliverable>(deliverable);
  const set = (patch: Partial<Deliverable>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={draft.priority} />
        <TypeBadge type={draft.type} />
        <OfferBadge offer={draft.offer} />
        <GateBadge status={draft.quality_gate_status} />
      </div>

      <p className="text-sm text-muted">{draft.description}</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Statut</Label>
          <select
            className={selectClass()}
            value={draft.status}
            onChange={(e) => set({ status: e.target.value as Deliverable['status'] })}
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Échéance</Label>
          <div className="flex h-8 items-center text-sm">{formatDate(draft.deadline)}</div>
        </div>
      </div>

      <div>
        <Label>Avancement : {draft.progress}%</Label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={draft.progress}
          onChange={(e) => set({ progress: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      </div>

      <div>
        <Label>Prochaine action</Label>
        <textarea
          className={inputClass('h-16 py-1.5')}
          value={draft.next_action}
          onChange={(e) => set({ next_action: e.target.value })}
        />
      </div>

      <div>
        <Label>Blocage</Label>
        <textarea
          className={inputClass('h-14 py-1.5')}
          placeholder="Aucun"
          value={draft.blocker ?? ''}
          onChange={(e) => set({ blocker: e.target.value })}
        />
      </div>

      <Separator />

      <div>
        <Label>Quality gates</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {GATE_FIELDS.map(({ key, label }) => {
            const value = draft.gates[key];
            const checked = value === true;
            const disabled = key === 'cvi_justified' && draft.gates.cvi_justified === undefined;
            return (
              <label
                key={key}
                className={`flex items-center gap-2 text-sm ${disabled ? 'opacity-40' : ''}`}
              >
                <input
                  type="checkbox"
                  className="accent-accent"
                  checked={checked}
                  disabled={disabled}
                  onChange={(e) => set({ gates: { ...draft.gates, [key]: e.target.checked } })}
                />
                {label}
              </label>
            );
          })}
        </div>
        <p className="mt-1 text-[11px] text-muted">
          {gateLabel[draft.quality_gate_status]} — un livrable peut être prêt mais bloqué
          méthodologiquement.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={() => void onSave(draft)}>Enregistrer</Button>
      </div>
    </div>
  );
}
