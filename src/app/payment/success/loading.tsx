import { Loader2Icon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function PaymentSuccessLoading() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center" aria-live="polite">
        <Loader2Icon className="size-10 animate-spin text-primary" aria-hidden />
        <div>
          <p className="font-semibold">Confirming your payment…</p>
          <p className="text-sm text-muted-foreground">This only takes a moment.</p>
        </div>
      </CardContent>
    </Card>
  );
}
