import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Donor dashboard — BloodBridge" };

export default async function DonorDashboardPage() {
  const user = await getSession();
  return (
    <PageHeader
      title={`Welcome back, ${user?.name.split(" ")[0]}`}
      description="Thank you for being ready to save a life."
    />
  );
}
