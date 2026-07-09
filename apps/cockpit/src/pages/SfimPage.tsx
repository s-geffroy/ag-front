import { useEffect, useState } from 'react';
import type { SfuFicheOut, StrategicFlowUnitSummary } from '@ag/chokepoints';
import { api } from '@/lib/api';
import { Badge, Separator, Sheet } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { Disclaimer, PanelTitle, humanize } from '@/components/chokepoints/panels';

/**
 * SFIM — Strategic Flow Units (ADR 0054), the prescription layer parallel to chokepoints.
 *
 * Scoring, verdicts and the red-team block are AUTHORED in the ag-back workbench, not computed by an
 * engine. As of the 0.6.0 deploy every SFU is still a `skeleton`: no verdict, no scoring, empty
 * routes. That is a gap on the PRODUCER side, not broken wiring here — so the screen says so plainly
 * rather than hiding the sections. Hiding them would make an unpopulated pipeline look finished.
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

  const scored = (items ?? []).filter((s) => s.verdict).length;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Flux stratégiques (SFIM)"
        subtitle="Couche de prescription : une unité de flux, une décision. Scoring et verdicts sont rédigés en workbench côté ag-back, pas calculés."
      />

      {error ? (
        <div className="rounded-md border border-status-at_risk/30 bg-status-at_risk/10 p-4 text-sm text-status-at_risk">
          {error.includes('503') ? 'API chokepoints non configurée (token absent).' : `Erreur : ${error}`}
        </div>
      ) : null}

      {items && items.length > 0 && scored === 0 ? (
        <div className="mb-4 rounded-md border border-line bg-subtle p-3 text-sm text-muted">
          Les {items.length} unités sont à l'état <strong>squelette</strong> : aucun verdict ni scoring
          n'a encore été rédigé côté producteur. Le câblage est en place — c'est la donnée qui manque.
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
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted">
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

      <VerdictBlock verdict={fiche.verdict} />

      <Separator />
      <ScoringBlock scoring={fiche.scoring} />

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

function ScoringBlock({ scoring }: { scoring: SfuFicheOut['scoring'] }) {
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
        `effective_score` arbitre entre la valeur automatique et celle de l'analyste.
      </p>
      <ul className="space-y-1.5 text-sm">
        {scoring.map((d) => (
          <li key={d.dimension}>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium">{humanize(d.dimension)}</span>
              {d.effective_score != null ? (
                <Badge tone="neutral">{d.effective_score}</Badge>
              ) : null}
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
