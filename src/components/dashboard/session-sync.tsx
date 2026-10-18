"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth-store";
import type { SessionUser } from "@/types";

/**
 * Pushes the server-verified session into the Zustand store and shows a
 * toast when the proxy bounced the user from a page their role can't access.
 */
export function SessionSync({ user }: { user: SessionUser }) {
  const setUser = useAuthStore((s) => s.setUser);
  const searchParams = useSearchParams();
  const router = useRouter();
  const denied = searchParams.get("denied");

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    if (!denied) return;
    toast.error("You don't have access to that page.");
    const url = new URL(window.location.href);
    url.searchParams.delete("denied");
    router.replace(`${url.pathname}${url.search}`, { scroll: false });
  }, [denied, router]);

  return null;
}
