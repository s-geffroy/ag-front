import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  verdictStages,
  criterionLabels,
  proofLevels,
  verdictLabels,
  DEFAULT_WEIGHTS,
} from '@ag/verdict';
import { api, ApiError } from '../lib/api';
import { fr } from '../i18n/fr';

// ---- loose row shapes (the API returns SQLite rows + JSON columns) ----------------------------
/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;
interface Bundle {
  decision: Row;
  pestel: Row[];
  swot: Row[];
  options: Row[];
  scores: Row[];
  audit: Row | null;
  red_team: Row[];
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const CRITERIA = Object.keys(criterionLabels) as (keyof typeof criterionLabels)[];
const PESTEL_CATEGORIES = ['political', 'economic', 'social', 'technological', 'environmental', 'legal'] as const;
const PESTEL_FR: Record<string, string> = {
  political: 'Politique', economic: 'Économique', social: 'Sociétal',
  technological: 'Technologique', environmental: 'Environnemental', legal: 'Légal',
};
const SWOT_QUADRANTS = ['strength', 'weakness', 'opportunity', 'threat'] as const;
const SWOT_FR: Record<string, string> = {
  strength: 'Forces', weakness: 'Faiblesses', opportunity: 'Opportunités', threat: 'Menaces',
};
const OPTION_TYPES = ['main', 'minimal_alternative', 'opposite', 'active_non_action'] as const;
const OPTION_TYPE_FR: Record<string, string> = {
  main: 'Principale', minimal_alternative: 'Alternative minimale',
  opposite: 'Opposée', active_non_action: 'Non-action active',
};
const CANVAS_FIELDS = [
  ['value', 'Valeur produite'],
  ['beneficiaries', 'Bénéficiaires'],
  ['adoption_validation', 'Adoption / validation'],
  ['critical_resources_costs', 'Ressources / coûts critiques'],
  ['sustainability_systemic_risk', 'Soutenabilité / risque systémique'],
] as const;
const auditClass: Record<string, string> = { VALIDE: 'audit-VALIDE', 'À CORRIGER': 'audit-CORRIGER', BLOQUÉ: 'audit-BLOQUE' };

export default function DecisionWorkspace() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const [step, setStep] = useState('see');

  const { data: bundle, isLoading } = useQuery({
    queryKey: ['decision', id],
    queryFn: () => api.get<Bundle>(`/api/decisions/${id}`),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['decision', id] });

  if (isLoading || !bundle) return <p className="text-slatewarn dark:text-slate-400">…</p>;
  const d = bundle.decision;
  const audit = normalizeAudit(bundle.audit);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link to="/" className="text-sm text-slatewarn hover:text-ink dark:text-slate-400">
          {fr.ws.back}
        </Link>
        <div className="flex items-center gap-2">
          {d.final_verdict && <span className={`chip v-${asClass(d.final_verdict)}`}>{d.final_verdict}</span>}
          {audit && <span className={`chip ${auditClass[audit.audit_status]}`}>{audit.audit_status}</span>}
        </div>
      </div>

      <h1 className="mt-2 text-xl font-semibold">{d.title}</h1>
      <p className="text-xs text-slatewarn dark:text-slate-400">
        {[d.client_name, d.sector].filter(Boolean).join(' · ') || '—'}
        {d.source_pack_hash && <> · ingéré de HDDE (<code>{d.hdde_case_ref}</code>)</>}
      </p>

      <Ingest id={id} onDone={invalidate} />

