import { useEffect, useState } from 'react';
import type { SfuFicheOut, StrategicFlowUnitSummary } from '@ag/chokepoints';
import { api } from '@/lib/api';
import { Badge, Separator, Sheet } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { Disclaimer, PanelTitle, humanize } from '@/components/chokepoints/panels';

/**
 * SFIM — Strategic Flow Units (ADR 0054), the prescription layer parallel to chokepoints.
 *
 * Only 4 of the 10 dimensions have a deterministic engine source; the 6 judgment dimensions and the
 * verdict are AUTHORED by an analyst in the ag-back workbench. So since API 0.7.0 an SFU reads as
 * partially scored by a machine and awaiting a human decision — `verdict: null` is the designed
 * state, not a gap. The screen states that plainly rather than hiding the empty sections: hiding
 * them would make an unpopulated pipeline look finished, and an engine score is a candidate, not a
 * validated fact, so its provenance is shown per dimension.
 */

const verdictTone = (v?: string | null) =>
  v === 'FAIRE' ? 'on_track' : v === 'ABANDONNER' ? 'blocked' : v === 'TESTER' ? 'at_risk' : 'neutral';

const prioTone = (p?: string | null) => (p === 'P0' ? 'blocked' : p === 'P1' ? 'at_risk' : 'neutral');

export function SfimPage() {
  const [items, setItems] = useState<StrategicFlowUnitSummary[] | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .getStrategicFlows()
      .then((l) => {
        if (!alive) return;
        setItems(l.items);
        setDisclaimer(l.disclaimer ?? null);
      })
      .catch((e: unknown) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, []);

  // `has a verdict` and `is scored` are distinct since 0.7.0: the engine fills dimensions, a human
  // signs the verdict. Conflating them made the screen claim an engine-populated layer was empty.
  const withVerdict = (items ?? []).filter((s) => s.verdict).length;
  const enginePopulated = (items ?? []).some((s) => (s.dimensions_scored ?? 0) > 0);

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Flux stratégiques (SFIM)"
        subtitle="Couche de prescription : une unité de flux, une décision. Le moteur score 4 dimensions sur 10 ; les 6 autres et le verdict sont rédigés par un analyste côté ag-back."
      />

      {error ? (
        <div className="rounded-md border border-status-at_risk/30 bg-status-at_risk/10 p-4 text-sm text-status-at_risk">
          {error.includes('503') ? 'API chokepoints non configurée (token absent).' : `Erreur : ${error}`}
        </div>
      ) : null}

      {items && items.length > 0 && withVerdict === 0 ? (
        <div className="mb-4 rounded-md border border-line bg-subtle p-3 text-sm text-muted">
          {enginePopulated ? (
            <>
              Les {items.length} unités sont <strong>renseignées par le moteur</strong> (scoring
              partiel, dimensions déterministes uniquement) ; aucune n'a encore de verdict analyste.
              Le remplissage machine n'est pas une validation : la couche attend une décision humaine.
            </>
          ) : (
            <>
              Les {items.length} unités n'ont ni scoring ni verdict. Le câblage est en place — c'est la
              donnée qui manque côté producteur.
            </>
          )}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-line">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface">
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-3 py-2 font-medium">Unité de flux</th>
              <th className="px-3 py-2 font-medium">Flux</th>
              <th className="px-3 py-2 font-medium">Prio</th>
              <th className="px-3 py-2 font-medium">État</th>
              {/* numerator only: `dimensions_total` exists on the fiche, not on the summary */}
              <th className="px-3 py-2 font-medium">Dim. scorées</th>
              <th className="px-3 py-2 font-medium">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((s) => (
              <tr
                key={s.id}
                onClick={() => setSelected(s.id)}
                className="cursor-pointer border-b border-line/60 hover:bg-subtle"
              >
                <td className="px-3 py-2 font-medium">{s.name}</td>
                <td className="px-3 py-2 text-muted">{humanize(s.flow_type)}</td>
                <td className="px-3 py-2">
                  <Badge tone={prioTone(s.priority_class)}>{s.priority_class ?? '—'}</Badge>
                </td>
                <td className="px-3 py-2 text-muted">
                  {humanize(s.status)}
                  {s.validation_status ? ` · ${humanize(s.validation_status)}` : ''}
                </td>
                <td className="px-3 py-2 text-muted">{s.dimensions_scored ?? 0}</td>
                <td className="px-3 py-2">
                  {s.verdict ? (
                    <Badge tone={verdictTone(s.verdict)}>
                      {s.verdict}
                      {s.verdict_status ? ` (${s.verdict_status})` : ''}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted">non rédigé</span>
                  )}
                </td>
              </tr>
            ))}
            {items && items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-muted">
                  Aucune unité de flux stratégique.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {disclaimer ? <Disclaimer text={disclaimer} /> : null}

      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)} title="Unité de flux">
        {selected ? <SfuPanel key={selected} id={selected} /> : null}
      </Sheet>
    </div>
  );
}

