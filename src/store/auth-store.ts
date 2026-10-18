import { create } from "zustand";

import type { SessionUser } from "@/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: SessionUser | null;
  status: AuthStatus;
  setUser: (user: SessionUser | null) => void;
  clear: () => void;
}

// Holds only non-sensitive user info for rendering. Tokens stay in
// httpOnly cookies and never touch client-side state.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: "loading",
  setUser: (user) =>
    set({ user, status: user ? "authenticated" : "unauthenticated" }),
  clear: () => set({ user: null, status: "unauthenticated" }),
}));
