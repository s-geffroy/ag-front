import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Upload } from 'lucide-react';
import { api, type UploadEntry } from '@/lib/api';
import { useCockpit } from '@/store';
import { Badge, Card, CardContent } from '@/components/ui';

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Read-only list of deposited source files, scoped to a set of deliverable ids (an output
 * workspace shows the deposits attached to its type's deliverables). Uploading/deleting stays in
 * the global Dépôts tool (Outils) — this view never mutates.
 */
export function UploadsList({ deliverableIds }: { deliverableIds?: string[] }) {
  const { state } = useCockpit();
  const [uploads, setUploads] = useState<UploadEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listUploads()
      .then(setUploads)
      .catch((e: unknown) => setError(String(e)));
  }, []);

  const titleOf = (id?: string) => state?.deliverables.find((d) => d.id === id)?.title;

  if (error) return <p className="text-sm text-status-blocked">Chargement impossible : {error}</p>;
  if (!uploads) return <p className="text-sm text-muted">Chargement…</p>;

  const ids = deliverableIds ? new Set(deliverableIds) : null;
  const rows = ids ? uploads.filter((u) => u.deliverable_id && ids.has(u.deliverable_id)) : uploads;

  // Deep-link the deposit tool to this deliverable when the scope is a single one; otherwise open the
  // general Dépôts tool. Deposits/deletions live there by design — this view is read-only.
  const depotHref =
    deliverableIds && deliverableIds.length === 1
      ? `/outils/depots?deliverable=${encodeURIComponent(deliverableIds[0])}`
      : '/outils/depots';

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          Sources rattachées aux livrables de ce type — <strong>lecture seule</strong>.
        </p>
        <Link
          to={depotHref}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-subtle"
        >
          <Upload className="h-3.5 w-3.5" /> Déposer / gérer dans Dépôts
        </Link>
      </div>
      <Card>
        <CardContent className="px-0">
          {rows.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">Aucun dépôt rattaché.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-4 py-2 font-medium">Fichier</th>
                  <th className="px-2 py-2 font-medium">Taille</th>
                  <th className="px-2 py-2 font-medium">Déposé</th>
                  <th className="px-2 py-2 font-medium">Livrable</th>
                  <th className="px-2 py-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-b border-line/60">
                    <td className="px-4 py-2">
                      <a
                        href={api.uploadRawUrl(u.id)}
                        className="inline-flex items-center gap-1 text-accent hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" /> {u.original_name}
                      </a>
                    </td>
                    <td className="px-2 py-2 text-muted">{humanSize(u.size)}</td>
                    <td className="px-2 py-2 text-muted">{u.uploaded_at.slice(0, 10)}</td>
                    <td className="px-2 py-2">
                      {u.deliverable_id ? (
                        <Badge tone="neutral">
                          {titleOf(u.deliverable_id) ?? u.deliverable_id}
                        </Badge>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-muted">{u.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
