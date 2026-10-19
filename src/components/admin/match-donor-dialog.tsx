"use client";

import { useState } from "react";
import { CheckIcon, Loader2Icon, MapPinIcon, SearchIcon, UserRoundSearchIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { BloodTypeBadge, StatusBadge } from "@/components/shared/status-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useCreateMatch, useMatchCandidates, useRequestMatches } from "@/hooks/use-admin";
import { useDebounce } from "@/hooks/use-debounce";
import { BLOOD_TYPE_LABELS } from "@/lib/constants";
import { donationEligibility, formatDate, initials } from "@/lib/format";
import type { BloodRequest } from "@/types";

interface MatchDonorDialogProps {
  request: BloodRequest | null;
  onOpenChange: (open: boolean) => void;
}

export function MatchDonorDialog({ request, onOpenChange }: MatchDonorDialogProps) {
  // Default to donors near the request; admins can widen the search.
  const [nearbyOnly, setNearbyOnly] = useState(true);
  const [location, setLocation] = useState("");
  const debouncedLocation = useDebounce(location.trim());
  const searchLocation = nearbyOnly ? request?.location : debouncedLocation;

  const candidates = useMatchCandidates(request, searchLocation);
  const existing = useRequestMatches(request?.id);
  const createMatch = useCreateMatch();

  // Donors already matched (and not declined) can't be matched again.
  const activeDonorIds = new Set(
    (existing.data ?? []).filter((m) => m.status === "PENDING" || m.status === "ACCEPTED").map((m) => m.donorId),
  );

  return (
    <Dialog open={!!request} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {request && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BloodTypeBadge type={request.bloodType} size="sm" /> Match a donor
              </DialogTitle>
              <DialogDescription>
                {request.units} unit{request.units > 1 && "s"} of {BLOOD_TYPE_LABELS[request.bloodType]} for{" "}
                {request.hospital ?? request.location}, needed by {formatDate(request.requiredDate)}. Only
                available donors with the same blood type can be matched.
              </DialogDescription>
            </DialogHeader>

            {(existing.data?.length ?? 0) > 0 && (
              <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
                <p className="text-sm font-medium">Already matched</p>
                <ul className="flex flex-wrap gap-2">
                  {existing.data!.map((m) => (
                    <li key={m.id} className="flex items-center gap-1.5 text-sm">
                      {m.donor?.name} <StatusBadge status={m.status} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex items-center gap-2 sm:h-9">
                <Switch id="nearby" checked={nearbyOnly} onCheckedChange={setNearbyOnly} />
                <Label htmlFor="nearby" className="capitalize">Near {request.location}</Label>
              </div>
              {!nearbyOnly && (
                <div className="flex flex-1 flex-col gap-2">
                  <Label htmlFor="match-location" className="sr-only">
                    Location
                  </Label>
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <Input
                      id="match-location"
                      type="search"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Any location"
                      className="pl-8"
                    />
                  </div>
                </div>
              )}
            </div>

            <ScrollArea className="max-h-[50vh] pr-3">
              {candidates.isPending ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : candidates.isError ? (
                <ErrorState error={candidates.error} onRetry={() => candidates.refetch()} />
              ) : candidates.data.donors.length === 0 ? (
                <EmptyState
                  icon={UserRoundSearchIcon}
                  title={`No available ${BLOOD_TYPE_LABELS[request.bloodType]} donors${nearbyOnly ? ` in ${request.location}` : ""}`}
                  description={nearbyOnly ? "Turn off “Near” to search every location." : "Try again later or raise an emergency alert."}
                />
              ) : (
                <ul className="space-y-2">
                  {candidates.data.donors.map((donor) => {
                    const { eligible, nextDate } = donationEligibility(donor.lastDonationDate);
                    const alreadyMatched = activeDonorIds.has(donor.userId);
                    const matching = createMatch.isPending && createMatch.variables?.donorProfileId === donor.id;
                    return (
                      <li key={donor.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                        <Avatar>
                          <AvatarFallback className="bg-muted text-xs font-semibold">{initials(donor.user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{donor.user.name}</p>
                          <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="size-3" aria-hidden /> {donor.location}
                            </span>
                            <span>{donor.totalDonations} donations</span>
                            <span>Last: {donor.lastDonationDate ? formatDate(donor.lastDonationDate) : "never"}</span>
                          </p>
                        </div>
                        {!eligible && nextDate && (
                          <Badge variant="outline" className="text-amber-800 dark:text-amber-300">
                            Eligible {formatDate(nextDate)}
                          </Badge>
                        )}
                        {alreadyMatched ? (
                          <Badge variant="secondary">
                            <CheckIcon aria-hidden /> Matched
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            disabled={createMatch.isPending}
                            onClick={() =>
                              createMatch.mutate(
                                { requestId: request.id, donorId: donor.userId, donorProfileId: donor.id },
                                { onSuccess: () => onOpenChange(false) },
                              )
                            }
                          >
                            {matching && <Loader2Icon className="animate-spin" aria-hidden />}
                            Match
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
