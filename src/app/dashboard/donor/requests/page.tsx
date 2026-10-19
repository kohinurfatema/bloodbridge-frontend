import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { OpenRequests } from "@/components/donor/open-requests";
import { PageHeader } from "@/components/shared/page-header";
import { ApiError } from "@/lib/api/client";
import { serverApi } from "@/lib/api/server";
import { parseRequestFilters } from "@/lib/filters/request-filters";
import { queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { BloodRequest, DonorProfile, EmergencyAlert, PaginationMeta } from "@/types";

export const metadata: Metadata = { title: "Open requests — BloodBridge" };

export default async function OpenRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { query } = parseRequestFilters(await searchParams, "PENDING");
  const queryClient = getServerQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.requests.list(query),
      queryFn: () =>
        serverApi<{ requests: BloodRequest[]; meta: PaginationMeta }>("/requests", {
          query: { ...query },
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.donorProfile,
      queryFn: () =>
        serverApi<DonorProfile>("/donors/me").catch((error) => {
          if (error instanceof ApiError && error.status === 404) return null;
          throw error;
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
        title="Open requests"
        description="Patients currently waiting for blood. Emergencies are listed first."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <OpenRequests />
      </HydrationBoundary>
    </>
  );
}
