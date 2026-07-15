import type {
  AlternativeOut,
  ChokepointAnalysis,
  CviAssessmentOut,
  DerivedRelationGraphOut,
  FlowOut,
  GeometryOut,
  MetricOut,
  PerceptionSignalList,
  RiskOut,
  SystemResilienceOut,
} from '@ag/chokepoints';
import { Badge, Separator } from '@/components/ui';

/**
 * Typed renderers for the Chokepoints Read API. These replace the raw `<pre>{JSON}</pre>` dumps: a
 * JSON blob is *reachable* data, not *consumed* data — nobody reads a 400-line payload to find the
 * one number that matters.
 *
 * Two rules run through every panel below, both from the API contract:
 *   1. Derived output is a CANDIDATE. Its `disclaimer` travels verbatim to the screen, so a reader
 *      can never mistake an engine's guess for a validated fact.
 *   2. A magnitude never appears bare. A flow volume shows its `method_note` + `value_status`; a
 *      metric shows its `metric_kind`, because a `capacity` is a maximum and a `stock` is a balance
 *      at a date — neither is comparable to a realised flow (ADR 0069).
 */

export const humanize = (s?: string | null) => (s ? s.replace(/_/g, ' ') : '');

const num = (v: unknown): string => (typeof v === 'number' ? v.toLocaleString('fr-FR') : String(v));

/** The verbatim producer disclaimer. Never paraphrase it, never hide it behind a tooltip. */
export function Disclaimer({ text }: { text?: string | null }) {
  if (!text) return null;
  return <p className="mt-2 text-[11px] italic leading-relaxed text-muted">{text}</p>;
}

export function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="label mb-1 text-[11px] uppercase tracking-wider text-muted">{children}</div>
  );
}

function Empty({ what, reason }: { what: string; reason?: string }) {
  return (
    <p className="text-sm text-muted">
      Aucun{what.endsWith('e') ? 'e' : ''} {what}
      {reason ? ` — ${reason}` : ''}.
    </p>
  );
}

/* ---- Chokepoint detail sections ------------------------------------------ */

