import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Contact, Deliverable, Milestone } from '@ag/schema/cockpit';
import { api } from './lib/api';
import type { CockpitState } from './types';

type CockpitContextValue = {
  state: CockpitState | null;
  error: string | null;
  saving: boolean;
  saveDeliverable: (d: Deliverable) => Promise<void>;
  saveContact: (c: Contact) => Promise<void>;
  saveMilestone: (m: Milestone) => Promise<void>;
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
      setState((s) => (s ? { ...s, deliverables: s.deliverables.map((x) => (x.id === d.id ? d : x)) } : s));
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
      setState((s) => (s ? { ...s, milestones: s.milestones.map((x) => (x.id === m.id ? m : x)) } : s));
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

  return (
    <CockpitContext.Provider
      value={{ state, error, saving, saveDeliverable, saveContact, saveMilestone, reload }}
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
