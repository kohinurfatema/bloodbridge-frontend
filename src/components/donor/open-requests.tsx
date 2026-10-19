"use client";

import { BuildingIcon, CalendarClockIcon, ClipboardListIcon, DropletsIcon, Loader2Icon, MapPinIcon, SirenIcon } from "lucide-react";

import { RequestFilterBar } from "@/components/requests/request-filter-bar";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { BloodTypeBadge, StatusBadge, UrgencyBadge } from "@/components/shared/status-badges";
import { TableSkeleton } from "@/components/skeletons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useActiveAlerts, useDonorProfile } from "@/hooks/use-donor";
import { useQueryParams } from "@/hooks/use-query-params";
import { useRequestList } from "@/hooks/use-requests";
import { BLOOD_TYPE_LABELS, CAN_DONATE_TO } from "@/lib/constants";
import { parseRequestFilters } from "@/lib/filters/request-filters";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BloodRequest, BloodType } from "@/types";

function Compatibility({ donorType, needed }: { donorType?: BloodType; needed: BloodType }) {
  if (!donorType) return null;
  if (donorType === needed) {
    return <Badge className="bg-primary/10 text-primary" variant="secondary">Your blood type</Badge>;
  }
  if (CAN_DONATE_TO[donorType].includes(needed)) {
    return <Badge variant="outline">Compatible with {BLOOD_TYPE_LABELS[donorType]}</Badge>;
  }
  return null;
}

function RequestRow({ request, donorType }: { request: BloodRequest; donorType?: BloodType }) {
  const mine = donorType === request.bloodType;
  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center",
        mine && "border-primary/40 bg-primary/5",
      )}
    >
      <div className="flex items-start gap-3 sm:flex-1">
        <BloodTypeBadge type={request.bloodType} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <UrgencyBadge urgency={request.urgency} />
            <StatusBadge status={request.status} />
            <Compatibility donorType={donorType} needed={request.bloodType} />
          </div>
          <p className="flex items-center gap-1.5 font-medium">
            <BuildingIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate">{request.hospital ?? "Hospital not specified"}</span>
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-3.5" aria-hidden /> {request.location}
            </span>
            <span className="flex items-center gap-1">
              <DropletsIcon className="size-3.5" aria-hidden /> {request.units} unit{request.units > 1 && "s"}
            </span>
            <span className="flex items-center gap-1">
              <CalendarClockIcon className="size-3.5" aria-hidden /> Needed by {formatDate(request.requiredDate)} (
              {formatRelative(request.requiredDate)})
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground sm:text-right">Posted {formatRelative(request.createdAt)}</p>
    </li>
  );
}

export function OpenRequests() {
  const { searchParams, setParams } = useQueryParams();
  const { filters, query } = parseRequestFilters(searchParams, "PENDING");
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useRequestList(query);
  const { data: profile } = useDonorProfile();
  const { data: alertData } = useActiveAlerts();

  const emergencies = (alertData?.alerts ?? []).filter(
    (a) => a.request && a.request.status !== "CANCELLED" && a.request.status !== "FULFILLED",
  );

  return (
    <>
      {emergencies.length > 0 && (
        <Alert variant="destructive" className="border-destructive/40 bg-destructive/5">
          <SirenIcon />
          <AlertTitle>
            {emergencies.length} active emergenc{emergencies.length === 1 ? "y" : "ies"}
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-1 space-y-1">
              {emergencies.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <span className="font-semibold">{a.request && BLOOD_TYPE_LABELS[a.request.bloodType]}</span> needed at{" "}
                  {a.request?.hospital ?? a.request?.location} · raised {formatRelative(a.createdAt)}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {profile && (
        <Card className="bg-muted/40">
          <CardContent className="text-sm text-muted-foreground">
            Admins match requests to <strong className="text-foreground">available</strong> donors with the{" "}
            <strong className="text-foreground">same blood type</strong>.{" "}
            {profile.isAvailable
              ? `You're available, so you can be matched to ${BLOOD_TYPE_LABELS[profile.bloodType]} requests below.`
              : "You're currently unavailable — switch availability on from your dashboard to be matched."}
          </CardContent>
        </Card>
      )}

      <RequestFilterBar filters={filters} />

      <p className="flex min-h-5 items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
        {data && `${data.meta.total} open request${data.meta.total !== 1 ? "s" : ""}`}
        {isFetching && !isPending && <Loader2Icon className="size-4 animate-spin" aria-label="Updating" />}
      </p>

      {isPending ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <ErrorState error={error} title="Couldn't load requests" onRetry={() => refetch()} />
      ) : data.requests.length === 0 ? (
        <EmptyState
          icon={ClipboardListIcon}
          title="No open requests match"
          description="Great news — nobody is waiting for blood with these filters right now."
        />
      ) : (
        <ul className={cn("space-y-3 transition-opacity", isPlaceholderData && "opacity-60")}>
          {data.requests.map((r) => (
            <RequestRow key={r.id} request={r} donorType={profile?.bloodType} />
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
    </>
  );
}
