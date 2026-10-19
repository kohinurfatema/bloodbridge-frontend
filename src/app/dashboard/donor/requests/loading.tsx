import { PageHeaderSkeleton, TableSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function OpenRequestsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading requests" className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <Skeleton className="h-24 w-full rounded-xl" />
      <TableSkeleton rows={5} />
    </div>
  );
}
