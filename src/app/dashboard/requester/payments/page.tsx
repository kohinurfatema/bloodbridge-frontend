import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PaymentHistory } from "@/components/payments/payment-history";
import { PageHeader } from "@/components/shared/page-header";
import { serverApi } from "@/lib/api/server";
import { MY_PAYMENTS_LIMIT, queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { PaginationMeta, Payment } from "@/types";

export const metadata: Metadata = { title: "Payments — BloodBridge" };

export default async function PaymentsPage() {
  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.payments.mine,
    queryFn: () =>
      serverApi<{ payments: Payment[]; meta: PaginationMeta }>("/payments/my", {
        query: { page: 1, limit: MY_PAYMENTS_LIMIT },
      }),
  });

  return (
    <>
      <PageHeader title="Payments" description="Service fees you've paid through Stripe." />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PaymentHistory />
      </HydrationBoundary>
    </>
  );
}
