"use client";

import { useState } from "react";
import {
  CheckCircle2Icon,
  ClipboardListIcon,
  HeartHandshakeIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react";

import { MatchDonorDialog } from "@/components/admin/match-donor-dialog";
import { RequestFilterBar } from "@/components/requests/request-filter-bar";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { BloodTypeBadge, StatusBadge, UrgencyBadge } from "@/components/shared/status-badges";
import { TableSkeleton } from "@/components/skeletons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminRequestStatus } from "@/hooks/use-admin";
import { useQueryParams } from "@/hooks/use-query-params";
import { useDeleteRequest, useRequestList } from "@/hooks/use-requests";
import { parseRequestFilters } from "@/lib/filters/request-filters";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BloodRequest } from "@/types";

const canMatch = (r: BloodRequest) => r.status === "PENDING" || r.status === "MATCHED";

function RowActions({
  request,
  onMatch,
  onDelete,
}: {
  request: BloodRequest;
  onMatch: (r: BloodRequest) => void;
  onDelete: (r: BloodRequest) => void;
}) {
  const setStatus = useAdminRequestStatus();
  const open = request.status !== "FULFILLED" && request.status !== "CANCELLED";

  return (
    <div className="flex items-center justify-end gap-1">
      {canMatch(request) && (
        <Button size="sm" variant={request.status === "PENDING" ? "default" : "outline"} onClick={() => onMatch(request)}>
          <HeartHandshakeIcon /> Match
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="More actions">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={!open}
            onSelect={() => setStatus.mutate({ id: request.id, status: "FULFILLED" })}
          >
            <CheckCircle2Icon /> Mark fulfilled
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!open}
            onSelect={() => setStatus.mutate({ id: request.id, status: "CANCELLED" })}
          >
            <XCircleIcon /> Cancel request
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => onDelete(request)}>
            <Trash2Icon /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function AdminRequests() {
  const { searchParams, setParams } = useQueryParams();
  const { filters, query } = parseRequestFilters(searchParams);
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useRequestList(query);
  const remove = useDeleteRequest();

  const [matching, setMatching] = useState<BloodRequest | null>(null);
  const [deleting, setDeleting] = useState<BloodRequest | null>(null);

  return (
    <>
      <RequestFilterBar filters={filters} showStatus />

      <p className="flex min-h-5 items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
        {data && `${data.meta.total} request${data.meta.total !== 1 ? "s" : ""}`}
        {isFetching && !isPending && <Loader2Icon className="size-4 animate-spin" aria-label="Updating" />}
      </p>

      {isPending ? (
        <TableSkeleton rows={8} columns={6} />
      ) : isError ? (
        <ErrorState error={error} title="Couldn't load requests" onRetry={() => refetch()} />
      ) : data.requests.length === 0 ? (
        <EmptyState icon={ClipboardListIcon} title="No requests match these filters" />
      ) : (
        <Card className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
          <CardContent>
            <Table className="hidden lg:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Needed by</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <BloodTypeBadge type={r.bloodType} size="sm" />
                        <div className="min-w-0">
                          <p className="max-w-56 truncate font-medium">{r.hospital ?? "Hospital not specified"}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.units} unit{r.units > 1 && "s"} · {r.location}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p>{r.requester?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">{r.requester?.phone ?? ""}</p>
                    </TableCell>
                    <TableCell>
                      <UrgencyBadge urgency={r.urgency} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>
                      <p>{formatDate(r.requiredDate)}</p>
                      <p className="text-xs text-muted-foreground">{formatRelative(r.requiredDate)}</p>
                    </TableCell>
                    <TableCell>
                      <RowActions request={r} onMatch={setMatching} onDelete={setDeleting} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <ul className="divide-y lg:hidden">
              {data.requests.map((r) => (
                <li key={r.id} className="space-y-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <BloodTypeBadge type={r.bloodType} />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate font-medium">{r.hospital ?? "Hospital not specified"}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.requester?.name} · {r.location} · needed {formatRelative(r.requiredDate)}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <UrgencyBadge urgency={r.urgency} />
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  </div>
                  <RowActions request={r} onMatch={setMatching} onDelete={setDeleting} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {data && (
        <DataPagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={(p) => setParams({ page: p === 1 ? null : p })}
        />
      )}

      <MatchDonorDialog request={matching} onOpenChange={(open) => !open && setMatching(null)} />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this request?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed from every dashboard. Use “Cancel request” instead if you want to keep a record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Keep request</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleting) remove.mutate(deleting.id, { onSettled: () => setDeleting(null) });
              }}
            >
              {remove.isPending && <Loader2Icon className="animate-spin" aria-hidden />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
