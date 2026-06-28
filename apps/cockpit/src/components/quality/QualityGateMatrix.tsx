import { BookOpen, Check, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Deliverable, DeliverableType } from '@ag/schema/cockpit';
import { useCockpit } from '@/store';
import { qualityAlerts } from '@/lib/calculations';
import { contentRefFromLinks, typeLabel } from '@/lib/display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { GateBadge } from '@/components/common';

const GATES: { key: keyof Deliverable['gates']; label: string }[] = [
  { key: 'sources_ok', label: 'Sources' },
  { key: 'llm_draft_done', label: 'Brouillon' },
  { key: 'contradiction_done', label: 'Contradiction' },
  { key: 'compliance_done', label: 'Conformité' },
  { key: 'human_review_done', label: 'Revue' },
  { key: 'cvi_justified', label: 'CVI' },
];

/** Immediate alerts + the per-deliverable gate matrix, optionally scoped to one output type. */
export function QualityGateMatrix({ typeFilter }: { typeFilter?: DeliverableType }) {
  const { state } = useCockpit();
  if (!state) return <p className="text-sm text-muted">Chargement…</p>;
  const deliverables = typeFilter
    ? state.deliverables.filter((d) => d.type === typeFilter)
    : state.deliverables;
  const alerts = qualityAlerts(deliverables);

  return (
    <>
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
              {deliverables.map((d) => (
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
                        to={`/outils/depots?deliverable=${encodeURIComponent(d.id)}`}
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
    </>
  );
}
