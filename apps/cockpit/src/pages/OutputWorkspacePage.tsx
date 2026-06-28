import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCockpit } from '@/store';
import { outputBySlug } from '@/lib/outputs';
import { cn } from '@/lib/cn';
import { PageHeader } from '@/components/common';
import { DeliverableBoard } from '@/components/deliverables/DeliverableBoard';
import { QualityGateMatrix } from '@/components/quality/QualityGateMatrix';
import { MunichMatrix } from '@/components/quality/MunichMatrix';
import { RequiredGatesReference } from '@/components/quality/RequiredGatesReference';
import { ReviewList } from '@/components/review/ReviewList';
import { UploadsList } from '@/components/uploads/UploadsList';

const TABS = [
  { key: 'suivi', label: 'Suivi' },
  { key: 'gates', label: 'Gates & Munich' },
  { key: 'revue', label: 'Revue' },
  { key: 'sources', label: 'Sources' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

export function OutputWorkspacePage() {
  const { slug = '' } = useParams();
  const { state } = useCockpit();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as TabKey) ?? 'suivi';

  const output = state ? outputBySlug(state.config, slug) : undefined;
  const idsOfType = useMemo(
    () =>
      state && output
        ? state.deliverables.filter((d) => d.type === output.type).map((d) => d.id)
        : [],
    [state, output],
  );

  if (!state) return <p className="text-sm text-muted">Chargement…</p>;
  if (!output) {
    return (
      <div>
        <PageHeader title="Espace inconnu" subtitle={`Aucun type de sortie pour « ${slug} ».`} />
      </div>
    );
  }

  const isBoard = tab === 'suivi';

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={output.label}
        subtitle="Suivi de rédaction, contrôles qualité, revue et sources de ce type de sortie."
      />

      {/* Tabs */}
      <div className="mb-4 flex shrink-0 gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setParams(t.key === 'suivi' ? {} : { tab: t.key }, { replace: true })}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm font-medium',
              tab === t.key
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={cn('min-h-0 flex-1', isBoard ? 'flex flex-col' : 'overflow-y-auto')}>
        {tab === 'suivi' ? <DeliverableBoard forcedType={output.type} /> : null}
        {tab === 'gates' ? (
          <>
            <QualityGateMatrix typeFilter={output.type} />
            <RequiredGatesReference typeFilter={output.type} />
            <MunichMatrix typeFilter={output.type} />
          </>
        ) : null}
        {tab === 'revue' ? <ReviewList contentTypes={[output.content_type]} /> : null}
        {tab === 'sources' ? <UploadsList deliverableIds={idsOfType} /> : null}
      </div>
    </div>
  );
}
