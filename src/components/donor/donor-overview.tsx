"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  CheckCircle2Icon,
  DropletIcon,
  HeartIcon,
  HourglassIcon,
  MapPinIcon,
  SirenIcon,
  UserPlusIcon,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatCard } from "@/components/shared/stat-card";
import { BloodTypeBadge, StatusBadge, UrgencyBadge } from "@/components/shared/status-badges";
import { DashboardSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useActiveAlerts,
  useDonorProfile,
  useMyMatches,
  useUpdateAvailability,
} from "@/hooks/use-donor";
import { BLOOD_TYPE_LABELS } from "@/lib/constants";
import { DONATION_GAP_DAYS, donationEligibility, formatDate, formatRelative } from "@/lib/format";
import type { DonorProfile } from "@/types";

function NoProfile() {
  return (
    <EmptyState
      icon={UserPlusIcon}
      title="Complete your donor profile"
      description="Add your blood type and location so our team can match you with patients who need you."
      action={
        <Button asChild>
          <Link href="/dashboard/donor/profile">Set up profile</Link>
        </Button>
      }
      className="border-primary/30 bg-primary/5 py-16"
    />
  );
}

function AvailabilityCard({ profile }: { profile: DonorProfile }) {
  const toggle = useUpdateAvailability();
  const { eligible, daysLeft, nextDate } = donationEligibility(profile.lastDonationDate);
  const progress = eligible ? 100 : ((DONATION_GAP_DAYS - daysLeft) / DONATION_GAP_DAYS) * 100;

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex items-center gap-4">
          <BloodTypeBadge type={profile.bloodType} size="lg" />
          <div>
            <p className="text-sm text-muted-foreground">Your blood type</p>
            <p className="text-xl font-bold">{BLOOD_TYPE_LABELS[profile.bloodType]}</p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPinIcon className="size-3.5" aria-hidden /> {profile.location}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {eligible ? "You're eligible to donate" : `Eligible again in ${daysLeft} days`}
            </span>
            <span className="text-muted-foreground">
              {profile.lastDonationDate ? `Last: ${formatDate(profile.lastDonationDate)}` : "No donations recorded"}
            </span>
          </div>
          <Progress value={progress} aria-label="Recovery progress since last donation" />
          {!eligible && nextDate && (
            <p className="text-xs text-muted-foreground">Next eligible date: {formatDate(nextDate)}</p>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Switch
            id="availability"
            checked={profile.isAvailable}
            disabled={toggle.isPending}
            onCheckedChange={(checked) => toggle.mutate(checked)}
          />
          <div>
            <Label htmlFor="availability" className="font-semibold">
              {profile.isAvailable ? "Available" : "Unavailable"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {profile.isAvailable ? "Visible in donor search" : "Hidden from donor search"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentMatches() {
  const { data, isPending, isError } = useMyMatches();
  const matches = data?.matches.slice(0, 4) ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="space-y-1">
          <CardTitle>Recent matches</CardTitle>
          <CardDescription>Requests our admins matched you with.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/donor/matches">
            View all <ArrowRightIcon />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">Matches are unavailable right now.</p>
        ) : matches.length === 0 ? (
          <EmptyState icon={HeartIcon} title="No matches yet" description="When you're matched to a request, it shows up here." />
        ) : (
          <ul className="divide-y">
            {matches.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                {m.request && <BloodTypeBadge type={m.request.bloodType} size="sm" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.request?.hospital ?? "Blood request"}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.request?.location} · {formatRelative(m.createdAt)}
                  </p>
                </div>
                <StatusBadge status={m.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function EmergencyAlerts({ bloodType }: { bloodType: DonorProfile["bloodType"] }) {
  const { data, isPending } = useActiveAlerts();
  const alerts = (data?.alerts ?? []).filter((a) => a.request?.status !== "CANCELLED");
  const forMe = alerts.filter((a) => a.request?.bloodType === bloodType);

  return (
    <Card className={forMe.length ? "border-destructive/40" : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SirenIcon className="size-4 text-destructive" aria-hidden /> Emergency alerts
        </CardTitle>
        <CardDescription>
          {forMe.length
            ? `${forMe.length} active emergency ${forMe.length === 1 ? "needs" : "need"} your blood type.`
            : "Active emergencies across the platform."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : alerts.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2Icon className="size-4 text-emerald-600" aria-hidden /> No active emergencies right now.
          </p>
        ) : (
          <ul className="space-y-3">
            {alerts.slice(0, 3).map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                {a.request && <BloodTypeBadge type={a.request.bloodType} size="sm" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.request?.hospital ?? a.request?.location}</p>
                  <p className="text-xs text-muted-foreground">{formatRelative(a.createdAt)}</p>
                </div>
                {a.request && <UrgencyBadge urgency={a.request.urgency} />}
              </li>
            ))}
          </ul>
        )}
        <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
          <Link href="/dashboard/donor/requests">See open requests</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function DonorOverview() {
  const { data: profile, isPending, isError, error, refetch } = useDonorProfile();
  const { data: matchData } = useMyMatches(!!profile);

  const counts = useMemo(() => {
    const matches = matchData?.matches ?? [];
    return {
      pending: matches.filter((m) => m.status === "PENDING").length,
      accepted: matches.filter((m) => m.status === "ACCEPTED").length,
    };
  }, [matchData]);

  if (isPending) return <DashboardSkeleton />;
  if (isError) return <ErrorState error={error} title="Couldn't load your donor profile" onRetry={() => refetch()} />;
  if (!profile) return <NoProfile />;

  return (
    <>
      <AvailabilityCard profile={profile} />

      <section aria-label="Donation summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total donations" value={profile.totalDonations} icon={DropletIcon} description="Recorded on BloodBridge" />
        <StatCard title="Lives impacted" value={profile.totalDonations * 3} icon={HeartIcon} tone="emerald" description="One donation can help up to 3 people" />
        <StatCard title="Awaiting your reply" value={counts.pending} icon={HourglassIcon} tone="amber" description="Matches to accept or decline" />
        <StatCard title="Upcoming donations" value={counts.accepted} icon={CalendarCheckIcon} tone="violet" description="Matches you've accepted" />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentMatches />
        </div>
        <EmergencyAlerts bloodType={profile.bloodType} />
      </div>
    </>
  );
}
