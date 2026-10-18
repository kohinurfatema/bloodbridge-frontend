import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { DonorSearch } from "@/components/donors/donor-search";
import { PageHeader } from "@/components/shared/page-header";
import { serverApi } from "@/lib/api/server";
import { parseDonorFilters } from "@/lib/filters/donor-filters";
import { queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { DonorSearchResult, PaginationMeta } from "@/types";

export const metadata: Metadata = { title: "Find donors — BloodBridge" };

export default async function FindDonorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Filters live in the URL, so the server can prefetch exactly what the
  // client will ask for — shared links and refreshes render instantly.
  const { query } = parseDonorFilters(await searchParams);
  const queryClient = getServerQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.donors(query),
    queryFn: () =>
      serverApi<{ donors: DonorSearchResult[]; meta: PaginationMeta }>("/donors", {
        query: { ...query },
      }),
  });

  return (
    <>
      <PageHeader
        title="Find donors"
        description="Search registered donors by blood type and location."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DonorSearch />
      </HydrationBoundary>
    </>
  );
}
