import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAlertsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading alerts" className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <Skeleton className="h-9 w-56" />
      <CardGridSkeleton count={3} />
    </div>
  );
}
