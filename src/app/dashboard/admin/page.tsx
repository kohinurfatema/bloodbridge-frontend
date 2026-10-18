import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin dashboard — BloodBridge" };

export default async function AdminDashboardPage() {
  const user = await getSession();
  return (
    <PageHeader
      title={`Welcome back, ${user?.name}`}
      description="Monitor platform activity and keep donations moving."
    />
  );
}
