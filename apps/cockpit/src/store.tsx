import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Contact, Deliverable, Milestone } from '@ag/schema/cockpit';
import { api, type PublishPayload, type ValidatePayload } from './lib/api';
import type { CockpitState } from './types';

type CockpitContextValue = {
  state: CockpitState | null;
  error: string | null;
  saving: boolean;
  saveDeliverable: (d: Deliverable) => Promise<void>;
  saveContact: (c: Contact) => Promise<void>;
  saveMilestone: (m: Milestone) => Promise<void>;
  /** Nominative gate validation (ADR 0046 / 0068): ticks a gate AND appends a journal entry. */
  validateGate: (deliverableId: string, payload: ValidatePayload) => Promise<void>;
  /** One-click publish (ADR 0069): flips the frontmatter flag, appends a journal entry. */
  publishDoc: (type: string, slug: string, payload: PublishPayload) => Promise<boolean>;
  reload: () => void;
};

const CockpitContext = createContext<CockpitContextValue | null>(null);

export function CockpitProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CockpitState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(() => {
    api
      .getState()
      .then((s) => {
        setState(s);
        setError(null);
      })
      .catch((e: unknown) => setError(String(e)));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Optimistic update, then persist; reload from server if the write fails.
  const saveDeliverable = useCallback(
    async (d: Deliverable) => {
      setSaving(true);
      setState((s) =>
        s ? { ...s, deliverables: s.deliverables.map((x) => (x.id === d.id ? d : x)) } : s,
      );
      try {
        await api.putDeliverable(d);
        setError(null);
      } catch (e) {
        setError(String(e));
        reload();
      } finally {
        setSaving(false);
      }
    },
    [reload],
  );

  const saveContact = useCallback(
    async (c: Contact) => {
      setSaving(true);
      setState((s) => (s ? { ...s, contacts: s.contacts.map((x) => (x.id === c.id ? c : x)) } : s));
      try {
        await api.putContact(c);
        setError(null);
      } catch (e) {
        setError(String(e));
        reload();
      } finally {
        setSaving(false);
      }
    },
    [reload],
  );

  const saveMilestone = useCallback(
    async (m: Milestone) => {
      setSaving(true);
      setState((s) =>
        s ? { ...s, milestones: s.milestones.map((x) => (x.id === m.id ? m : x)) } : s,
      );
      try {
        await api.putMilestone(m);
        setError(null);
      } catch (e) {
        setError(String(e));
        reload();
      } finally {
        setSaving(false);
      }
    },
    [reload],
  );

  // Nominative gate validation. Unlike saveDeliverable, this is NOT optimistic: the write must be
  // confirmed by the server (it also appends the append-only journal entry). On success, reflect the
  // returned deliverable and journal entry into state so both the gate and the journal stay fresh.
  const validateGate = useCallback(async (deliverableId: string, payload: ValidatePayload) => {
    setSaving(true);
    try {
      const { entry, deliverable } = await api.validateGate(deliverableId, payload);
      setState((s) =>
        s
          ? {
              ...s,
              deliverables: s.deliverables.map((x) => (x.id === deliverable.id ? deliverable : x)),
              validation_journal: [...s.validation_journal, entry],
            }
          : s,
      );
      setError(null);
    } catch (e) {
      setError(String(e));
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  // One-click publish: the write lives in the content file (not cockpit state); reflect only the new
  // journal entry into state and return the published flag so the caller can refetch the document.
  const publishDoc = useCallback(async (type: string, slug: string, payload: PublishPayload) => {
    setSaving(true);
    try {
      const { entry, published } = await api.publishDoc(type, slug, payload);
      setState((s) => (s ? { ...s, validation_journal: [...s.validation_journal, entry] } : s));
      setError(null);
      return published;
    } catch (e) {
      setError(String(e));
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  return (
    <CockpitContext.Provider
      value={{
        state,
        error,
        saving,
        saveDeliverable,
        saveContact,
        saveMilestone,
        validateGate,
        publishDoc,
        reload,
      }}
    >
      {children}
    </CockpitContext.Provider>
  );
}

export function useCockpit(): CockpitContextValue {
  const ctx = useContext(CockpitContext);
  if (!ctx) throw new Error('useCockpit must be used within a CockpitProvider');
  return ctx;
}
