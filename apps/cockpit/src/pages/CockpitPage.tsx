import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { useCockpit } from '@/store';
import { criticalBlockers, globalHealth, p0ToPush, qualityAlerts } from '@/lib/calculations';
import { formatDate, healthLabel, healthTone } from '@/lib/display';
import {
  badgeVariants,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Separator,
} from '@/components/ui';
import { PageHeader, PriorityBadge } from '@/components/common';
import { ScorecardTiers } from '@/components/scorecard/ScorecardTiers';

export function CockpitPage() {
  const { state } = useCockpit();
  if (!state) return <p className="text-sm text-muted">Chargement…</p>;

  const now = new Date();
  const health = globalHealth(state.deliverables, now);
  const push3 = p0ToPush(state.deliverables, now, 3);
  const blockers = criticalBlockers(state.deliverables);
  const alerts = qualityAlerts(state.deliverables);
  const ms90 = state.milestones.filter((m) => m.horizon === '90d');

  return (
    <div>
      <PageHeader
        title="Cockpit"
        subtitle="Qu’est-ce qui menace le déploiement, et quelle action doit avancer maintenant ?"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Global health */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Santé globale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={badgeVariants({ tone: healthTone[health], className: 'text-sm' })}>
              {healthLabel[health]}
            </div>
            <p className="mt-3 text-xs text-muted">
              {health === 'blocked'
                ? 'Un livrable P0 est bloqué.'
                : health === 'at_risk'
                  ? 'Un livrable P0 est à risque ou en retard.'
                  : 'Aucun P0 bloqué ou en retard.'}
            </p>
          </CardContent>
        </Card>

        {/* Next action */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Prochaine action prioritaire</CardTitle>
          </CardHeader>
          <CardContent>
            {push3[0] ? (
              <div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={push3[0].priority} />
                  <span className="text-sm font-medium">{push3[0].title}</span>
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-sm">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {push3[0].next_action}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted">Rien à pousser.</p>
            )}
          </CardContent>
        </Card>

        {/* P0 to push */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>3 livrables à pousser</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {push3.map((d) => (
              <div key={d.id}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={d.priority} />
                    <span className="text-sm font-medium">{d.title}</span>
                  </div>
                  <span className="text-xs text-muted">{formatDate(d.deadline)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Progress value={d.progress} className="max-w-[160px]" />
                  <span className="text-xs text-muted">{d.progress}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Critical blockers */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-status-blocked" />
              Blocages critiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blockers.length === 0 ? (
              <p className="text-sm text-muted">Aucun blocage.</p>
            ) : (
              blockers.map((d) => (
                <div key={d.id} className="text-sm">
                  <div className="font-medium">{d.title}</div>
                  <div className="text-xs text-status-blocked">{d.blocker}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Cross-domain KPI synthesis (projet + commercial) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Synthèse des indicateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScorecardTiers compact />
          </CardContent>
        </Card>

        {/* Quality alerts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-status-at_risk" />
              Alertes qualité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted">Aucune alerte.</p>
            ) : (
              alerts.map((a) => (
                <div key={a.deliverable.id} className="text-sm">
                  <div className="font-medium">{a.deliverable.title}</div>
                  <div className="text-xs text-status-at_risk">Manque : {a.missing.join(', ')}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />
      <div className="text-xs text-muted">
        Jalons 90 jours :{' '}
        {ms90.map((m, i) => (
          <span key={m.id}>
            {i > 0 ? ' · ' : ''}
            {m.title} ({formatDate(m.due_date)})
          </span>
        ))}
      </div>
    </div>
  );
}
