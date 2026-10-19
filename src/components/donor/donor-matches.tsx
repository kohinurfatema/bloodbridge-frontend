"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BuildingIcon,
  CheckIcon,
  HandHeartIcon,
  HeartHandshakeIcon,
  InfoIcon,
  MapPinIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { BloodTypeBadge, StatusBadge, UrgencyBadge } from "@/components/shared/status-badges";
import { CardGridSkeleton } from "@/components/skeletons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useDonorProfile, useMyMatches, useRespondToMatch } from "@/hooks/use-donor";
import { useQueryParams } from "@/hooks/use-query-params";
import { BLOOD_TYPE_LABELS, MATCH_STATUSES } from "@/lib/constants";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DonationMatch, MatchStatus } from "@/types";

const FILTERS = ["ALL", ...MATCH_STATUSES] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABELS: Record<Filter, string> = {
  ALL: "All",
  PENDING: "Needs reply",
  ACCEPTED: "Accepted",
  COMPLETED: "Completed",
  DECLINED: "Declined",
};

function MatchCard({ match }: { match: DonationMatch }) {
  const respond = useRespondToMatch();
  const busy = respond.isPending;
  const req = match.request;
  const send = (response: "ACCEPTED" | "DECLINED" | "COMPLETED") =>
    respond.mutate({ id: match.id, response });

  return (
    <Card
      className={cn(
        "flex flex-col",
        match.status === "PENDING" && req?.urgency === "EMERGENCY" && "border-destructive/50 ring-1 ring-destructive/20",
      )}
    >
      <CardHeader className="flex flex-row items-start gap-3">
        {req && <BloodTypeBadge type={req.bloodType} />}
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="flex items-center gap-1.5 font-semibold">
            <BuildingIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate">{req?.hospital ?? "Hospital not specified"}</span>
          </h2>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="size-4 shrink-0" aria-hidden /> {req?.location ?? "—"}
          </p>
        </div>
        <StatusBadge status={match.status} />
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {req && <UrgencyBadge urgency={req.urgency} />}
          {req && (
            <span className="text-xs text-muted-foreground">
              Needs {BLOOD_TYPE_LABELS[req.bloodType]} · matched {formatRelative(match.createdAt)}
            </span>
          )}
        </div>
        {match.status === "ACCEPTED" && (
          <Alert>
            <InfoIcon />
            <AlertDescription>
              Visit the hospital to donate, then mark it as donated here so we can record it.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {match.status === "PENDING" && (
        <CardFooter className="gap-2">
          <ConfirmDialog
            trigger={
              <Button variant="outline" className="flex-1" disabled={busy}>
                <XIcon /> Decline
              </Button>
            }
            title="Decline this match?"
            description="The requester will be matched with another donor. This can't be undone."
            confirmLabel="Decline"
            cancelLabel="Go back"
            destructive
            onConfirm={() => send("DECLINED")}
          />
          <Button className="flex-1" disabled={busy} onClick={() => send("ACCEPTED")}>
            <CheckIcon /> Accept
          </Button>
        </CardFooter>
      )}

      {match.status === "ACCEPTED" && (
        <CardFooter className="gap-2">
          <ConfirmDialog
            trigger={
              <Button variant="ghost" className="flex-1" disabled={busy}>
                Can&apos;t make it
              </Button>
            }
            title="Withdraw from this donation?"
            description="The requester will need another donor. Only do this if you really can't donate."
            confirmLabel="Withdraw"
            destructive
            onConfirm={() => send("DECLINED")}
          />
          <ConfirmDialog
            trigger={
              <Button className="flex-1" disabled={busy}>
                <HandHeartIcon /> Mark donated
              </Button>
            }
            title="Confirm your donation"
            description="This records the donation, marks the request as fulfilled and makes you available again after recovery."
            confirmLabel="Yes, I donated"
            onConfirm={() => send("COMPLETED")}
          />
        </CardFooter>
      )}
    </Card>
  );
}

export function DonorMatches() {
  const profile = useDonorProfile();
  const { data, isPending, isError, error, refetch } = useMyMatches(!!profile.data);
  const { searchParams, setParams } = useQueryParams();

  const param = searchParams.get("status")?.toUpperCase() as Filter | undefined;
  const filter: Filter = param && FILTERS.includes(param) ? param : "ALL";

  const matches = useMemo(() => data?.matches ?? [], [data]);
  const counts = useMemo(() => {
    const c = { ALL: matches.length } as Record<Filter, number>;
    for (const s of MATCH_STATUSES) c[s] = 0;
    for (const m of matches) c[m.status as MatchStatus]++;
    return c;
  }, [matches]);

  if (profile.isPending || (profile.data && isPending)) return <CardGridSkeleton count={4} />;
  if (profile.isError) return <ErrorState error={profile.error} onRetry={() => profile.refetch()} />;
  if (!profile.data) {
    return (
      <EmptyState
        icon={UserPlusIcon}
        title="Set up your donor profile first"
        description="You'll start receiving matches once we know your blood type and location."
        action={
          <Button asChild>
            <Link href="/dashboard/donor/profile">Set up profile</Link>
          </Button>
        }
      />
    );
  }
  if (isError) return <ErrorState error={error} title="Couldn't load your matches" onRetry={() => refetch()} />;

  // Requests needing a reply first, then newest.
  const visible = (filter === "ALL" ? matches : matches.filter((m) => m.status === filter))
    .slice()
    .sort((a, b) => Number(b.status === "PENDING") - Number(a.status === "PENDING"));

  return (
    <>
      <SegmentedControl
        label="Filter matches by status"
        value={filter}
        onChange={(v) => setParams({ status: v === "ALL" ? null : v })}
        options={FILTERS.map((f) => ({ value: f, label: FILTER_LABELS[f], count: counts[f] }))}
      />

      {visible.length === 0 ? (
        <EmptyState
          icon={HeartHandshakeIcon}
          title={filter === "ALL" ? "No matches yet" : `No ${FILTER_LABELS[filter].toLowerCase()} matches`}
          description={
            filter === "ALL"
              ? "When an admin matches you to a blood request, it will appear here for you to accept."
              : "Try another tab to see the rest of your matches."
          }
          action={
            filter === "ALL" && (
              <Button variant="outline" asChild>
                <Link href="/dashboard/donor/requests">Browse open requests</Link>
              </Button>
            )
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) => (
            <li key={m.id} className="flex">
              <div className="w-full">
                <MatchCard match={m} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
