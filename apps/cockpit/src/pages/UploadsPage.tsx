import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Trash2, Upload } from 'lucide-react';
import { api, type UploadEntry } from '@/lib/api';
import { useCockpit } from '@/store';
import { Badge, Button, Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/common';

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function UploadsPage() {
  const { state } = useCockpit();
  const [params, setParams] = useSearchParams();
  const filter = params.get('deliverable') ?? '';
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  // Attachment + note applied to the next upload.
  const [attachTo, setAttachTo] = useState('');
  const [note, setNote] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const deliverables = state?.deliverables ?? [];
  const titleOf = (id?: string) => deliverables.find((d) => d.id === id)?.title;

  const reload = useCallback(() => {
    api
      .listUploads(filter || undefined)
      .then(setUploads)
      .catch((e: unknown) => setError(String(e)));
  }, [filter]);

  useEffect(() => {
    reload();
  }, [reload]);

  const send = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      const form = new FormData();
      list.forEach((f) => form.append('files', f));
      // Default the attachment to the active filter when one is set.
      const target = attachTo || filter;
      if (target) form.append('deliverable_id', target);
      if (note.trim()) form.append('note', note.trim());
      setBusy(true);
      setError(null);
      try {
        await api.uploadFiles(form);
        setNote('');
        reload();
      } catch (e) {
        setError(String(e));
      } finally {
        setBusy(false);
      }
    },
    [attachTo, filter, note, reload],
  );

  const remove = async (id: string) => {
    setError(null);
    try {
      await api.deleteUpload(id);
      reload();
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div>
      <PageHeader
        title="Dépôts"
        subtitle="Déposez des fichiers sources (PDF, HTML enregistré, captures, CSV…). Tailnet uniquement ; téléchargement en pièce jointe. Rattachez-les à un livrable pour alimenter le bon dossier."
      />

      {/* Drop zone */}
      <Card className="mb-5">
        <CardContent className="py-5">
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-xs text-muted">Rattacher à</span>
              <select
                value={attachTo}
                onChange={(e) => setAttachTo(e.target.value)}
                className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
              >
                <option value="">— aucun —</option>
                {deliverables.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 text-sm">
              <span className="mb-1 block text-xs text-muted">Note (optionnelle)</span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="ex. S&P Global — primes Red Sea, déc. 2025"
                className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              void send(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed py-8 text-sm transition-colors ${
              drag ? 'border-accent bg-accent/5' : 'border-line hover:bg-subtle'
            }`}
          >
            <Upload className="h-6 w-6 text-muted" />
            <span className="text-muted">
              {busy ? 'Envoi…' : 'Glissez des fichiers ici, ou cliquez pour choisir'}
            </span>
            <span className="text-xs text-muted">
              PDF, HTML, TXT, MD, CSV, PNG/JPG/WebP, DOCX/XLSX · 25 Mo max
            </span>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) void send(e.target.files);
                e.target.value = '';
              }}
            />
          </div>
          {error ? <p className="mt-2 text-sm text-status-blocked">{error}</p> : null}
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span className="text-xs text-muted">Filtrer :</span>
        <select
          value={filter}
          onChange={(e) => {
            const v = e.target.value;
            setParams(v ? { deliverable: v } : {});
          }}
          className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
        >
          <option value="">Tous les dépôts</option>
          {deliverables.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <Card>
        <CardContent className="px-0">
          {uploads.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">Aucun dépôt.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-4 py-2 font-medium">Fichier</th>
                  <th className="px-2 py-2 font-medium">Taille</th>
                  <th className="px-2 py-2 font-medium">Déposé</th>
                  <th className="px-2 py-2 font-medium">Livrable</th>
                  <th className="px-2 py-2 font-medium">Note</th>
                  <th className="px-2 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((u) => (
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
                    <td className="px-2 py-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(u.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
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
