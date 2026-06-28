import { DeliverableBoard } from '@/components/deliverables/DeliverableBoard';
import { PageHeader } from '@/components/common';

export function PipelinePage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Pipeline de production"
        subtitle="Avancement de toutes les sorties — du backlog au publié. Filtrable par type."
      />
      <div className="min-h-0 flex-1">
        <DeliverableBoard showTypeFilter />
      </div>
    </div>
  );
}
