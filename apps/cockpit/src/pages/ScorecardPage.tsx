import type { Metric } from '@ag/schema/cockpit';
import { useCockpit } from '@/store';
import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { gateTone } from '@/lib/display';

export function ScorecardPage() {
  const { state } = useCockpit();
  if (!state) return <p className="text-sm text-muted">Chargement…</p>;
  const groups = [...state.metrics].sort((a, b) => a.rank - b.rank);

  return (
    <div>
      <PageHeader
        title="Scorecard"
        subtitle="Hiérarchie de valeur : un pilote Premium vaut plus qu’une croissance d’audience non qualifiée."
      />
      <div className="space-y-4">
        {groups.map((g) => (
          <Card key={g.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-[11px] font-semibold text-accent">
                  {g.rank}
                </span>
                {g.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.metrics.map((m) => (
                <MetricCell key={m.id} metric={m} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MetricCell({ metric: m }: { metric: Metric }) {
  const pct = m.target_90d ? Math.min(100, Math.round((m.value / m.target_90d) * 100)) : null;
  return (
    <div className="rounded-md border border-line p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="text-2xl font-semibold tabular-nums">{m.value}</div>
        <Badge tone={gateTone[m.status === 'on_track' ? 'ok' : m.status === 'blocked' ? 'blocked' : 'at_risk']}>
          {m.status === 'on_track' ? 'Sur les rails' : m.status === 'blocked' ? 'Bloqué' : 'À risque'}
        </Badge>
      </div>
      <div className="mt-0.5 text-sm">{m.label}</div>
      <div className="mt-2 flex gap-3 text-[11px] text-muted">
        {m.target_90d != null ? <span>90j : {m.target_90d}</span> : null}
        {m.target_12m != null ? <span>12m : {m.target_12m}</span> : null}
      </div>
      {pct != null ? <Progress value={pct} className="mt-2" /> : null}
    </div>
  );
}
