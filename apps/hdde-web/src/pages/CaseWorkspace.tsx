import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { fr } from '../i18n/fr';

// Loose shapes for pack/packet payloads served by the API.
interface Question {
  id: string;
  block_id: string;
  order: number;
  type: string;
  text_fr: string;
  answer_options?: string[];
}
interface Pack {
  dimensions: { id: string; label_fr: string }[];
  interview_blocks: { id: string; order: number; label_fr: string }[];
  questions: Question[];
  personas: { id: string; label_fr: string }[];
}
interface Packet {
  id: string;
  version_number: number;
  status: string;
  operational_verdict: string;
  confidence: string;
  primary_diagnosis: string;
  packet_json: {
    scores: { dimension_id: string; value: number; confidence: string }[];
    activated_patterns: { id: string; label_fr: string }[];
    red_flags: { id: string; severity: number; message: string }[];
    open_uncertainties: { uncertainty: string; required_test: string }[];
    light_actions: { priority: number; action: string; purpose: string }[];
    cvi?: { vulnerability_level: string };
    entities?: {
      id: string;
      name: string;
      entity_type: string;
      operational_verdict: string;
      top_risk: string;
    }[];
    concentration?: {
      supplier_count: number;
      customer_count: number;
      site_count: number;
      single_source_supplier_count: number;
      tier2_blind_spots: number;
      customer_top_share_pct: number | null;
      supplier_top_country: string | null;
      supplier_top_country_count: number;
      notes: string[];
    };
    matrix_rows: {
      dependency: string;
      actor: string;
      actor_role: string;
      mechanism: string;
      risk_level: number;
      confidence: string;
    }[];
  };
}

interface Entity {
  id: string;
  entity_type: string;
  name: string;
  country?: string;
  criticality: number;
  substitutability: string;
  tier2_visibility: string;
  single_source: boolean;
  share_pct?: number | null;
  what_it_enables?: string;
}
const ENTITY_TYPES = [
  'supplier',
  'customer',
  'site',
  'logistics_provider',
  'bank',
  'insurer',
  'regulator',
  'partner',
];
const ENTITY_LABELS: Record<string, string> = {
  supplier: 'Fournisseurs',
  customer: 'Clients',
  site: 'Sites',
  logistics_provider: 'Logistique',
  bank: 'Banques',
  insurer: 'Assureurs',
  regulator: 'Régulateurs',
  partner: 'Partenaires',
};
const ANSWER_TYPES = [
  'verified_fact',
  'estimate',
  'hypothesis',
  'intuition',
  'unknown',
  'not_applicable',
];

