import { useEffect, useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import type { ChokepointDetail, ChokepointSummary } from '@ag/chokepoints';
import { api } from '@/lib/api';
import { Badge, Button, inputClass, Separator, Sheet } from '@/components/ui';
import { PageHeader } from '@/components/common';

const PRIORITIES = ['P0', 'P1', 'P2', 'P3'] as const;
const humanize = (s?: string | null) => (s ? s.replace(/_/g, ' ') : '');
const prioTone = (p?: string) => (p === 'P0' ? 'blocked' : p === 'P1' ? 'at_risk' : 'neutral');

export function ExplorationPage() {
  const [items, setItems] = useState<ChokepointSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [priority, setPriority] = useState<string>('P0');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [explorerOpen, setExplorerOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setItems(null);
    setError(null);
    api
      .getChokepoints(priority || undefined)
      .then((r) => alive && setItems(r.items))
      .catch((e: unknown) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, [priority]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter(
      (c) => !q || c.canonical_name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
    );
  }, [items, query]);

  const taintedCount = (items ?? []).filter((c) => c.license_taint).length;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Exploration"
        subtitle="Base des chokepoints (interne, Tailscale). Inclut les données restreintes (read_tainted) — ne jamais republier sur le site public."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          className={inputClass('h-8 w-56')}
          placeholder="Rechercher un nœud…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-1">
          {PRIORITIES.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={priority === p ? 'default' : 'outline'}
              onClick={() => setPriority(priority === p ? '' : p)}
            >
              {p}
            </Button>
          ))}
        </div>
        <span className="text-xs text-muted">
          {items ? `${filtered.length} nœuds` : '…'}
          {taintedCount > 0 ? ` · ${taintedCount} restreints` : ''}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() => setExplorerOpen(true)}
        >
          Explorateur API
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-status-at_risk/30 bg-status-at_risk/10 p-4 text-sm text-status-at_risk">
          {error.includes('503')
            ? 'API chokepoints non configurée (token absent).'
            : `Erreur : ${error}`}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-line">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface">
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-3 py-2 font-medium">Nœud</th>
              <th className="px-3 py-2 font-medium">Famille</th>
              <th className="px-3 py-2 font-medium">Région</th>
              <th className="px-3 py-2 font-medium">Prio</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className="cursor-pointer border-b border-line/60 hover:bg-subtle"
              >
                <td className="px-3 py-2 font-medium">{c.canonical_name}</td>
                <td className="px-3 py-2 text-muted">{humanize(c.family)}</td>
                <td className="px-3 py-2 text-muted">{c.macro_region ?? '—'}</td>
                <td className="px-3 py-2">
                  <Badge tone={prioTone(c.priority_class)}>{c.priority_class ?? '—'}</Badge>
                </td>
                <td className="px-3 py-2">
                  {c.license_taint ? (
                    <Badge tone="blocked">
                      <ShieldAlert className="h-3 w-3" /> Restreint
                    </Badge>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet
        open={selectedId !== null}
        onOpenChange={(o) => !o && setSelectedId(null)}
        title="Chokepoint"
      >
        {selectedId ? <DetailPanel key={selectedId} id={selectedId} /> : null}
      </Sheet>

      <Sheet open={explorerOpen} onOpenChange={setExplorerOpen} title="Explorateur API (read)">
        <ResourceExplorer />
      </Sheet>
    </div>
  );
}

// Every non-corridor-scoped Read API endpoint, surfaced as a one-click resource. `text: true` marks
// the raw NDJSON export. Search/nearby take params and are handled inline below.
const API_RESOURCES: { label: string; path: string; text?: boolean }[] = [
  { label: 'health (liveness API)', path: 'health' },
  { label: 'actors', path: 'actors' },
  { label: 'relations', path: 'relations' },
  { label: 'sources', path: 'sources' },
  { label: 'vocabularies', path: 'vocabularies' },
  { label: 'strategic-systems', path: 'strategic-systems' },
  { label: 'episodes', path: 'episodes' },
  { label: 'alerts', path: 'alerts' },
  { label: 'analytics / results', path: 'analytics/results' },
  { label: 'analytics / engine-runs', path: 'analytics/engine-runs' },
  { label: 'chokepoint-analyses', path: 'chokepoint-analyses' },
  { label: 'exports / jsonl', path: 'exports/jsonl', text: true },
];

