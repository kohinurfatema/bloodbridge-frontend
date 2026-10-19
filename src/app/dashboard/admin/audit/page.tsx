import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AuditLogs } from "@/components/admin/audit-logs";
import { PageHeader } from "@/components/shared/page-header";
import { serverApi } from "@/lib/api/server";
import { parseAuditFilters } from "@/lib/filters/audit-filters";
import { queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { AuditLog, PaginationMeta } from "@/types";

export const metadata: Metadata = { title: "Audit logs — BloodBridge" };

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { query } = parseAuditFilters(await searchParams);
  const queryClient = getServerQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.admin.audit(query),
    queryFn: () =>
      serverApi<{ logs: AuditLog[]; meta: PaginationMeta }>("/audit", { query: { ...query } }),
  });

  return (
    <>
      <PageHeader title="Audit logs" description="A record of sign-ins and important changes across the platform." />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AuditLogs />
      </HydrationBoundary>
    </>
  );
}
