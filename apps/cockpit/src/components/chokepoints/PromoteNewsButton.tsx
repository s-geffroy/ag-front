import { useState } from 'react';
import { Megaphone, Check } from 'lucide-react';
import type { NewsClusterOut } from '@ag/chokepoints';
import { useCockpit } from '@/store';
import { api } from '@/lib/api';

// Promote ONE news cluster to the public Atlas (ADR 0071). A nominative candidate → public act: the
// server re-fetches the feed, refuses a tainted cluster, and journals it. This button sends the cluster
// identity, the operator and the operator's own framing; the server owns the trust boundary. Going live
// still needs the host rebuild (~2 min watcher). Shown only in the per-corridor panel.
//
// The note is REQUIRED (ADR 0074) and it replaces a confirm() that asked nothing. The model's headline
// is a summary of article titles; approving it after reading only those titles was the whole defect.
// Writing one's own line is the smallest act that cannot be performed without having formed a view —
// and a promoter who cannot write it has learnt something worth learning before publishing.
export function PromoteNewsButton({
  corridorId,
  cluster,
}: {
  corridorId: string;
  cluster: NewsClusterOut;
}) {
  const { state } = useCockpit();
  const operator = state?.config.operator ?? '';
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  const promote = async () => {
    if (status === 'busy' || status === 'done') return;
    if (!operator.trim()) {
      setStatus('error');
      setMessage('Configurez « operator » (acte nominatif, ADR 0046).');
      return;
    }
    if (!note.trim()) {
      setStatus('error');
      setMessage('Une phrase de votre main est obligatoire (ADR 0074).');
      return;
    }
    setStatus('busy');
    setMessage(null);
    try {
      await api.promoteNews(corridorId, {
        cluster_id: cluster.cluster_id,
        validated_by: operator.trim(),
        editorial_note: note.trim(),
      });
      setStatus('done');
      setMessage('Promu — mise en ligne au prochain rebuild (~2 min).');
    } catch (e) {
      const s = String(e);
      setStatus('error');
      setMessage(
        s.includes('cluster_tainted')
          ? 'Refusé : cluster tainted, jamais republié en public (ADR 0013).'
          : s.includes('no_attributable_article')
            ? 'Refusé : aucun article attribuable (lien http).'
            : s.includes('cluster_not_found')
              ? 'Refusé : cluster introuvable dans le flux courant.'
              : s,
      );
    }
  };

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => (open ? void promote() : setOpen(true))}
        disabled={status === 'busy' || status === 'done'}
        className="inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 text-[11px] text-muted hover:border-accent hover:text-accent disabled:opacity-60"
      >
        {status === 'done' ? <Check className="h-3 w-3" /> : <Megaphone className="h-3 w-3" />}
        {status === 'done'
          ? 'Promu'
          : status === 'busy'
            ? 'Promotion…'
            : open
              ? 'Confirmer la promotion'
              : 'Promouvoir sur l’Atlas public'}
      </button>
      {open && status !== 'done' ? (
        <div className="mt-1.5 rounded border border-line bg-subtle/40 p-2">
          <label className="block text-[11px] text-muted">
            Votre phrase — c’est elle, et non le titre du modèle, qui sera publiée et signée.
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ce que cette couverture établit, et ce qu’elle n’établit pas."
              className="mt-1 w-full rounded border border-line bg-surface px-1.5 py-1 text-[12px] text-ink"
            />
          </label>
          <p className="mt-1 text-[11px] text-muted">
            Le titre proposé par le modèle est conservé au journal, jamais affiché : «{' '}
            {cluster.headline ?? '—'} »
          </p>
        </div>
      ) : null}
      {message ? (
        <p
          className={`mt-0.5 text-[11px] ${status === 'error' ? 'text-status-at_risk' : 'text-muted'}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
