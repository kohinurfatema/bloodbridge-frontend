import type { Metadata } from "next";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PlusIcon, SearchIcon } from "lucide-react";

import { RequesterOverview } from "@/components/requester/requester-overview";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { serverApi } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { MY_REQUESTS_LIMIT, queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { BloodRequest, PaginationMeta } from "@/types";

export const metadata: Metadata = { title: "Requester dashboard — BloodBridge" };

// Server Component: prefetches the requester's requests on the server and
// hands the cache to the client, so the table renders with data immediately
// while TanStack Query keeps it fresh afterwards.
export default async function RequesterDashboardPage() {
  const user = await getSession();
  const queryClient = getServerQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.requests.mine,
    queryFn: () =>
      serverApi<{ requests: BloodRequest[]; meta: PaginationMeta }>("/requests/my", {
        query: { page: 1, limit: MY_REQUESTS_LIMIT },
      }),
  });

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name.split(" ")[0]}`}
        description="Track your blood requests and find donors quickly."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/requester/donors">
                <SearchIcon /> Find donors
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/requester/requests/new">
                <PlusIcon /> New request
              </Link>
            </Button>
          </>
        }
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RequesterOverview />
      </HydrationBoundary>
    </>
  );
}
