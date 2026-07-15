import { BookLock } from 'lucide-react';
import type { ValidationEntry } from '@ag/schema/cockpit';
import { useCockpit } from '@/store';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

const targetKindLabel: Record<ValidationEntry['target_kind'], string> = {
  gate: 'Gate',
  munich: 'Munich',
  cvi: 'CVI',
  publication: 'Publication',
};

/**
 * Read-only view of the append-only human-validation journal (ADR 0046 / 0068) — the in-cockpit
 * replacement for the hand-edited markdown validation tables. Optionally scoped to a set of
 * deliverable ids (one output type). The most recent entries first.
 */
export function ValidationJournal({ deliverableIds }: { deliverableIds?: string[] }) {
  const { state } = useCockpit();
  if (!state) return null;
  const scope = deliverableIds ? new Set(deliverableIds) : null;
  const titleById = new Map(state.deliverables.map((d) => [d.id, d.title]));
  const entries = state.validation_journal
    .filter((e) => !scope || scope.has(e.deliverable_id))
    .slice()
    .sort((a, b) => (a.validated_at < b.validated_at ? 1 : -1));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookLock className="h-4 w-4 text-accent" />
          Journal de validation (nominatif, append-only)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted">
            Aucune validation enregistrée. Chaque validation nominative d'un gate (ADR 0046)
            s'inscrit ici — traçable, non réécrivable.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-2 py-1.5 font-medium">Date</th>
                  <th className="px-2 py-1.5 font-medium">Livrable</th>
                  <th className="px-2 py-1.5 font-medium">Cible</th>
                  <th className="px-2 py-1.5 font-medium">Décision</th>
                  <th className="px-2 py-1.5 font-medium">Réserve</th>
                  <th className="px-2 py-1.5 font-medium">Validé par</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-line/60 align-top">
                    <td className="whitespace-nowrap px-2 py-1.5 text-muted tabular-nums">
                      {formatDate(e.validated_at)}
                    </td>
                    <td className="px-2 py-1.5 text-ink">
                      {titleById.get(e.deliverable_id) ?? e.deliverable_id}
                    </td>
                    <td className="px-2 py-1.5 text-muted">
                      {targetKindLabel[e.target_kind]} · {e.target_id}
                    </td>
                    <td className="px-2 py-1.5">
                      <Badge tone={e.decision === 'validated' ? 'on_track' : 'blocked'}>
                        {e.decision === 'validated' ? 'validé' : 'rejeté'}
                      </Badge>
                    </td>
                    <td className="px-2 py-1.5 text-muted">{e.reserve || '—'}</td>
                    <td className="px-2 py-1.5 text-ink">{e.validated_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
