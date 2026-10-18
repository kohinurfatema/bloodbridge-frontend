import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function FindDonorsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading donors" className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <Skeleton className="h-24 w-full rounded-xl" />
      <CardGridSkeleton />
    </div>
  );
}