function SfuPanel({ id }: { id: string }) {
  const [fiche, setFiche] = useState<SfuFicheOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setFiche(null);
    setError(null);
    api
      .getStrategicFlowFiche(id)
      .then((f) => alive && setFiche(f))
      .catch((e: unknown) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, [id]);

  if (error) return <p className="text-sm text-status-blocked">Erreur : {error}</p>;
  if (!fiche) return <p className="text-sm text-muted">Chargement…</p>;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={prioTone(fiche.priority_class)}>{fiche.priority_class ?? '—'}</Badge>
          <Badge tone="neutral">{humanize(fiche.flow_type)}</Badge>
          {fiche.status ? <Badge tone="neutral">{humanize(fiche.status)}</Badge> : null}
        </div>
        <h3 className="mt-2 text-base font-semibold">{fiche.name}</h3>
        <div className="text-xs text-muted">{fiche.id}</div>
      </div>

      <CompletenessBlock completeness={fiche.completeness} />

      <VerdictBlock verdict={fiche.verdict} />

      <Separator />
      <ScoringBlock scoring={fiche.scoring} completeness={fiche.completeness} />

      <Separator />
      <CountsBlock fiche={fiche} />

      {/* red_team is served only with the read_tainted scope — the cockpit has it, nobody else does. */}
      {fiche.red_team ? (
        <>
          <Separator />
          <div>
            <PanelTitle>Red team (avis, non-cleared)</PanelTitle>
            <pre className="max-h-64 overflow-auto rounded-md border border-line bg-subtle p-2 text-[11px]">
              {JSON.stringify(fiche.red_team, null, 2)}
            </pre>
          </div>
        </>
      ) : null}

      <Disclaimer text={fiche.disclaimer} />
    </div>
  );
}

/** 0.7.0 completeness envelope. Absent on an older producer — render nothing rather than invent it. */
function CompletenessBlock({ completeness }: { completeness: SfuFicheOut['completeness'] }) {
  if (!completeness) return null;
  const c = completeness;
  return (
    <div className="rounded-md border border-line bg-subtle p-3">
      <PanelTitle>Complétude</PanelTitle>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
        <Badge tone="neutral">
          {c.dimensions_scored}/{c.dimensions_total} dimensions
        </Badge>
        <span className="text-[11px] text-muted">
          {c.auto_dimensions} automatiques · {c.analyst_dimensions} analyste
        </span>
      </div>
      <p className="mt-1 text-[11px] text-muted">
        {c.awaiting_analyst_verdict
          ? 'En attente du verdict analyste.'
          : `Verdict ${humanize(c.verdict_status)}.`}
        {c.has_draft
          ? ` Brouillon côté producteur${
              c.draft_status && c.draft_status !== 'draft' ? ` (${humanize(c.draft_status)})` : ''
            }.`
          : ''}
      </p>
    </div>
  );
}

