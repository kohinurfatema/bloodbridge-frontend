import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AdminRequests } from "@/components/admin/admin-requests";
import { PageHeader } from "@/components/shared/page-header";
import { serverApi } from "@/lib/api/server";
import { parseRequestFilters } from "@/lib/filters/request-filters";
import { queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { BloodRequest, PaginationMeta } from "@/types";

export const metadata: Metadata = { title: "Blood requests — BloodBridge" };

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { query } = parseRequestFilters(await searchParams);
  const queryClient = getServerQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.requests.list(query),
    queryFn: () =>
      serverApi<{ requests: BloodRequest[]; meta: PaginationMeta }>("/requests", {
        query: { ...query },
      }),
  });

  return (
    <>
      <PageHeader
        title="Blood requests"
        description="Match pending requests with available donors and keep statuses up to date."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminRequests />
      </HydrationBoundary>
    </>
  );
}
