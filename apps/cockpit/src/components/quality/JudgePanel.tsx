import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bot, Check, GitCompareArrows, Loader2, Scale } from 'lucide-react';
import type { GateVerdict, JudgeGateVerdict, JudgeReport } from '@ag/schema/cockpit';
import { api } from '@/lib/api';
import { useCockpit } from '@/store';
import {
  disagreements,
  summarize,
  verdictLabel,
  verdictTone,
  type JudgeSummary,
} from '@/lib/judge';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

const verdictShort: Record<GateVerdict, string> = { pass: '✓', fail: '✗', uncertain: '?' };

/** A slim 0–1 confidence bar. */
function Confidence({ value }: { value: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <span className="inline-flex items-center gap-1.5" title={`Confiance ${pct}%`}>
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-subtle">
        <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </span>
      <span className="tabular-nums text-[11px] text-muted">{pct}%</span>
    </span>
  );
}

function VerdictRow({ v, contested }: { v: JudgeGateVerdict; contested: boolean }) {
  return (
    <tr className="border-b border-line/60 align-top">
      <td className="px-2 py-2">
        <span className="text-ink">{v.label || v.target_id}</span>
        <span className="ml-1 text-[11px] text-muted">
          {v.target_kind === 'munich' ? `Munich ${v.target_id}` : 'rubrique'}
        </span>
        {contested ? (
          <Badge tone="blocked" className="ml-1.5">
            <GitCompareArrows className="h-3 w-3" /> contesté par le red team
          </Badge>
        ) : null}
      </td>
      <td className="px-2 py-2 text-center">
        <Badge tone={verdictTone(v.verdict, v.confidence)}>
          {verdictShort[v.verdict]} {verdictLabel[v.verdict]}
        </Badge>
      </td>
      <td className="px-2 py-2 text-center">
        <Confidence value={v.confidence} />
      </td>
      <td className="px-2 py-2 text-muted">
        {v.justification}
        {v.evidence_quote ? (
          <div className="mt-1 border-l-2 border-line pl-2 text-[11px] italic text-muted">
            « {v.evidence_quote} »
          </div>
        ) : null}
      </td>
    </tr>
  );
}

/**
 * LLM judge / pré-validation for ONE document (ADR 0068). Runs a per-gate verdict pass and shows the
 * candidates so the human confirms/overrides instead of reasoning from scratch. The output is a
 * CANDIDATE pending human validation: it never edits the content and never ticks a gate — validation
 * happens per-gate in the Gates & Munich views (a nominative click that writes the journal, ADR 0046).
 */
