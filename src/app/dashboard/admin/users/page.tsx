import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { UserManagement } from "@/components/admin/user-management";
import { PageHeader } from "@/components/shared/page-header";
import { serverApi } from "@/lib/api/server";
import { parseUserFilters } from "@/lib/filters/user-filters";
import { queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { AdminUserRow, PaginationMeta } from "@/types";

export const metadata: Metadata = { title: "Users — BloodBridge" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { query } = parseUserFilters(await searchParams);
  const queryClient = getServerQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.admin.users(query),
    queryFn: () =>
      serverApi<{ users: AdminUserRow[]; meta: PaginationMeta }>("/admin/users", {
        query: { ...query },
      }),
  });

  return (
    <>
      <PageHeader title="Users" description="Search accounts, deactivate misuse and remove users." />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <UserManagement />
      </HydrationBoundary>
    </>
  );
}
