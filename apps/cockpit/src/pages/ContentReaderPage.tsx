import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { api, type RenderedContent } from '@/lib/api';
import { typeLabel } from '@/lib/display';
import { outputByContentType } from '@/lib/outputs';
import { useCockpit } from '@/store';
import { Badge, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/common';

// Maps the content folder to the public-site URL prefix (identical here, but kept explicit).
const publicPrefix: Record<string, string> = {
  atlas: 'atlas',
  dossiers: 'dossiers',
  notes: 'notes',
};

export function ContentReaderPage() {
  const { type = '', slug = '' } = useParams();
  const [doc, setDoc] = useState<RenderedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDoc(null);
    setError(null);
    api
      .getContent(type, slug)
      .then(setDoc)
      .catch((e: unknown) => setError(String(e)));
  }, [type, slug]);

  if (error) {
    return (
      <div>
        <BackLink />
        <p className="mt-4 text-sm text-status-blocked">Lecture impossible : {error}</p>
      </div>
    );
  }
  if (!doc) {
    return (
      <div>
        <BackLink />
        <p className="mt-4 text-sm text-muted">Chargement…</p>
      </div>
    );
  }

  const data = doc.data;
  const title = typeof data.title === 'string' ? data.title : slug;
  // notes use `draft` (published unless draft); atlas/dossiers use `published` (off-public by default).
  const isPublished = doc.type === 'notes' ? data.draft !== true : data.published === true;

  return (
    <div>
      <BackLink />
      <PageHeader
        title={title}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{typeLabel[typeKindLabel(doc.type)] ?? doc.type}</Badge>
            {isPublished ? (
              <Badge tone="on_track">En ligne</Badge>
            ) : (
              <Badge tone="at_risk">Hors-ligne · en revue</Badge>
            )}
            {doc.full ? (
              <Badge tone="accent">Version complète (interne)</Badge>
            ) : (
              <Badge tone="neutral">Résumé public</Badge>
            )}
            {isPublished ? (
              <a
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                href={`https://www.applied-geopolitics.com/${publicPrefix[doc.type]}/${doc.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                Voir en ligne <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </span>
        }
      />

      {!isPublished ? (
        <p className="mb-4 rounded-md border border-status-at_risk/30 bg-status-at_risk/10 px-3 py-2 text-xs text-status-at_risk">
          Aperçu interne — contenu <strong>candidat, non publié</strong>. Le site public ne sert que
          les fiches/dossiers validés (gate de publication). À lire pour revue avant mise en ligne.
        </p>
      ) : null}

      {!doc.full ? (
        <p className="mb-4 rounded-md border border-line bg-subtle px-3 py-2 text-xs text-muted">
          Vous lisez le <strong>résumé public</strong> — la version complète interne n'existe pas
          encore. Elle se rédige dans{' '}
          <code>
            apps/cockpit/content/{doc.type}/{doc.slug}.md
          </code>{' '}
          ; dès qu'elle existe, le cockpit l'affiche ici en entier.
        </p>
      ) : null}

      <Card>
        <CardContent className="py-6">
          {/* doc.html is sanitized server-side (sanitize-html in server/content.ts): no script,
              event handlers or javascript: URLs survive — safe to inject here. */}
          <article className="content-prose" dangerouslySetInnerHTML={{ __html: doc.html }} />
        </CardContent>
      </Card>
    </div>
  );
}

// Back to the originating output workspace's Revue tab (derived from the content folder in the URL),
// falling back to the dossiers workspace when config isn't loaded or the folder is unknown.
function BackLink() {
  const { type = '' } = useParams();
  const { state } = useCockpit();
  const output = state ? outputByContentType(state.config, type) : undefined;
  const to = output ? `/sorties/${output.slug}?tab=revue` : '/sorties/dossiers?tab=revue';
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent">
      <ArrowLeft className="h-3 w-3" /> Revue{output ? ` · ${output.label}` : ''}
    </Link>
  );
}

// The content folder ("atlas") differs from the deliverable type key ("atlas_fiche") used in
// typeLabel; map folder → a key typeLabel knows, falling back to the folder name.
function typeKindLabel(type: string): string {
  return { atlas: 'atlas_fiche', dossiers: 'dossier', notes: 'note' }[type] ?? type;
}
