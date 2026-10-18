"use client";

import { useAuthStore } from "@/store/auth-store";
import type { Role } from "@/types";

interface RoleGateProps {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/** Renders children only when the current user has one of the given roles. */
export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const user = useAuthStore((s) => s.user);
  if (!user || !roles.includes(user.role)) return fallback;
  return children;
}
