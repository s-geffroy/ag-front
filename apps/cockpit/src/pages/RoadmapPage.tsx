import type { Deliverable, Milestone } from '@ag/schema/cockpit';
import { useCockpit } from '@/store';
import { daysUntil, formatDate } from '@/lib/display';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { MilestoneBadge, PageHeader } from '@/components/common';

export function RoadmapPage() {
  const { state } = useCockpit();
  if (!state) return <p className="text-sm text-muted">Chargement…</p>;

  const byId = new Map(state.deliverables.map((d) => [d.id, d]));
  const ms90 = state.milestones.filter((m) => m.horizon === '90d');
  const ms12 = state.milestones.filter((m) => m.horizon === '12m');

  return (
    <div>
      <PageHeader title="Roadmap" subtitle="Deux horizons : 90 jours (opérationnel) et 12 mois (stratégique)." />

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-muted">Horizon 90 jours</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {ms90.map((m) => (
            <MilestoneCard key={m.id} milestone={m} byId={byId} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">Horizon 12 mois</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {ms12.map((m) => (
            <MilestoneCard key={m.id} milestone={m} byId={byId} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MilestoneCard({
  milestone: m,
  byId,
}: {
  milestone: Milestone;
  byId: Map<string, Deliverable>;
}) {
  const days = daysUntil(m.due_date);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-snug">{m.title}</CardTitle>
        <MilestoneBadge status={m.status} />
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>Échéance {formatDate(m.due_date)}</span>
          <span>·</span>
          <span className={days < 0 ? 'text-status-blocked' : ''}>
            {days < 0 ? `${-days} j de retard` : `${days} j restants`}
          </span>
        </div>
        <p>
          <span className="text-muted">Preuve attendue : </span>
          {m.expected_proof}
        </p>
        <p>
          <span className="text-muted">Métrique : </span>
          {m.success_metric}
        </p>
        {m.linked_deliverables.length > 0 ? (
          <div className="flex flex-wrap gap-1 pt-1">
            {m.linked_deliverables.map((id) => (
              <Badge key={id} tone="neutral">
                {byId.get(id)?.title ?? id}
              </Badge>
            ))}
          </div>
        ) : null}
        {m.blocker ? <p className="text-xs text-status-blocked">Blocage : {m.blocker}</p> : null}
        <p className="border-t border-line pt-2 text-xs">
          <span className="text-muted">Prochaine action : </span>
          {m.next_action}
        </p>
      </CardContent>
    </Card>
  );
}
