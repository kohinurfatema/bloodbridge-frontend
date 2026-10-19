import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { DonorMatches } from "@/components/donor/donor-matches";
import { PageHeader } from "@/components/shared/page-header";
import { ApiError } from "@/lib/api/client";
import { serverApi } from "@/lib/api/server";
import { MY_MATCHES_LIMIT, queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { DonationMatch, DonorProfile, PaginationMeta } from "@/types";

export const metadata: Metadata = { title: "My matches — BloodBridge" };

export default async function DonorMatchesPage() {
  const queryClient = getServerQueryClient();

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
  ]);

  return (
    <>
      <PageHeader
        title="My matches"
        description="Requests an admin matched you with. Accept to share your contact with the requester."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DonorMatches />
      </HydrationBoundary>
    </>
  );
}