      {/* V·E·R·D·I·C·T stepper nav */}
      <nav className="mt-5 flex flex-wrap gap-1">
        {verdictStages.map((s) => (
          <button
            key={s.key}
            onClick={() => setStep(s.key)}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
              step === s.key ? 'bg-ink text-white' : 'btn-ghost'
            }`}
            title={s.title}
          >
            <span className="font-mono font-bold">{s.letter}</span>
            <span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </nav>

      <div className="mt-4">
        {step === 'see' && <SeeStage id={id} d={d} onDone={invalidate} />}
        {step === 'evaluate' && <PestelStage id={id} items={bundle.pestel} onDone={invalidate} />}
        {step === 'reveal' && <SwotStage id={id} items={bundle.swot} onDone={invalidate} />}
        {step === 'define' && <OptionsStage id={id} options={bundle.options} onDone={invalidate} />}
        {step === 'interrogate' && <InterrogateStage id={id} options={bundle.options} redTeam={bundle.red_team} onDone={invalidate} />}
        {step === 'compare' && <CompareStage id={id} d={d} options={bundle.options} scores={bundle.scores} audit={audit} onDone={invalidate} />}
        {step === 'decide' && <DecideStage id={id} d={d} options={bundle.options} audit={audit} onDone={invalidate} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- shared bits
function normalizeAudit(row: Row | null): { audit_status: string; blocking_errors: string[]; warnings: string[] } | null {
  if (!row) return null;
  if (row.result_json) {
    try {
      const r = JSON.parse(row.result_json);
      return { audit_status: r.audit_status, blocking_errors: r.blocking_errors ?? [], warnings: r.warnings ?? [] };
    } catch {
      /* fall through */
    }
  }
  return { audit_status: row.audit_status, blocking_errors: [], warnings: [] };
}
const asClass = (v: string) => (v === 'DIFFÉRER' ? 'DIFFERER' : v);

function Provenance({ row }: { row: Row }) {
  if (row.source_kind === 'manual') return null;
  const tone =
    row.status === 'validated'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
      : row.status === 'rejected'
        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  return (
    <span className={`badge-candidate ${tone}`} title={row.source_ref ?? ''}>
      {row.status === 'candidate' ? fr.ws.candidate : row.status} · {row.source_kind}
    </span>
  );
}

function CandidateActions({ id, kind, item, onDone }: { id: string; kind: 'pestel' | 'swot'; item: Row; onDone: () => void }) {
  const setStatus = useMutation({
    mutationFn: (status: string) => api.patch(`/api/decisions/${id}/${kind}/${item.id}`, { status }),
    onSuccess: onDone,
  });
  const del = useMutation({
    mutationFn: () => api.del(`/api/decisions/${id}/${kind}/${item.id}`),
    onSuccess: onDone,
  });
  return (
    <div className="mt-1 flex gap-2 text-xs">
      {item.status !== 'validated' && (
        <button onClick={() => setStatus.mutate('validated')} className="text-emerald-600 hover:underline">{fr.ws.validate}</button>
      )}
      {item.status !== 'rejected' && (
        <button onClick={() => setStatus.mutate('rejected')} className="text-amber-600 hover:underline">{fr.ws.reject}</button>
      )}
      <button onClick={() => del.mutate()} className="text-red-600 hover:underline">{fr.ws.remove}</button>
    </div>
  );
}

// ---------------------------------------------------------------- ingestion
function Ingest({ id, onDone }: { id: string; onDone: () => void }) {
  const [ref, setRef] = useState('');
  const [msg, setMsg] = useState('');
  const ingest = useMutation({
    mutationFn: () => api.post<{ ingested: { pestel: number; swot: number; options: number } }>(`/api/decisions/${id}/ingest`, { hdde_case_ref: ref }),
    onSuccess: (r) => {
      setMsg(`${r.ingested.pestel + r.ingested.swot + r.ingested.options} ${fr.ws.ingestDone}.`);
      onDone();
    },
    onError: (e) => setMsg(e instanceof ApiError && e.status === 502 ? fr.ws.ingestFail : String(e)),
  });
  return (
    <div className="card mt-4 flex flex-wrap items-end gap-3">
      <label className="text-sm">
        <span className="font-medium">{fr.ws.ingestRef}</span>
        <input value={ref} onChange={(e) => setRef(e.target.value)} className="field" placeholder="case-id HDDE" />
      </label>
      <button className="btn" disabled={!ref || ingest.isPending} onClick={() => ingest.mutate()}>
        {fr.ws.ingestRun}
      </button>
      {msg && <span className="text-sm text-slatewarn dark:text-slate-400">{msg}</span>}
    </div>
  );
}

// ---------------------------------------------------------------- V
function SeeStage({ id, d, onDone }: { id: string; d: Row; onDone: () => void }) {
  const [situation, setSituation] = useState(d.situation ?? '');
  const save = useMutation({
    mutationFn: () => api.patch(`/api/decisions/${id}`, { situation }),
    onSuccess: onDone,
  });
  return (
    <section className="card">
      <h2 className="font-semibold">V — Voir la situation réelle</h2>
      <p className="mt-1 text-sm text-slatewarn dark:text-slate-400">Énoncez la situation sans solution préférée.</p>
      <textarea value={situation} onChange={(e) => setSituation(e.target.value)} rows={5} className="field mt-3" />
      <button className="btn mt-3" disabled={save.isPending} onClick={() => save.mutate()}>{fr.ws.save}</button>
    </section>
  );
}

// ---------------------------------------------------------------- E
function PestelStage({ id, items, onDone }: { id: string; items: Row[]; onDone: () => void }) {
  const add = useMutation({
    mutationFn: (body: Row) => api.post(`/api/decisions/${id}/pestel`, body),
    onSuccess: onDone,
  });
  return (
    <section className="card">
      <h2 className="font-semibold">E — PESTEL décisionnel</h2>
      <p className="mt-1 text-sm text-slatewarn dark:text-slate-400">Uniquement les facteurs qui changent le coût, le risque, le timing ou une hypothèse d’une option.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PESTEL_CATEGORIES.map((cat) => (
          <div key={cat} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <h3 className="text-sm font-semibold">{PESTEL_FR[cat]}</h3>
            <ul className="mt-2 space-y-2">
              {items.filter((f) => f.category === cat).map((f) => (
                <li key={f.id} className={`rounded border border-slate-200 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900 ${f.status === 'rejected' ? 'opacity-50' : ''}`}>
                  <div>{f.statement}</div>
                  {f.decisional_impact && <div className="text-xs text-slatewarn dark:text-slate-400">→ {f.decisional_impact}</div>}
                  <div className="mt-1"><Provenance row={f} /></div>
                  <CandidateActions id={id} kind="pestel" item={f} onDone={onDone} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <AddForm
        fields={[
          { name: 'category', label: 'Catégorie', type: 'select', options: PESTEL_CATEGORIES.map((c) => [c, PESTEL_FR[c]]) },
          { name: 'statement', label: 'Facteur', type: 'text', required: true },
          { name: 'decisional_impact', label: 'Impact décisionnel', type: 'text' },
        ]}
        onSubmit={(v) => add.mutate(v)}
      />
    </section>
  );
}

// ---------------------------------------------------------------- R
function SwotStage({ id, items, onDone }: { id: string; items: Row[]; onDone: () => void }) {
  const add = useMutation({
    mutationFn: (body: Row) => api.post(`/api/decisions/${id}/swot`, body),
    onSuccess: onDone,
  });
  return (
    <section className="card">
      <h2 className="font-semibold">R — SWOT décisionnelle</h2>
      <p className="mt-1 text-sm text-slatewarn dark:text-slate-400">Une force sans preuve est une hypothèse.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {SWOT_QUADRANTS.map((q) => (
          <div key={q} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <h3 className="text-sm font-semibold">{SWOT_FR[q]}</h3>
            <ul className="mt-2 space-y-2">
              {items.filter((s) => s.quadrant === q).map((s) => (
                <li key={s.id} className={`rounded border border-slate-200 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900 ${s.status === 'rejected' ? 'opacity-50' : ''}`}>
                  <div>{s.statement}{s.is_hypothesis ? <em className="text-xs text-slatewarn"> (hypothèse)</em> : null}</div>
                  <div className="mt-1"><Provenance row={s} /></div>
                  <CandidateActions id={id} kind="swot" item={s} onDone={onDone} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <AddForm
        fields={[
          { name: 'quadrant', label: 'Quadrant', type: 'select', options: SWOT_QUADRANTS.map((q) => [q, SWOT_FR[q]]) },
          { name: 'statement', label: 'Élément', type: 'text', required: true },
        ]}
        onSubmit={(v) => add.mutate(v)}
      />
    </section>
  );
}

// ---------------------------------------------------------------- D
function OptionsStage({ id, options, onDone }: { id: string; options: Row[]; onDone: () => void }) {
  const present = new Set(options.map((o) => o.type));
  const missing = OPTION_TYPES.filter((t) => (t === 'opposite' || t === 'active_non_action' ? false : !present.has(t)));
  const needOpposite = !present.has('opposite') && !present.has('active_non_action');
  return (
    <section className="space-y-3">
      <div className="card">
        <h2 className="font-semibold">D — Définir les options</h2>
        <p className="mt-1 text-sm text-slatewarn dark:text-slate-400">
          ≥3 options : principale + alternative minimale + opposée/non-action.
          {(missing.length > 0 || needOpposite) && (
            <span className="ml-1 text-amber-600">Manque : {[...missing.map((m) => OPTION_TYPE_FR[m]), needOpposite ? 'Opposée/Non-action' : ''].filter(Boolean).join(', ')}.</span>
          )}
        </p>
      </div>
      {options.map((o) => (
        <OptionEditor key={o.id} id={id} option={o} onDone={onDone} />
      ))}
      <OptionEditor id={id} onDone={onDone} />
    </section>
  );
}

function OptionEditor({ id, option, onDone }: { id: string; option?: Row; onDone: () => void }) {
  const isNew = !option;
  const canvas0 = (() => {
    try {
      return option?.canvas_json ? JSON.parse(option.canvas_json) : {};
    } catch {
      return {};
    }
  })();
  const [form, setForm] = useState<Row>({
    option_id: option?.option_id ?? '',
    type: option?.type ?? 'main',
    title: option?.title ?? '',
    description: option?.description ?? '',
    critical_hypothesis: option?.critical_hypothesis ?? '',
    main_evidence: option?.main_evidence ?? '',
    main_contradiction: option?.main_contradiction ?? '',
    proof_level: option?.proof_level ?? 0,
    canvas: canvas0,
  });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const save = useMutation({
    mutationFn: () => api.put(`/api/decisions/${id}/options`, form),
    onSuccess: onDone,
  });
  const del = useMutation({
    mutationFn: () => api.del(`/api/decisions/${id}/options/${option!.option_id}`),
    onSuccess: onDone,
  });

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{isNew ? 'Nouvelle option' : `${OPTION_TYPE_FR[form.type]} — ${form.title || form.option_id}`}</h3>
        {!isNew && <Provenance row={option!} />}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Labelled label="Identifiant"><input className="field" value={form.option_id} disabled={!isNew} onChange={(e) => set('option_id', e.target.value)} /></Labelled>
        <Labelled label="Type">
          <select className="field" value={form.type} onChange={(e) => set('type', e.target.value)}>
            {OPTION_TYPES.map((t) => <option key={t} value={t}>{OPTION_TYPE_FR[t]}</option>)}
          </select>
        </Labelled>
        <Labelled label="Titre" full><input className="field" value={form.title} onChange={(e) => set('title', e.target.value)} /></Labelled>
        <Labelled label="Hypothèse critique" full><input className="field" value={form.critical_hypothesis} onChange={(e) => set('critical_hypothesis', e.target.value)} /></Labelled>
        <Labelled label="Preuve principale"><input className="field" value={form.main_evidence} onChange={(e) => set('main_evidence', e.target.value)} /></Labelled>
        <Labelled label="Contradiction principale"><input className="field" value={form.main_contradiction} onChange={(e) => set('main_contradiction', e.target.value)} /></Labelled>
        <Labelled label={`Niveau de preuve : ${form.proof_level}`} full>
          <input type="range" min={0} max={5} value={form.proof_level} onChange={(e) => set('proof_level', Number(e.target.value))} className="w-full" />
          <span className="text-xs text-slatewarn dark:text-slate-400">{proofLevels[form.proof_level]?.label}</span>
        </Labelled>
      </div>
      <fieldset className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
        <legend className="px-1 text-xs font-semibold text-slatewarn dark:text-slate-400">Canvas de viabilité systémique</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {CANVAS_FIELDS.map(([k, label]) => (
            <Labelled key={k} label={label}>
              <input className="field" value={form.canvas[k] ?? ''} onChange={(e) => set('canvas', { ...form.canvas, [k]: e.target.value })} />
            </Labelled>
          ))}
        </div>
      </fieldset>
      <div className="mt-3 flex gap-2">
        <button className="btn" disabled={!form.option_id || !form.title || save.isPending} onClick={() => save.mutate()}>{fr.ws.save}</button>
        {!isNew && <button className="btn-ghost text-red-600" onClick={() => del.mutate()}>{fr.ws.remove}</button>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- I
const RED_TEAM_ROLES: [string, string][] = [
  ['red_team_option', 'Attaquer l’option'],
  ['minimal_alternative', 'Alternative minimale'],
  ['truth_test', 'Concevoir un test de vérité'],
];

function InterrogateStage({ id, options, redTeam, onDone }: { id: string; options: Row[]; redTeam: Row[]; onDone: () => void }) {
  const [role, setRole] = useState('red_team_option');
  const [target, setTarget] = useState('');
  const [err, setErr] = useState('');
  const run = useMutation({
    mutationFn: () => api.post(`/api/decisions/${id}/red-team/run`, { role, target_option_id: target || null }),
    onSuccess: () => { setErr(''); onDone(); },
    onError: (e) => setErr(e instanceof ApiError && e.status === 502 ? 'Échec de l’appel LLM.' : String(e)),
  });
  const review = useMutation({
    mutationFn: ({ sid, status }: { sid: string; status: string }) => api.patch(`/api/decisions/${id}/red-team/${sid}`, { status }),
    onSuccess: onDone,
  });
  return (
    <section className="space-y-3">
      <div className="card">
        <h2 className="font-semibold">I — Interroger hypothèses, preuves et biais</h2>
        <p className="mt-1 text-sm text-slatewarn dark:text-slate-400">Pour chaque option : hypothèse, preuve, contradiction, niveau de preuve.</p>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-xs text-slatewarn dark:text-slate-400">
            <tr><th className="py-1">Option</th><th>Preuve</th><th>Hypothèse critique</th><th>Contradiction</th></tr>
          </thead>
          <tbody>
            {options.map((o) => (
              <tr key={o.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className="py-2 pr-2 font-medium">{o.title}</td>
                <td className="pr-2 tabular-nums">{o.proof_level}/5</td>
                <td className="pr-2">{o.critical_hypothesis || '—'}</td>
                <td>{o.main_contradiction || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold">Red team d’arbitrage</h3>
        <p className="mt-1 text-xs text-slatewarn dark:text-slate-400">Sortie = suggestion (preuve niveau 0), jamais un verdict. L’analyste accepte ou rejette.</p>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="font-medium">Mode</span>
            <select className="field" value={role} onChange={(e) => setRole(e.target.value)}>
              {RED_TEAM_ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium">Option ciblée</span>
            <select className="field" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">(retenue / principale)</option>
              {options.map((o) => <option key={o.option_id} value={o.option_id}>{o.title}</option>)}
            </select>
          </label>
          <button className="btn" disabled={run.isPending} onClick={() => run.mutate()}>Lancer</button>
          {err && <span className="text-sm text-red-600">{err}</span>}
        </div>

        <ul className="mt-3 space-y-2">
          {redTeam.length === 0 && <li className="text-sm text-slatewarn dark:text-slate-400">Aucune suggestion.</li>}
          {redTeam.map((s) => {
            const sug = typeof s.suggestion_json === 'string' ? safeParse(s.suggestion_json) : s.suggestion_json;
            return (
              <li key={s.id} className="rounded border border-slate-200 p-3 text-sm dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span><span className="chip bg-slate-100 dark:bg-slate-700">{s.role}</span> · {s.status}</span>
                  <span className="flex gap-2 text-xs">
                    {s.status !== 'accepted' && <button className="text-emerald-600 hover:underline" onClick={() => review.mutate({ sid: s.id, status: 'accepted' })}>Accepter</button>}
                    {s.status !== 'rejected' && <button className="text-amber-600 hover:underline" onClick={() => review.mutate({ sid: s.id, status: 'rejected' })}>Rejeter</button>}
                  </span>
                </div>
                {sug && (
                  <div className="mt-1 text-slatewarn dark:text-slate-300">
                    <div className="font-medium text-ink dark:text-slate-100">{sug.main_objection}</div>
                    {Array.isArray(sug.missing_proofs) && sug.missing_proofs.length > 0 && (
                      <div className="mt-1 text-xs">Preuves manquantes : {sug.missing_proofs.join(' · ')}</div>
                    )}
                    {sug.could_change_recommendation && (
                      <div className="mt-1 text-xs text-amber-600">Pourrait changer la recommandation : {sug.reason}</div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function safeParse(s: string): Row | null {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- C
function CompareStage({ id, d, options, scores, audit, onDone }: { id: string; d: Row; options: Row[]; scores: Row[]; audit: ReturnType<typeof normalizeAudit>; onDone: () => void }) {
  const scoreByOpt = useMemo(() => Object.fromEntries(scores.map((s) => [s.option_id, s])), [scores]);
  const hasProfile = Boolean(d.weight_profile_json);
  const setProfile = useMutation({
    mutationFn: () => api.put(`/api/decisions/${id}/weight-profile`, { profile: 'standard', adapted_before_scoring: true, justification: '', weights: DEFAULT_WEIGHTS }),
    onSuccess: onDone,
  });
  const runAudit = useMutation({
    mutationFn: () => api.post(`/api/decisions/${id}/audit`, {}),
    onSuccess: onDone,
  });
  return (
    <section className="space-y-3">
      <div className="card">
        <h2 className="font-semibold">C — Comparer (score, risques, vetos)</h2>
        <p className="mt-1 text-sm text-slatewarn dark:text-slate-400">Le score ouvre une possibilité ; les vetos peuvent l’interdire.</p>
        {!hasProfile && (
          <button className="btn mt-2" onClick={() => setProfile.mutate()}>Activer le profil de poids standard</button>
        )}
      </div>
      {options.map((o) => (
        <ScoreEditor key={o.id} id={id} option={o} score={scoreByOpt[o.option_id]} onDone={onDone} />
      ))}
      <div className="card">
        <button className="btn" onClick={() => runAudit.mutate()} disabled={runAudit.isPending}>{fr.ws.runAudit}</button>
        {audit && (
          <div className="mt-3">
            <span className={`chip ${auditClass[audit.audit_status]}`}>{audit.audit_status}</span>
            {audit.blocking_errors.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
                {audit.blocking_errors.map((e) => <li key={e}><code>{e}</code></li>)}
              </ul>
            )}
            {audit.warnings.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm text-amber-600">
                {audit.warnings.map((w) => <li key={w}><code>{w}</code></li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ScoreEditor({ id, option, score, onDone }: { id: string; option: Row; score?: Row; onDone: () => void }) {
  const initial = (() => {
    try {
      return score?.criteria_json ? JSON.parse(score.criteria_json) : {};
    } catch {
      return {};
    }
  })();
  const [criteria, setCriteria] = useState<Record<string, number>>(
    Object.fromEntries(CRITERIA.map((c) => [c, initial[c] ?? 0])),
  );
  const save = useMutation({
    mutationFn: () => api.put<Row>(`/api/decisions/${id}/options/${option.option_id}/score`, { criteria }),
    onSuccess: onDone,
  });
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{OPTION_TYPE_FR[option.type]} — {option.title}</h3>
        {score && (
          <span className="text-xs text-slatewarn dark:text-slate-400">
            {fr.ws.rawScore} {score.raw_score} · {fr.ws.adjScore} {score.adjusted_score}
          </span>
        )}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {CRITERIA.map((c) => (
          <label key={c} className="text-xs">
            <span className="font-medium">{criterionLabels[c].label} ({criterionLabels[c].weight})</span>
            <input
              type="number" min={0} max={5} value={criteria[c]}
              onChange={(e) => setCriteria((p) => ({ ...p, [c]: Math.max(0, Math.min(5, Number(e.target.value))) }))}
              className="field"
            />
          </label>
        ))}
      </div>
      <button className="btn mt-3" onClick={() => save.mutate()} disabled={save.isPending}>Calculer le score</button>
    </div>
  );
}

// ---------------------------------------------------------------- T
function DecideStage({ id, d, options, audit, onDone }: { id: string; d: Row; options: Row[]; audit: ReturnType<typeof normalizeAudit>; onDone: () => void }) {
  const tt0 = (() => {
    try {
      return d.truth_test_json ? JSON.parse(d.truth_test_json) : {};
    } catch {
      return {};
    }
  })();
  const [form, setForm] = useState<Row>({
    final_verdict: d.final_verdict ?? 'TESTER',
    selected_option_id: d.selected_option_id ?? '',
    confidence: d.confidence ?? 'moyenne',
    stop_threshold: d.stop_threshold ?? '',
    review_date: d.review_date ?? '',
    human_validation: Boolean(d.human_validation),
    why_faire_not_tester: d.why_faire_not_tester ?? '',
    defer_reason: d.defer_reason ?? '',
    reopening_signal: d.reopening_signal ?? '',
    abandonment_disposition: d.abandonment_disposition ?? '',
    truth_test: { can_kill_option: false, ...tt0 },
  });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const setTT = (k: string, v: unknown) => setForm((f) => ({ ...f, truth_test: { ...f.truth_test, [k]: v } }));
  const save = useMutation({
    mutationFn: () => api.patch(`/api/decisions/${id}`, form),
    onSuccess: onDone,
  });
  const v = form.final_verdict;
  const TT_FIELDS: [string, string][] = [
    ['critical_hypothesis', 'Hypothèse critique'], ['minimal_protocol', 'Protocole minimal'],
    ['max_duration', 'Durée max'], ['max_cost', 'Coût max'],
    ['success_signal', 'Signal de succès'], ['failure_signal', 'Signal d’échec'],
    ['decision_if_success', 'Décision si succès'], ['decision_if_failure', 'Décision si échec'],
  ];
  return (
    <section className="card">
      <h2 className="font-semibold">T — Trancher, tester ou différer</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Labelled label="Verdict">
          <select className="field" value={v} onChange={(e) => set('final_verdict', e.target.value)}>
            {Object.keys(verdictLabels).map((k) => <option key={k} value={k}>{k} — {verdictLabels[k as keyof typeof verdictLabels].label}</option>)}
          </select>
        </Labelled>
        <Labelled label="Option retenue">
          <select className="field" value={form.selected_option_id} onChange={(e) => set('selected_option_id', e.target.value)}>
            <option value="">—</option>
            {options.map((o) => <option key={o.option_id} value={o.option_id}>{o.title}</option>)}
          </select>
        </Labelled>
        <Labelled label="Confiance">
          <select className="field" value={form.confidence} onChange={(e) => set('confidence', e.target.value)}>
            {['faible', 'moyenne', 'forte'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Labelled>
        <Labelled label="Seuil d’arrêt"><input className="field" value={form.stop_threshold} onChange={(e) => set('stop_threshold', e.target.value)} /></Labelled>
        <Labelled label="Date de revue"><input type="date" className="field" value={form.review_date} onChange={(e) => set('review_date', e.target.value)} /></Labelled>
        <label className="mt-6 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.human_validation} onChange={(e) => set('human_validation', e.target.checked)} />
          Validation humaine
        </label>
      </div>

      {v === 'FAIRE' && (
        <Labelled label="Pourquoi FAIRE plutôt que TESTER ?" full><input className="field" value={form.why_faire_not_tester} onChange={(e) => set('why_faire_not_tester', e.target.value)} /></Labelled>
      )}
      {v === 'TESTER' && (
        <fieldset className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <legend className="px-1 text-xs font-semibold text-slatewarn dark:text-slate-400">Test de vérité (obligatoire)</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {TT_FIELDS.map(([k, label]) => (
              <Labelled key={k} label={label}>
                <input className="field" value={form.truth_test[k] ?? ''} onChange={(e) => setTT(k, e.target.value)} />
              </Labelled>
            ))}
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(form.truth_test.can_kill_option)} onChange={(e) => setTT('can_kill_option', e.target.checked)} />
            Le test peut tuer l’option
          </label>
        </fieldset>
      )}
      {v === 'DIFFÉRER' && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Labelled label="Motif du report"><input className="field" value={form.defer_reason} onChange={(e) => set('defer_reason', e.target.value)} /></Labelled>
          <Labelled label="Signal de réouverture"><input className="field" value={form.reopening_signal} onChange={(e) => set('reopening_signal', e.target.value)} /></Labelled>
        </div>
      )}
      {v === 'ABANDONNER' && (
        <Labelled label="Disposition (archiver / transformer / surveiller / remplacer)" full><input className="field" value={form.abandonment_disposition} onChange={(e) => set('abandonment_disposition', e.target.value)} /></Labelled>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button className="btn" onClick={() => save.mutate()} disabled={save.isPending}>{fr.ws.save}</button>
        {audit && <span className={`chip ${auditClass[audit.audit_status]}`}>Audit : {audit.audit_status}</span>}
      </div>

      <ExportsPanel id={id} />
    </section>
  );
}

function ExportsPanel({ id }: { id: string }) {
  const [files, setFiles] = useState<{ filename: string; content: string }[] | null>(null);
  const gen = useMutation({
    mutationFn: () => api.post<{ files: { filename: string; content: string }[] }>(`/api/decisions/${id}/exports`, {}),
    onSuccess: (r) => setFiles(r.files),
  });
  const fr_md = files?.find((f) => f.filename === 'decision.fr.md');
  return (
    <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <button className="btn-ghost" onClick={() => gen.mutate()} disabled={gen.isPending}>Générer la note de décision (FR/EN)</button>
        {files && <span className="text-xs text-slatewarn dark:text-slate-400">{files.map((f) => f.filename).join(' · ')}</span>}
      </div>
      {fr_md && (
        <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-900">{fr_md.content}</pre>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- tiny helpers
function Labelled({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`text-sm ${full ? 'sm:col-span-2' : ''}`}>
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

interface AddField {
  name: string;
  label: string;
  type: 'text' | 'select';
  required?: boolean;
  options?: readonly (readonly [string, string])[];
}
function AddForm({ fields, onSubmit }: { fields: AddField[]; onSubmit: (v: Record<string, string>) => void }) {
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onSubmit(Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v)])));
    e.currentTarget.reset();
  }
  return (
    <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
      {fields.map((fl) => (
        <label key={fl.name} className="text-sm">
          <span className="font-medium">{fl.label}</span>
          {fl.type === 'select' ? (
            <select name={fl.name} className="field">
              {fl.options!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ) : (
            <input name={fl.name} required={fl.required} className="field" />
          )}
        </label>
      ))}
      <button className="btn">{fr.ws.add}</button>
    </form>
  );
}
