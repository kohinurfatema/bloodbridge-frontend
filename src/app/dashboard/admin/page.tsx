import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AdminOverview } from "@/components/admin/admin-overview";
import { PageHeader } from "@/components/shared/page-header";
import { serverApi } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { DashboardStats } from "@/types";

export const metadata: Metadata = { title: "Admin dashboard — BloodBridge" };

export default async function AdminDashboardPage() {
  const user = await getSession();
  const queryClient = getServerQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: () => serverApi<DashboardStats>("/admin/stats"),
  });

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name}`}
        description="Monitor platform activity and keep donations moving."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminOverview />
      </HydrationBoundary>
    </>
  );
}
