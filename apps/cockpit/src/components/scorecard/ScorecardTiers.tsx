import type { Metric, MetricGroup } from '@ag/schema/cockpit';
import { useCockpit } from '@/store';
import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui';
import { gateTone } from '@/lib/display';

type Domain = 'project' | 'commercial';

// Tiers without an explicit domain default to 'project' (back-compat with un-tagged data).
const domainOf = (g: MetricGroup): Domain => g.domain ?? 'project';

/**
 * Renders the ranked scorecard tiers. With `domain`, only that métier's tiers show (ventilated
 * scorecards). With `compact`, a condensed cross-domain synthesis for the home dashboard.
 */
export function ScorecardTiers({ domain, compact }: { domain?: Domain; compact?: boolean }) {
  const { state } = useCockpit();
  if (!state) return <p className="text-sm text-muted">Chargement…</p>;
  const groups = [...state.metrics]
    .filter((g) => !domain || domainOf(g) === domain)
    .sort((a, b) => a.rank - b.rank);

  if (groups.length === 0) return <p className="text-sm text-muted">Aucun indicateur.</p>;

  if (compact) {
    return (
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.id}>
            <div className="mb-1.5 text-xs font-semibold text-muted">{g.label}</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {g.metrics.map((m) => (
                <div key={m.id}>
                  <div className="text-2xl font-semibold tabular-nums">{m.value}</div>
                  <div className="text-xs text-muted">{m.label}</div>
                  {m.target_90d != null ? (
                    <div className="mt-0.5 text-[11px] text-muted">cible 90j : {m.target_90d}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
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
  );
}

function MetricCell({ metric: m }: { metric: Metric }) {
  const pct = m.target_90d ? Math.min(100, Math.round((m.value / m.target_90d) * 100)) : null;
  return (
    <div className="rounded-md border border-line p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="text-2xl font-semibold tabular-nums">{m.value}</div>
        <Badge
          tone={
            gateTone[
              m.status === 'on_track' ? 'ok' : m.status === 'blocked' ? 'blocked' : 'at_risk'
            ]
          }
        >
          {m.status === 'on_track'
            ? 'Sur les rails'
            : m.status === 'blocked'
              ? 'Bloqué'
              : 'À risque'}
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
