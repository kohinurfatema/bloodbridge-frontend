"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightIcon,
  CalendarIcon,
  HandHeartIcon,
  Loader2Icon,
  LogOutIcon,
  MailIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { BloodTypeBadge } from "@/components/shared/status-badges";
import { FormSkeleton } from "@/components/skeletons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useMe, useUpdateProfile } from "@/hooks/use-profile";
import { ApiError } from "@/lib/api/client";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate, initials } from "@/lib/format";
import { profileSchema, type ProfileValues } from "@/lib/validations/profile";
import type { User } from "@/types";

function ProfileForm({ user }: { user: User }) {
  const update = useUpdateProfile();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, phone: user.phone ?? "" },
  });
  const { errors, isDirty } = form.formState;

  const onSubmit = (values: ProfileValues) =>
    update.mutate(
      { name: values.name, ...(values.phone && { phone: values.phone }) },
      { onSuccess: () => form.reset(values) },
    );

  const serverErrors = update.error instanceof ApiError ? update.error.errors : [];

  return (
    <Card>
      {/* contents: keeps the Card's own spacing between header, body and footer */}
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="contents">
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>Your name and phone are shared with matched donors or requesters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {update.isError && (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>{update.error.message}</AlertTitle>
              {serverErrors.length > 0 && <AlertDescription>{serverErrors.join(", ")}</AlertDescription>}
            </Alert>
          )}
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...form.register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+8801XXXXXXXXX"
                aria-invalid={!!errors.phone}
                {...form.register("phone")}
              />
              <FieldDescription>Used by matched donors and requesters to reach you.</FieldDescription>
              <FieldError errors={[errors.phone]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" value={user.email} disabled readOnly />
              <FieldDescription>Email is your login and can&apos;t be changed.</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          <Button type="button" variant="outline" disabled={!isDirty || update.isPending} onClick={() => form.reset()}>
            Discard
          </Button>
          <Button type="submit" disabled={!isDirty || update.isPending}>
            {update.isPending && <Loader2Icon className="animate-spin" aria-hidden />}
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function ProfileSettings() {
  const { data: user, isPending, isError, error, refetch } = useMe();
  const { logout } = useAuth();

  if (isPending) return <FormSkeleton sections={1} />;
  if (isError) return <ErrorState error={error} title="Couldn't load your profile" onRetry={() => refetch()} />;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <ProfileForm user={user} />

        {user.role === "DONOR" && (
          <Card>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {user.donorProfile ? (
                <BloodTypeBadge type={user.donorProfile.bloodType} size="lg" />
              ) : (
                <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <HandHeartIcon className="size-6" aria-hidden />
                </span>
              )}
              <div className="flex-1">
                <p className="font-semibold">Donor profile</p>
                <p className="text-sm text-muted-foreground">
                  {user.donorProfile
                    ? `${user.donorProfile.location} · ${user.donorProfile.isAvailable ? "available" : "unavailable"} · ${user.donorProfile.totalDonations} donations`
                    : "Add your blood type and location to start receiving matches."}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/dashboard/donor/profile">
                  {user.donorProfile ? "Edit donor profile" : "Set up"} <ArrowRightIcon />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="h-fit">
        <CardHeader className="items-center text-center">
          <Avatar className="mx-auto size-20">
            <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-2">{user.name}</CardTitle>
          <div className="flex justify-center gap-1.5">
            <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
            {user.isActive ? (
              <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground">
            <MailIcon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{user.email}</span>
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="size-4 shrink-0" aria-hidden /> Member since {formatDate(user.createdAt)}
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheckIcon className="size-4 shrink-0" aria-hidden /> Signed in with a secure session
          </p>
          <Separator />
          <Button variant="outline" className="w-full" disabled={logout.isPending} onClick={() => logout.mutate()}>
            <LogOutIcon /> Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
