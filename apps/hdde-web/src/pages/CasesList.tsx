import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { fr } from '../i18n/fr';

interface CaseRow {
  id: string;
  title: string;
  critical_actor_name: string;
  critical_actor_type: string;
  sector: string;
  status: string;
  updated_at: string;
}

const ACTOR_TYPES = [
  'supplier',
  'logistics_provider',
  'insurer',
  'bank',
  'regulator',
  'customs_authority',
  'platform_operator',
  'infrastructure_owner',
  'port_authority',
  'shipping_company',
  'state_owned_company',
  'customer',
  'certification_body',
  'state',
];

export default function CasesList() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: cases } = useQuery({
    queryKey: ['cases'],
    queryFn: () => api.get<CaseRow[]>('/api/cases'),
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post<CaseRow>('/api/cases', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cases'] });
      setOpen(false);
    },
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    create.mutate(Object.fromEntries(f.entries()));
  }

  return (
    <div>
      <LlmCostPanel />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{fr.cases.title}</h1>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-white"
        >
          {fr.cases.create}
        </button>
      </div>

      {open && (
        <form
          onSubmit={submit}
          className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
        >
          <Field name="title" label={fr.cases.title} required />
          <Field name="client_name" label={fr.cases.clientName} />
          <Field name="sector" label={fr.cases.sector} required />
          <Field name="critical_actor_name" label={fr.cases.criticalActor} required />
          <label className="text-sm">
            <span className="font-medium">{fr.cases.actorType}</span>
            <select
              name="critical_actor_type"
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 px-2 py-2 text-sm"
            >
              {ACTOR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <Field name="business_function_at_risk" label={fr.cases.businessFunction} required />
          <Field name="suspected_dependency" label={fr.cases.suspectedDependency} full />
          <Field name="initial_concern" label={fr.cases.initialConcern} full />
          <div className="col-span-2">
            <button className="rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-white">
              {fr.cases.save}
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
        {!cases?.length && (
          <p className="px-4 py-6 text-sm text-slatewarn dark:text-slate-400">{fr.cases.none}</p>
        )}
        {cases?.map((c) => (
          <Link
            key={c.id}
            to={`/cases/${c.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div>
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-slatewarn dark:text-slate-400">
                {c.critical_actor_name} · {c.critical_actor_type} · {c.sector}
              </div>
            </div>
            <span className="chip bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              {c.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  required,
  full,
}: {
  name: string;
  label: string;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <label className={`text-sm ${full ? 'col-span-2' : ''}`}>
      <span className="font-medium">{label}</span>
      <input
        name={name}
        required={required}
        className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
      />
    </label>
  );
}

interface UsageWindow {
  calls: number;
  total_tokens: number;
  cost_usd: number;
}
interface UsageSummary {
  currency: string;
  model: string;
  llm_enabled: boolean;
  today: UsageWindow;
  week: UsageWindow;
  month: UsageWindow;
  all_time: UsageWindow;
}

const usd = (n: number) => `$${n.toFixed(n < 1 ? 4 : 2)}`;

function LlmCostPanel() {
  const { data } = useQuery({
    queryKey: ['llm-usage'],
    queryFn: () => api.get<UsageSummary>('/api/usage/llm/summary'),
    refetchInterval: 30_000,
  });
  if (!data) return null;
  const cells: { label: string; w: UsageWindow }[] = [
    { label: fr.usage.today, w: data.today },
    { label: fr.usage.week, w: data.week },
    { label: fr.usage.month, w: data.month },
    { label: fr.usage.allTime, w: data.all_time },
  ];
  return (
    <section className="mb-5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {fr.usage.title}{' '}
          <span className="font-normal text-slatewarn dark:text-slate-400">· {data.model}</span>
        </h2>
        {!data.llm_enabled && (
          <span className="text-xs text-slatewarn dark:text-slate-400">{fr.usage.disabled}</span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {cells.map((c) => (
          <div key={c.label} className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3">
            <div className="text-xs text-slatewarn dark:text-slate-400">{c.label}</div>
            <div className="mt-1 text-lg font-semibold tabular-nums">{usd(c.w.cost_usd)}</div>
            <div className="text-xs text-slatewarn dark:text-slate-400">
              {c.w.calls} {fr.usage.calls} · {c.w.total_tokens.toLocaleString('fr-FR')} tok
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
