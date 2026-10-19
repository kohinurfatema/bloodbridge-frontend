"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarClockIcon,
  CalendarPlusIcon,
  CheckIcon,
  DropletsIcon,
  MapPinIcon,
  PhoneIcon,
  StickyNoteIcon,
  Trash2Icon,
  UserRoundSearchIcon,
  XCircleIcon,
} from "lucide-react";

import { PaymentCard } from "@/components/payments/payment-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  BloodTypeBadge,
  StatusBadge,
  UrgencyBadge,
} from "@/components/shared/status-badges";
import { TableSkeleton } from "@/components/skeletons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCancelRequest, useDeleteRequest, useRequest } from "@/hooks/use-requests";
import { BLOOD_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatRelative, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BloodRequest, RequestStatus } from "@/types";

const TIMELINE: { status: RequestStatus; label: string; hint: string }[] = [
  { status: "PENDING", label: "Request posted", hint: "Waiting for an admin to match a donor" },
  { status: "MATCHED", label: "Donor matched", hint: "A donor has been assigned to your request" },
  { status: "FULFILLED", label: "Donation completed", hint: "The donor has completed the donation" },
];

function StatusTimeline({ status }: { status: RequestStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-muted p-4 text-sm">
        <XCircleIcon className="size-5 text-muted-foreground" aria-hidden />
        This request was cancelled and is no longer visible to donors.
      </div>
    );
  }
  const current = TIMELINE.findIndex((s) => s.status === status);

  return (
    <ol className="space-y-0">
      {TIMELINE.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step.status} className="relative flex gap-3 pb-6 last:pb-0">
            {i < TIMELINE.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-8 left-[15px] h-[calc(100%-2rem)] w-0.5",
                  i < current ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground",
              )}
            >
              {done ? <CheckIcon className="size-4" aria-hidden /> : i + 1}
            </span>
            <div className="pt-1">
              <p className={cn("text-sm font-medium", !done && "text-muted-foreground")}>
                {step.label}
                {i === current && <span className="sr-only"> (current step)</span>}
              </p>
              <p className="text-xs text-muted-foreground">{step.hint}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: typeof MapPinIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  // A <dl> group may only contain <dt>/<dd>, so the icon lives inside the <dt>.
  return (
    <div className={className}>
      <dt className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden /> {label}
      </dt>
      <dd className="mt-0.5 pl-6 text-sm font-medium break-words">{children}</dd>
    </div>
  );
}

function MatchedDonors({ matches }: { matches: NonNullable<BloodRequest["matches"]> }) {
  if (matches.length === 0) {
    return (
      <EmptyState
        icon={UserRoundSearchIcon}
        title="No donors matched yet"
        description="Our admins are looking for an available donor with your blood type. You'll see them here."
      />
    );
  }

  return (
    <ul className="divide-y">
      {matches.map((m) => {
        // Only reveal contact details once the donor has agreed to donate.
        const showContact = (m.status === "ACCEPTED" || m.status === "COMPLETED") && m.donor.phone;
        return (
          <li key={m.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">{initials(m.donor.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{m.donor.name}</p>
              <p className="text-xs text-muted-foreground">
                {m.createdAt ? `Matched ${formatRelative(m.createdAt)}` : "Matched"}
              </p>
            </div>
            <StatusBadge status={m.status} />
            {showContact && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${m.donor.phone}`}>
                  <PhoneIcon /> {m.donor.phone}
                </a>
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function RequestDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: request, isPending, isError, error, refetch } = useRequest(id);
  const cancel = useCancelRequest(id);
  const remove = useDeleteRequest();

  if (isPending) return <TableSkeleton rows={4} />;
  if (isError) return <ErrorState error={error} title="Couldn't load this request" onRetry={() => refetch()} />;

  const canCancel = request.status === "PENDING";
  const matches = request.matches ?? [];

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <BloodTypeBadge type={request.bloodType} size="lg" />
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {BLOOD_TYPE_LABELS[request.bloodType]} blood needed
            </h1>
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge status={request.status} />
              <UrgencyBadge urgency={request.urgency} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/requester">
              <ArrowLeftIcon /> All requests
            </Link>
          </Button>
          {canCancel && (
            <ConfirmDialog
              trigger={
                <Button variant="outline">
                  <XCircleIcon /> Cancel request
                </Button>
              }
              title="Cancel this request?"
              description="Donors will no longer see it. You can post a new request at any time."
              confirmLabel="Cancel request"
              cancelLabel="Keep request"
              destructive
              pending={cancel.isPending}
              onConfirm={() => cancel.mutate()}
            />
          )}
          <ConfirmDialog
            trigger={
              <Button variant="ghost" className="text-destructive hover:text-destructive" aria-label="Delete request">
                <Trash2Icon />
              </Button>
            }
            title="Delete this request?"
            description="It will be removed from your dashboard permanently."
            confirmLabel="Delete"
            destructive
            pending={remove.isPending}
            onConfirm={() =>
              remove.mutate(request.id, { onSuccess: () => router.replace("/dashboard/requester") })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Request details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <DetailRow icon={BuildingIcon} label="Hospital">
                  {request.hospital ?? "Not specified"}
                </DetailRow>
                <DetailRow icon={MapPinIcon} label="Location">
                  {request.location}
                </DetailRow>
                <DetailRow icon={DropletsIcon} label="Units required">
                  {request.units} unit{request.units > 1 && "s"}
                </DetailRow>
                <DetailRow icon={CalendarClockIcon} label="Needed by">
                  {formatDate(request.requiredDate)}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({formatRelative(request.requiredDate)})
                  </span>
                </DetailRow>
                <DetailRow icon={CalendarPlusIcon} label="Posted">
                  {formatDate(request.createdAt, true)}
                </DetailRow>
                {request.notes && (
                  <DetailRow icon={StickyNoteIcon} label="Notes" className="sm:col-span-2">
                    <span className="font-normal whitespace-pre-line">{request.notes}</span>
                  </DetailRow>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matched donors</CardTitle>
              <CardDescription>
                Contact numbers appear once a donor accepts the match.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MatchedDonors matches={matches} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline status={request.status} />
            </CardContent>
          </Card>
          <PaymentCard request={request} />
        </div>
      </div>
    </>
  );
}
