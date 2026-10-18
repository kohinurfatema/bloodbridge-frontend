import type { Metadata } from "next";
import Link from "next/link";
import { CircleSlashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Payment cancelled — BloodBridge" };

export default function PaymentCancelPage() {
  return (
    <Card className="text-center">
      <CardHeader className="items-center gap-3">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CircleSlashIcon className="size-7" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold">Payment cancelled</h1>
        <p className="text-muted-foreground">
          No money was taken. Your blood request is still active and donors can still be matched.
        </p>
      </CardHeader>
      <CardFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/dashboard/requester">Back to my requests</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/requester/payments">View payments</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
