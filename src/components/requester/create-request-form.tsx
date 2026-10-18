"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SirenIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { BloodTypePicker } from "@/components/shared/blood-type-picker";
import { DatePicker } from "@/components/shared/date-picker";
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
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRequest } from "@/hooks/use-requests";
import { ApiError } from "@/lib/api/client";
import { createRequestSchema, type CreateRequestValues } from "@/lib/validations/request";

const URGENCY_OPTIONS = [
  { value: "NORMAL", title: "Normal", description: "Needed within a few days" },
  { value: "URGENT", title: "Urgent", description: "Needed within 24 hours" },
  { value: "EMERGENCY", title: "Emergency", description: "Life-threatening, needed now" },
] as const;

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export function CreateRequestForm() {
  const router = useRouter();
  const createRequest = useCreateRequest();

  const form = useForm<CreateRequestValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      urgency: "NORMAL",
      units: 1,
      hospital: "",
      location: "",
      notes: "",
    },
  });
  const { errors } = form.formState;
  const urgency = useWatch({ control: form.control, name: "urgency" });
  const notes = useWatch({ control: form.control, name: "notes" }) ?? "";

  const onSubmit = (values: CreateRequestValues) => {
    // Noon local time keeps the chosen calendar day in every timezone.
    const required = new Date(values.requiredDate);
    required.setHours(12, 0, 0, 0);

    createRequest.mutate(
      {
        bloodType: values.bloodType,
        urgency: values.urgency,
        units: values.units,
        location: values.location,
        requiredDate: required.toISOString(),
        ...(values.hospital && { hospital: values.hospital }),
        ...(values.notes && { notes: values.notes }),
      },
      {
        onSuccess: (created) => {
          toast.success(
            values.urgency === "EMERGENCY"
              ? "Emergency request posted — an alert has been raised."
              : "Blood request posted.",
          );
          router.push(`/dashboard/requester/requests/${created.id}`);
        },
      },
    );
  };

  const serverErrors =
    createRequest.error instanceof ApiError ? createRequest.error.errors : [];
  const busy = createRequest.isPending || createRequest.isSuccess;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
      {createRequest.isError && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>{createRequest.error.message}</AlertTitle>
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
          <CardTitle>What&apos;s needed</CardTitle>
          <CardDescription>Blood type, quantity and how soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={form.control}
              name="bloodType"
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label">Blood type</FieldLegend>
                  <BloodTypePicker
                    value={field.value}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </FieldSet>
              )}
            />

            <Controller
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FieldSet>
                  <FieldLegend variant="label">Urgency</FieldLegend>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid gap-2 sm:grid-cols-3"
                  >
                    {URGENCY_OPTIONS.map((option) => (
                      <FieldLabel key={option.value} htmlFor={`urgency-${option.value}`}>
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>{option.title}</FieldTitle>
                            <FieldDescription>{option.description}</FieldDescription>
                          </FieldContent>
                          <RadioGroupItem value={option.value} id={`urgency-${option.value}`} />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                </FieldSet>
              )}
            />

            {urgency === "EMERGENCY" && (
              <Alert className="border-destructive/30 bg-destructive/5">
                <SirenIcon className="text-destructive" />
                <AlertTitle>An emergency alert will be raised</AlertTitle>
                <AlertDescription>
                  Our admin team is notified immediately so matching donors can be contacted.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.units}>
                <FieldLabel htmlFor="units">Units (bags)</FieldLabel>
                <Input
                  id="units"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10}
                  aria-invalid={!!errors.units}
                  {...form.register("units", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.units]} />
              </Field>

              <Controller
                control={form.control}
                name="requiredDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="requiredDate">Needed by</FieldLabel>
                    <DatePicker
                      id="requiredDate"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={{ before: today() }}
                      invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Where</CardTitle>
          <CardDescription>Donors use this to judge if they can reach you.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.hospital}>
                <FieldLabel htmlFor="hospital">
                  Hospital <span className="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input
                  id="hospital"
                  placeholder="Dhaka Medical College Hospital"
                  aria-invalid={!!errors.hospital}
                  {...form.register("hospital")}
                />
                <FieldError errors={[errors.hospital]} />
              </Field>

              <Field data-invalid={!!errors.location}>
                <FieldLabel htmlFor="location">City / area</FieldLabel>
                <Input
                  id="location"
                  placeholder="Dhaka"
                  aria-invalid={!!errors.location}
                  {...form.register("location")}
                />
                <FieldError errors={[errors.location]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.notes}>
              <FieldLabel htmlFor="notes">
                Notes <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="notes"
                rows={4}
                placeholder="Patient condition, ward number, contact person…"
                aria-invalid={!!errors.notes}
                aria-describedby="notes-count"
                {...form.register("notes")}
              />
              <FieldDescription id="notes-count" className="text-right tabular-nums">
                {notes.length}/500
              </FieldDescription>
              <FieldError errors={[errors.notes]} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy} variant={urgency === "EMERGENCY" ? "destructive" : "default"}>
          {busy && <Loader2Icon className="animate-spin" aria-hidden />}
          {urgency === "EMERGENCY" ? "Post emergency request" : "Post request"}
        </Button>
      </div>
    </form>
  );
}
