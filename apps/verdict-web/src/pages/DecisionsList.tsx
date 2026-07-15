import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { fr } from '../i18n/fr';

interface DecisionRow {
  id: string;
  title: string;
  client_name: string | null;
  sector: string;
  status: string;
  final_verdict: string | null;
  updated_at: string;
}

const verdictClass: Record<string, string> = {
  FAIRE: 'v-FAIRE',
  TESTER: 'v-TESTER',
  DIFFÉRER: 'v-DIFFERER',
  ABANDONNER: 'v-ABANDONNER',
};

export default function DecisionsList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: decisions } = useQuery({
    queryKey: ['decisions'],
    queryFn: () => api.get<DecisionRow[]>('/api/decisions'),
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post<DecisionRow>('/api/decisions', body),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['decisions'] });
      setOpen(false);
      navigate(`/decisions/${d.id}`);
    },
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    create.mutate(Object.fromEntries([...f.entries()].filter(([, v]) => v !== '')));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{fr.list.title}</h1>
        <button onClick={() => setOpen((v) => !v)} className="btn">
          {fr.list.create}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="card mt-4 grid grid-cols-2 gap-3">
          <label className="col-span-2 text-sm">
            <span className="font-medium">{fr.list.titleField}</span>
            <input name="title" required className="field" />
          </label>
          <label className="text-sm">
            <span className="font-medium">{fr.list.client}</span>
            <input name="client_name" className="field" />
          </label>
          <label className="text-sm">
            <span className="font-medium">{fr.list.sector}</span>
            <input name="sector" className="field" />
          </label>
          <label className="col-span-2 text-sm">
            <span className="font-medium">{fr.list.situation}</span>
            <textarea name="situation" rows={2} className="field" />
          </label>
          <div className="col-span-2">
            <button className="btn">{fr.list.save}</button>
          </div>
        </form>
      )}

      <div className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-300 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
        {!decisions?.length && (
          <p className="px-4 py-6 text-sm text-slatewarn dark:text-slate-400">{fr.list.none}</p>
        )}
        {decisions?.map((d) => (
          <Link
            key={d.id}
            to={`/decisions/${d.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div>
              <div className="font-medium">{d.title}</div>
              <div className="text-xs text-slatewarn dark:text-slate-400">
                {[d.client_name, d.sector].filter(Boolean).join(' · ') || '—'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {d.final_verdict && (
                <span className={`chip ${verdictClass[d.final_verdict] ?? ''}`}>
                  {d.final_verdict}
                </span>
              )}
              <span className="chip bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {d.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