function ResourceExplorer() {
  const [title, setTitle] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  async function run(label: string, path: string, text = false) {
    setTitle(label);
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(text ? await api.exploreText(path) : await api.exploreResource(path));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-muted">
        Proxy interne (token côté serveur) sur toute la surface lecture de l'API chokepoints. Données
        dérivées = candidats à valider ; peut inclure des enregistrements restreints — usage interne.
      </p>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) run(`search « ${q.trim()} »`, `chokepoints/search?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <input
          className={inputClass('h-8 flex-1')}
          placeholder="Recherche plein-texte (search)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button size="sm" type="submit" disabled={!q.trim()}>
          Chercher
        </Button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {API_RESOURCES.map((r) => (
          <Button
            key={r.path}
            size="sm"
            variant={title === r.label ? 'default' : 'outline'}
            onClick={() => run(r.label, r.path, r.text)}
          >
            {r.label}
          </Button>
        ))}
      </div>

      {title ? (
        <>
          <Separator />
          <ResultView title={title} busy={busy} error={error} result={result} />
        </>
      ) : null}
    </div>
  );
}

function ResultView({
  title,
  busy,
  error,
  result,
}: {
  title: string;
  busy: boolean;
  error: string | null;
  result: unknown;
}) {
  const count = Array.isArray(result) ? result.length : null;
  const isCvi = title.includes('cvi-assessment');
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className="label text-[11px] uppercase tracking-wider text-muted">{title}</span>
        {count !== null ? <Badge tone="neutral">{count}</Badge> : null}
      </div>
      {busy ? <p className="text-sm text-muted">Chargement…</p> : null}
      {error ? (
        <p className="text-sm text-status-blocked">
          {error.includes('404') && isCvi
            ? 'cvi-assessment : endpoint pas encore livré côté producteur (voir le brief). Se câblera au bump 0.3.0.'
            : error.includes('503')
              ? 'API chokepoints non configurée (token absent).'
              : `Erreur : ${error}`}
        </p>
      ) : null}
      {!busy && !error && result !== null ? (
        <pre className="max-h-80 overflow-auto rounded-md border border-line bg-subtle p-2 text-[11px] leading-relaxed">
          {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}

function DetailPanel({ id }: { id: string }) {
  const [detail, setDetail] = useState<ChokepointDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setDetail(null);
    setError(null);
    api
      .getChokepointDetail(id)
      .then((d) => alive && setDetail(d))
      .catch((e: unknown) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, [id]);

  if (error) return <p className="text-sm text-status-blocked">Erreur : {error}</p>;
  if (!detail) return <p className="text-sm text-muted">Chargement…</p>;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={prioTone(detail.priority_class)}>{detail.priority_class ?? '—'}</Badge>
          <Badge tone="neutral">{humanize(detail.family)}</Badge>
          {detail.license_taint ? <Badge tone="blocked">Restreint</Badge> : null}
        </div>
        <h3 className="mt-2 text-base font-semibold">{detail.canonical_name}</h3>
        {detail.macro_region ? (
          <div className="text-xs text-muted">{detail.macro_region}</div>
        ) : null}
      </div>

      {detail.required_attributions.length ? (
        <p className="text-xs text-muted">
          Attribution : {detail.required_attributions.join(' · ')}
          {detail.max_license_risk ? ` · risque licence : ${detail.max_license_risk}` : ''}
        </p>
      ) : null}

      <Section
        title="Flux"
        rows={detail.flows.map(
          (f) => `${humanize(f.flow_type)}${f.directionality ? ` · ${f.directionality}` : ''}`,
        )}
      />
      <Section
        title="Risques"
        rows={detail.risks.map(
          (r) =>
            `${humanize(r.risk_type)}${r.risk_severity ? ` · ${humanize(r.risk_severity)}` : ''}` +
            `${r.assessment_status ? ` · ${humanize(r.assessment_status)}` : ''}`,
        )}
      />
      <Section title="Alternatives" rows={detail.alternatives.map((a) => a.description)} />
      <Section title="Épisodes" rows={detail.episodes.map((e) => e.name)} />

      <Separator />
      <CorridorApiPanel id={id} />

      <Separator />
      <p className="text-[11px] text-muted">
        Données canoniques (lecture seule). Géométrie schématique ; analytique dérivée = candidats
        en attente de validation. Vue interne — ne pas republier les données restreintes.
      </p>
    </div>
  );
}

// Per-corridor Read API endpoints, scoped to the selected chokepoint id.
const CORRIDOR_ENDPOINTS: { label: string; sub: string }[] = [
  { label: 'fiche', sub: 'fiche' },
  { label: 'actors', sub: 'actors' },
  { label: 'analysis', sub: 'analysis' },
  { label: 'event-signals', sub: 'event-signals' },
  { label: 'perception-signals', sub: 'perception-signals' },
  { label: 'cvi-assessment', sub: 'cvi-assessment' },
];

function CorridorApiPanel({ id }: { id: string }) {
  const [title, setTitle] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(label: string, sub: string) {
    setTitle(`${label} · ${id}`);
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await api.exploreResource(`chokepoints/${encodeURIComponent(id)}/${sub}`));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="label mb-1 text-[11px] uppercase tracking-wider text-muted">
        Signaux & analyses (API)
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CORRIDOR_ENDPOINTS.map((e) => (
          <Button
            key={e.sub}
            size="sm"
            variant={title?.startsWith(e.label) ? 'default' : 'outline'}
            onClick={() => run(e.label, e.sub)}
          >
            {e.label}
          </Button>
        ))}
      </div>
      {title ? (
        <div className="mt-2">
          <ResultView title={title} busy={busy} error={error} result={result} />
        </div>
      ) : null}
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: string[] }) {
  if (!rows.length) return null;
  return (
    <div>
      <div className="label mb-1 text-[11px] uppercase tracking-wider text-muted">{title}</div>
      <ul className="space-y-0.5 text-sm">
        {rows.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