function VerdictBlock({ verdict }: { verdict: SfuFicheOut['verdict'] }) {
  if (!verdict) {
    return (
      <div>
        <PanelTitle>Verdict</PanelTitle>
        <p className="text-sm text-muted">
          Aucun verdict rédigé. Les verdicts SFIM sont produits en workbench (ag-back), pas calculés
          par un moteur — leur absence n'est pas une panne.
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <PanelTitle>Verdict</PanelTitle>
        <Badge tone={verdictTone(verdict.decision)}>{verdict.decision}</Badge>
        <Badge tone="neutral">{humanize(verdict.status)}</Badge>
        {verdict.confidence ? (
          <span className="text-[11px] text-muted">confiance {verdict.confidence}</span>
        ) : null}
      </div>
      {verdict.rationale ? <p className="text-sm">{verdict.rationale}</p> : null}
      {verdict.required_actions.length ? (
        <>
          <div className="mt-1.5 text-[11px] uppercase tracking-wider text-muted">Actions requises</div>
          <ul className="list-disc pl-4 text-sm">
            {verdict.required_actions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      ) : null}
      {verdict.supporting_sources.length ? (
        <div className="mt-1 text-[11px] text-muted">
          Sources : {verdict.supporting_sources.join(' · ')}
        </div>
      ) : null}
    </div>
  );
}

/** An `engine_auto` score is a candidate, not a validated fact — provenance is shown, never implied. */
const originLabel = (o?: string | null) =>
  o === 'engine_auto' ? 'auto (moteur)' : o === 'analyst_submission' ? 'analyste' : humanize(o);

function ScoringBlock({
  scoring,
  completeness,
}: {
  scoring: SfuFicheOut['scoring'];
  completeness: SfuFicheOut['completeness'];
}) {
  // The unscored judgment dimensions never appear as rows and we hold no names for them (their
  // labels live in /vocabularies). Count them rather than render fabricated blanks.
  const remaining = completeness
    ? Math.max(0, completeness.dimensions_total - completeness.dimensions_scored)
    : 0;

  if (!scoring.length) {
    return (
      <div>
        <PanelTitle>Scoring</PanelTitle>
        <p className="text-sm text-muted">Aucune dimension scorée.</p>
      </div>
    );
  }
  return (
    <div>
      <PanelTitle>Scoring</PanelTitle>
      <p className="mb-1 text-[11px] text-muted">
        `effective_score` arbitre entre la valeur automatique et celle de l'analyste. Origine{' '}
        <em>auto</em> = candidat moteur non validé ; <em>analyste</em> = soumission humaine.
      </p>
      <ul className="space-y-1.5 text-sm">
        {scoring.map((d) => (
          <li key={d.dimension}>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium">{humanize(d.dimension)}</span>
              {d.effective_score != null ? (
                <Badge tone="neutral">{d.effective_score}</Badge>
              ) : null}
              {d.origin ? <Badge tone="neutral">{originLabel(d.origin)}</Badge> : null}
              {d.confidence ? (
                <span className="text-[11px] text-muted">confiance {d.confidence}</span>
              ) : null}
              {d.evidence_status ? (
                <span className="text-[11px] text-muted">{humanize(d.evidence_status)}</span>
              ) : null}
            </div>
            <div className="text-[11px] text-muted">
              {[
                d.auto_value != null ? `auto ${d.auto_value}` : null,
                d.analyst_value != null ? `analyste ${d.analyst_value}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>
            {d.rationale ? <div className="text-xs text-muted">{d.rationale}</div> : null}
          </li>
        ))}
      </ul>
      {remaining > 0 ? (
        <p className="mt-1.5 text-[11px] text-muted">
          {remaining} dimension{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}, en
          attente d'analyste.
        </p>
      ) : null}
    </div>
  );
}

/** Routes / actors / value chain / aggregates / integration are opaque producer-owned rows. */
function CountsBlock({ fiche }: { fiche: SfuFicheOut }) {
  const blocks: [string, unknown[]][] = [
    ['Routes', fiche.routes],
    ['Acteurs de contrôle', fiche.control_actors],
    ['Chaîne de valeur', fiche.value_chain],
    ['Agrégats', fiche.aggregates],
    ['Intégration', fiche.integration],
  ];
  return (
    <div>
      <PanelTitle>Blocs de la fiche</PanelTitle>
      <ul className="space-y-2 text-sm">
        {blocks.map(([label, rows]) => (
          <li key={label}>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{label}</span>
              <Badge tone="neutral">{rows.length}</Badge>
            </div>
            {rows.length ? (
              <pre className="mt-0.5 max-h-40 overflow-auto rounded-md border border-line bg-subtle p-2 text-[11px]">
                {JSON.stringify(rows, null, 2)}
              </pre>
            ) : (
              <span className="text-[11px] text-muted">vide côté producteur</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
