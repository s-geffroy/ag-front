import { Check, Circle, Minus } from 'lucide-react';
import type { Deliverable, DeliverableType, MunichStatus } from '@ag/schema/cockpit';
import { useCockpit } from '@/store';
import { munichControls, munichModeLabel, type MunichMode } from '@/lib/munich';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

const munichModeTone: Record<MunichMode, 'on_track' | 'accent' | 'neutral'> = {
  machine: 'on_track',
  humain: 'neutral',
  mixte: 'accent',
};

// Click cycles a control's status: todo → ok → na → todo.
const nextMunich = (s: MunichStatus | undefined): MunichStatus =>
  s === 'todo' || s === undefined ? 'ok' : s === 'ok' ? 'na' : 'todo';

// Column header: the distinctive tail of a deliverable title (after the em dash), trimmed.
const shortTitle = (t: string): string => {
  const tail = t.includes('—') ? t.split('—').pop()!.trim() : t;
  return tail.length > 18 ? `${tail.slice(0, 17)}…` : tail;
};

function MunichCell({ status }: { status: MunichStatus | undefined }) {
  if (status === 'ok') return <Check className="mx-auto h-4 w-4 text-status-on_track" />;
  if (status === 'na') return <Minus className="mx-auto h-4 w-4 text-muted" />;
  return <Circle className="mx-auto h-3.5 w-3.5 text-status-at_risk" />; // todo / unset
}

/**
 * Munich Charter checklist matrix — the operational definition of the `compliance_done` gate
 * (ADR 0037). One column per editorial deliverable (those carrying a `munich` map); optionally
 * scoped to one output type.
 */
export function MunichMatrix({ typeFilter }: { typeFilter?: DeliverableType }) {
  const { state, saveDeliverable } = useCockpit();
  if (!state) return null;
  const editorial = state.deliverables.filter(
    (d) => d.munich && (!typeFilter || d.type === typeFilter),
  );
  const setMunich = (d: Deliverable, n: number, current: MunichStatus | undefined) =>
    saveDeliverable({ ...d, munich: { ...(d.munich ?? {}), [n]: nextMunich(current) } });

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Conformité Charte de Munich — définit « Conformité »</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-muted">
          <span className="font-medium text-ink">compliance_done</span> n’est coché qu’une fois les
          10 contrôles satisfaits. Les contrôles « Auto » sont imposés au build/CI (
          <code className="text-xs">check:munich</code>) — un contenu non conforme ne peut pas être
          publié ; les autres relèvent de la revue humaine. Cliquez une cellule pour cycler le
          statut (<Circle className="inline h-3 w-3 text-status-at_risk" /> à faire →{' '}
          <Check className="inline h-3 w-3 text-status-on_track" /> ok →{' '}
          <Minus className="inline h-3 w-3 text-muted" /> n/a).
        </p>
        {editorial.length === 0 ? (
          <p className="text-sm text-muted">
            Aucun livrable éditorial avec suivi Munich pour ce type.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-2 py-2 font-medium">Contrôle (devoir)</th>
                  <th className="px-2 py-2 font-medium">Mode</th>
                  {editorial.map((d) => (
                    <th key={d.id} className="px-2 py-2 text-center font-medium" title={d.title}>
                      {shortTitle(d.title)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {munichControls.map((c) => (
                  <tr key={c.n} className="border-b border-line/60">
                    <td className="px-2 py-2">
                      <span className="font-mono text-xs text-muted">
                        {String(c.n).padStart(2, '0')}
                      </span>{' '}
                      <span className="text-ink" title={c.control}>
                        {c.duty}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <Badge tone={munichModeTone[c.mode]}>{munichModeLabel[c.mode]}</Badge>
                    </td>
                    {editorial.map((d) => {
                      const status = d.munich?.[String(c.n)];
                      return (
                        <td key={d.id} className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() => setMunich(d, c.n, status)}
                            title="Cliquer pour changer le statut"
                            className="mx-auto block rounded p-1 hover:bg-subtle"
                          >
                            <MunichCell status={status} />
                          </button>
                        </td>
                      );
                    })}
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