export function FlowsPanel({ flows }: { flows: FlowOut[] }) {
  if (!flows.length) return null;
  return (
    <div>
      <PanelTitle>Flux</PanelTitle>
      <ul className="space-y-2 text-sm">
        {flows.map((f, i) => (
          <li key={`${f.flow_type}-${i}`}>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium">{humanize(f.flow_type)}</span>
              {f.importance_score != null ? (
                <Badge tone="neutral">importance {f.importance_score}</Badge>
              ) : null}
              {f.value_status ? <Badge tone="neutral">{humanize(f.value_status)}</Badge> : null}
              {f.directionality ? (
                <span className="text-xs text-muted">{humanize(f.directionality)}</span>
              ) : null}
            </div>
            {f.estimated_volume != null ? (
              <div className="text-xs text-muted">
                {num(f.estimated_volume)} {f.volume_unit ?? ''}
                {f.volume_year ? ` (${f.volume_year})` : ''}
              </div>
            ) : null}
            {/* The contract REQUIRES the method note beside any volume: it states what the figure
                excludes. A `qualitative_scored` flow carries no volume at all, by design. */}
            {f.method_note ? (
              <div className="text-xs italic text-muted">{f.method_note}</div>
            ) : null}
            {f.sources.length ? (
              <div className="text-[11px] text-muted">Sources : {f.sources.join(' · ')}</div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MetricsPanel({ metrics }: { metrics: MetricOut[] }) {
  if (!metrics.length) return null;
  return (
    <div>
      <PanelTitle>Métriques de référence</PanelTitle>
      <p className="mb-1 text-[11px] text-muted">
        Une métrique n'est pas un flux : un <em>stock</em> est un solde à une date, une{' '}
        <em>capacity</em> un maximum potentiel. Ni l'un ni l'autre ne se compare à un volume
        réalisé.
      </p>
      <ul className="space-y-2 text-sm">
        {metrics.map((m) => (
          <li key={m.metric_key}>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium">{m.metric_label ?? humanize(m.metric_key)}</span>
              {m.metric_kind ? <Badge tone="accent">{m.metric_kind}</Badge> : null}
            </div>
            <div className="text-xs text-muted">
              {m.value != null ? `${num(m.value)} ${m.unit ?? ''}` : '—'}
              {m.period ? ` · ${m.period}` : ''}
              {m.rank != null ? ` · rang ${m.rank}` : ''}
            </div>
            {m.notes ? <div className="text-xs italic text-muted">{m.notes}</div> : null}
            {m.sources.length ? (
              <div className="text-[11px] text-muted">Sources : {m.sources.join(' · ')}</div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RisksPanel({ risks }: { risks: RiskOut[] }) {
  if (!risks.length) return null;
  const tone = (sev?: string | null) =>
    sev === 'critical' || sev === 'severe' ? 'blocked' : sev === 'elevated' ? 'at_risk' : 'neutral';
  return (
    <div>
      <PanelTitle>Risques</PanelTitle>
      <ul className="space-y-1.5 text-sm">
        {risks.map((r, i) => (
          <li key={`${r.risk_type}-${i}`}>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium">{humanize(r.risk_type)}</span>
              {r.risk_severity ? (
                <Badge tone={tone(r.risk_severity)}>{humanize(r.risk_severity)}</Badge>
              ) : null}
              {r.assessment_status ? (
                <span className="text-xs text-muted">{humanize(r.assessment_status)}</span>
              ) : null}
            </div>
            <div className="text-xs text-muted">
              {[
                r.probability_score != null ? `probabilité ${r.probability_score}` : null,
                r.impact_score != null ? `impact ${r.impact_score}` : null,
                r.vulnerability_score != null ? `vulnérabilité ${r.vulnerability_score}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>
            {r.triggers.length ? (
              <div className="text-[11px] text-muted">
                Déclencheurs : {r.triggers.map(humanize).join(' · ')}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AlternativesPanel({ alternatives }: { alternatives: AlternativeOut[] }) {
  if (!alternatives.length) return null;
  return (
    <div>
      <PanelTitle>Alternatives / bypass</PanelTitle>
      <ul className="space-y-2 text-sm">
        {alternatives.map((a, i) => (
          <li key={i}>
            <div className="font-medium">{a.description}</div>
            <div className="text-xs text-muted">
              {[
                a.feasibility ? `faisabilité ${humanize(a.feasibility)}` : null,
                a.cost_penalty ? `coût ${humanize(String(a.cost_penalty))}` : null,
                a.time_penalty ? `délai ${humanize(String(a.time_penalty))}` : null,
                a.capacity_penalty ? `capacité ${humanize(String(a.capacity_penalty))}` : null,
                a.validation_status ? humanize(a.validation_status) : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>
            {a.substitution_note ? (
              <div className="text-xs italic text-muted">{a.substitution_note}</div>
            ) : null}
            {a.reroute_deltas.length ? (
              <ul className="mt-1 space-y-0.5 pl-3 text-[11px] text-muted">
                {a.reroute_deltas.map((d, j) => (
                  <li key={j}>
                    {humanize(d.flow_type)}
                    {d.vessel_class ? ` (${humanize(d.vessel_class)})` : ''} :{' '}
                    {d.delta_days != null ? `+${d.delta_days} j` : '—'}
                    {d.net_cost_usd != null ? ` · coût net ${num(d.net_cost_usd)} USD` : ''}
                    {d.suggested_cost_penalty ? ` · ${humanize(d.suggested_cost_penalty)}` : ''}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GeometriesPanel({
  geometries,
  disclaimer,
}: {
  geometries: GeometryOut[];
  disclaimer?: string;
}) {
  if (!geometries.length) return null;
  return (
    <div>
      <PanelTitle>Géométries</PanelTitle>
      <ul className="space-y-0.5 text-sm">
        {geometries.map((g, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span>{humanize(g.geometry_role)}</span>
            <Badge tone="neutral">{humanize(g.geometry_status)}</Badge>
          </li>
        ))}
      </ul>
      <Disclaimer text={disclaimer} />
    </div>
  );
}

/* ---- Derived / candidate panels ------------------------------------------ */

/** CVI: 8 named 0–5 dimensions (higher = more vulnerable). An omitted dimension had no engine input. */
export function CviPanel({ cvi }: { cvi: CviAssessmentOut }) {
  const dims = Object.entries(cvi.dimensions ?? {});
  const levelTone = (l?: string | null) =>
    l === 'critique' ? 'blocked' : l === 'eleve' ? 'at_risk' : 'neutral';
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <PanelTitle>CVI — vulnérabilité du corridor</PanelTitle>
        {cvi.global_level ? (
          <Badge tone={levelTone(cvi.global_level)}>{humanize(cvi.global_level)}</Badge>
        ) : null}
        {cvi.status ? <Badge tone="neutral">{humanize(cvi.status)}</Badge> : null}
      </div>
      <p className="mb-1.5 text-[11px] text-muted">
        Échelle {cvi.scale} — plus haut = plus vulnérable. {dims.length}/8 dimensions ; une
        dimension sans donnée moteur est omise, jamais fabriquée. Aucun score agrégé 0–100 n'est
        publié.
      </p>
      {dims.length ? (
        <ul className="space-y-2 text-sm">
          {dims.map(([key, d]) => (
            <li key={key}>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium">{humanize(key)}</span>
                <Badge tone={d.score >= 4 ? 'blocked' : d.score >= 3 ? 'at_risk' : 'neutral'}>
                  {d.score}/5
                </Badge>
                {d.confidence ? (
                  <span className="text-[11px] text-muted">confiance {d.confidence}</span>
                ) : null}
              </div>
              {d.rationale ? <div className="text-xs text-muted">{d.rationale}</div> : null}
              {d.source_refs.length ? (
                <div className="text-[11px] text-muted">Sources : {d.source_refs.join(' · ')}</div>
              ) : null}
              {d.uncertainties.length ? (
                <div className="text-[11px] italic text-muted">
                  Incertitudes : {d.uncertainties.join(' · ')}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <Empty what="dimension" reason="aucun moteur n'a produit de score" />
      )}
      {cvi.engine_version ? (
        <p className="mt-1 text-[11px] text-muted">
          Moteur {cvi.engine_version}
          {cvi.last_updated ? ` · ${cvi.last_updated}` : ''}
        </p>
      ) : null}
      <Disclaimer text={cvi.disclaimer} />
    </div>
  );
}

/** One global ENA row over the WHOLE relation graph — not a per-corridor score (ADR 0057). */
export function SystemResiliencePanel({ r }: { r: SystemResilienceOut }) {
  const regimeTone = (g?: string | null) =>
    g === 'brittle' ? 'blocked' : g === 'redundant' ? 'at_risk' : 'on_track';
  const rows: [string, string][] = [
    ['Robustesse', r.robustness != null ? r.robustness.toFixed(4) : '—'],
    ['Ascendance', r.ascendency != null ? num(r.ascendency) : '—'],
    [
      'Capacité de développement',
      r.development_capacity != null ? num(r.development_capacity) : '—',
    ],
    ['Overhead (réserve)', r.overhead != null ? num(r.overhead) : '—'],
    ['Alpha (degré d’ordre)', r.alpha != null ? r.alpha.toFixed(4) : '—'],
    [
      'Débit total du système',
      r.total_system_throughput != null ? num(r.total_system_throughput) : '—',
    ],
    ['Graphe', `${r.node_count ?? '—'} nœuds · ${r.edge_count ?? '—'} arêtes`],
    ['Base des poids', humanize(r.weight_basis) || '—'],
  ];
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <PanelTitle>Résilience systémique (ENA, graphe entier)</PanelTitle>
        {r.regime ? <Badge tone={regimeTone(r.regime)}>{humanize(r.regime)}</Badge> : null}
      </div>
      <p className="mb-1.5 text-[11px] text-muted">
        Résultat <strong>global</strong> (scope {r.scope}), pas un score par corridor. La robustesse
        est maximale au milieu de la fenêtre de vitalité : trop d'ordre rend cassant, trop peu rend
        redondant.
      </p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <Disclaimer text={r.disclaimer} />
    </div>
  );
}

/** Prediction-market odds. Crowd ANTICIPATION, never event evidence. read_tainted surface. */
export function PerceptionPanel({ p }: { p: PerceptionSignalList }) {
  return (
    <div>
      <PanelTitle>Perception (marchés de prédiction)</PanelTitle>
      <p className="mb-1.5 text-[11px] text-muted">
        Anticipation de la foule, <strong>pas</strong> une preuve d'événement. Source non-clearée
        (scope read_tainted) — ne jamais republier.
      </p>
      {p.consensus.length ? (
        <ul className="space-y-1 text-sm">
          {p.consensus.map((c, i) => (
            <li key={i} className="flex items-baseline justify-between gap-2">
              <span>{humanize(c.signal_family)}</span>
              <span className="shrink-0 text-xs tabular-nums text-muted">
                {c.consensus_probability != null
                  ? `${(c.consensus_probability * 100).toFixed(1)} %`
                  : '—'}
                {c.market_count != null ? ` · ${c.market_count} marché(s)` : ''}
                {c.total_liquidity != null ? ` · ${num(Math.round(c.total_liquidity))} $` : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty what="consensus" reason="aucune collecte pour ce corridor" />
      )}
      {p.signals.length ? (
        <ul className="mt-2 space-y-0.5 text-[11px] text-muted">
          {p.signals.slice(0, 6).map((s, i) => (
            <li key={i}>
              « {s.market_question} »
              {s.implied_probability != null
                ? ` — ${(s.implied_probability * 100).toFixed(2)} %`
                : ''}
            </li>
          ))}
        </ul>
      ) : null}
      <Disclaimer text={p.disclaimer} />
    </div>
  );
}

/**
 * Derived candidate graph (ADR 0065) — NOT canonical, distinct from /relations. A target flagged
 * `external_candidate` is a COVERAGE GAP: an object the corpus does not contain.
 */
export function DerivedRelationsPanel({ g }: { g: DerivedRelationGraphOut }) {
  const gaps = g.items.filter((e) => e.to_status === 'external_candidate').length;
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <PanelTitle>Relations dérivées (candidates)</PanelTitle>
        <Badge tone="neutral">{g.edge_count_total} arêtes</Badge>
        {gaps ? <Badge tone="at_risk">{gaps} hors corpus</Badge> : null}
      </div>
      <p className="mb-1.5 text-[11px] text-muted">
        Extraites des fiches d'analyse, en attente de validation humaine. Une cible « hors corpus »
        est une <strong>lacune de couverture</strong>, pas un objet du corpus.
      </p>
      <ul className="space-y-1 text-sm">
        {g.items.map((e, i) => (
          <li key={i}>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted">{e.from_object_id}</span>
              <span aria-hidden>→</span>
              <span className="font-medium">{e.to_label ?? e.to}</span>
              {e.to_status === 'external_candidate' ? (
                <Badge tone="at_risk">hors corpus</Badge>
              ) : null}
              <Badge tone="neutral">{humanize(e.relation_type)}</Badge>
              {e.strength_score != null ? (
                <span className="text-[11px] text-muted">force {e.strength_score}</span>
              ) : null}
            </div>
            {e.evidence_quote ? (
              <div className="text-[11px] italic text-muted">« {e.evidence_quote} »</div>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[11px] text-muted">
        {g.returned} affichées sur {g.edge_count_total}.
      </p>
      <Disclaimer text={g.disclaimer} />
    </div>
  );
}

/**
 * Engine outputs, rendered from the payload's own `columns[]`/`rows[]`. One generic table consumes
 * every engine — the 11 that exist today and the ones ag-back adds tomorrow. Hard-coding a view per
 * engine would break on each producer tweak, and would silently drop new columns.
 */
export function EngineBlocks({ analysis }: { analysis: ChokepointAnalysis }) {
  if (!analysis.engines.length) return <Empty what="sortie moteur" />;
  return (
    <div className="space-y-4">
      {analysis.engines.map((e) => (
        <div key={e.key}>
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-sm font-medium">{e.title ?? humanize(e.key)}</span>
            <Badge tone="neutral">{e.rows.length}</Badge>
          </div>
          {e.description ? <p className="text-[11px] text-muted">{e.description}</p> : null}
          <div className="mt-1 overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-line text-left text-muted">
                  {e.columns.map((c) => (
                    <th key={c} className="px-1.5 py-1 font-medium">
                      {humanize(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {e.rows.map((row, i) => (
                  <tr key={i} className="border-b border-line/60">
                    {e.columns.map((c) => {
                      const v = (row as Record<string, unknown>)[c];
                      return (
                        <td key={c} className="px-1.5 py-1 align-top">
                          {v == null ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <Separator />
      <p className="text-[11px] text-muted">
        {analysis.relations.length} relations · {analysis.claims.length} claims.
      </p>
      <Disclaimer text={analysis.disclaimer} />
    </div>
  );
}
