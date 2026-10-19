import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { ProfileSettings } from "@/components/profile/profile-settings";
import { PageHeader } from "@/components/shared/page-header";
import { serverApi } from "@/lib/api/server";
import { queryKeys } from "@/lib/query-keys";
import { getServerQueryClient } from "@/lib/server-query-client";
import type { User } from "@/types";

export const metadata: Metadata = { title: "Profile settings — BloodBridge" };

// Shared by all three roles; role-specific sections render inside.
export default async function ProfileSettingsPage() {
  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.me,
    queryFn: () => serverApi<User>("/users/me"),
  });

  return (
    <>
      <PageHeader title="Profile settings" description="Manage your account details." />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProfileSettings />
      </HydrationBoundary>
    </>
  );
}
