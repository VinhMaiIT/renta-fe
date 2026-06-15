import { create } from 'zustand';
import {
  clearStoredSession,
  getStoredSession,
  patchStoredSession,
  setStoredSession,
  type StoredSession,
} from '@/lib/auth/tokens';

interface AuthState {
  session: StoredSession | null;
  hydrated: boolean;
  /** Replace the whole session (on login). */
  setSession: (session: StoredSession) => void;
  /** Update the active branch id. */
  setBranchId: (branchId: string) => void;
  /** Shallow-merge fields into the current session (no-op if logged out). */
  patchSession: (patch: Partial<StoredSession>) => void;
  /** Re-read persisted session into memory (called once on mount). */
  hydrate: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  hydrated: false,
  setSession: (session) => {
    setStoredSession(session);
    set({ session, hydrated: true });
  },
  setBranchId: (branchId) => {
    patchStoredSession({ branchId });
    set((state) => ({
      session: state.session ? { ...state.session, branchId } : state.session,
    }));
  },
  patchSession: (patch) => {
    set((state) => {
      if (!state.session) return state;
      patchStoredSession(patch);
      return { session: { ...state.session, ...patch } };
    });
  },
  hydrate: () => set({ session: getStoredSession(), hydrated: true }),
  logout: () => {
    clearStoredSession();
    set({ session: null });
  },
}));

/** Convenience selectors. */
export const useSession = () => useAuthStore((s) => s.session);
export const useIsAuthenticated = () => useAuthStore((s) => Boolean(s.session?.accessToken));
