import { useState } from 'react';
import { Megaphone, Check } from 'lucide-react';
import type { NewsClusterOut } from '@ag/chokepoints';
import { useCockpit } from '@/store';
import { api } from '@/lib/api';

// Promote ONE news cluster to the public Atlas (ADR 0071). A nominative candidate → public act: the
// server re-fetches the feed, refuses a tainted cluster, and journals it. This button only sends the
// cluster identity + the operator; the server owns the trust boundary. Going live still needs the host
// rebuild (~2 min watcher). Shown only in the per-corridor panel (a promotion needs a corridor).
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

  const promote = async () => {
    if (status === 'busy' || status === 'done') return;
    if (!operator.trim()) {
      setStatus('error');
      setMessage('Configurez « operator » (acte nominatif, ADR 0046).');
      return;
    }
    if (!window.confirm('Promouvoir ce cluster sur l’Atlas public ? Acte nominatif et journalisé.'))
      return;
    setStatus('busy');
    setMessage(null);
    try {
      await api.promoteNews(corridorId, {
        cluster_id: cluster.cluster_id,
        validated_by: operator.trim(),
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
        onClick={promote}
        disabled={status === 'busy' || status === 'done'}
        className="inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 text-[11px] text-muted hover:border-accent hover:text-accent disabled:opacity-60"
      >
        {status === 'done' ? <Check className="h-3 w-3" /> : <Megaphone className="h-3 w-3" />}
        {status === 'done'
          ? 'Promu'
          : status === 'busy'
            ? 'Promotion…'
            : 'Promouvoir sur l’Atlas public'}
      </button>
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
