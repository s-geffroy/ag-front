import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bot, Check, GitFork, Loader2, ShieldQuestion, Swords } from 'lucide-react';
import type { ContradictionBasis, ContradictionReport, Deliverable } from '@ag/schema/cockpit';
import { api } from '@/lib/api';
import { useCockpit } from '@/store';
import { deliverablesForDoc, maxSeverity, severityTone } from '@/lib/contradiction';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

const basisLabel: Record<ContradictionBasis, string> = {
  internal_inconsistency: 'Incohérence interne',
  unsupported_claim: 'Affirmation non sourcée',
  source_gap: 'Trou de sourcing',
  overstated_certainty: 'Certitude surévaluée',
  missing_counterargument: 'Contre-argument absent',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

/**
 * Editorial contradiction (red team) for ONE document (ADR 0039). Runs an adversarial LLM pass and
 * shows the findings. The output is a CANDIDATE pending human validation: it never edits the content
 * and never auto-clears the `contradiction_done` gate — a human reads it and decides.
 */
export function ContradictionPanel({ contentType, slug }: { contentType: string; slug: string }) {
  const { state, reload, saveDeliverable } = useCockpit();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docId = `${contentType}/${slug}`;
  const report = state?.contradictions.find((r) => r.doc_id === docId);
  // Deliverables tracking this document — so the human can close the loop on the `contradiction_done`
  // gate right here (an explicit human action; the run itself never auto-ticks it, per ADR 0039).
  const linked = state ? deliverablesForDoc(state.deliverables, contentType, slug) : [];

  const markGate = async (d: Deliverable) => {
    try {
      await saveDeliverable({ ...d, gates: { ...d.gates, contradiction_done: true } });
    } catch (e) {
      setError(String(e));
    }
  };

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      await api.runContradiction(contentType, slug);
      reload();
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  };

  const setReviewed = async (status: 'pending' | 'reviewed') => {
    try {
      await api.reviewContradiction(contentType, slug, status);
      reload();
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <Swords className="h-4 w-4 text-accent" />
          Contradiction (red team)
        </CardTitle>
        <Button size="sm" variant={report ? 'outline' : 'default'} onClick={run} disabled={running}>
          {running ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Bot className="h-3.5 w-3.5" />
          )}
          {running ? 'Analyse…' : report ? 'Relancer' : 'Lancer la contradiction'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="flex items-start gap-2 rounded-md border border-status-at_risk/30 bg-status-at_risk/10 px-3 py-2 text-xs text-status-at_risk">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Sortie LLM = <strong>candidats à valider par un humain</strong>. Ne vaut ni preuve, ni
            validation du gate « Contradiction ». L'auteur tranche et lance les tests proposés.
          </span>
        </p>

        {error ? <p className="text-sm text-status-blocked">Échec : {error}</p> : null}

        {!report ? (
          <p className="py-4 text-center text-sm text-muted">
            Aucune passe de contradiction lancée sur ce document.
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
              <span>· {formatDate(report.generated_at)}</span>
            </div>

            <div>
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                Objection principale
              </div>
              <p className="text-sm text-ink">{report.summary}</p>
            </div>

            {/* The model's adversarial reasoning (ADR 0063) — a candidate, not a proof. Collapsed by
                default so it aids human validation without competing with the findings. */}
            {report.analysis ? (
              <details className="rounded-md border border-line bg-subtle px-3 py-2">
                <summary className="cursor-pointer text-[11px] font-medium uppercase tracking-wide text-muted">
                  Raisonnement du modèle
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-xs text-muted">{report.analysis}</p>
              </details>
            ) : null}

            {report.findings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs text-muted">
                      <th className="px-2 py-1.5 font-medium">Affirmation attaquée</th>
                      <th className="px-2 py-1.5 font-medium">Objection</th>
                      <th className="px-2 py-1.5 font-medium">Type</th>
                      <th className="px-2 py-1.5 text-center font-medium">Sév.</th>
                      <th className="px-2 py-1.5 font-medium">Test proposé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.findings
                      .slice()
                      .sort((a, b) => b.severity - a.severity)
                      .map((f, i) => (
                        <tr key={i} className="border-b border-line/60 align-top">
                          <td className="px-2 py-2 text-ink">{f.claim}</td>
                          <td className="px-2 py-2 text-muted">{f.objection}</td>
                          <td className="px-2 py-2">
                            <Badge tone="neutral">{basisLabel[f.basis]}</Badge>
                          </td>
                          <td className="px-2 py-2 text-center">
                            <Badge tone={severityTone(f.severity)}>{f.severity}</Badge>
                          </td>
                          <td className="px-2 py-2 text-muted">{f.suggested_test}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {report.open_questions.length > 0 ? (
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                  <ShieldQuestion className="h-3.5 w-3.5" /> Questions ouvertes
                </div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
                  {report.open_questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
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

            {/* Close the loop: tick the deliverable's contradiction gate. Explicit human decision —
                the run never does this automatically (ADR 0039). */}
            {linked.length > 0 ? (
              <div className="rounded-md border border-line px-3 py-2.5">
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                  <GitFork className="h-3.5 w-3.5" /> Gate « Contradiction » du livrable
                </div>
                <ul className="space-y-1.5">
                  {linked.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-ink">{d.title}</span>
                      {d.gates.contradiction_done ? (
                        <Badge tone="on_track">
                          <Check className="h-3 w-3" /> Gate validé
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => markGate(d)}>
                          Valider le gate
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5 text-[11px] text-muted">
                  À cocher seulement après avoir traité les failles ci-dessus — c'est votre
                  décision, pas celle du LLM.
                </p>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Compact roll-up for the Gates tab: contradiction status of every document of one content type. */
export function ContradictionRollup({
  contentType,
}: {
  contentType: ContradictionReport['content_type'];
}) {
  const { state } = useCockpit();
  const reports = (state?.contradictions ?? []).filter((r) => r.content_type === contentType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="h-4 w-4 text-accent" />
          Contradiction (red team)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-sm text-muted">
            Aucune passe de contradiction sur ce type. Ouvrez un document depuis l'onglet Revue puis
            lancez-la — la sortie reste un candidat à valider.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {reports.map((r) => {
              const maxSev = maxSeverity(r);
              return (
                <li key={r.doc_id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <Link
                    to={`/lire/${r.content_type}/${r.slug}`}
                    className="truncate text-ink hover:text-accent"
                  >
                    {r.title || r.slug}
                  </Link>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge tone={severityTone(maxSev)}>
                      {r.findings.length} faille(s) · max {maxSev}
                    </Badge>
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
