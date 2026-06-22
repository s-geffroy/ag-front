import nodemailer from 'nodemailer';
import { leadSubjectLabel, type LeadInput } from '@ag/schema/cockpit';

/**
 * Optional email notification. No-op unless SMTP_HOST is configured, so the endpoint works out of the
 * box (store-only) and gains email by setting env vars later. User input goes only into the body and a
 * validated `replyTo`; the subject is a fixed label — no header injection.
 */
export async function notifyLead(lead: LeadInput, id: string): Promise<void> {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.log(`[lead] ${id} stored (email disabled: SMTP_HOST unset)`);
    return;
  }

  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? '' }
      : undefined,
  });

  await transport.sendMail({
    from: process.env.LEAD_FROM ?? 'no-reply@applied-geopolitics.com',
    to: process.env.LEAD_TO ?? 'contact@applied-geopolitics.com',
    replyTo: lead.email,
    subject: `[AG] Lead — ${leadSubjectLabel[lead.subject]}`,
    text:
      `Nom : ${lead.name}\n` +
      `Email : ${lead.email}\n` +
      `Organisation : ${lead.organization || '—'}\n` +
      `Sujet : ${leadSubjectLabel[lead.subject]}\n\n` +
      `${lead.message || '(pas de message)'}\n`,
  });
}
