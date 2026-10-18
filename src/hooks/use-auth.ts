"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ApiError, parseResponse } from "@/lib/api/client";
import { dashboardPath } from "@/lib/auth/routes";
import { useAuthStore } from "@/store/auth-store";
import type { Role, SessionUser } from "@/types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
  role: Exclude<Role, "ADMIN">;
  phone?: string;
}

async function postAuth<T>(path: string, body?: unknown) {
  try {
    const res = await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    return await parseResponse<T>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, "Network error. Check your internet connection.");
  }
}

// Only allow same-site relative paths to avoid open redirects.
const safeRedirect = (path?: string | null) =>
  path && /^\/(?![/\\])/.test(path) ? path : null;

export function useAuth(options: { redirectTo?: string | null } = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status, setUser, clear } = useAuthStore();

  const onAuthenticated = ({ user }: { user: SessionUser }) => {
    setUser(user);
    queryClient.clear();
    toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
    router.replace(safeRedirect(options.redirectTo) ?? dashboardPath(user.role));
    router.refresh();
  };

  const login = useMutation({
    mutationFn: (input: LoginInput) =>
      postAuth<{ user: SessionUser }>("login", input),
    onSuccess: onAuthenticated,
    onError: () => {},
  });

  const register = useMutation({
    mutationFn: (input: RegisterInput) =>
      postAuth<{ user: SessionUser }>("register", input),
    onSuccess: onAuthenticated,
    onError: () => {},
  });

  const logout = useMutation({
    mutationFn: () => postAuth("logout"),
    onSettled: () => {
      clear();
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    hasRole: (...roles: Role[]) => !!user && roles.includes(user.role),
    login,
    register,
    logout,
  };
}
