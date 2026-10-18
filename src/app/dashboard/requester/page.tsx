import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Requester dashboard — BloodBridge" };

export default async function RequesterDashboardPage() {
  const user = await getSession();
  return (
    <PageHeader
      title={`Welcome back, ${user?.name.split(" ")[0]}`}
      description="Track your blood requests and find donors quickly."
    />
  );
}
