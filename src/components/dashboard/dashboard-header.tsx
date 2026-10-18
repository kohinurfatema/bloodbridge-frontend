"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@/types";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Admin",
  donor: "Donor",
  requester: "Requester",
  requests: "Requests",
  new: "New",
  donors: "Find donors",
  payments: "Payments",
  matches: "Matches",
  alerts: "Alerts",
  audit: "Audit logs",
  users: "Users",
  profile: "Profile",
};

const UUID_RE = /^[0-9a-f-]{36}$/i;

function useBreadcrumbs() {
  const segments = usePathname().split("/").filter(Boolean);
  return segments.map((segment, i) => ({
    href: `/${segments.slice(0, i + 1).join("/")}`,
    label: UUID_RE.test(segment)
      ? `#${segment.slice(0, 8)}`
      : (LABELS[segment] ?? segment.replace(/-/g, " ")),
  }));
}

export function DashboardHeader({ role }: { role: Role }) {
  const crumbs = useBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1;
            return (
              <Fragment key={crumb.href}>
                {/* Hide intermediate crumbs on phones to save space */}
                <BreadcrumbItem className={last ? "truncate" : "hidden md:inline-flex"}>
                  {last ? (
                    <BreadcrumbPage className="truncate capitalize">{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild className="capitalize">
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!last && <BreadcrumbSeparator className="hidden md:block" />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <Badge variant="secondary" className="hidden sm:inline-flex">
        {ROLE_LABELS[role]}
      </Badge>
      <ThemeToggle />
    </header>
  );
}
