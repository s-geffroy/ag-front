import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/cn';
import { api, type PlaquetteFamilyStatus, type PlaquetteStatus } from '@/lib/api';

/**
 * Plaquette review and publication (ADR 0073).
 *
 * The point of this page is fidelity: what is reviewed here must be what a prospect receives. So the
 * PDF is shown in the browser's own viewer — the exact artifact, not a re-render — and the public page
 * is embedded from the real build at the cockpit's own `/plaquette`, absolute asset paths and all.
 *
 * Two axes, hence two levels of navigation and no scrolling for either: a FAMILY selector (each
 * publishes independently) and TABS over the four things a reviewer actually does — read the document,
 * check the page, look at the degraded render, decide.
 *
 * The cockpit does not build the decks. `scripts/build-deck.sh` does, on the host. Everything here is
 * read-only except one act: flipping a family's `manifest.published`, nominatively, into the journal.
 */

const REVIEWER_KEY = 'ag.cockpit.validator';

const FAMILY_LABELS: Record<string, string> = {
  commercial: 'Commerciale',
  methode: 'Méthode',
};

const TABS = [
  { id: 'document', label: 'Document' },
  { id: 'page', label: 'Page publique' },
  { id: 'degraded', label: 'Rendu dégradé' },
  { id: 'decision', label: 'Décision' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const PUBLISH_BLOCKERS: Record<string, string> = {
  unknown_family: 'Famille inconnue — le manifeste a disparu ?',
  no_language_built: 'Aucune langue générée.',
  artifact_missing:
    'Un PDF ou un PPTX annoncé par le manifeste est absent — probablement un build --pptx-only.',
  page_never_built:
    'La page publique n’a jamais été construite : rien n’a pu être relu. Lancer le build du site public.',
};

function fmtBytes(n: number | null): string {
  if (n === null) return '—';
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} Mo` : `${Math.round(n / 1000)} ko`;
}

export function PlaquettePage() {
  const [status, setStatus] = useState<PlaquetteStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [familyKey, setFamilyKey] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>('document');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [reviewer, setReviewer] = useState(() => localStorage.getItem(REVIEWER_KEY) ?? '');
  const [reserve, setReserve] = useState('');

  const load = useCallback(() => {
    api
      .getPlaquette()
      .then((s) => {
        setStatus(s);
        setError(null);
        setFamilyKey((k) =>
          k && s.families.some((f) => f.family === k) ? k : (s.families[0]?.family ?? null),
        );
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  useEffect(load, [load]);

  const family: PlaquetteFamilyStatus | null = useMemo(
    () => status?.families.find((f) => f.family === familyKey) ?? status?.families[0] ?? null,
    [status, familyKey],
  );
  const current = family?.languages.find((l) => l.lang === lang) ?? family?.languages[0] ?? null;

  const decide = async (decision: 'publish' | 'unpublish') => {
    if (!family) return;
    if (!reviewer.trim()) {
      setError('Le nom du validateur est obligatoire : le journal est nominatif (ADR 0046).');
      return;
    }
    setBusy(true);
    try {
      localStorage.setItem(REVIEWER_KEY, reviewer.trim());
      await api.publishPlaquette(family.family, {
        decision,
        validated_by: reviewer.trim(),
        reserve,
      });
      setReserve('');
      load();
      setError(null);
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : String(e);
      const code = Object.keys(PUBLISH_BLOCKERS).find((k) => raw.includes(k));
      setError(code ? PUBLISH_BLOCKERS[code]! : raw);
    } finally {
      setBusy(false);
    }
  };

  if (error && !status) {
    return (
      <div>
        <PageHeader title="Plaquettes" />
        <Card>
          <CardContent className="pt-4 text-sm text-status-blocked">{error}</CardContent>
        </Card>
      </div>
    );
  }
  if (!status || !family) return <div className="text-sm text-muted">Chargement…</div>;

  const pageShowsThisFamily = status.pageContains.includes(family.family);

  return (
    <div>
      <PageHeader
        title="Plaquettes"
        subtitle="Relire chaque plaquette telle qu’un prospect la recevra, puis décider de sa mise en ligne. Les plaquettes sont produites par scripts/build-deck.sh ; le cockpit ne les génère pas."
      />

      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-status-blocked/30 bg-status-blocked/5 p-3 text-sm text-status-blocked">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Family selector — each family has its own publication flag and its own decision. */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {status.families.map((f) => (
          <button
            key={f.family}
            onClick={() => setFamilyKey(f.family)}
            className={cn(
              'flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors',
              f.family === family.family
                ? 'border-accent bg-accent/10 text-ink'
                : 'border-line bg-surface text-muted hover:bg-subtle',
            )}
          >
            <span className="font-medium">{FAMILY_LABELS[f.family] ?? f.family}</span>
            <Badge tone={f.published ? 'on_track' : 'not_started'}>
              {f.published ? 'en ligne' : 'hors ligne'}
            </Badge>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-muted">
          <span className="font-mono">{family.updated}</span>
          <span>·</span>
          <span>
            {family.languages.map((l) => `${l.lang.toUpperCase()} ${l.slides}p`).join(' · ')}
          </span>
          <Button variant="ghost" size="sm" onClick={load} aria-label="Rafraîchir">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm transition-colors',
              tab === t.id
                ? 'border-accent font-medium text-ink'
                : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
        {tab !== 'page' && tab !== 'decision' ? (
          <div className="ml-auto flex items-center gap-1 pb-1">
            {family.languages.map((l) => (
              <Button
                key={l.lang}
                variant={l.lang === (current?.lang ?? 'fr') ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLang(l.lang)}
              >
                {l.lang.toUpperCase()}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      {tab === 'document' && current ? (
        <Card>
          <CardHeader>
            <CardTitle>Le document, tel qu’il sera reçu</CardTitle>
            <span className="font-mono text-[11px] text-muted">
              PDF {fmtBytes(current.pdf.bytes)} · PPTX {fmtBytes(current.pptx.bytes)}
            </span>
          </CardHeader>
          <CardContent>
            {/* The PDF itself, in the browser's viewer: the highest-fidelity view there is, because
                it is not a view of the artifact — it IS the artifact. */}
            <iframe
              key={`${family.family}-${current.lang}-${family.updated}`}
              title={`Plaquette ${family.family} ${current.lang.toUpperCase()}`}
              src={`/api/plaquette/file/${family.family}/${current.lang}/${current.pdf.file}`}
              className="h-[72vh] w-full rounded-sm border border-line bg-subtle"
            />
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                className="text-sm text-accent hover:underline"
                href={`/api/plaquette/file/${family.family}/${current.lang}/${current.pdf.file}`}
                target="_blank"
                rel="noreferrer"
              >
                Ouvrir le PDF
              </a>
              <a
                className="text-sm text-accent hover:underline"
                href={`/api/plaquette/file/${family.family}/${current.lang}/${current.pptx.file}`}
              >
                Télécharger le PPTX
              </a>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === 'page' ? (
        <Card>
          <CardHeader>
            <CardTitle>La page publique, telle qu’elle sera servie</CardTitle>
            {status.previewSource !== 'none' ? (
              <a
                className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
                href="/plaquette/"
                target="_blank"
                rel="noreferrer"
              >
                Ouvrir en pleine page <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </CardHeader>
          <CardContent>
            {status.previewSource === 'none' ? (
              <p className="text-sm text-status-at_risk">
                Le site public n’a pas été rebâti depuis la génération des plaquettes. Lancer le
                build du site public pour disposer de cette prévisualisation.
              </p>
            ) : (
              <>
                <iframe
                  title="Page /plaquette"
                  src="/plaquette/"
                  className="h-[62vh] w-full rounded-sm border border-line bg-white"
                />
                <p className="mt-2 text-[11px] text-muted">
                  Mêmes octets, mêmes feuilles de style, mêmes chemins absolus que le site public.
                  Seuls les liens sortants (/offres, /contact) retombent sur le cockpit.
                </p>
                {!pageShowsThisFamily ? (
                  <p className="mt-2 text-[11px] text-status-at_risk">
                    Cette page ne contient pas encore «{' '}
                    {FAMILY_LABELS[family.family] ?? family.family} » : elle a été construite avant
                    sa publication. C’est attendu — publier, puis rebâtir le site, la fera
                    apparaître.
                  </p>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      {tab === 'degraded' && current ? (
        <Card>
          <CardHeader>
            <CardTitle>Rendu à polices substituées</CardTitle>
            <span className="text-[11px] text-muted">
              poste client dépourvu d’Inter et Fraunces
            </span>
          </CardHeader>
          <CardContent>
            {current.substitutionPreviews.length === 0 ? (
              <p className="text-sm text-muted">
                Aucun rendu dégradé disponible. Le produire avec{' '}
                <code className="font-mono text-xs">
                  scripts/build-deck.sh --deck {family.family} --substitution-qa
                </code>
                .
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {current.substitutionPreviews.map((f) => (
                    <img
                      key={f}
                      src={`/api/plaquette/preview/${family.family}/${f}`}
                      alt={f}
                      loading="lazy"
                      className="w-full rounded-sm border border-line"
                    />
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted">
                  À comparer à l’onglet Document. Cherche les débordements : c’est le seul défaut
                  que la substitution introduit, et aucun test ne le détecte à ta place.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      {tab === 'decision' ? (
        <Card>
          <CardHeader>
            <CardTitle>Décision — {FAMILY_LABELS[family.family] ?? family.family}</CardTitle>
            <Badge tone={family.published ? 'on_track' : 'not_started'}>
              {family.published ? 'En ligne' : 'Hors ligne'}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted">
              La décision porte sur cette famille seule, elle est nominative et journalisée (ADR
              0046). Publier n’envoie rien en ligne immédiatement : la sentinelle est posée, et le
              watcher de l’hôte rebâtit le site (~2 min).
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-muted">Validé par</span>
                <input
                  className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
                  value={reviewer}
                  onChange={(e) => setReviewer(e.target.value)}
                  placeholder="Prénom Nom"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-muted">Réserve (facultatif)</span>
                <input
                  className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
                  value={reserve}
                  onChange={(e) => setReserve(e.target.value)}
                  placeholder="Ce qui reste à corriger au prochain tirage"
                />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <Button disabled={busy || family.published} onClick={() => void decide('publish')}>
                <Check className="mr-1 h-4 w-4" />
                Publier sur /plaquette
              </Button>
              <Button
                variant="outline"
                disabled={busy || !family.published}
                onClick={() => void decide('unpublish')}
              >
                Retirer
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
