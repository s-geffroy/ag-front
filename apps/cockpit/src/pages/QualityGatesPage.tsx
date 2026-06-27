import { BookOpen, Check, Circle, Minus, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Deliverable, MunichStatus } from '@ag/schema/cockpit';
import { useCockpit } from '@/store';
import { qualityAlerts } from '@/lib/calculations';
import { contentRefFromLinks, typeLabel } from '@/lib/display';
import { munichControls, munichModeLabel, type MunichMode } from '@/lib/munich';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { GateBadge, PageHeader } from '@/components/common';

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

const GATES: { key: keyof Deliverable['gates']; label: string }[] = [
  { key: 'sources_ok', label: 'Sources' },
  { key: 'llm_draft_done', label: 'Brouillon' },
  { key: 'contradiction_done', label: 'Contradiction' },
  { key: 'compliance_done', label: 'Conformité' },
  { key: 'human_review_done', label: 'Revue' },
  { key: 'cvi_justified', label: 'CVI' },
];

export function QualityGatesPage() {
  const { state, saveDeliverable } = useCockpit();
  if (!state) return <p className="text-sm text-muted">Chargement…</p>;
  const alerts = qualityAlerts(state.deliverables);
  // Per-deliverable Munich tracking applies to editorial artifacts (those carrying a `munich` map).
  const editorial = state.deliverables.filter((d) => d.munich);
  const setMunich = (d: Deliverable, n: number, current: MunichStatus | undefined) =>
    saveDeliverable({ ...d, munich: { ...(d.munich ?? {}), [n]: nextMunich(current) } });

  return (
    <div>
      <PageHeader
        title="Quality Gates"
        subtitle="Validation méthodologique : un livrable peut être prêt éditorialement mais bloqué méthodologiquement."
      />

      {/* Alerts */}
      <Card className="mb-5 border-status-at_risk/30">
        <CardHeader>
          <CardTitle>Alertes immédiates</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted">Aucun livrable prêt/publié avec un gate manquant.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {alerts.map((a) => (
                <li key={a.deliverable.id} className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{a.deliverable.title}</span>
                  <span className="text-status-at_risk">manque : {a.missing.join(', ')}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Gate matrix */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Matrice des gates</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto px-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium">Livrable</th>
                <th className="px-2 py-2 font-medium">Type</th>
                {GATES.map((g) => (
                  <th key={g.key} className="px-2 py-2 text-center font-medium">
                    {g.label}
                  </th>
                ))}
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-2 py-2 font-medium">Liens</th>
              </tr>
            </thead>
            <tbody>
              {state.deliverables.map((d) => (
                <tr key={d.id} className="border-b border-line/60">
                  <td className="px-4 py-2 font-medium">{d.title}</td>
                  <td className="px-2 py-2 text-muted">{typeLabel[d.type] ?? d.type}</td>
                  {GATES.map((g) => {
                    const v = d.gates[g.key];
                    return (
                      <td key={g.key} className="px-2 py-2 text-center">
                        {v === undefined ? (
                          <span className="text-muted">—</span>
                        ) : v ? (
                          <Check className="mx-auto h-4 w-4 text-status-on_track" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-status-blocked" />
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2">
                    <GateBadge status={d.quality_gate_status} />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const ref = contentRefFromLinks(d.links);
                        return ref ? (
                          <Link
                            to={`/lire/${ref.type}/${ref.slug}`}
                            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                          >
                            <BookOpen className="h-3.5 w-3.5" /> Lire
                          </Link>
                        ) : null;
                      })()}
                      <Link
                        to={`/depots?deliverable=${encodeURIComponent(d.id)}`}
                        className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
                        title="Fichiers déposés pour ce livrable"
                      >
                        <Upload className="h-3.5 w-3.5" /> Dépôts
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Required gates per type (reference) */}
      <Card>
        <CardHeader>
          <CardTitle>Gates requis par type (référence)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.quality_gates.map((spec) => (
            <div key={spec.type}>
              <div className="mb-1 text-sm font-semibold">{typeLabel[spec.type] ?? spec.type}</div>
              <ul className="space-y-1 text-xs text-muted">
                {spec.required_gates.map((g) => (
                  <li key={g.id}>
                    <span className="font-medium text-ink">{g.label}</span> — {g.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Munich Charter — operational definition of the `compliance_done` gate (ADR 0037) */}
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Conformité Charte de Munich — définit « Conformité »</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted">
            <span className="font-medium text-ink">compliance_done</span> n’est coché qu’une fois
            les 10 contrôles satisfaits. Les contrôles « Auto » sont imposés au build/CI (
            <code className="text-xs">check:munich</code>) — un contenu non conforme ne peut pas
            être publié ; les autres relèvent de la revue humaine. Cliquez une cellule pour cycler
            le statut (<Circle className="inline h-3 w-3 text-status-at_risk" /> à faire →{' '}
            <Check className="inline h-3 w-3 text-status-on_track" /> ok →{' '}
            <Minus className="inline h-3 w-3 text-muted" /> n/a).
          </p>
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
        </CardContent>
      </Card>
    </div>
  );
}
