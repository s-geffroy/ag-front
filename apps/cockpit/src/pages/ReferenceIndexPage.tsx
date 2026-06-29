import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { api, type ReferenceSummary } from '@/lib/api';
import { EmptyHint, PageHeader } from '@/components/common';
import { Card, CardContent } from '@/components/ui';

// Library index for internal methodology docs (Outils → Référence). Read-only; the docs live in
// apps/cockpit/reference and are never built by the public site.
export function ReferenceIndexPage() {
  const [docs, setDocs] = useState<ReferenceSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listReferences()
      .then(setDocs)
      .catch((e: unknown) => setError(String(e)));
  }, []);

  return (
    <div>
      <PageHeader
        title="Référence"
        subtitle="Documents méthodologiques internes — doctrine, chaîne produit, corrélation aux offres. Lecture seule, tailnet uniquement."
      />

      {error ? (
        <p className="text-sm text-status-blocked">Lecture impossible : {error}</p>
      ) : !docs ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : docs.length === 0 ? (
        <EmptyHint>Aucun document de référence pour l'instant.</EmptyHint>
      ) : (
        <div className="space-y-3">
          {docs.map((d) => (
            <Link key={d.slug} to={`/reference/${d.slug}`} className="block">
              <Card className="transition-colors hover:border-accent/50">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-accent">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium tracking-tight">{d.title}</div>
                      {d.summary ? <p className="mt-0.5 text-sm text-muted">{d.summary}</p> : null}
                      {d.updated ? (
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                          Mis à jour le {d.updated}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
