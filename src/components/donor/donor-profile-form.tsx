"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { BloodTypePicker } from "@/components/shared/blood-type-picker";
import { DatePicker } from "@/components/shared/date-picker";
import { ErrorState } from "@/components/shared/error-state";
import { FormSkeleton } from "@/components/skeletons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useDonorProfile, useSaveDonorProfile } from "@/hooks/use-donor";
import { ApiError } from "@/lib/api/client";
import { donationEligibility, formatDate, fromApiDate, toApiDate } from "@/lib/format";
import { donorProfileSchema, type DonorProfileValues } from "@/lib/validations/donor";
import type { DonorProfile } from "@/types";

function ProfileForm({ profile }: { profile: DonorProfile | null }) {
  const router = useRouter();
  const save = useSaveDonorProfile(!!profile);

  const form = useForm<DonorProfileValues>({
    resolver: zodResolver(donorProfileSchema),
    defaultValues: {
      bloodType: profile?.bloodType,
      location: profile?.location ?? "",
      lastDonationDate: profile?.lastDonationDate ? fromApiDate(profile.lastDonationDate) : undefined,
      isAvailable: profile?.isAvailable ?? true,
    },
  });
  const { errors, isDirty } = form.formState;
  const lastDonation = useWatch({ control: form.control, name: "lastDonationDate" });
  const eligibility = donationEligibility(lastDonation && toApiDate(lastDonation));

  const onSubmit = (values: DonorProfileValues) => {
    const lastDonationDate = values.lastDonationDate
      ? toApiDate(values.lastDonationDate)
      : undefined;

    save.mutate(
      {
        bloodType: values.bloodType,
        location: values.location,
        isAvailable: values.isAvailable,
        ...(lastDonationDate && { lastDonationDate }),
      },
      {
        onSuccess: () => {
          if (profile) {
            toast.success("Donor profile updated.");
            form.reset(values);
          } else {
            toast.success("Welcome aboard! Your donor profile is live.");
            router.push("/dashboard/donor");
          }
        },
      },
    );
  };

  const serverErrors = save.error instanceof ApiError ? save.error.errors : [];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="max-w-3xl space-y-6">
      {!profile && (
        <Alert>
          <InfoIcon />
          <AlertTitle>Set up your donor profile</AlertTitle>
          <AlertDescription>
            Admins use your blood type and location to match you with patients. You can change these later.
          </AlertDescription>
        </Alert>
      )}

      {save.isError && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>{save.error.message}</AlertTitle>
          {serverErrors.length > 0 && (
            <AlertDescription>
              <ul className="list-disc pl-4">
                {serverErrors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </AlertDescription>
          )}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Donor details</CardTitle>
          <CardDescription>Only admins and requesters searching for donors can see this.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={form.control}
              name="bloodType"
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label">Blood type</FieldLegend>
                  <BloodTypePicker value={field.value} onChange={field.onChange} invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </FieldSet>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.location}>
                <FieldLabel htmlFor="location">City / area</FieldLabel>
                <Input
                  id="location"
                  placeholder="e.g. Dhaka"
                  autoComplete="address-level2"
                  aria-invalid={!!errors.location}
                  {...form.register("location")}
                />
                <FieldError errors={[errors.location]} />
              </Field>

              <Controller
                control={form.control}
                name="lastDonationDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lastDonationDate">
                      Last donation <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <DatePicker
                      id="lastDonationDate"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={{ after: new Date() }}
                      placeholder="Never donated"
                      invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      {lastDonation
                        ? eligibility.eligible
                          ? "You're eligible to donate again."
                          : `Eligible again on ${formatDate(eligibility.nextDate)}.`
                        : "Leave empty if you haven't donated before."}
                    </FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <Field orientation="horizontal" className="rounded-lg border p-4">
                  <FieldContent>
                    <FieldLabel htmlFor="isAvailable">Available to donate</FieldLabel>
                    <FieldDescription>
                      Turn this off when you&apos;re travelling, unwell or recently donated.
                    </FieldDescription>
                  </FieldContent>
                  <Switch id="isAvailable" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {profile && (
          <Button type="button" variant="outline" disabled={!isDirty || save.isPending} onClick={() => form.reset()}>
            Discard changes
          </Button>
        )}
        <Button type="submit" disabled={save.isPending || (!!profile && !isDirty)}>
          {save.isPending && <Loader2Icon className="animate-spin" aria-hidden />}
          {profile ? "Save changes" : "Create donor profile"}
        </Button>
      </div>
    </form>
  );
}

export function DonorProfileForm() {
  const { data: profile, isPending, isError, error, refetch } = useDonorProfile();

  if (isPending) return <FormSkeleton sections={1} />;
  if (isError) return <ErrorState error={error} title="Couldn't load your profile" onRetry={() => refetch()} />;

  // Remount when the profile is first created so defaults reflect saved data.
  return <ProfileForm key={profile?.id ?? "new"} profile={profile} />;
}
