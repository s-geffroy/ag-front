import { useState } from 'react';
import type { Contact } from '@ag/schema/cockpit';
import { useCockpit } from '@/store';
import { formatDate } from '@/lib/display';
import { Badge, Button, inputClass, Label, selectClass, Sheet } from '@/components/ui';
import { PageHeader } from '@/components/common';

export function AcquisitionPage() {
  const { state, saveContact } = useCockpit();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (!state) return <p className="text-sm text-muted">Chargement…</p>;

  const stages = state.config.contact_stages;
  const byStage = (id: string) => state.contacts.filter((c) => c.stage === id);
  const selected = state.contacts.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Acquisition"
        subtitle="Transformer la crédibilité publique en conversations qualifiées — ce n’est pas un CRM."
      />

      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
        {stages.map((s) => {
          const items = byStage(s.id);
          return (
            <div key={s.id} className="flex w-64 shrink-0 flex-col rounded-md bg-subtle">
              <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted">
                <span>{s.label}</span>
                <span className="rounded-full bg-surface px-1.5 py-0.5 tabular-nums">{items.length}</span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
                {items.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className="block w-full rounded-md border border-line bg-surface p-2.5 text-left shadow-sm hover:border-accent/40"
                  >
                    <div className="text-sm font-medium leading-snug">{c.organization}</div>
                    <div className="text-xs text-muted">{c.role}</div>
                    {c.interest_signal ? (
                      <div className="mt-1.5 text-[11px] text-muted">{c.interest_signal}</div>
                    ) : null}
                    <div className="mt-1.5">
                      <Badge tone="neutral">{c.profile_type}</Badge>
                    </div>
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
        title={selected?.organization}
      >
        {selected ? (
          <ContactDetail
            key={selected.id}
            contact={selected}
            stages={stages}
            onSave={async (c) => {
              await saveContact(c);
              setSelectedId(null);
            }}
          />
        ) : null}
      </Sheet>
    </div>
  );
}

function ContactDetail({
  contact,
  stages,
  onSave,
}: {
  contact: Contact;
  stages: { id: string; label: string }[];
  onSave: (c: Contact) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Contact>(contact);
  const set = (patch: Partial<Contact>) => setDraft((c) => ({ ...c, ...patch }));

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium">{draft.role}</div>
        <div className="text-xs text-muted">{draft.organization}</div>
      </div>

      <div>
        <Label>Étape du pipeline</Label>
        <select
          className={selectClass()}
          value={draft.stage}
          onChange={(e) => set({ stage: e.target.value as Contact['stage'] })}
        >
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Signal d’intérêt</Label>
        <textarea
          className={inputClass('h-14 py-1.5')}
          value={draft.interest_signal ?? ''}
          onChange={(e) => set({ interest_signal: e.target.value })}
        />
      </div>

      <div>
        <Label>Prochaine action</Label>
        <textarea
          className={inputClass('h-14 py-1.5')}
          value={draft.next_action}
          onChange={(e) => set({ next_action: e.target.value })}
        />
      </div>

      <div>
        <Label>Notes internes</Label>
        <textarea
          className={inputClass('h-14 py-1.5')}
          value={draft.notes ?? ''}
          onChange={(e) => set({ notes: e.target.value })}
        />
      </div>

      <div className="text-[11px] text-muted">Dernier contact : {formatDate(draft.last_contact_date)}</div>

      <div className="flex justify-end pt-2">
        <Button onClick={() => void onSave(draft)}>Enregistrer</Button>
      </div>
    </div>
  );
}
