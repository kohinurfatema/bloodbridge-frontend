"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SirenIcon, TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAlert } from "@/hooks/use-admin";
import { useRequestList } from "@/hooks/use-requests";
import { BLOOD_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { createAlertSchema, type CreateAlertValues } from "@/lib/validations/alert";

/** Raise an emergency alert for an open request that doesn't have one yet. */
export function RaiseAlertDialog({ alertedRequestIds }: { alertedRequestIds: Set<string> }) {
  const [open, setOpen] = useState(false);
  const createAlert = useCreateAlert();
  const pending = useRequestList({ status: "PENDING", limit: 50, sortBy: "urgency", sortOrder: "desc" });

  const options = (pending.data?.requests ?? []).filter((r) => !alertedRequestIds.has(r.id));

  const form = useForm<CreateAlertValues>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: { requestId: "" },
  });

  const onSubmit = ({ requestId }: CreateAlertValues) =>
    createAlert.mutate(requestId, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          form.reset();
          createAlert.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">
          <SirenIcon /> Raise alert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Raise an emergency alert</DialogTitle>
            <DialogDescription>
              Flags a pending request as an emergency on every donor&apos;s dashboard. Emergency
              requests created by requesters raise one automatically.
            </DialogDescription>
          </DialogHeader>

          <Controller
            control={form.control}
            name="requestId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="alert-request">Blood request</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={pending.isPending}>
                  <SelectTrigger id="alert-request" className="w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={pending.isPending ? "Loading requests…" : "Select a pending request"} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {BLOOD_TYPE_LABELS[r.bloodType]} · {r.hospital ?? r.location} · by {formatDate(r.requiredDate)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  {options.length === 0 && !pending.isPending
                    ? "Every pending request already has an alert."
                    : "Only pending requests without an alert are listed."}
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {createAlert.isError && (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertDescription>{createAlert.error.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={createAlert.isPending}>
              {createAlert.isPending && <Loader2Icon className="animate-spin" aria-hidden />}
              Raise alert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
