import { ScorecardTiers } from '@/components/scorecard/ScorecardTiers';
import { PageHeader } from '@/components/common';

export function CommercialScorecardPage() {
  return (
    <div>
      <PageHeader
        title="KPIs commerciaux"
        subtitle="Hiérarchie de valeur : un pilote Premium vaut plus qu’une croissance d’audience non qualifiée."
      />
      <ScorecardTiers domain="commercial" />
    </div>
  );
}
