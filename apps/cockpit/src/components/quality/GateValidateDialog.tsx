import { useState } from 'react';
import { Check, ShieldAlert, X } from 'lucide-react';
import type { Deliverable, JudgeGateVerdict } from '@ag/schema/cockpit';
import { useCockpit } from '@/store';
import { verdictLabel, verdictTone } from '@/lib/judge';
import { Badge, Button, inputClass, Label, Sheet } from '@/components/ui';

export interface ValidateTarget {
  kind: 'gate' | 'munich' | 'cvi';
  id: string;
  label: string;
  description?: string;
}

/**
 * The nominative validation dialog (ADR 0046 / 0068). One gate at a time — no batch. It shows the
 * LLM judge's CANDIDATE verdict (when one exists), pre-fills the reserve from the judge justification,
 * and requires an explicit click to validate or reject. The click writes an append-only journal entry
 * (who/when/reserve) AND ticks/un-ticks the gate. The human decides; the LLM only prepared the case.
 */
export function GateValidateDialog({
  open,
  onOpenChange,
  deliverable,
  target,
  judgeVerdict,
  currentValue,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  deliverable: Deliverable;
  target: ValidateTarget;
  judgeVerdict?: JudgeGateVerdict;
  currentValue?: boolean | string;
}) {
  const { state, validateGate } = useCockpit();
  const operator = state?.config.operator ?? '';
  const [reserve, setReserve] = useState(judgeVerdict?.justification ?? '');
  const [validatedBy, setValidatedBy] = useState(operator);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (decision: 'validated' | 'rejected') => {
    if (!validatedBy.trim()) {
      setError('Indiquez qui valide (acte nominatif, ADR 0046).');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await validateGate(deliverable.id, {
        target_kind: target.kind,
        target_id: target.id,
        decision,
        reserve: reserve.trim(),
        validated_by: validatedBy.trim(),
        judge_verdict_snapshot: judgeVerdict,
      });
      onOpenChange(false);
    } catch (e) {
      // The server refuses compliance_done while Munich is incomplete — surface it plainly.
      setError(
        String(e).includes('munich_incomplete')
          ? 'Conformité refusée : les 10 contrôles de Munich doivent d’abord être « ok ».'
          : String(e),
      );
    } finally {
      setBusy(false);
    }
  };

  const isSet = target.kind === 'munich' ? currentValue === 'ok' : currentValue === true;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={`Valider — ${target.label}`}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isSet ? 'on_track' : 'neutral'}>
            {isSet ? 'Actuellement validé' : 'Non validé'}
          </Badge>
          <span className="text-xs text-muted">{deliverable.title}</span>
        </div>

        {target.description ? <p className="text-sm text-muted">{target.description}</p> : null}

        {/* The judge candidate — a suggestion, not a decision. */}
        {judgeVerdict ? (
          <div className="rounded-md border border-line bg-subtle px-3 py-2.5">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted">
              Verdict-candidat du juge LLM
              <Badge tone={verdictTone(judgeVerdict.verdict, judgeVerdict.confidence)}>
                {verdictLabel[judgeVerdict.verdict]} · {Math.round(judgeVerdict.confidence * 100)}%
              </Badge>
            </div>
            <p className="text-sm text-ink">{judgeVerdict.justification}</p>
            {judgeVerdict.evidence_quote ? (
              <p className="mt-1 border-l-2 border-line pl-2 text-xs italic text-muted">
                « {judgeVerdict.evidence_quote} »
              </p>
            ) : null}
            <p className="mt-1.5 text-[11px] text-muted">
              Candidat à valider — c'est votre décision, pas celle du LLM.
            </p>
          </div>
        ) : (
          <p className="rounded-md border border-line bg-subtle px-3 py-2 text-xs text-muted">
            Aucun verdict-candidat du juge pour ce gate — validez sur votre lecture.
          </p>
        )}

        <div>
          <Label>Réserve / commentaire (journalisé)</Label>
          <textarea
            className={inputClass('h-20 py-1.5')}
            placeholder="Ce que vous avez vérifié, réserve éventuelle…"
            value={reserve}
            onChange={(e) => setReserve(e.target.value)}
          />
        </div>

        <div>
          <Label>Validé par (identité nominative)</Label>
          <input
            className={inputClass()}
            value={validatedBy}
            onChange={(e) => setValidatedBy(e.target.value)}
            placeholder="Votre nom"
          />
        </div>

        {error ? (
          <p className="flex items-start gap-1.5 text-sm text-status-blocked">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={() => submit('rejected')} disabled={busy}>
            <X className="h-3.5 w-3.5" /> Rejeter
          </Button>
          <Button size="sm" onClick={() => submit('validated')} disabled={busy}>
            <Check className="h-3.5 w-3.5" /> Valider (nominatif)
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
