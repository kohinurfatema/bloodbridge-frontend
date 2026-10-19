import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AdminAlerts } from "@/components/admin/admin-alerts";
import { PageHeader } from "@/components/shared/page-header";
import { serverApi } from "@/lib/api/server";
import { ALERT_PAGE_SIZE, queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { EmergencyAlert, PaginationMeta } from "@/types";

export const metadata: Metadata = { title: "Emergency alerts — BloodBridge" };

export default async function AdminAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string }>;
}) {
  const { view, page } = await searchParams;
  const query = {
    page: Math.max(1, Number(page) || 1),
    active: view !== "all",
    limit: ALERT_PAGE_SIZE,
  };
  const queryClient = getServerQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.alerts(query),
    queryFn: () =>
      serverApi<{ alerts: EmergencyAlert[]; meta: PaginationMeta }>("/alerts", { query }),
  });

  return (
    <>
      <PageHeader
        title="Emergency alerts"
        description="Life-threatening requests that need a donor now. Match a donor, then resolve."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminAlerts />
      </HydrationBoundary>
    </>
  );
}
