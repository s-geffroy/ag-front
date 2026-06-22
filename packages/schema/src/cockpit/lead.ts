import { z } from 'zod';
import { Contact } from './contact';

/** Subjects offered by the public contact form. */
export const leadSubjects = ['echange', 'pilote', 'critique', 'presse'] as const;
export const LeadSubject = z.enum(leadSubjects);
export type LeadSubject = z.infer<typeof LeadSubject>;

/**
 * Payload accepted by the public lead endpoint (POST /api/lead). Bounded sizes + a honeypot
 * (`website` must be empty) for basic anti-spam; full validation happens server-side.
 */
export const LeadInput = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  organization: z.string().trim().max(200).optional().default(''),
  subject: LeadSubject.default('echange'),
  message: z.string().trim().max(5000).optional().default(''),
  // honeypot: real users leave it empty. Accepted by the schema so a filled value parses, then the
  // server silently drops it (returns ok) rather than signalling detection to bots.
  website: z.string().max(200).optional(),
});
export type LeadInput = z.infer<typeof LeadInput>;

export const leadSubjectLabel: Record<LeadSubject, string> = {
  echange: 'Échange stratégique',
  pilote: 'Pilote Premium',
  critique: 'Critique de dossier',
  presse: 'Presse / partenariat',
};

const leadSubjectProfile: Record<LeadSubject, string> = {
  echange: 'inbound_echange',
  pilote: 'inbound_pilote',
  critique: 'inbound_critique',
  presse: 'inbound_presse',
};

/** Map a validated lead to a cockpit Contact (stage `identified`) for the acquisition pipeline. */
export function leadToContact(lead: LeadInput, id: string, receivedAtIso: string): Contact {
  const label = leadSubjectLabel[lead.subject];
  const excerpt = lead.message ? ` — ${lead.message.slice(0, 140)}` : '';
  return Contact.parse({
    id,
    name: lead.name,
    organization: lead.organization || '—',
    role: 'Lead entrant (web)',
    profile_type: leadSubjectProfile[lead.subject],
    stage: 'identified',
    email: lead.email,
    source: 'web_form',
    interest_signal: `${label}${excerpt}`,
    next_action: 'Qualifier le lead entrant',
    last_contact_date: receivedAtIso.slice(0, 10),
    notes: `Formulaire web — ${label}. Email : ${lead.email}.${lead.message ? `\n\n${lead.message}` : ''}`,
  });
}
