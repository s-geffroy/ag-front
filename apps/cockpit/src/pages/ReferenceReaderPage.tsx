import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api, type RenderedReference } from '@/lib/api';
import { PageHeader } from '@/components/common';
import { Card, CardContent } from '@/components/ui';

// Reader for an internal reference doc. Deliberately stripped of editorial chrome (no publish
// badge, no public "Voir en ligne" link, no contradiction panel) — these are methodology notes,
// not editorial outputs.
export function ReferenceReaderPage() {
  const { slug = '' } = useParams();
  const [doc, setDoc] = useState<RenderedReference | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDoc(null);
    setError(null);
    api
      .getReference(slug)
      .then(setDoc)
      .catch((e: unknown) => setError(String(e)));
  }, [slug]);

  const back = (
    <Link
      to="/outils/reference"
      className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
    >
      <ArrowLeft className="h-3 w-3" /> Référence
    </Link>
  );

  if (error) {
    return (
      <div>
        {back}
        <p className="mt-4 text-sm text-status-blocked">Lecture impossible : {error}</p>
      </div>
    );
  }
  if (!doc) {
    return (
      <div>
        {back}
        <p className="mt-4 text-sm text-muted">Chargement…</p>
      </div>
    );
  }

  const data = doc.data;
  const title = typeof data.title === 'string' ? data.title : slug;
  const updated = typeof data.updated === 'string' ? data.updated : undefined;

  return (
    <div>
      {back}
      <PageHeader title={title} subtitle={updated ? `Mis à jour le ${updated}` : undefined} />
      <Card>
        <CardContent className="py-6">
          {/* doc.html is sanitized server-side (renderMarkdown in server/markdown.ts): no script,
              event handlers or javascript: URLs survive — safe to inject here. */}
          <article className="content-prose" dangerouslySetInnerHTML={{ __html: doc.html }} />
        </CardContent>
      </Card>
    </div>
  );
}
