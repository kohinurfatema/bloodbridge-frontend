import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckIcon, ReceiptIcon, TriangleAlertIcon } from "lucide-react";

import { BloodTypeBadge, StatusBadge } from "@/components/shared/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ApiError } from "@/lib/api/client";
import { serverApi } from "@/lib/api/server";
import { BLOOD_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Payment } from "@/types";

export const metadata: Metadata = { title: "Payment successful — BloodBridge" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

// Server Component: confirms the Stripe session with the backend before
// rendering, so the user never sees "success" for an unpaid session.
export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/dashboard/requester/payments");

  let payment: Payment | null = null;
  let failure: string | null = null;
  try {
    payment = await serverApi<Payment>("/payments/verify", { query: { session_id } });
  } catch (error) {
    // 5xx details are not useful to the user; 4xx messages (e.g. "not successful") are.
    failure =
      error instanceof ApiError && error.status < 500
        ? error.message
        : "We couldn't confirm this payment with Stripe. If you were charged, it will appear in your payments shortly.";
  }

  if (!payment) {
    return (
      <Card className="text-center">
        <CardHeader className="items-center gap-3">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlertIcon className="size-7" aria-hidden />
          </span>
          <h1 className="text-2xl font-bold">Payment not confirmed</h1>
          <p className="text-muted-foreground">{failure}</p>
        </CardHeader>
        <CardFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard/requester/payments">View payments</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/requester">Back to dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center gap-3 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <CheckIcon className="size-7" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold">Payment successful</h1>
        <p className="text-muted-foreground">
          Thank you. Your service fee has been received and your request stays active.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-4xl font-bold tabular-nums">
          {formatCurrency(payment.amount, payment.currency)}
        </div>
        <Separator />
        <dl className="space-y-3">
          {payment.request && (
            <Row label="Request">
              <span className="inline-flex items-center gap-2">
                <BloodTypeBadge type={payment.request.bloodType} size="sm" />
                {payment.request.hospital ?? BLOOD_TYPE_LABELS[payment.request.bloodType]}
              </span>
            </Row>
          )}
          <Row label="Status">
            <StatusBadge status={payment.status} />
          </Row>
          <Row label="Date">{formatDate(payment.paidAt ?? payment.updatedAt, true)}</Row>
          <Row label="Reference">
            <span className="font-mono text-xs">{payment.id.slice(0, 8).toUpperCase()}</span>
          </Row>
        </dl>
      </CardContent>
      <CardFooter className="flex-col gap-2 sm:flex-row">
        <Button className="w-full sm:flex-1" asChild>
          <Link href={`/dashboard/requester/requests/${payment.requestId}`}>View request</Link>
        </Button>
        <Button variant="outline" className="w-full sm:flex-1" asChild>
          <Link href="/dashboard/requester/payments">
            <ReceiptIcon /> All payments
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
