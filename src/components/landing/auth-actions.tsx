"use client";

import Link from "next/link";
import { LayoutDashboardIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardPath } from "@/lib/auth/routes";
import { useAuthStore } from "@/store/auth-store";

/** The only client part of the landing header: shows Log in or Dashboard. */
export function AuthActions() {
  const { user, status } = useAuthStore();

  if (status === "loading") return <Skeleton className="h-8 w-28" />;

  if (user) {
    return (
      <Button asChild>
        <Link href={dashboardPath(user.role)}>
          <LayoutDashboardIcon /> Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild className="hidden sm:inline-flex">
        <Link href="/login">Log in</Link>
      </Button>
      <Button asChild>
        <Link href="/register">Get started</Link>
      </Button>
    </div>
  );
}
