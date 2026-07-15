import { useState } from 'react';
import { Check, Circle, Minus } from 'lucide-react';
import type { Deliverable, DeliverableType, GateVerdict, MunichStatus } from '@ag/schema/cockpit';
import { useCockpit } from '@/store';
import { munichControls, munichModeLabel, type MunichControl, type MunichMode } from '@/lib/munich';
import { judgementForDeliverable, verdictForMunich, verdictLabel } from '@/lib/judge';
import { GateValidateDialog } from '@/components/quality/GateValidateDialog';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

const munichModeTone: Record<MunichMode, 'on_track' | 'accent' | 'neutral'> = {
  machine: 'on_track',
  humain: 'neutral',
  mixte: 'accent',
};

// Click cycles a NON-judgeable control's status: todo → ok → na → todo. Judgeable controls are
// validated through the nominative dialog instead (a journalled human act, ADR 0046 / 0068).
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

const verdictMark: Record<GateVerdict, string> = { pass: '✓', fail: '✗', uncertain: '?' };
// Literal classes (Tailwind extracts these statically — never build them by template interpolation).
const verdictMarkClass: Record<GateVerdict, string> = {
  pass: 'text-status-on_track',
  fail: 'text-status-blocked',
  uncertain: 'text-status-at_risk',
};

/**
 * Munich Charter checklist matrix — the operational definition of the `compliance_done` gate
 * (ADR 0037). One column per editorial deliverable. Judgeable controls (1/2/3/7/8) carry the LLM
 * judge's candidate verdict (ADR 0068) and open a nominative validation dialog on click; governance
 * controls (6/9/10) stay a pure human cycle with no candidate. Optionally scoped to one output type.
 */
export function MunichMatrix({ typeFilter }: { typeFilter?: DeliverableType }) {
  const { state, saveDeliverable } = useCockpit();
  const [dialog, setDialog] = useState<{ deliverableId: string; control: MunichControl } | null>(
    null,
  );
  if (!state) return null;
  const editorial = state.deliverables.filter(
    (d) => d.munich && (!typeFilter || d.type === typeFilter),
  );
  const setMunich = (d: Deliverable, n: number, current: MunichStatus | undefined) =>
    saveDeliverable({ ...d, munich: { ...(d.munich ?? {}), [n]: nextMunich(current) } });

  const dialogDeliverable = dialog
    ? state.deliverables.find((d) => d.id === dialog.deliverableId)
    : undefined;
  const dialogVerdict =
    dialog && dialogDeliverable
      ? verdictForMunich(
          judgementForDeliverable(state.judgements, dialogDeliverable),
          dialog.control.n,
        )
      : undefined;

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Conformité Charte de Munich — définit « Conformité »</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-muted">
          <span className="font-medium text-ink">compliance_done</span> n’est coché qu’une fois les
          10 contrôles satisfaits. Les contrôles « Auto » sont imposés au build/CI (
          <code className="text-xs">check:munich</code>). Les contrôles adossés au texte portent un{' '}
          <span className="font-medium text-ink">verdict-candidat du juge LLM</span> et s’ouvrent en
          validation nominative (journalisée) ; les contrôles de gouvernance (secret des sources,
          indépendance, pressions) restent un cycle purement humain — cliquez pour cycler (
          <Circle className="inline h-3 w-3 text-status-at_risk" /> à faire →{' '}
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
                      const verdict = c.judgeable
                        ? verdictForMunich(judgementForDeliverable(state.judgements, d), c.n)
                        : undefined;
                      return (
                        <td key={d.id} className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() =>
                              c.judgeable
                                ? setDialog({ deliverableId: d.id, control: c })
                                : setMunich(d, c.n, status)
                            }
                            title={
                              c.judgeable
                                ? verdict
                                  ? `Juge : ${verdictLabel[verdict.verdict]} (${Math.round(verdict.confidence * 100)}%) — cliquer pour valider`
                                  : 'Validation nominative (aucun verdict-candidat)'
                                : 'Cliquer pour changer le statut'
                            }
                            className="mx-auto flex items-center justify-center gap-1 rounded p-1 hover:bg-subtle"
                          >
                            <MunichCell status={status} />
                            {c.judgeable && verdict ? (
                              <span
                                className={`text-[10px] font-semibold ${verdictMarkClass[verdict.verdict]}`}
                              >
                                {verdictMark[verdict.verdict]}
                              </span>
                            ) : null}
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

      {dialog && dialogDeliverable ? (
        <GateValidateDialog
          open={dialog !== null}
          onOpenChange={(o) => !o && setDialog(null)}
          deliverable={dialogDeliverable}
          target={{
            kind: 'munich',
            id: String(dialog.control.n),
            label: dialog.control.duty,
            description: dialog.control.control,
          }}
          judgeVerdict={dialogVerdict}
          currentValue={dialogDeliverable.munich?.[String(dialog.control.n)]}
        />
      ) : null}
    </Card>
  );
}
