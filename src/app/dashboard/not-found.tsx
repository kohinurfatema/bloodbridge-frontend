import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <EmptyState
      icon={SearchXIcon}
      title="Not found"
      description="The page or record you're looking for doesn't exist or was removed."
      action={
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      }
      className="my-auto"
    />
  );
}
