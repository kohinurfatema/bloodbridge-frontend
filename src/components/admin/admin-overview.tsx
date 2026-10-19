"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  ClipboardListIcon,
  HandHeartIcon,
  SirenIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatCard } from "@/components/shared/stat-card";
import { BloodTypeBadge, StatusBadge, UrgencyBadge } from "@/components/shared/status-badges";
import { DashboardSkeleton } from "@/components/skeletons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatRelative, plural } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { adminService } from "@/services/admin.service";

// Charts are split into their own chunk and loaded after the KPI tiles.
const chartFallback = () => <Skeleton className="h-64 w-full rounded-xl" />;
const RequestStatusChart = dynamic(
  () => import("@/components/admin/stats-charts").then((m) => m.RequestStatusChart),
  { loading: chartFallback },
);
const UserRoleChart = dynamic(
  () => import("@/components/admin/stats-charts").then((m) => m.UserRoleChart),
  { loading: chartFallback },
);
const CompletionMeter = dynamic(
  () => import("@/components/admin/stats-charts").then((m) => m.CompletionMeter),
  { loading: chartFallback },
);

export function AdminOverview() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: adminService.getStats,
  });

  if (isPending) return <DashboardSkeleton />;
  if (isError) return <ErrorState error={error} title="Couldn't load platform stats" onRetry={() => refetch()} />;

  return (
    <>
      {data.alerts.unresolved > 0 && (
        <Alert variant="destructive" className="border-destructive/40 bg-destructive/5">
          <SirenIcon />
          <AlertTitle>
            {data.alerts.unresolved} unresolved emergency alert{data.alerts.unresolved > 1 && "s"}
          </AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            Match a donor quickly, then resolve the alert.
            <Link href="/dashboard/admin/alerts" className="font-medium underline underline-offset-4">
              Review alerts
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <section aria-label="Platform totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Users"
          value={data.users.total}
          icon={UsersIcon}
          tone="sky"
          description={`${plural(data.users.donors, "donor")} · ${plural(data.users.requesters, "requester")}`}
        />
        <StatCard
          title="Blood requests"
          value={data.bloodRequests.total}
          icon={ClipboardListIcon}
          description={`${data.bloodRequests.pending} waiting for a match`}
        />
        <StatCard
          title="Donations completed"
          value={data.donations.completed}
          icon={HandHeartIcon}
          tone="emerald"
          description={`${plural(data.donations.total, "match", "matches")} made`}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(data.payments.totalRevenue)}
          icon={WalletIcon}
          tone="violet"
          description={`${data.payments.completed} of ${data.payments.total} payments completed`}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RequestStatusChart data={data.bloodRequests} />
        </div>
        <CompletionMeter data={data.donations} />
      </div>

      <UserRoleChart data={data.users} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Latest requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/admin/requests">
                All requests <ArrowRightIcon />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recent.requests.length === 0 ? (
              <EmptyState title="No requests yet" />
            ) : (
              <ul className="divide-y">
                {data.recent.requests.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <BloodTypeBadge type={r.bloodType} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.hospital ?? "Hospital not specified"}</p>
                      <p className="text-xs text-muted-foreground">{formatRelative(r.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center">
                      <UrgencyBadge urgency={r.urgency} />
                      <StatusBadge status={r.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest matches</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recent.matches.length === 0 ? (
              <EmptyState title="No matches yet" />
            ) : (
              <ul className="divide-y">
                {data.recent.matches.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <BloodTypeBadge type={m.request.bloodType} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.donor.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {m.request.hospital ?? "Hospital not specified"} · {formatRelative(m.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={m.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
