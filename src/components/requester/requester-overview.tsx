"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2Icon,
  ChevronRightIcon,
  ClipboardListIcon,
  HourglassIcon,
  LinkIcon,
  MapPinIcon,
  PlusIcon,
} from "lucide-react";

import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { StatCard } from "@/components/shared/stat-card";
import {
  BloodTypeBadge,
  StatusBadge,
  UrgencyBadge,
} from "@/components/shared/status-badges";
import { StatCardsSkeleton, TableSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQueryParams } from "@/hooks/use-query-params";
import { useMyRequests } from "@/hooks/use-requests";
import { REQUEST_STATUSES } from "@/lib/constants";
import { formatDate, formatRelative } from "@/lib/format";
import type { BloodRequest, RequestStatus } from "@/types";

const PAGE_SIZE = 8;
const FILTERS = ["ALL", ...REQUEST_STATUSES] as const;
type Filter = (typeof FILTERS)[number];

const detailHref = (id: string) => `/dashboard/requester/requests/${id}`;

function RequestTable({ requests }: { requests: BloodRequest[] }) {
  return (
    <Table className="hidden md:table">
      <TableHeader>
        <TableRow>
          <TableHead>Blood</TableHead>
          <TableHead>Hospital</TableHead>
          <TableHead>Urgency</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Needed by</TableHead>
          <TableHead className="text-right">Donors</TableHead>
          <TableHead className="sr-only">Open</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((r) => (
          <TableRow key={r.id} className="group">
            <TableCell>
              <BloodTypeBadge type={r.bloodType} size="sm" />
            </TableCell>
            <TableCell>
              <div className="font-medium">{r.hospital ?? "Hospital not set"}</div>
              <div className="text-xs text-muted-foreground">
                {r.units} unit{r.units > 1 && "s"} · {r.location}
              </div>
            </TableCell>
            <TableCell>
              <UrgencyBadge urgency={r.urgency} />
            </TableCell>
            <TableCell>
              <StatusBadge status={r.status} />
            </TableCell>
            <TableCell>
              <div>{formatDate(r.requiredDate)}</div>
              <div className="text-xs text-muted-foreground">{formatRelative(r.requiredDate)}</div>
            </TableCell>
            <TableCell className="text-right tabular-nums">{r.matches?.length ?? 0}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon-sm" asChild>
                <Link href={detailHref(r.id)} aria-label={`View request for ${r.hospital ?? r.location}`}>
                  <ChevronRightIcon />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Tables don't fit phones; show stacked cards below the md breakpoint.
function RequestCards({ requests }: { requests: BloodRequest[] }) {
  return (
    <ul className="space-y-3 md:hidden">
      {requests.map((r) => (
        <li key={r.id}>
          <Link
            href={detailHref(r.id)}
            className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <BloodTypeBadge type={r.bloodType} />
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <div className="truncate font-medium">{r.hospital ?? "Hospital not set"}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPinIcon className="size-3" aria-hidden /> {r.location} · needed{" "}
                  {formatRelative(r.requiredDate)}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <UrgencyBadge urgency={r.urgency} />
                <StatusBadge status={r.status} />
              </div>
            </div>
            <ChevronRightIcon className="size-4 self-center text-muted-foreground" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function RequesterOverview() {
  const { data, isPending, isError, error, refetch } = useMyRequests();
  const { searchParams, setParams } = useQueryParams();

  const statusParam = searchParams.get("status")?.toUpperCase() as Filter | undefined;
  const filter: Filter = statusParam && FILTERS.includes(statusParam) ? statusParam : "ALL";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const requests = useMemo(() => data?.requests ?? [], [data]);

  const counts = useMemo(() => {
    const c = { ALL: requests.length } as Record<Filter, number>;
    for (const s of REQUEST_STATUSES) c[s] = 0;
    for (const r of requests) c[r.status as RequestStatus]++;
    return c;
  }, [requests]);

  const filtered = filter === "ALL" ? requests : requests.filter((r) => r.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (isPending) {
    return (
      <>
        <StatCardsSkeleton />
        <TableSkeleton />
      </>
    );
  }

  if (isError) {
    return <ErrorState error={error} title="Couldn't load your requests" onRetry={() => refetch()} />;
  }

  return (
    <>
      <section aria-label="Request summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total requests" value={counts.ALL} icon={ClipboardListIcon} description="All time" />
        <StatCard title="Pending" value={counts.PENDING} icon={HourglassIcon} tone="amber" description="Waiting for a donor match" />
        <StatCard title="Matched" value={counts.MATCHED} icon={LinkIcon} tone="violet" description="Donor assigned" />
        <StatCard title="Fulfilled" value={counts.FULFILLED} icon={CheckCircle2Icon} tone="emerald" description="Donation completed" />
      </section>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>My blood requests</CardTitle>
          <SegmentedControl
            label="Filter requests by status"
            value={filter}
            onChange={(v) => setParams({ status: v === "ALL" ? null : v, page: null })}
            options={FILTERS.map((f) => ({ value: f, label: <span className="capitalize">{f.toLowerCase()}</span>, count: counts[f] }))}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {visible.length === 0 ? (
            <EmptyState
              icon={ClipboardListIcon}
              title={filter === "ALL" ? "No blood requests yet" : `No ${filter.toLowerCase()} requests`}
              description={
                filter === "ALL"
                  ? "Create your first request and we'll help match you with a donor."
                  : "Try a different filter to see your other requests."
              }
              action={
                filter === "ALL" && (
                  <Button asChild>
                    <Link href="/dashboard/requester/requests/new">
                      <PlusIcon /> New request
                    </Link>
                  </Button>
                )
              }
            />
          ) : (
            <>
              <RequestTable requests={visible} />
              <RequestCards requests={visible} />
            </>
          )}
          <DataPagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setParams({ page: p === 1 ? null : p })}
          />
        </CardContent>
      </Card>
    </>
  );
}
