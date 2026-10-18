"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";
import type { SessionUser } from "@/types";

/**
 * Syncs the httpOnly-cookie session into the Zustand store once on mount,
 * so client components (navbar, menus) can render role-aware UI.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((json: { data?: { user: SessionUser | null } }) => {
        if (!cancelled) setUser(json.data?.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  return children;
}
