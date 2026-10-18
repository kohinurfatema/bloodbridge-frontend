"use client";

import { useState } from "react";
import { CalendarHeartIcon, DropletIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { BloodTypeBadge } from "@/components/shared/status-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { donationEligibility, formatDate, initials } from "@/lib/format";
import type { DonorSearchResult } from "@/types";

export function DonorCard({ donor }: { donor: DonorSearchResult }) {
  const [showPhone, setShowPhone] = useState(false);
  const { eligible, daysLeft } = donationEligibility(donor.lastDonationDate);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-3">
        <Avatar className="size-12">
          <AvatarFallback className="bg-muted font-semibold">{initials(donor.user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{donor.user.name}</h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{donor.location}</span>
          </p>
        </div>
        <BloodTypeBadge type={donor.bloodType} />
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {donor.isAvailable ? (
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" variant="secondary">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden /> Available
            </Badge>
          ) : (
            <Badge variant="secondary">Unavailable</Badge>
          )}
          {!eligible && (
            <Badge variant="outline">Eligible in {daysLeft} days</Badge>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="flex items-center gap-1 text-xs text-muted-foreground">
              <DropletIcon className="size-3" aria-hidden /> Donations
            </dt>
            <dd className="font-semibold tabular-nums">{donor.totalDonations}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarHeartIcon className="size-3" aria-hidden /> Last donated
            </dt>
            <dd className="font-semibold">{donor.lastDonationDate ? formatDate(donor.lastDonationDate) : "Never"}</dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter>
        {donor.user.phone ? (
          showPhone ? (
            <Button variant="outline" className="w-full" asChild>
              <a href={`tel:${donor.user.phone}`}>
                <PhoneIcon /> {donor.user.phone}
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setShowPhone(true)}>
              <PhoneIcon /> Show contact
            </Button>
          )
        ) : (
          <p className="w-full text-center text-sm text-muted-foreground">No phone number shared</p>
        )}
      </CardFooter>
    </Card>
  );
}
