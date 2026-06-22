import { Check, X } from 'lucide-react';
import type { Deliverable } from '@ag/schema/cockpit';
import { useCockpit } from '@/store';
import { qualityAlerts } from '@/lib/calculations';
import { typeLabel } from '@/lib/display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { GateBadge, PageHeader } from '@/components/common';

const GATES: { key: keyof Deliverable['gates']; label: string }[] = [
  { key: 'sources_ok', label: 'Sources' },
  { key: 'llm_draft_done', label: 'Brouillon' },
  { key: 'contradiction_done', label: 'Contradiction' },
  { key: 'compliance_done', label: 'Conformité' },
  { key: 'human_review_done', label: 'Revue' },
  { key: 'cvi_justified', label: 'CVI' },
];

export function QualityGatesPage() {
  const { state } = useCockpit();
  if (!state) return <p className="text-sm text-muted">Chargement…</p>;
  const alerts = qualityAlerts(state.deliverables);

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
    </div>
  );
}
