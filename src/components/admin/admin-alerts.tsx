"use client";

import { useState } from "react";
import {
  BellOffIcon,
  BuildingIcon,
  CheckCircle2Icon,
  HeartHandshakeIcon,
  MapPinIcon,
} from "lucide-react";

import { MatchDonorDialog } from "@/components/admin/match-donor-dialog";
import { RaiseAlertDialog } from "@/components/admin/raise-alert-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { BloodTypeBadge, StatusBadge, UrgencyBadge } from "@/components/shared/status-badges";
import { CardGridSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useAlertList, useResolveAlert } from "@/hooks/use-admin";
import { useQueryParams } from "@/hooks/use-query-params";
import { useRequest } from "@/hooks/use-requests";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EmergencyAlert } from "@/types";

/** Loads the full request (units, needed-by date) before opening the matcher. */
function MatchFromAlert({ requestId, onClose }: { requestId: string; onClose: () => void }) {
  const { data } = useRequest(requestId);
  return <MatchDonorDialog request={data ?? null} onOpenChange={(open) => !open && onClose()} />;
}

function AlertCard({ alert, onMatch }: { alert: EmergencyAlert; onMatch: (requestId: string) => void }) {
  const resolve = useResolveAlert();
  const req = alert.request;
  const canMatch = req && (req.status === "PENDING" || req.status === "MATCHED");

  return (
    <Card className={cn("flex flex-col", !alert.isResolved && "border-destructive/40")}>
      <CardHeader className="flex flex-row items-start gap-3">
        {req && <BloodTypeBadge type={req.bloodType} />}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="flex items-start gap-1.5 leading-snug font-semibold">
            <BuildingIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="break-words">{req?.hospital ?? "Hospital not specified"}</span>
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="size-4 shrink-0" aria-hidden /> {req?.location}
          </p>
        </div>
        {alert.isResolved ? (
          <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2Icon aria-hidden /> Resolved
          </Badge>
        ) : (
          <Badge variant="destructive">
            <span className="size-1.5 animate-pulse rounded-full bg-destructive" aria-hidden /> Active
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {req && <UrgencyBadge urgency={req.urgency} />}
          {req && <StatusBadge status={req.status} />}
        </div>
        <p className="text-xs text-muted-foreground">
          Raised {formatRelative(alert.createdAt)} ({formatDate(alert.createdAt, true)})
          {alert.isResolved && ` · resolved ${formatRelative(alert.updatedAt)}`}
        </p>
      </CardContent>
      {!alert.isResolved && (
        <CardFooter className="gap-2">
          {canMatch && (
            <Button variant="outline" className="flex-1" onClick={() => onMatch(req.id)}>
              <HeartHandshakeIcon /> Match donor
            </Button>
          )}
          <ConfirmDialog
            trigger={
              <Button className="flex-1" disabled={resolve.isPending}>
                <CheckCircle2Icon /> Resolve
              </Button>
            }
            title="Resolve this alert?"
            description="The emergency banner disappears from donor dashboards. Do this once a donor is secured."
            confirmLabel="Resolve"
            onConfirm={() => resolve.mutate(alert.id)}
          />
        </CardFooter>
      )}
    </Card>
  );
}

export function AdminAlerts() {
  const { searchParams, setParams } = useQueryParams();
  const view = searchParams.get("view") === "all" ? "all" : "active";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useAlertList({
    page,
    active: view === "active",
  });
  const [matchRequestId, setMatchRequestId] = useState<string | null>(null);

  // Requests already alerted (on this page) are excluded from "Raise alert".
  const alerted = new Set((data?.alerts ?? []).map((a) => a.requestId));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          label="Which alerts to show"
          value={view}
          onChange={(v) => setParams({ view: v === "active" ? null : v, page: null })}
          options={[
            { value: "active", label: "Active" },
            { value: "all", label: "All alerts" },
          ]}
        />
        <RaiseAlertDialog alertedRequestIds={alerted} />
      </div>

      {isPending ? (
        <CardGridSkeleton count={3} />
      ) : isError ? (
        <ErrorState error={error} title="Couldn't load alerts" onRetry={() => refetch()} />
      ) : data.alerts.length === 0 ? (
        <EmptyState
          icon={BellOffIcon}
          title={view === "active" ? "No active emergencies" : "No alerts yet"}
          description={
            view === "active"
              ? "All emergencies are resolved. Alerts appear here when a requester posts an emergency."
              : "Emergency alerts will be listed here."
          }
        />
      ) : (
        <ul className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", isPlaceholderData && "opacity-60")}>
          {data.alerts.map((a) => (
            <li key={a.id} className="flex">
              <div className="w-full">
                <AlertCard alert={a} onMatch={setMatchRequestId} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {data && (
        <DataPagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={(p) => setParams({ page: p === 1 ? null : p })}
        />
      )}

      {matchRequestId && <MatchFromAlert requestId={matchRequestId} onClose={() => setMatchRequestId(null)} />}
    </>
  );
}
