import { z } from 'zod';
import { ContactStage } from './enums';

/** Acquisition pipeline entry — a convertor of public credibility into conversations, not a CRM. */
export const Contact = z.object({
  id: z.string(),
  name: z.string(),
  organization: z.string(),
  role: z.string(),
  profile_type: z.string(),
  stage: ContactStage,
  content_linked: z.array(z.string()).optional(),
  interest_signal: z.string().optional(),
  next_action: z.string(),
  last_contact_date: z.string().optional(),
  notes: z.string().optional(),
});
export type Contact = z.infer<typeof Contact>;
