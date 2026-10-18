import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { DonorOverview } from "@/components/donor/donor-overview";
import { PageHeader } from "@/components/shared/page-header";
import { ApiError } from "@/lib/api/client";
import { serverApi } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { MY_MATCHES_LIMIT, queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { DonationMatch, DonorProfile, EmergencyAlert, PaginationMeta } from "@/types";

export const metadata: Metadata = { title: "Donor dashboard — BloodBridge" };

export default async function DonorDashboardPage() {
  const user = await getSession();
  const queryClient = getServerQueryClient();

  // Prefetch in parallel; a missing donor profile (404) is a valid state.
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.donorProfile,
      queryFn: () =>
        serverApi<DonorProfile>("/donors/me").catch((error) => {
          if (error instanceof ApiError && error.status === 404) return null;
          throw error;
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.matches.mine,
      queryFn: () =>
        serverApi<{ matches: DonationMatch[]; meta: PaginationMeta }>("/matches/my", {
          query: { page: 1, limit: MY_MATCHES_LIMIT },
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.alerts({ active: true }),
      queryFn: () =>
        serverApi<{ alerts: EmergencyAlert[]; meta: PaginationMeta }>("/alerts", {
          query: { active: true, limit: 20 },
        }),
    }),
  ]);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name.split(" ")[0]}`}
        description="Thank you for being ready to save a life."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DonorOverview />
      </HydrationBoundary>
    </>
  );
}