export default function CaseWorkspace() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const inval = () => {
    qc.invalidateQueries({ queryKey: ['packets', id] });
    qc.invalidateQueries({ queryKey: ['answers', id] });
    qc.invalidateQueries({ queryKey: ['suggestions', id] });
    qc.invalidateQueries({ queryKey: ['entities', id] });
  };

  const { data: pack } = useQuery({
    queryKey: ['pack'],
    queryFn: () => api.get<Pack>('/api/pack'),
  });
  const { data: caseRow } = useQuery({
    queryKey: ['case', id],
    queryFn: () => api.get<any>(`/api/cases/${id}`),
  });
  const { data: answers } = useQuery({
    queryKey: ['answers', id],
    queryFn: () => api.get<any[]>(`/api/cases/${id}/interview/answers`),
  });
  const { data: packets } = useQuery({
    queryKey: ['packets', id],
    queryFn: () => api.get<Packet[]>(`/api/cases/${id}/diagnostic-packets`),
  });
  const { data: suggestions } = useQuery({
    queryKey: ['suggestions', id],
    queryFn: () => api.get<any[]>(`/api/cases/${id}/red-team/suggestions`),
  });
  const { data: entities } = useQuery({
    queryKey: ['entities', id],
    queryFn: () => api.get<Entity[]>(`/api/cases/${id}/entities`),
  });

  const generate = useMutation({
    mutationFn: () => api.post(`/api/cases/${id}/diagnostic-packets`),
    onSuccess: inval,
  });
  const latest = packets?.[0];

  // Build the interview using the Chokepoints Read API (ADR 0035): once the critical flow type is
  // answered, surface relevant corridors as candidates to help the analyst probe hidden dependencies.
  const flowType = (answers ?? []).find((a) => a.question_id === 'critical_flow_type')
    ?.normalized_answer as string | undefined;
  const { data: chokepoints } = useQuery({
    queryKey: ['chokepoints', id, flowType],
    enabled: !!flowType,
    queryFn: () =>
      api.get<{
        available: boolean;
        note: string;
        candidates: { id: string; canonical_name: string; family?: string }[];
      }>(`/api/cases/${id}/enrichment/chokepoints?flow_type=${encodeURIComponent(flowType!)}`),
  });

  if (!pack || !caseRow) return <div className="text-slatewarn dark:text-slate-400">…</div>;
  const answeredBy = new Map((answers ?? []).map((a) => [a.question_id, a]));

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: case + interview */}
      <div className="col-span-2 space-y-6">
        <section className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <h1 className="text-lg font-semibold">{caseRow.title}</h1>
          <p className="text-sm text-slatewarn dark:text-slate-400">
            {caseRow.sector}
            {caseRow.hq_country ? ` · HQ ${caseRow.hq_country}` : ''}
            {caseRow.employee_band ? ` · ${caseRow.employee_band} emp.` : ''}
            {caseRow.revenue_band ? ` · ${caseRow.revenue_band}` : ''}
          </p>
          <p className="mt-2 text-sm">{caseRow.business_function_at_risk}</p>
          {caseRow.description && (
            <p className="mt-1 text-xs text-slatewarn dark:text-slate-400">{caseRow.description}</p>
          )}
        </section>

        <RosterSection caseId={id!} entities={entities ?? []} onChange={inval} />

        <section className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <h2 className="font-semibold">{fr.interview.title}</h2>
          <div className="mt-3 space-y-5">
            {pack.interview_blocks
              .sort((a, b) => a.order - b.order)
              .map((block) => {
                const qs = pack.questions
                  .filter((q) => q.block_id === block.id)
                  .sort((a, b) => a.order - b.order);
                if (!qs.length) return null;
                return (
                  <div key={block.id}>
                    <h3 className="text-sm font-semibold text-slatewarn dark:text-slate-400">
                      {block.label_fr}
                    </h3>
                    <div className="mt-2 space-y-3">
                      {qs.map((q) => (
                        <QuestionRow
                          key={q.id}
                          caseId={id!}
                          q={q}
                          existing={answeredBy.get(q.id)}
                          onSaved={inval}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>

          {flowType && chokepoints && (
            <div className="mt-4 rounded-md border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-3">
              <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-200">
                Contexte chokepoints — flux « {flowType} »
              </h3>
              <p className="text-xs text-sky-800 dark:text-sky-300">{chokepoints.note}</p>
              {chokepoints.available && chokepoints.candidates.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-sky-900 dark:text-sky-200">
                  {chokepoints.candidates.map((k) => (
                    <CandidateRow key={k.id} caseId={id!} k={k} />
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-sky-700 dark:text-sky-400">
                  Aucun candidat (API non configurée ou aucun résultat).
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Right: diagnostic + red team */}
      <div className="space-y-6">
        <section className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{fr.diagnostic.title}</h2>
            <button
              onClick={() => generate.mutate()}
              className="rounded-md bg-ink px-2.5 py-1 text-xs font-semibold text-white"
            >
              {fr.diagnostic.generate}
            </button>
          </div>
          {!latest && <p className="mt-3 text-sm text-slatewarn dark:text-slate-400">—</p>}
          {latest && (
            <DiagnosticPanel caseId={id!} packet={latest} dims={pack.dimensions} onChange={inval} />
          )}
        </section>

        <section className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <h2 className="font-semibold">{fr.redteam.title}</h2>
          <div className="mt-2 rounded-md bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
            {fr.redteam.notEvidence}
          </div>
          <RedTeamRunner caseId={id!} personas={pack.personas} onRun={inval} />
          <div className="mt-3 space-y-2">
            {(suggestions ?? []).map((s) => (
              <SuggestionCard key={s.id} caseId={id!} s={s} onReview={inval} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function QuestionRow({
  caseId,
  q,
  existing,
  onSaved,
}: {
  caseId: string;
  q: Question;
  existing?: any;
  onSaved: () => void;
}) {
  const [raw, setRaw] = useState(existing?.raw_answer ?? '');
  const [norm, setNorm] = useState(existing?.normalized_answer ?? q.answer_options?.[0] ?? '');
  const [type, setType] = useState(existing?.answer_type ?? 'estimate');
  const [ev, setEv] = useState<number>(existing?.evidence_quality ?? 2);

  const save = useMutation({
    mutationFn: () =>
      api.post(`/api/cases/${caseId}/interview/answers`, {
        question_id: q.id,
        block_id: q.block_id,
        raw_answer: raw,
        normalized_answer: q.type === 'free_text' ? null : norm,
        answer_type: type,
        evidence_quality: Number(ev),
      }),
    onSuccess: onSaved,
  });

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3">
      <p className="text-sm">{q.text_fr}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {q.type !== 'free_text' && q.answer_options && (
          <select
            value={norm}
            onChange={(e) => setNorm(e.target.value)}
            className="rounded border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs"
          >
            {q.answer_options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        )}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs"
        >
          {ANSWER_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-xs text-slatewarn dark:text-slate-400">
          {fr.interview.evidenceQuality}
          <input
            type="number"
            min={0}
            max={5}
            value={ev}
            onChange={(e) => setEv(Number(e.target.value))}
            className="w-14 rounded border border-slate-300 dark:border-slate-700 px-2 py-1"
          />
        </label>
      </div>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Réponse client / note expert…"
        className="mt-2 w-full rounded border border-slate-300 dark:border-slate-700 px-2 py-1 text-sm"
        rows={2}
      />
      <button
        onClick={() => save.mutate()}
        className="mt-2 rounded bg-slate-700 px-2.5 py-1 text-xs font-semibold text-white"
      >
        {fr.interview.save}
      </button>
      {existing && <span className="ml-2 text-xs text-emerald-600">enregistré</span>}
    </div>
  );
}

function DiagnosticPanel({
  caseId,
  packet,
  dims,
  onChange,
}: {
  caseId: string;
  packet: Packet;
  dims: { id: string; label_fr: string }[];
  onChange: () => void;
}) {
  const qc = useQueryClient();
  const validate = useMutation({
    mutationFn: () => api.post(`/api/cases/${caseId}/diagnostic-packets/${packet.id}/validate`),
    onSuccess: onChange,
  });
  const [exported, setExported] = useState<string[] | null>(null);
  const doExport = useMutation({
    mutationFn: () =>
      api.post<{ files: string[] }>(`/api/cases/${caseId}/diagnostic-packets/${packet.id}/exports`),
    onSuccess: (r) => setExported(r.files),
  });
  const label = (dimId: string) => dims.find((d) => d.id === dimId)?.label_fr ?? dimId;
  void qc;

  return (
    <div className="mt-3 space-y-3 text-sm">
      <div className="flex items-center gap-2">
        <span className={`chip verdict-${packet.operational_verdict}`}>
          {packet.operational_verdict}
        </span>
        <span className="text-xs text-slatewarn dark:text-slate-400">
          v{packet.version_number} · {fr.diagnostic.confidence}: {packet.confidence}
        </span>
        {packet.status === 'validated' ? (
          <span className="chip bg-emerald-100 text-emerald-800">{fr.diagnostic.validated}</span>
        ) : null}
      </div>
      {packet.status !== 'validated' && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          {fr.diagnostic.notValidated}
        </div>
      )}
      <div>
        <div className="font-medium">{fr.diagnostic.primary}</div>
        <div className="text-slatewarn dark:text-slate-400">
          {packet.primary_diagnosis}
          {packet.packet_json.cvi ? ` · CVI: ${packet.packet_json.cvi.vulnerability_level}` : ''}
        </div>
      </div>

      <details open>
        <summary className="cursor-pointer font-medium">{fr.diagnostic.scores}</summary>
        <ul className="mt-1 space-y-1">
          {packet.packet_json.scores.map((s) => (
            <li key={s.dimension_id} className="flex items-center justify-between text-xs">
              <span>{label(s.dimension_id)}</span>
              <span className="font-mono">
                {s.value}/5 · {s.confidence}
              </span>
            </li>
          ))}
        </ul>
      </details>

      {packet.packet_json.concentration && (
        <details open>
          <summary className="cursor-pointer font-medium">Synthèse entreprise</summary>
          <div className="mt-1 text-xs text-slatewarn dark:text-slate-400">
            {packet.packet_json.concentration.supplier_count} fournisseurs ·{' '}
            {packet.packet_json.concentration.customer_count} clients ·{' '}
            {packet.packet_json.concentration.site_count} sites
            {packet.packet_json.concentration.single_source_supplier_count > 0 &&
              ` · ${packet.packet_json.concentration.single_source_supplier_count} source(s) unique(s)`}
            {packet.packet_json.concentration.tier2_blind_spots > 0 &&
              ` · ${packet.packet_json.concentration.tier2_blind_spots} angle(s) mort(s) rang 2`}
          </div>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slatewarn dark:text-slate-400">
            {packet.packet_json.concentration.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </details>
      )}

      {packet.packet_json.entities && packet.packet_json.entities.length > 0 && (
        <details>
          <summary className="cursor-pointer font-medium">
            Posture par acteur ({packet.packet_json.entities.length})
          </summary>
          <ul className="mt-1 space-y-1">
            {packet.packet_json.entities
              .slice()
              .sort(
                (a, b) =>
                  ['monitor', 'prepare', 'act', 'escalate'].indexOf(b.operational_verdict) -
                  ['monitor', 'prepare', 'act', 'escalate'].indexOf(a.operational_verdict),
              )
              .map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate">{e.name}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    <span className="text-slatewarn dark:text-slate-400">{e.top_risk}</span>
                    <span className={`chip verdict-${e.operational_verdict}`}>
                      {e.operational_verdict}
                    </span>
                  </span>
                </li>
              ))}
          </ul>
        </details>
      )}

      <Block
        title={fr.diagnostic.patterns}
        items={packet.packet_json.activated_patterns.map((p) => p.label_fr)}
      />
      <Block
        title={fr.diagnostic.flags}
        items={packet.packet_json.red_flags.map((f) => f.message)}
      />
      <Block
        title={fr.diagnostic.uncertainties}
        items={packet.packet_json.open_uncertainties.map(
          (u) => `${u.uncertainty} → ${u.required_test}`,
        )}
      />
      <Block
        title={fr.diagnostic.actions}
        items={packet.packet_json.light_actions.map((a) => `[${a.priority}] ${a.action}`)}
      />

      <div className="flex gap-2 pt-1">
        {packet.status !== 'validated' && (
          <button
            onClick={() => validate.mutate()}
            className="rounded bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white"
          >
            {fr.diagnostic.validate}
          </button>
        )}
        <button
          onClick={() => doExport.mutate()}
          className="rounded bg-slate-700 px-2.5 py-1 text-xs font-semibold text-white"
        >
          {fr.diagnostic.export}
        </button>
      </div>
      {exported && <p className="text-xs text-emerald-700">Exporté : {exported.join(', ')}</p>}
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <details>
      <summary className="cursor-pointer font-medium">
        {title} ({items.length})
      </summary>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slatewarn dark:text-slate-400">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </details>
  );
}

function RedTeamRunner({
  caseId,
  personas,
  onRun,
}: {
  caseId: string;
  personas: { id: string; label_fr: string }[];
  onRun: () => void;
}) {
  const [persona, setPersona] = useState(personas[0]?.id ?? '');
  const run = useMutation({
    mutationFn: () => api.post(`/api/cases/${caseId}/red-team/run`, { persona }),
    onSuccess: onRun,
  });
  return (
    <div className="mt-2 flex items-center gap-2">
      <select
        value={persona}
        onChange={(e) => setPersona(e.target.value)}
        className="rounded border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs"
      >
        {personas.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label_fr}
          </option>
        ))}
      </select>
      <button
        onClick={() => run.mutate()}
        disabled={run.isPending}
        className="rounded bg-slate-700 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
      >
        {fr.redteam.run}
      </button>
    </div>
  );
}

function SuggestionCard({ caseId, s, onReview }: { caseId: string; s: any; onReview: () => void }) {
  const review = useMutation({
    mutationFn: (status: 'accepted' | 'rejected') =>
      api.patch(`/api/cases/${caseId}/red-team/suggestions/${s.id}`, { status }),
    onSuccess: onReview,
  });
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{s.persona}</span>
        <span
          className={`chip ${s.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:text-amber-200' : s.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700 dark:text-slate-200'}`}
        >
          {s.status}
        </span>
      </div>
      <p className="mt-1">{s.suggestion_json.main_objection}</p>
      {s.suggestion_json.analysis && (
        <details className="mt-1">
          <summary className="cursor-pointer text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Raisonnement du modèle
          </summary>
          <p className="mt-1 whitespace-pre-wrap text-slate-600 dark:text-slate-300">
            {s.suggestion_json.analysis}
          </p>
        </details>
      )}
      {s.status === 'pending' && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => review.mutate('accepted')}
            className="rounded bg-emerald-700 px-2 py-0.5 font-semibold text-white"
          >
            {fr.redteam.accept}
          </button>
          <button
            onClick={() => review.mutate('rejected')}
            className="rounded bg-slate-500 px-2 py-0.5 font-semibold text-white"
          >
            {fr.redteam.reject}
          </button>
        </div>
      )}
    </div>
  );
}

function RosterSection({
  caseId,
  entities,
  onChange,
}: {
  caseId: string;
  entities: Entity[];
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post(`/api/cases/${caseId}/entities`, body),
    onSuccess: () => {
      onChange();
      setOpen(false);
    },
  });
  const del = useMutation({
    mutationFn: (eid: string) => api.del(`/api/cases/${caseId}/entities/${eid}`),
    onSuccess: onChange,
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const o = Object.fromEntries(f.entries()) as Record<string, string>;
    create.mutate({
      entity_type: o.entity_type,
      name: o.name,
      country: o.country,
      what_it_enables: o.what_it_enables,
      criticality: Number(o.criticality),
      substitutability: o.substitutability,
      tier2_visibility: o.tier2_visibility,
      single_source: o.single_source === 'on',
      share_pct: o.share_pct ? Number(o.share_pct) : null,
    });
  }

  const grouped = ENTITY_TYPES.map((t) => ({
    type: t,
    items: entities.filter((e) => e.entity_type === t),
  })).filter((g) => g.items.length > 0);

  return (
    <section className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          Entreprise — roster{' '}
          <span className="font-normal text-slatewarn dark:text-slate-400">
            ({entities.length} acteurs)
          </span>
        </h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md bg-ink px-2.5 py-1 text-xs font-semibold text-white"
        >
          + Acteur
        </button>
      </div>

      {open && (
        <form
          onSubmit={submit}
          className="mt-3 grid grid-cols-2 gap-2 rounded-md border border-slate-200 p-3 text-xs dark:border-slate-700"
        >
          <select
            name="entity_type"
            className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700"
          >
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {ENTITY_LABELS[t]}
              </option>
            ))}
          </select>
          <input
            name="name"
            placeholder="Nom"
            required
            className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700"
          />
          <input
            name="country"
            placeholder="Pays / juridiction"
            className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700"
          />
          <input
            name="what_it_enables"
            placeholder="Ce qu'il rend possible"
            className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700"
          />
          <label className="flex items-center gap-1">
            Criticité
            <input
              name="criticality"
              type="number"
              min={0}
              max={5}
              defaultValue={3}
              className="w-14 rounded border border-slate-300 px-2 py-1 dark:border-slate-700"
            />
          </label>
          <select
            name="substitutability"
            className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700"
            defaultValue="unknown"
          >
            {['yes', 'partial', 'no', 'unknown'].map((s) => (
              <option key={s} value={s}>
                substituable: {s}
              </option>
            ))}
          </select>
          <select
            name="tier2_visibility"
            className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700"
            defaultValue="unknown"
          >
            {['yes', 'partial', 'no', 'unknown'].map((s) => (
              <option key={s} value={s}>
                visib. rang 2: {s}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1">
            Part %
            <input
              name="share_pct"
              type="number"
              min={0}
              max={100}
              className="w-16 rounded border border-slate-300 px-2 py-1 dark:border-slate-700"
            />
          </label>
          <label className="flex items-center gap-1">
            <input name="single_source" type="checkbox" /> source unique
          </label>
          <div className="col-span-2">
            <button className="rounded bg-slate-700 px-2.5 py-1 font-semibold text-white">
              Ajouter
            </button>
          </div>
        </form>
      )}

      {entities.length === 0 && (
        <p className="mt-3 text-sm text-slatewarn dark:text-slate-400">
          Aucun acteur. Ajoute fournisseurs, clients, sites, partenaires pour un topo complet.
        </p>
      )}
      <div className="mt-3 space-y-3">
        {grouped.map((g) => (
          <div key={g.type}>
            <h3 className="text-xs font-semibold text-slatewarn dark:text-slate-400">
              {ENTITY_LABELS[g.type]} ({g.items.length})
            </h3>
            <ul className="mt-1 divide-y divide-slate-100 dark:divide-slate-700">
              {g.items.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-1.5 text-sm">
                  <span>
                    <span className="font-medium">{e.name}</span>
                    {e.country ? (
                      <span className="text-slatewarn dark:text-slate-400"> · {e.country}</span>
                    ) : null}
                    <span className="ml-2 text-xs text-slatewarn dark:text-slate-400">
                      crit {e.criticality}/5 · subst {e.substitutability}
                      {e.single_source ? ' · source unique' : ''}
                      {e.share_pct ? ` · ${e.share_pct}%` : ''}
                    </span>
                  </span>
                  <button
                    onClick={() => del.mutate(e.id)}
                    className="text-xs text-slate-400 hover:text-red-600"
                    title="Supprimer"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// A chokepoint candidate that expands to reveal its corridor evidence (actors + signals) from the
// Chokepoints Read API. Evidence is fetched lazily on expand and framed as candidates to validate.
function CandidateRow({
  caseId,
  k,
}: {
  caseId: string;
  k: { id: string; canonical_name: string; family?: string };
}) {
  const [open, setOpen] = useState(false);
  const { data: evidence, isFetching, isError } = useQuery({
    queryKey: ['corridor-evidence', caseId, k.id],
    enabled: open,
    queryFn: () =>
      api.get<{
        available: boolean;
        note: string;
        actors: { name: string; actor_type?: string; control_type?: string; basis?: string }[];
        event_signals: { domain?: string; weight?: number; observed_on?: string; event_key?: string }[];
        perception: {
          count: number;
          families: {
            signal_family?: string;
            market_count?: number;
            consensus_probability?: number;
            total_liquidity?: number;
          }[];
          disclaimer?: string;
        } | null;
      }>(`/api/cases/${caseId}/enrichment/chokepoints/${encodeURIComponent(k.id)}/evidence`),
  });

  return (
    <li className="border-b border-sky-200/60 dark:border-sky-800/60 pb-1 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-left hover:underline"
      >
        <span aria-hidden>{open ? '▾' : '▸'}</span> {k.canonical_name}
        {k.family ? ` · ${k.family}` : ''}{' '}
        <span className="text-sky-700 dark:text-sky-400">(candidat — à valider)</span>
      </button>
      {open && (
        <div className="mt-1 pl-4">
          {isFetching && <p className="text-sky-700 dark:text-sky-400">Chargement…</p>}
          {isError && !isFetching && (
            <p className="text-red-600 dark:text-red-400">Évidence indisponible (erreur réseau).</p>
          )}
          {evidence && !isFetching && (
            <>
              {evidence.actors.length > 0 && (
                <div className="mt-1">
                  <span className="font-semibold">Acteurs :</span>{' '}
                  {evidence.actors
                    .map((a) => a.name + (a.control_type ? ` (${a.control_type})` : ''))
                    .join(', ')}
                </div>
              )}
              {evidence.event_signals.length > 0 && (
                <div className="mt-1">
                  <span className="font-semibold">Signaux d’événements :</span>{' '}
                  {evidence.event_signals.length} · domaines{' '}
                  {[...new Set(evidence.event_signals.map((s) => s.domain).filter(Boolean))].join(
                    ', ',
                  ) || '—'}
                </div>
              )}
              {evidence.perception && evidence.perception.count > 0 && (
                <div className="mt-1">
                  <span className="font-semibold">Perception :</span>{' '}
                  <span className="text-sky-700 dark:text-sky-400">
                    consensus des marchés de prédiction — anticipation, pas une preuve
                  </span>
                  <ul className="mt-0.5 pl-4">
                    {evidence.perception.families.map((f) => (
                      <li key={f.signal_family}>
                        {(f.signal_family ?? '—').replace(/_/g, ' ')}
                        {f.consensus_probability != null
                          ? ` · ${(f.consensus_probability * 100).toFixed(1)} %`
                          : ''}
                        {f.market_count != null ? ` · ${f.market_count} marché(s)` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!evidence.available && (
                <p className="text-sky-700 dark:text-sky-400">
                  Aucun acteur/signal pour ce corridor (scope read).
                </p>
              )}
            </>
          )}
        </div>
      )}
    </li>
  );
}