export function JudgePanel({ contentType, slug }: { contentType: string; slug: string }) {
  const { state, reload } = useCockpit();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docId = `${contentType}/${slug}`;
  const report = state?.judgements.find((r) => r.doc_id === docId);
  const contradiction = state?.contradictions.find((r) => r.doc_id === docId);
  const contested = new Set(
    disagreements(report, contradiction).map((v) => `${v.target_kind}:${v.target_id}`),
  );

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      await api.runJudgement(contentType, slug);
      reload();
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  };

  const setReviewed = async (status: 'pending' | 'reviewed') => {
    try {
      await api.reviewJudgement(contentType, slug, status);
      reload();
    } catch (e) {
      setError(String(e));
    }
  };

  const summary: JudgeSummary | null = report ? summarize(report) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-accent" />
          Pré-validation (juge LLM)
        </CardTitle>
        <Button size="sm" variant={report ? 'outline' : 'default'} onClick={run} disabled={running}>
          {running ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Bot className="h-3.5 w-3.5" />
          )}
          {running ? 'Analyse…' : report ? 'Relancer' : 'Lancer la pré-validation'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="flex items-start gap-2 rounded-md border border-status-at_risk/30 bg-status-at_risk/10 px-3 py-2 text-xs text-status-at_risk">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Verdicts LLM = <strong>candidats à valider par un humain</strong>. Aucun ne coche un
            gate. La validation nominative se fait gate par gate dans « Gates &amp; Munich ».
            Regardez d'abord les lignes en désaccord avec le red team et les confiances basses.
          </span>
        </p>

        {error ? <p className="text-sm text-status-blocked">Échec : {error}</p> : null}

        {!report ? (
          <p className="py-4 text-center text-sm text-muted">
            Aucune pré-validation lancée sur ce document.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <Badge tone={report.status === 'reviewed' ? 'on_track' : 'at_risk'}>
                {report.status === 'reviewed' ? 'Revue par un humain' : 'À examiner'}
              </Badge>
              <Badge tone={report.model === 'facade' ? 'neutral' : 'accent'}>
                {report.model === 'facade' ? 'Façade hors-ligne' : report.model}
              </Badge>
              {summary ? (
                <span>
                  · {summary.pass} satisfait(s) · {summary.uncertain} incertain(s) · {summary.fail}{' '}
                  non satisfait(s)
                  {summary.attention > 0 ? (
                    <span className="ml-1 text-status-at_risk">
                      · {summary.attention} à examiner
                    </span>
                  ) : null}
                </span>
              ) : null}
              <span>· {formatDate(report.generated_at)}</span>
            </div>

            {contested.size > 0 ? (
              <p className="flex items-start gap-2 rounded-md border border-status-blocked/30 bg-status-blocked/10 px-3 py-2 text-xs text-status-blocked">
                <GitCompareArrows className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  <strong>Désaccord juge / red team.</strong> {contested.size} gate(s) jugé(s) «
                  satisfait » alors que le red team a levé une faille de sévérité élevée sur ce
                  document. À arbitrer en priorité avant toute validation.
                </span>
              </p>
            ) : null}

            {report.analysis ? (
              <details className="rounded-md border border-line bg-subtle px-3 py-2">
                <summary className="cursor-pointer text-[11px] font-medium uppercase tracking-wide text-muted">
                  Raisonnement du modèle
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-xs text-muted">{report.analysis}</p>
              </details>
            ) : null}

            {report.gate_verdicts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs text-muted">
                      <th className="px-2 py-1.5 font-medium">Gate</th>
                      <th className="px-2 py-1.5 text-center font-medium">Verdict</th>
                      <th className="px-2 py-1.5 text-center font-medium">Confiance</th>
                      <th className="px-2 py-1.5 font-medium">Justification (candidat)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.gate_verdicts.map((v, i) => (
                      <VerdictRow
                        key={i}
                        v={v}
                        contested={contested.has(`${v.target_kind}:${v.target_id}`)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {report.do_not_conclude.length > 0 ? (
              <div className="rounded-md border border-line bg-subtle px-3 py-2 text-xs text-muted">
                {report.do_not_conclude.map((d, i) => (
                  <p key={i}>⚠ {d}</p>
                ))}
              </div>
            ) : null}

            <div className="flex justify-end">
              {report.status === 'reviewed' ? (
                <Button size="sm" variant="ghost" onClick={() => setReviewed('pending')}>
                  Rouvrir
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setReviewed('reviewed')}>
                  <Check className="h-3.5 w-3.5" /> Marquer comme examiné
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Compact roll-up for the Gates tab: judge pré-validation status of every document of one type. */
export function JudgeRollup({ contentType }: { contentType: JudgeReport['content_type'] }) {
  const { state } = useCockpit();
  const reports = (state?.judgements ?? []).filter((r) => r.content_type === contentType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-accent" />
          Pré-validation (juge LLM)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-sm text-muted">
            Aucune pré-validation sur ce type. Ouvrez un document depuis l'onglet Revue puis
            lancez-la — la sortie reste un candidat à valider gate par gate.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {reports.map((r) => {
              const s = summarize(r);
              return (
                <li key={r.doc_id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <Link
                    to={`/lire/${r.content_type}/${r.slug}`}
                    className="truncate text-ink hover:text-accent"
                  >
                    {r.title || r.slug}
                  </Link>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge tone={s.attention > 0 ? 'at_risk' : 'on_track'}>
                      {s.pass}/{s.total} satisfait(s)
                    </Badge>
                    {s.attention > 0 ? (
                      <Badge tone="at_risk">{s.attention} à examiner</Badge>
                    ) : null}
                    <Badge tone={r.status === 'reviewed' ? 'on_track' : 'at_risk'}>
                      {r.status === 'reviewed' ? 'examiné' : 'à examiner'}
                    </Badge>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
