/**
 * La pulsation : le battement qui remplace le digest hebdomadaire.
 *
 * CE QU'ELLE EST. Le flux au fil de l'eau (`stream.ts`) ne parle que quand il a quelque chose à
 * dire. Son silence est donc ambigu — « rien à signaler » ou « le sondeur est mort » ? La pulsation
 * part tous les deux jours, y compris quand tout est vide, et c'est SON absence qui devient le
 * signal. C'est la fonction du digest du lundi qu'elle reprend, pas son contenu : elle ne redépose
 * pas un lot, elle atteste que la chaîne respire.
 *
 * CE QU'ELLE N'EST PAS. Un rappel à l'ordre éditorial. Une période sans promotion n'est pas une
 * anomalie : c'est une semaine où rien ne méritait d'être promu, et le dire en rouge apprendrait
 * seulement à ignorer la couleur.
 *
 * Aucune entrée-sortie ici : `pulse-run.ts` lit, poste et horodate.
 */

/** Le sondeur tourne toutes les heures. Au-delà de ce retard, il n'écrit plus. */
export const POLL_LATE_AFTER_HOURS = 3;

/**
 * Deux jours, comptés en HEURES depuis la dernière pulsation — et non par un pas de deux sur le
 * quantième dans la crontab, qui ne donne que les jours impairs et laisse un trou de trois jours
 * quand un mois en compte 31. (Écrire ce pas ici, tel quel, refermait le bloc de commentaire et
 * cassait le fichier : le piège s'est vengé jusque dans son explication.)
 * 47 h et non 48 pour qu'une pulsation quotidiennement déclenchée à heure fixe ne saute pas un tour
 * à cause de quelques secondes de dérive.
 */
export const PULSE_EVERY_HOURS = 47;

export type FeedState = 'ok' | 'empty_honest' | 'never_ran' | 'unreachable';

export interface PulseState {
  feed: FeedState;
  /** Regroupements servis touchant un corridor au périmètre (P0/P1). */
  servedAtScope: number;
  announcedSince: number;
  promotedSince: number;
  promotedTotal: number;
  promotedCorridors: number;
  /** Heures depuis la dernière écriture du registre. `null` = le sondeur n'a jamais rien écrit. */
  pollAgeHours: number | null;
  runNotes: string[];
  sinceLabel: string;
}

export function shouldPulse(
  lastPulseAt: string | undefined,
  now: Date,
  everyHours = PULSE_EVERY_HOURS,
): boolean {
  const last = Date.parse(lastPulseAt ?? '');
  // Horodatage absent OU illisible : on pulse. Se taire sur un état de fichier douteux reviendrait
  // à laisser le dead-man's switch décider de mourir.
  if (!Number.isFinite(last)) return true;
  return now.getTime() - last >= everyHours * 3_600_000;
}

export function pollAgeHours(ledgerMtime: Date | null, now: Date): number | null {
  if (!ledgerMtime) return null;
  return (now.getTime() - ledgerMtime.getTime()) / 3_600_000;
}

/** Ce qui mérite de crier. Rien d'autre. */
export function pulseAlarms(s: PulseState): string[] {
  const alarms: string[] = [];
  if (s.pollAgeHours === null)
    alarms.push("Le sondeur horaire n'a jamais écrit : aucun registre sur le disque.");
  else if (s.pollAgeHours > POLL_LATE_AFTER_HOURS)
    alarms.push(
      `Le sondeur horaire n'a rien écrit depuis ${s.pollAgeHours.toFixed(1)} h — il tourne toutes les heures.`,
    );

  if (s.feed === 'never_ran')
    alarms.push(
      "L'agrégation amont n'a pas tourné : `count: 0` sans `run_id` ne veut pas dire « pas d'actualité ».",
    );
  else if (s.feed === 'unreachable') alarms.push("Le flux d'actualités est injoignable.");

  return alarms;
}

const FEED_LABEL: Record<FeedState, string> = {
  ok: 'servi',
  empty_honest: 'vide, et honnêtement vide (une passe a tourné)',
  never_ran: 'aucune agrégation',
  unreachable: 'injoignable',
};

export function buildPulseMessage(s: PulseState) {
  const alarms = pulseAlarms(s);
  const title =
    alarms.length > 0 ? '⚠ Pulsation — flux d’actualités' : 'Pulsation — flux d’actualités';

  const fields = [
    `*Flux amont :* ${FEED_LABEL[s.feed]} · ${s.servedAtScope} regroupement(s) au périmètre`,
    `*${s.sinceLabel} :* ${s.announcedSince} sujet(s) annoncé(s), ${s.promotedSince} promu(s)`,
    `*Total public :* ${s.promotedTotal} promotion(s) sur ${s.promotedCorridors} corridor(s)`,
    s.pollAgeHours === null
      ? '*Dernier sondage :* jamais'
      : `*Dernier sondage :* il y a ${s.pollAgeHours.toFixed(1)} h`,
  ].join('\n');

  const blocks: Record<string, unknown>[] = [
    { type: 'header', text: { type: 'plain_text', text: title, emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: fields } },
  ];

  if (alarms.length > 0) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: alarms.map((a) => `• ${a}`).join('\n') },
    });
  }

  // Le contrat demande que les `run_notes` soient rendues : une liste propre sans elles ressemble à
  // l'actualité de la période alors qu'elle est un échantillon plafonné.
  if (s.runNotes.length > 0) {
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: s.runNotes
            .slice(0, 3)
            .map((n) => `_${n.slice(0, 300)}_`)
            .join('\n'),
        },
      ],
    });
  }

  return {
    // Le texte de notification est ce qui s'affiche sur un téléphone verrouillé : l'alarme doit y
    // être, pas seulement dans les blocs qu'il faut ouvrir pour lire.
    text:
      alarms.length > 0
        ? `⚠ ${title} — ${alarms[0]}`
        : `${title} — ${s.announcedSince} annoncé(s), ${s.promotedSince} promu(s) ${s.sinceLabel}`,
    blocks,
  };
}
