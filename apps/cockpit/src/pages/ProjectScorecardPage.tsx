import { ScorecardTiers } from '@/components/scorecard/ScorecardTiers';
import { PageHeader } from '@/components/common';

export function ProjectScorecardPage() {
  return (
    <div>
      <PageHeader
        title="KPIs projet"
        subtitle="Production tenue et signaux de crédibilité — la valeur produite par le déploiement."
      />
      <ScorecardTiers domain="project" />
    </div>
  );
}
