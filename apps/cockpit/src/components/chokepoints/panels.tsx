import type {
  AlertOut,
  AlternativeOut,
  ChokepointAnalysis,
  CviAssessmentOut,
  CviCounterfactualOut,
  ChokepointState,
  StateSummaryOut,
  DerivedRelationGraphOut,
  FlowOut,
  GeometryOut,
  MetricOut,
  NewsClusterOut,
  NewsFeedOut,
  PerceptionSignalList,
  RiskOut,
  SystemResilienceOut,
} from '@ag/chokepoints';
import {
  familyPluralitySurvivesDeduplication,
  familyQuestionDiversity,
  signalAttachmentRuleIsReviewed,
  stateReading,
  PUBLISHABLE_MIN_MARKET_COUNT,
} from '@ag/chokepoints';
import { Badge, Separator } from '@/components/ui';
import { cviBinding, levelForScore } from '@/lib/cvi-binding';
import { decodeHtmlEntities } from '@/lib/display';
import { PromoteNewsButton } from './PromoteNewsButton';

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
  const binding = cviBinding(cvi.dimensions as Record<string, { score?: number | null }>);
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
      {/* Le contrefactuel agrégé rendu utile ICI, corridor par corridor. Il existait depuis 0.9.0
          sur /analytics/cvi-counterfactual et nous avions un panneau pour l'afficher — que personne
          n'avait ouvert avant d'écrire un handoff demandant la mesure. Un chiffre qu'on affiche sans
          le porter au point de décision ne sert à rien (ADR 0077). */}
      {binding.boundByInferred ? (
        <p className="mb-1.5 rounded-[2px] border-l-2 border-l-status-at_risk bg-subtle px-2 py-1.5 text-[11px] leading-relaxed">
          <span className="font-medium text-status-at_risk">
            Ce niveau tient à « concentration » seule.
          </span>{' '}
          Cette dimension n'est pas une mesure : faute d'alternative de contournement modélisée, le
          moteur amont retombe sur le compte des relations et note l'absence à 5. ag-back l'a
          concédé et va la <strong>supprimer</strong> (leur 0027). Sans elle, le maximum retombe à{' '}
          {binding.maxWithoutInferred}/5, soit «&nbsp;
          {humanize(levelForScore(binding.maxWithoutInferred) ?? '')}
          &nbsp;». Ne pas justifier une publication sur ce niveau.
        </p>
      ) : binding.max !== null ? (
        <p className="mb-1.5 text-[11px] text-muted">
          Niveau porté par{' '}
          {binding.maxWithoutInferred === binding.max
            ? 'des dimensions mesurées'
            : 'plusieurs dimensions'}{' '}
          — il survit au retrait annoncé de «&nbsp;concentration&nbsp;» (ag-back 0027).
          «&nbsp;incertitude&nbsp;» est hors du maximum (leur ADR 0055).
        </p>
      ) : null}
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
  // Deduplicate the RAW questions per family (ADR 0074). The cardinality floor counts rows; this
  // counts propositions. It only works here, on the read_tainted surface, because the public endpoint
  // serves totals and no questions — which is the whole reason the gap existed.
  const diversity = new Map(
    familyQuestionDiversity(p.signals).map((d) => [d.signalFamily, d] as const),
  );

  return (
    <div>
      <PanelTitle>Perception (marchés de prédiction)</PanelTitle>
      <p className="mb-1.5 text-[11px] text-muted">
        Anticipation de la foule, <strong>pas</strong> une preuve d'événement. Source non-clearée
        (scope read_tainted) — ne jamais republier.
      </p>
      {p.consensus.length ? (
        <ul className="space-y-1 text-sm">
          {p.consensus.map((c, i) => {
            const d = c.signal_family ? diversity.get(c.signal_family) : undefined;
            // Two markets asking one question clear the N≥2 floor and are not a consensus. Flag it
            // where the human decides, since nothing downstream can.
            const thin =
              d !== undefined &&
              !familyPluralitySurvivesDeduplication(d, PUBLISHABLE_MIN_MARKET_COUNT);
            return (
              <li key={i} className="flex items-baseline justify-between gap-2">
                <span>
                  {humanize(c.signal_family)}
                  {thin ? (
                    <Badge tone="at_risk" className="ml-1.5">
                      {d!.distinctQuestions} question{d!.distinctQuestions > 1 ? 's' : ''} distincte
                      {d!.distinctQuestions > 1 ? 's' : ''} / {d!.markets} marchés
                    </Badge>
                  ) : null}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted">
                  {c.consensus_probability != null
                    ? `${(c.consensus_probability * 100).toFixed(1)} %`
                    : '—'}
                  {c.market_count != null ? ` · ${c.market_count} marché(s)` : ''}
                  {c.total_liquidity != null ? ` · ${num(Math.round(c.total_liquidity))} $` : ''}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty what="consensus" reason="aucune collecte pour ce corridor" />
      )}
      {diversity.size > 0 ? (
        <p className="mt-1.5 text-[11px] text-muted">
          Le badge compare les questions posées, après normalisation, au nombre de marchés. Il
          attrape une reformulation, <strong>pas</strong> une paraphrase, et il ne dit rien de
          l'auteur : ce n'est pas un test d'indépendance, c'est ce qu'on peut en mesurer.
        </p>
      ) : null}
      {p.signals.length ? (
        <ul className="mt-2 space-y-0.5 text-[11px] text-muted">
          {p.signals.slice(0, 6).map((s, i) => (
            <li key={i}>
              « {s.market_question} »
              {s.implied_probability != null
                ? ` — ${(s.implied_probability * 100).toFixed(2)} %`
                : ''}
              {/* API 0.17.0 — this surface served rows written under four incompatible rules and said
                  so nowhere (ag-back 0023 §6). We do not filter here: an internal reader must SEE a
                  rule nobody has reviewed, not be protected from it. */}
              {!signalAttachmentRuleIsReviewed(s) ? (
                <Badge tone="at_risk" className="ml-1.5">
                  règle {s.attachment_rule}
                </Badge>
              ) : null}
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
/**
 * DEPUIS 2.1.0, CE PANNEAU NE MONTRE PLUS LE MÊME GRAPHE. L'endpoint servait le fichier de
 * candidats (769 arêtes, dont 333 vers un nom hors corpus) ; il sert la table `derived_relation` —
 * celle que `network_centrality` et `system_cascade` lisent réellement pour produire la
 * `betweenness` affichée ailleurs dans cet écran. Aucun champ n'a bougé : c'est le contenu.
 *
 * Deux conséquences ici. Le décompte « hors corpus » a disparu avec les cibles : `to_status` vaut
 * désormais toujours `in_corpus`, la branche qui le testait ne pouvait plus être vraie et affichait
 * un zéro permanent. Et ~936 arêtes d'inférence géographique sont apparues — d'où `by_origin`,
 * affiché EN TÊTE : « une fiche rédigée par un humain l'affirme » et « les deux objets touchent la
 * même ZEE » ne sont pas la même prétention, et le graphe est à ~70 % de la seconde.
 */
export function DerivedRelationsPanel({ g }: { g: DerivedRelationGraphOut }) {
  const byOrigin = Object.entries(g.by_origin ?? {}).sort((a, b) => b[1] - a[1]);
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <PanelTitle>Relations dérivées (candidates)</PanelTitle>
        <Badge tone="neutral">{g.edge_count_total} arêtes</Badge>
      </div>
      <p className="mb-1.5 text-[11px] text-muted">
        Le graphe que <strong>lisent les moteurs</strong>, en attente de validation humaine. Une
        arête extraite d'une fiche est une affirmation ; une arête inférée par co-localisation n'en
        est pas une. La répartition ci-dessous dit de quel tas vient ce que vous lisez.
      </p>
      {byOrigin.length ? (
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {byOrigin.map(([origin, n]) => (
            <Badge key={origin} tone={origin.endsWith('fiche-extraction') ? 'neutral' : 'at_risk'}>
              {humanize(origin.replace('derived:', ''))} : {n}
            </Badge>
          ))}
        </div>
      ) : null}
      <ul className="space-y-1 text-sm">
        {g.items.map((e, i) => (
          <li key={i}>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted">{e.from_object_id}</span>
              <span aria-hidden>→</span>
              <span className="font-medium">{e.to_label ?? e.to}</span>
              {/* La règle qui a produit l'arête, sur l'arête. Une inférence SQL et une extraction de
                  fiche ne se pèsent pas pareil, et rien d'autre ne les distingue. */}
              {e.origin ? (
                <Badge tone={e.origin.endsWith('fiche-extraction') ? 'neutral' : 'at_risk'}>
                  {humanize(e.origin.replace('derived:', ''))}
                </Badge>
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
            {/* PÉRIMÉ, LU AVANT LA VALEUR (1.7.0). `stale` est vrai quand le moteur a recalculé SANS
                cet objet : la ligne servie est celle d'une passe antérieure, et rien ne la
                distinguait d'une ligne du jour. Mesuré chez eux le 13/08 : 28 objets sur cinq
                moteurs étaient servis avec des lignes de juillet. Le drapeau ne les rend pas
                fraîches — il empêche le périmé de passer pour du frais. */}
            {e.stale ? (
              <Badge tone="at_risk">
                <span title="Le moteur a recalculé sans cet objet : cette ligne vient d'une passe antérieure.">
                  périmé
                </span>
              </Badge>
            ) : null}
          </div>
          {/* La PREUVE du drapeau, servie à côté de lui : on vérifie au lieu de croire. */}
          {e.generated_at || e.engine_last_emitted_at ? (
            <p className="text-[11px] text-muted">
              ligne {e.generated_at ?? '—'} · dernière passe du moteur{' '}
              {e.engine_last_emitted_at ?? '—'}
            </p>
          ) : null}
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

/* ---- État courant (1.7.0, ADR amont 0107/0108) ---------------------------- */

/**
 * `GET /chokepoints/{id}/state` — six composantes et trois pourcentages, servis ensemble.
 *
 * TROIS INTERDITS, TENUS ICI ET PAS SEULEMENT ÉCRITS. (1) La couverture ouvre la lecture, parce
 * qu'elle dit combien de terrain il y a sous les deux autres chiffres. (2) Les trois ne se
 * découplent pas : `stateReading` fabrique la phrase entière, il n'existe pas de rendu « tension
 * seule ». (3) Cela ne se compare pas entre objets — deux objets reposent sur des composantes
 * différentes — et l'avertissement de l'amont est affiché tel qu'il arrive, pas résumé.
 *
 * `no_data` n'est pas un zéro : un objet à zéro composante observée dit « nous ne savons rien de cet
 * objet », jamais « tout va bien ». C'est la même faute que nous avons commise en triant `/atlas` sur
 * `pressure_score`, qui mesurait le volume de NOTRE collecte.
 */
export function StatePanel({ state }: { state: ChokepointState }) {
  const r = stateReading(state);
  const components = Object.entries(state.components ?? {});
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <PanelTitle>État courant</PanelTitle>
        {r.knowsNothing ? <Badge tone="at_risk">aucune composante observée</Badge> : null}
      </div>
      {/* Les trois chiffres en une phrase, dans cet ordre. Aucun n'est affichable seul. */}
      <p className="text-sm tabular-nums">{r.label}</p>
      {r.knowsNothing ? (
        <p className="mt-1 text-[11px] text-status-at_risk">
          Nous ne savons rien de cet objet. Ce n'est pas du calme : une composante absente sort du
          dénominateur, elle ne devient jamais un zéro.
        </p>
      ) : null}
      <ul className="mt-2 space-y-0.5 text-[11px]">
        {components.map(([name, c]) => (
          <li key={name} className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium">{humanize(name)}</span>
            <Badge
              tone={
                c.status === 'no_data' ? 'neutral' : c.status === 'stale' ? 'at_risk' : 'neutral'
              }
            >
              {humanize(c.status)}
            </Badge>
            {c.tension != null ? <span className="text-muted">tension {c.tension}</span> : null}
            {/* event_pressure est servi AVEC son signal_count et ne nourrit PAS la tension : sa
                magnitude suit le volume de collecte, pas la sévérité (Ormuz 295 sur 308 signaux,
                Taïwan 1,28 sur 2). Le compte est donc affiché à côté, jamais le score seul. */}
            {c.pressure_score != null ? (
              <span className="text-muted">
                pression {c.pressure_score} sur {c.signal_count ?? '—'} signaux (hors tension)
              </span>
            ) : null}
            {c.generated_at ? <span className="text-muted">· {c.generated_at}</span> : null}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-muted">
        {state.coverage.observed} observée(s) · {state.coverage.stale} périmée(s) ·{' '}
        {state.coverage.no_data} sans donnée, sur {state.coverage.total}.{' '}
        {state.coverage.tension_components_used} ont nourri la tension.
      </p>
      <Disclaimer text={state.comparability} />
    </div>
  );
}

/**
 * `GET /analytics/state-summary` — la vue parc. Un DÉCOMPTE DE CATÉGORIES, pas une moyenne, et le
 * dénominateur honnête est affiché avec la part : la majeure partie du noyau n'a aucune évaluation
 * de régime, et une part calculée sur les quelques objets couverts ne se lit pas comme une part du
 * noyau. `stale_regime_rows` est leur propre aveu, servi en continu.
 */
export function StateSummaryPanel({ summary }: { summary: StateSummaryOut }) {
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <PanelTitle>État du parc</PanelTitle>
        {summary.stale_regime_rows > 0 ? (
          <Badge tone="at_risk">{summary.stale_regime_rows} régime(s) périmé(s)</Badge>
        ) : null}
      </div>
      <p className="text-sm tabular-nums">
        {summary.objects_above_normal} objet(s) au-dessus de « open », sur{' '}
        {summary.objects_with_regime} évalué(s)
        {summary.share_above_normal_pct != null ? ` (${summary.share_above_normal_pct} %)` : ''}
      </p>
      <p className="mt-1 text-[11px] text-muted">
        <strong>{summary.objects_without_regime}</strong> objets du noyau n'ont AUCUNE évaluation de
        régime, sur {summary.core_total}. La part ci-dessus porte sur les évalués, pas sur le noyau
        — les deux dénominateurs ne se confondent pas.
      </p>
      <p className="mt-1 text-[11px] text-muted">Calculé le {summary.generated_at}.</p>
    </div>
  );
}

/* ---- News (ADR 0070) ----------------------------------------------------- */

/** One event cluster. The model prose can be wrong; `articles[]` + `affected_chokepoints[]` are
 *  server-recalculated and reliable — believe the articles on conflict. Never a confirmed incident. */
function NewsCluster({ c, corridorId }: { c: NewsClusterOut; corridorId?: string }) {
  return (
    <li className="rounded-md border border-line px-2.5 py-2">
      <div className="flex flex-wrap items-baseline gap-1.5">
        <span className="text-sm font-medium">
          {decodeHtmlEntities(c.headline) || '(sans titre)'}
        </span>
        {c.event_category ? <Badge tone="neutral">{humanize(c.event_category)}</Badge> : null}
        {/* Jamais une sévérité — ton neutre. Et jamais un rang : ag-back a précisé (leur 0027,
            2026-08-12) que ce score est 100 % modèle, calé sur deux ancres, « ni comparable entre
            corridors ni stable entre passes ». Il sert à repérer dans UNE liste, à un instant donné.
            Le titre de l'élément le dit à qui s'apprête à s'en servir pour comparer. */}
        {c.salience_score != null ? (
          <Badge tone="neutral">
            <span title="Jugement du modèle amont : ni comparable entre corridors, ni stable d'une passe à l'autre (ag-back 0027).">
              saillance {c.salience_score.toFixed(2)}
            </span>
          </Badge>
        ) : null}
      </div>
      {c.summary_text ? (
        <p className="mt-1 text-xs text-muted">{decodeHtmlEntities(c.summary_text)}</p>
      ) : null}
      {c.affected_chokepoints.length ? (
        <div className="mt-1 text-[11px] text-muted">
          {/* Le nombre qui suivait chaque objet a été RETIRÉ. `relevance` n'est pas une pertinence
              par corridor : ag-back a divulgué (leur 0027, 2026-08-12) que c'est la salience GLOBALE
              du regroupement, recopiée à l'identique sur chaque objet lié. L'afficher ainsi laissait
              croire que ce regroupement comptait 0,90 pour Ormuz et autre chose pour Suez, alors que
              toutes les valeurs sont la même. Un chiffre faux est pire qu'aucun chiffre. La salience
              est affichée UNE fois, ci-dessous, pour ce qu'elle est. */}
          Objets liés :{' '}
          {c.affected_chokepoints.map((a) => a.canonical_name ?? a.chokepoint_id).join(' · ')}
        </div>
      ) : null}
      {/* PAYS DES MÉDIAS (contrat 1.3.0, leur 0031). `countries[]` compte des RÉDACTIONS, pas des
          articles : une dépêche reprise par quarante stations locales est une histoire en quarante
          endroits, pas quarante sources indépendantes. Et il ne se rend JAMAIS sans
          `outlets_without_country` — un agrégat qui tait ses inconnus est exactement l'objet contre
          lequel nous leur écrivions. Sur le plus gros regroupement d'Ormuz au 13/08 : 8 médias
          déclarés, 29 sans pays. Aucun pourcentage n'est calculé ici : le dénominateur honnête est
          la somme des deux, et il se lit. */}
      {c.countries.length || c.outlets_without_country ? (
        <div className="mt-1 text-[11px] text-muted">
          Pays des médias :{' '}
          {c.countries.length
            ? c.countries.map((k) => `${k.code} ${k.outlets}`).join(' · ')
            : 'aucun déclaré'}
          {' · '}
          <span title="Médias dont le registre amont ne déclare pas le pays. Jamais déduit d'un domaine.">
            sans pays {c.outlets_without_country ?? 0}
          </span>
        </div>
      ) : null}
      {c.articles.length ? (
        <ul className="mt-1 space-y-0.5 text-[11px]">
          {c.articles.slice(0, 8).map((a, i) => (
            <li key={i} className="text-muted">
              {a.url ? (
                <a href={a.url} target="_blank" rel="noreferrer" className="underline">
                  {decodeHtmlEntities(a.title) || a.url}
                </a>
              ) : (
                decodeHtmlEntities(a.title) || '(article)'
              )}
              {a.outlet ? <span> — {a.outlet}</span> : null}
              {/* GKG is the web-wide long tail, not an audited outlet — flag it, don't equate it. */}
              {a.source_id === 'gdelt_gkg' ? (
                <span className="ml-1 opacity-70">[gdelt]</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {/* Promotion to the public Atlas is a per-corridor act (ADR 0071) — only when we know the corridor. */}
      {corridorId ? <PromoteNewsButton corridorId={corridorId} cluster={c} /> : null}
    </li>
  );
}

/** GET /news → readable news layer. Candidate coverage, NEVER a confirmed incident (capped at
 *  `stress`, ADR 0042). `run_notes` is shown up top: a tidy list is a SAMPLE, not the period's news. */
export function NewsPanel({ feed, corridorId }: { feed: NewsFeedOut; corridorId?: string }) {
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <PanelTitle>Actualité (couverture média)</PanelTitle>
        <Badge tone="neutral">{feed.count} événement(s)</Badge>
        {feed.taint_class ? <Badge tone="neutral">{humanize(feed.taint_class)}</Badge> : null}
      </div>
      <p className="mb-1.5 text-[11px] text-muted">
        Couverture média = <strong>candidat à valider, jamais un incident confirmé</strong>. La
        prose du modèle peut être fausse ; les articles et objets liés sont recalculés serveur — en
        cas de doute, croyez les articles. Compteurs à ne pas comparer entre objets (cycle d'actu ≠
        importance).
      </p>

      {/* run_notes FIRST and visible: it reports the run's own limits (sample vs summary, caps). */}
      {feed.run_notes.length ? (
        <ul className="mb-2 space-y-0.5 rounded-md border border-status-at_risk/30 bg-status-at_risk/10 px-2.5 py-1.5 text-[11px] text-status-at_risk">
          {feed.run_notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      ) : null}

      {feed.items.length ? (
        <ul className="space-y-2">
          {feed.items.map((c) => (
            <NewsCluster key={c.cluster_id} c={c} corridorId={corridorId} />
          ))}
        </ul>
      ) : feed.run_id ? (
        <Empty what="événement" reason="feed honnête, aucun cluster sur la période" />
      ) : (
        <Empty what="agrégation" reason="aucune n'a encore tourné" />
      )}

      <Disclaimer text={feed.attribution_notice} />
      <Disclaimer text={feed.disclaimer} />
    </div>
  );
}

/* ---- CVI counterfactual (ADR 0070) --------------------------------------- */

/** GET /analytics/cvi-counterfactual → how many objects' CVI level slides when `concentration` is
 *  removed. A live aggregate count, derived candidate — replay it against the base to verify. */
export function CviCounterfactualPanel({ data }: { data: CviCounterfactualOut }) {
  const buckets = Object.entries(data.buckets ?? {});
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <PanelTitle>Contrefactuel CVI (retrait « {humanize(data.removed_dimension)} »)</PanelTitle>
        <Badge tone="neutral">scope {data.scope}</Badge>
        {data.status ? <Badge tone="neutral">{data.status}</Badge> : null}
      </div>
      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-[11px] text-muted">Population</dt>
          <dd className="tabular-nums">{num(data.population)}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted">Glissent</dt>
          <dd className="tabular-nums">{num(data.changent)}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted">Critique → bas</dt>
          <dd className="tabular-nums">{num(data.critique_vers_bas)}</dd>
        </div>
      </dl>
      {buckets.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {buckets.map(([k, v]) => (
            <Badge key={k} tone="neutral">
              {humanize(k)} : {num(v)}
            </Badge>
          ))}
        </div>
      ) : null}
      {data.method_note ? (
        <p className="mt-1 text-xs italic text-muted">{data.method_note}</p>
      ) : null}
      <Disclaimer text={data.disclaimer} />
    </div>
  );
}

/* ---- Alerts (ADR 0077 — media_attention_spike is NOT a disruption) -------- */

/** GET /alerts → review triggers, never conclusions. `media_attention_spike` answers "something to
 *  watch?", NOT "is there a disruption?" — kept in a distinct section, never styled as an incident. */
export function AlertsPanel({ alerts }: { alerts: AlertOut[] }) {
  const media = alerts.filter((a) => a.alert_type === 'media_attention_spike');
  const rest = alerts.filter((a) => a.alert_type !== 'media_attention_spike');
  const row = (a: AlertOut, i: number) => (
    <li key={a.id ?? i} className="rounded-md border border-line px-2.5 py-1.5">
      <div className="flex flex-wrap items-baseline gap-1.5">
        <span className="text-sm">{a.canonical_name ?? a.chokepoint_id ?? '—'}</span>
        <Badge tone="neutral">{humanize(a.alert_type)}</Badge>
        {a.level ? <Badge tone="neutral">{humanize(a.level)}</Badge> : null}
        {a.review_status ? (
          <span className="text-[11px] text-muted">{humanize(a.review_status)}</span>
        ) : null}
      </div>
      {a.trigger_summary ? (
        <p className="mt-0.5 text-[11px] text-muted">{a.trigger_summary}</p>
      ) : null}
      <Disclaimer text={a.disclaimer} />
    </li>
  );
  return (
    <div className="space-y-3">
      <div>
        <PanelTitle>À regarder — volume médiatique</PanelTitle>
        <p className="mb-1.5 text-[11px] text-muted">
          <strong>Coverage volume only, NOT evidence of disruption.</strong> Une demande d'attention
          (revue humaine), jamais une disruption, une confirmation ni un incident.
        </p>
        {media.length ? (
          <ul className="space-y-1.5">{media.map(row)}</ul>
        ) : (
          <Empty what="pic d'attention" reason="aucun signalé" />
        )}
      </div>
      <Separator />
      <div>
        <PanelTitle>Autres alertes (déclencheurs de revue)</PanelTitle>
        {rest.length ? (
          <ul className="space-y-1.5">{rest.map(row)}</ul>
        ) : (
          <Empty what="alerte" reason="aucune" />
        )}
      </div>
    </div>
  );
}
