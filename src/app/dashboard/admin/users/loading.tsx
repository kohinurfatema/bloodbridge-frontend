import { PageHeaderSkeleton, TableSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersLoading() {
  return (
    <div aria-busy="true" aria-label="Loading users" className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <Skeleton className="h-24 w-full rounded-xl" />
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
