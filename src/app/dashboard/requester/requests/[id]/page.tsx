import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { RequestDetail } from "@/components/requester/request-detail";
import { ApiError } from "@/lib/api/client";
import { serverApi } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { BloodRequest } from "@/types";

export const metadata: Metadata = { title: "Request details — BloodBridge" };

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSession();
  const queryClient = getServerQueryClient();

  let request: BloodRequest;
  try {
    request = await serverApi<BloodRequest>(`/requests/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error; // handled by the nearest error.tsx
  }

  // Requesters may only open their own requests.
  if (request.requesterId !== user?.id) notFound();

  queryClient.setQueryData(queryKeys.requests.detail(id), request);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequestDetail id={id} />
    </HydrationBoundary>
  );
}
