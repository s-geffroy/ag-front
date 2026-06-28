import { DeliverableBoard } from '@/components/deliverables/DeliverableBoard';
import { PageHeader } from '@/components/common';

export function PipelinePage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Pipeline de production"
        subtitle="Avancement de tous les livrables — du backlog au publié, filtrable par type. Les types éditoriaux ont aussi un espace dédié (lien dans le détail) ; les autres (site, prospection…) ne sont suivis qu'ici."
      />
      <div className="min-h-0 flex-1">
        <DeliverableBoard showTypeFilter />
      </div>
    </div>
  );
}
