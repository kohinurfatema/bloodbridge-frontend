import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { DonorProfileForm } from "@/components/donor/donor-profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { ApiError } from "@/lib/api/client";
import { serverApi } from "@/lib/api/server";
import { queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { DonorProfile } from "@/types";

export const metadata: Metadata = { title: "Donor profile — BloodBridge" };

export default async function DonorProfilePage() {
  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.donorProfile,
    queryFn: () =>
      serverApi<DonorProfile>("/donors/me").catch((error) => {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }),
  });

  return (
    <>
      <PageHeader
        title="Donor profile"
        description="Keep your details current so we can match you with the right patients."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DonorProfileForm />
      </HydrationBoundary>
    </>
  );
}
