import { describe, it, expect } from 'vitest';
import { LeadInput, leadToContact } from './cockpit/index';

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.org',
  organization: 'Analytical Engines',
  subject: 'echange' as const,
  message: 'Un mot sur Ormuz.',
  consent: true as const,
};

describe('LeadInput consent', () => {
  it('accepts a lead that carries an explicit consent', () => {
    expect(LeadInput.parse(valid).consent).toBe(true);
  });

  it('refuses to parse a lead without consent', () => {
    // The legal basis for storing the rest of the payload. Rejecting at the schema means no caller —
    // not a stale cached page, not a script — can write personal data without it.
    const { consent, ...withoutConsent } = valid;
    expect(consent).toBe(true);
    expect(LeadInput.safeParse(withoutConsent).success).toBe(false);
  });

  it('refuses a consent that is false or merely truthy', () => {
    expect(LeadInput.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(LeadInput.safeParse({ ...valid, consent: 'on' }).success).toBe(false);
    expect(LeadInput.safeParse({ ...valid, consent: 1 }).success).toBe(false);
  });
});

describe('leadToContact', () => {
  it('carries the consent timestamp into the pipeline contact', () => {
    // RGPD art. 7.1 puts the burden of proof on us; whoever reads the pipeline must see the proof
    // without opening the append-only ledger.
    const iso = '2026-08-10T13:00:00.000Z';
    const contact = leadToContact(LeadInput.parse(valid), 'lead_x', iso);
    expect(contact.notes).toContain('Consentement RGPD recueilli le 2026-08-10T13:00:00.000Z');
    expect(contact.email).toBe('ada@example.org');
    expect(contact.stage).toBe('identified');
  });

  it('keeps working when the optional message is empty', () => {
    const contact = leadToContact(
      LeadInput.parse({ ...valid, message: '' }),
      'lead_y',
      '2026-08-10T13:00:00.000Z',
    );
    expect(contact.notes).toContain('Consentement RGPD');
  });
});
