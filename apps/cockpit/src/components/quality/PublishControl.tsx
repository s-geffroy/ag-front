import { useState } from 'react';
import { Check, Globe, Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import { useCockpit } from '@/store';
import { PUBLISH_GATE_LABELS, publishReadiness } from '@/lib/publish';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  inputClass,
  Label,
} from '@/components/ui';

/**
 * One-click publish for one document (ADR 0069). Flips the public frontmatter flag, gated on all
 * validation gates of the linked deliverable, and journals the act nominatively (ADR 0046). Going live
 * still needs the host rebuild — the watcher ships it within ~2 min. The cockpit never runs the build.
 */
export function PublishControl({
  type,
  slug,
  published,
  onChanged,
}: {
  type: string;
  slug: string;
  published: boolean;
  onChanged: () => void;
}) {
  const { state, publishDoc } = useCockpit();
  const operator = state?.config.operator ?? '';
  const [open, setOpen] = useState<null | 'publish' | 'unpublish'>(null);
  const [validatedBy, setValidatedBy] = useState(operator);
  const [reserve, setReserve] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!state) return null;
  const readiness = publishReadiness(state.deliverables, type, slug);

  const submit = async (decision: 'publish' | 'unpublish') => {
    if (!validatedBy.trim()) {
      setError('Indiquez qui publie (acte nominatif, ADR 0046).');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await publishDoc(type, slug, {
        decision,
        validated_by: validatedBy.trim(),
        reserve: reserve.trim(),
      });
      setOpen(null);
      setReserve('');
      setPending(true);
      onChanged();
    } catch (e) {
      const s = String(e);
      setError(
        s.includes('gates_incomplete')
          ? 'Publication refusée : des gates de validation manquent.'
          : s.includes('no_linked_deliverable')
            ? 'Publication refusée : aucun livrable lié à ce document.'
            : s,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-accent" />
          Publication
        </CardTitle>
        <Badge tone={published ? 'on_track' : 'neutral'}>
          {published ? 'En ligne' : 'Hors-ligne'}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        {pending ? (
          <p className="flex items-start gap-2 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent">
            <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Drapeau modifié + journalisé. <strong>Mise en ligne au prochain rebuild</strong> (le
              watcher hôte reconstruit le site public sous ~2 min ; un contenu non conforme Munich
              casse le build et n'est pas mis en ligne).
            </span>
          </p>
        ) : null}

        {error ? (
          <p className="flex items-start gap-1.5 text-sm text-status-blocked">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
          </p>
        ) : null}

        {/* Gate readiness — a publish is refused until every validation gate is validated. */}
        {!published && !readiness.ready ? (
          <p className="rounded-md border border-status-at_risk/30 bg-status-at_risk/10 px-3 py-2 text-xs text-status-at_risk">
            {readiness.linked.length === 0 ? (
              <>Aucun livrable lié à ce document — rien à publier depuis ici.</>
            ) : (
              <>
                Gates manquants avant publication :{' '}
                <strong>
                  {readiness.missing.map((g) => PUBLISH_GATE_LABELS[g] ?? g).join(', ')}
                </strong>
                . Validez-les dans « Gates &amp; Munich ».
              </>
            )}
          </p>
        ) : null}

        {open ? (
          <div className="space-y-3 rounded-md border border-line px-3 py-3">
            <p className="text-sm text-ink">
              {open === 'publish'
                ? 'Publier ce document : le drapeau passe en ligne (mise en ligne au prochain rebuild).'
                : 'Dépublier : le document repasse hors-ligne au prochain rebuild.'}
            </p>
            <div>
              <Label>Réserve / commentaire (journalisé)</Label>
              <textarea
                className={inputClass('h-16 py-1.5')}
                placeholder="Décision, réserve éventuelle…"
                value={reserve}
                onChange={(e) => setReserve(e.target.value)}
              />
            </div>
            <div>
              <Label>Publié par (identité nominative)</Label>
              <input
                className={inputClass()}
                value={validatedBy}
                onChange={(e) => setValidatedBy(e.target.value)}
                placeholder="Votre nom"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(null)} disabled={busy}>
                Annuler
              </Button>
              <Button size="sm" onClick={() => submit(open)} disabled={busy}>
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                {open === 'publish' ? 'Confirmer la publication' : 'Confirmer la dépublication'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            {published ? (
              <Button size="sm" variant="outline" onClick={() => setOpen('unpublish')}>
                Dépublier
              </Button>
            ) : (
              <Button size="sm" onClick={() => setOpen('publish')} disabled={!readiness.ready}>
                <Globe className="h-3.5 w-3.5" /> Publier
              </Button>
            )}
          </div>
        )}

        <p className="text-[11px] text-muted">
          La publication écrit le seul drapeau du frontmatter et s'inscrit au journal nominatif (ADR
          0069/0046). Le cockpit ne reconstruit jamais le site lui-même.
        </p>
      </CardContent>
    </Card>
  );
}
