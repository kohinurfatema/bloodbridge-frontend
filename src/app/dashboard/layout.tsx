import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SessionSync } from "@/components/dashboard/session-sync";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth/session";

// Server Component: reads the session once and passes it down, so the
// sidebar renders the correct role's navigation on first paint.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  // proxy.ts already guards this route; this is a second line of defence.
  if (!user) redirect("/login");

  const sidebarOpen = (await cookies()).get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <Suspense fallback={null}>
        <SessionSync user={user} />
      </Suspense>
      <AppSidebar user={user} />
      <SidebarInset id="main-content">
        <DashboardHeader role={user.role} />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
