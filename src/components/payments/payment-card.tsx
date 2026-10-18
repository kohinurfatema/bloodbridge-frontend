"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2Icon,
  CreditCardIcon,
  Loader2Icon,
  LockIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badges";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useInitiatePayment, useRequestPayment, useVerifyPayment } from "@/hooks/use-payments";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { paymentSchema, type PaymentValues } from "@/lib/validations/payment";
import type { BloodRequest } from "@/types";

const PRESETS = [5, 10, 25, 50];

function PayDialog({ requestId }: { requestId: string }) {
  const [open, setOpen] = useState(false);
  const initiate = useInitiatePayment();

  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: 10 },
  });
  const amount = useWatch({ control: form.control, name: "amount" });
  const { errors } = form.formState;

  const onSubmit = ({ amount }: PaymentValues) => {
    initiate.mutate({ requestId, amount, currency: "usd" });
  };

  // Stays "pending" until the browser leaves for Stripe.
  const redirecting = initiate.isPending || initiate.isSuccess;

  return (
    <Dialog open={open} onOpenChange={(o) => !redirecting && setOpen(o)}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <CreditCardIcon /> Pay service fee
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Pay service fee</DialogTitle>
            <DialogDescription>
              Covers screening, cross-matching and transport for your request. You&apos;ll be
              redirected to Stripe&apos;s secure checkout.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Suggested amounts">
            {PRESETS.map((value) => (
              <Button
                key={value}
                type="button"
                variant="outline"
                aria-pressed={amount === value}
                className={cn(amount === value && "border-primary bg-primary/10 text-primary")}
                onClick={() => form.setValue("amount", value, { shouldValidate: true })}
              >
                ${value}
              </Button>
            ))}
          </div>

          <Field data-invalid={!!errors.amount}>
            <FieldLabel htmlFor="amount">Amount (USD)</FieldLabel>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={1}
                className="pl-7"
                aria-invalid={!!errors.amount}
                {...form.register("amount", { valueAsNumber: true })}
              />
            </div>
            <FieldDescription>Between $1 and $1,000.</FieldDescription>
            <FieldError errors={[errors.amount]} />
          </Field>

          {initiate.isError && (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertDescription>{initiate.error.message}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <LockIcon />
            <AlertDescription>
              Test mode — use card <span className="font-mono font-medium">4242 4242 4242 4242</span>,
              any future date and any CVC.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={redirecting}>
              Cancel
            </Button>
            <Button type="submit" disabled={redirecting}>
              {redirecting ? <Loader2Icon className="animate-spin" aria-hidden /> : <LockIcon />}
              {redirecting
                ? "Redirecting to Stripe…"
                : `Pay ${Number.isFinite(amount) && amount > 0 ? formatCurrency(amount) : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentCard({ request }: { request: BloodRequest }) {
  const { data: payment, isPending, isError } = useRequestPayment(request.id);
  const verify = useVerifyPayment();

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Service fee</CardTitle>
        <CardDescription>Processed securely by Stripe.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? (
          <Skeleton className="h-9 w-full" />
        ) : isError ? (
          <p className="text-sm text-muted-foreground">Payment status is unavailable right now.</p>
        ) : !payment ? (
          request.status === "CANCELLED" ? (
            <p className="text-sm text-muted-foreground">Cancelled requests can&apos;t be paid for.</p>
          ) : (
            <PayDialog requestId={request.id} />
          )
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xl font-bold tabular-nums">
                {formatCurrency(payment.amount, payment.currency)}
              </span>
              <StatusBadge status={payment.status} />
            </div>
            {payment.status === "COMPLETED" && (
              <p className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2Icon className="size-4" aria-hidden /> Paid on{" "}
                {formatDate(payment.paidAt ?? payment.updatedAt)}
              </p>
            )}
            {payment.status === "PENDING" && payment.stripeSessionId && (
              <>
                <p className="text-sm text-muted-foreground">
                  Checkout was started but not confirmed yet. Already paid? Check the status.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={verify.isPending}
                  onClick={() => verify.mutate(payment.stripeSessionId!)}
                >
                  {verify.isPending ? <Loader2Icon className="animate-spin" aria-hidden /> : <RefreshCwIcon />}
                  Check payment status
                </Button>
              </>
            )}
            {payment.status === "FAILED" && (
              <p className="text-sm text-muted-foreground">
                This payment didn&apos;t go through. Please contact support to retry.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
