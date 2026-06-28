import { ReviewList } from '@/components/review/ReviewList';
import { PageHeader } from '@/components/common';

export function ReviewPage() {
  return (
    <div>
      <PageHeader
        title="Revue des sorties"
        subtitle="Toutes les sorties éditoriales (dossiers, fiches, notes) réunies pour validation. Les candidats hors-ligne ne sont pas publiés tant qu'ils ne sont pas validés."
      />
      <ReviewList />
    </div>
  );
}
