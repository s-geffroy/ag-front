import type { CockpitState } from '../types';
import { criticalBlockers, globalHealth, p0ToPush, qualityAlerts } from './calculations';
import { formatDate, healthLabel } from './display';

/** Build the operational Markdown summary surfaced by the Cockpit "Export" button. */
export function buildMarkdownSummary(state: CockpitState, now = new Date()): string {
  const { deliverables, milestones, metrics } = state;
  const lines: string[] = [];
  const push = (s = '') => lines.push(s);

  push('# Cockpit — Applied Geopolitics');
  push();
  push(`_Résumé généré le ${formatDate(now.toISOString())}_`);
  push();
  push(`**Santé globale : ${healthLabel[globalHealth(deliverables, now)]}**`);
  push();

  push('## Priorités à pousser (P0)');
  for (const d of p0ToPush(deliverables, now, 3)) {
    push(`- **${d.title}** (${d.priority}, ${d.progress}%) — ${d.next_action}`);
  }

  const blockers = criticalBlockers(deliverables);
  if (blockers.length) {
    push();
    push('## Blocages critiques');
    for (const d of blockers) push(`- **${d.title}** — ${d.blocker}`);
  }

  const alerts = qualityAlerts(deliverables);
  if (alerts.length) {
    push();
    push('## Alertes qualité');
    for (const a of alerts) push(`- **${a.deliverable.title}** — manque : ${a.missing.join(', ')}`);
  }

  push();
  push('## Jalons 90 jours');
  for (const m of milestones.filter((x) => x.horizon === '90d')) {
    push(`- ${m.title} — échéance ${formatDate(m.due_date)}`);
  }

  push();
  push('## Scorecard');
  for (const g of [...metrics].sort((a, b) => a.rank - b.rank)) {
    push(`- **${g.label}**`);
    for (const mt of g.metrics) {
      const t90 = mt.target_90d != null ? ` (cible 90j : ${mt.target_90d})` : '';
      push(`  - ${mt.label} : ${mt.value}${t90}`);
    }
  }

  return lines.join('\n') + '\n';
}

export function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
