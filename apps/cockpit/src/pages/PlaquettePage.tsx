import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { api, type PlaquetteStatus } from '@/lib/api';

/**
 * Plaquette review and publication (ADR 0073).
 *
 * The point of this page is fidelity: what is reviewed here must be what a prospect receives. So the
 * PDF is shown in the browser's own viewer — the exact artifact, not a re-render — and the public page
 * is embedded from the real build at the cockpit's own `/plaquette`, absolute asset paths and all.
 *
 * The cockpit does not build the deck. `scripts/build-deck.sh` does, on the host. Everything here is
 * read-only except one act: flipping `manifest.published`, nominatively and into the journal.
 */

const REVIEWER_KEY = 'ag.cockpit.validator';

function fmtBytes(n: number | null): string {
  if (n === null) return '—';
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} Mo` : `${Math.round(n / 1000)} ko`;
}

const PUBLISH_BLOCKERS: Record<string, string> = {
  no_manifest: 'Aucun manifeste — lancer scripts/build-deck.sh.',
  no_language_built: 'Aucune langue générée.',
  artifact_missing:
    'Un PDF ou un PPTX annoncé par le manifeste est absent — probablement un build --pptx-only.',
  page_never_built:
    'La page publique n’a jamais été construite : rien n’a pu être relu. Lancer le build du site public.',
};

export function PlaquettePage() {
  const [status, setStatus] = useState<PlaquetteStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [reviewer, setReviewer] = useState(() => localStorage.getItem(REVIEWER_KEY) ?? '');
  const [reserve, setReserve] = useState('');

  const load = useCallback(() => {
    api
      .getPlaquette()
      .then((s) => {
        setStatus(s);
        setError(null);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  useEffect(load, [load]);

  const decide = async (decision: 'publish' | 'unpublish') => {
    if (!reviewer.trim()) {
      setError('Le nom du validateur est obligatoire : le journal est nominatif (ADR 0046).');
      return;
    }
    setBusy(true);
    try {
      localStorage.setItem(REVIEWER_KEY, reviewer.trim());
      await api.publishPlaquette({ decision, validated_by: reviewer.trim(), reserve });
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
        <PageHeader title="Plaquette commerciale" />
        <Card>
          <CardContent className="pt-4 text-sm text-status-blocked">{error}</CardContent>
        </Card>
      </div>
    );
  }
  if (!status) return <div className="text-sm text-muted">Chargement…</div>;

  const current = status.languages.find((l) => l.lang === lang) ?? status.languages[0];

  return (
    <div>
      <PageHeader
        title="Plaquette commerciale"
        subtitle="Relire la plaquette telle qu’un prospect la recevra, puis décider de sa mise en ligne. La plaquette est produite par scripts/build-deck.sh ; le cockpit ne la génère pas."
      />

      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-status-blocked/30 bg-status-blocked/5 p-3 text-sm text-status-blocked">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>État</CardTitle>
          <div className="flex items-center gap-2">
            {status.published ? (
              <Badge tone="on_track">En ligne</Badge>
            ) : (
              <Badge tone="not_started">Hors ligne</Badge>
            )}
            <Button variant="ghost" size="sm" onClick={load} aria-label="Rafraîchir">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="text-muted">Mise à jour</dt>
            <dd className="font-mono">{status.updated}</dd>
            <dt className="text-muted">Langues</dt>
            <dd>
              {status.languages
                .map((l) => `${l.lang.toUpperCase()} (${l.slides} slides)`)
                .join(' · ')}
            </dd>
            <dt className="text-muted">Page publique</dt>
            <dd>
              {status.previewSource === 'served'
                ? 'construite et servie'
                : status.previewSource === 'withheld'
                  ? 'construite, retenue hors du build servi'
                  : 'jamais construite'}
            </dd>
          </dl>
          {status.previewSource === 'none' ? (
            <p className="mt-3 text-sm text-status-at_risk">
              Le site public n’a pas été rebâti depuis la génération de la plaquette : la
              prévisualisation ci-dessous n’est pas disponible, et la publication est refusée tant
              que rien n’a pu être relu.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="mb-4 flex gap-1">
        {status.languages.map((l) => (
          <Button
            key={l.lang}
            variant={l.lang === lang ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLang(l.lang)}
          >
            {l.lang.toUpperCase()}
          </Button>
        ))}
      </div>

      {current ? (
        <>
          <Card className="mb-4">
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
                key={`${current.lang}-${status.updated}`}
                title={`Plaquette ${current.lang.toUpperCase()}`}
                src={`/api/plaquette/file/${current.lang}/${current.pdf.file}`}
                className="h-[70vh] w-full rounded-sm border border-line bg-subtle"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  className="text-sm text-accent hover:underline"
                  href={`/api/plaquette/file/${current.lang}/${current.pdf.file}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ouvrir le PDF
                </a>
                <a
                  className="text-sm text-accent hover:underline"
                  href={`/api/plaquette/file/${current.lang}/${current.pptx.file}`}
                >
                  Télécharger le PPTX
                </a>
              </div>
            </CardContent>
          </Card>

          {status.previewSource !== 'none' ? (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>La page publique, telle qu’elle sera servie</CardTitle>
                <a
                  className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
                  href="/plaquette"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ouvrir en pleine page <ExternalLink className="h-3 w-3" />
                </a>
              </CardHeader>
              <CardContent>
                <iframe
                  title="Page /plaquette"
                  src="/plaquette"
                  className="h-[60vh] w-full rounded-sm border border-line bg-white"
                />
                <p className="mt-2 text-[11px] text-muted">
                  Mêmes octets, mêmes feuilles de style, mêmes chemins absolus que le site public.
                  Seuls les liens sortants (/offres, /contact) retombent sur le cockpit : ce qui est
                  relu ici, c’est la page plaquette et le document, pas le reste du site.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {current.substitutionPreviews.length > 0 ? (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Rendu à polices substituées</CardTitle>
                <span className="text-[11px] text-muted">
                  poste client dépourvu d’Inter et Fraunces
                </span>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {current.substitutionPreviews.map((f) => (
                    <img
                      key={f}
                      src={`/api/plaquette/preview/${f}`}
                      alt={f}
                      loading="lazy"
                      className="w-full rounded-sm border border-line"
                    />
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted">
                  À comparer au PDF ci-dessus. Cherche les débordements : c’est le seul défaut que
                  la substitution introduit, et aucun test ne le détecte à ta place.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Décision</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted">
            La décision est nominative et journalisée (ADR 0046). Publier n’envoie rien en ligne
            immédiatement : la sentinelle est posée, et le watcher de l’hôte rebâtit le site (~2
            min).
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
            <Button disabled={busy || status.published} onClick={() => void decide('publish')}>
              <Check className="mr-1 h-4 w-4" />
              Publier sur /plaquette
            </Button>
            <Button
              variant="outline"
              disabled={busy || !status.published}
              onClick={() => void decide('unpublish')}
            >
              Retirer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
