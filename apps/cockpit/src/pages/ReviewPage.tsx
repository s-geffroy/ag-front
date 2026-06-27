import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileWarning } from 'lucide-react';
import { api, type ContentSummary } from '@/lib/api';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { PageHeader } from '@/components/common';

const GROUPS: { key: ContentSummary['type']; label: string }[] = [
  { key: 'dossiers', label: 'Dossiers' },
  { key: 'atlas', label: 'Fiches Atlas' },
  { key: 'notes', label: 'Notes' },
];

const confidenceLabel: Record<string, string> = {
  bas: 'Confiance basse',
  moyen: 'Confiance moyenne',
  eleve: 'Confiance élevée',
};

export function ReviewPage() {
  const [items, setItems] = useState<ContentSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listContent()
      .then(setItems)
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) return <p className="text-sm text-status-blocked">Chargement impossible : {error}</p>;
  if (!items) return <p className="text-sm text-muted">Chargement…</p>;

  const candidates = items.filter((i) => !i.published).length;

  return (
    <div>
      <PageHeader
        title="Revue des sorties"
        subtitle="Consultez chaque sortie éditoriale (dossiers, fiches, notes) à des fins de validation. Les candidats hors-ligne ne sont pas publiés tant qu'ils ne sont pas validés."
      />

      <Card className="mb-5 border-status-at_risk/30">
        <CardContent className="flex items-center gap-2 py-3 text-sm">
          <FileWarning className="h-4 w-4 text-status-at_risk" />
          <span>
            <span className="font-medium">{candidates}</span> sortie(s) candidate(s) hors-ligne à
            valider, sur {items.length} au total.
          </span>
        </CardContent>
      </Card>

      {GROUPS.map(({ key, label }) => {
        const group = items.filter((i) => i.type === key);
        if (group.length === 0) return null;
        return (
          <Card key={key} className="mb-5">
            <CardHeader>
              <CardTitle>
                {label} <span className="text-xs font-normal text-muted">· {group.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <table className="w-full text-sm">
                <tbody>
                  {group.map((it) => (
                    <tr key={`${it.type}/${it.slug}`} className="border-b border-line/60">
                      <td className="px-4 py-2.5">
                        <div className="font-medium">{it.title}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {it.published ? (
                            <Badge tone="on_track">En ligne</Badge>
                          ) : (
                            <Badge tone="at_risk">Hors-ligne · candidat</Badge>
                          )}
                          {it.full ? <Badge tone="accent">Version complète</Badge> : null}
                          {it.confidence ? (
                            <Badge tone="neutral">
                              {confidenceLabel[it.confidence] ?? it.confidence}
                            </Badge>
                          ) : null}
                          <Badge tone={it.sources > 0 ? 'neutral' : 'blocked'}>
                            {it.sources} source{it.sources > 1 ? 's' : ''}
                          </Badge>
                          {it.corrections > 0 ? (
                            <Badge tone="neutral">{it.corrections} correction(s)</Badge>
                          ) : null}
                          {it.date ? (
                            <span className="font-mono text-[11px] text-muted">
                              {it.date.slice(0, 10)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Link
                          to={`/lire/${it.type}/${it.slug}`}
                          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                        >
                          <BookOpen className="h-4 w-4" /> Consulter
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
