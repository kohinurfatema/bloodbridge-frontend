import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function DonorMatchesLoading() {
  return (
    <div aria-busy="true" aria-label="Loading matches" className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <Skeleton className="h-9 w-full max-w-lg" />
      <CardGridSkeleton count={4} />
    </div>
  );
}
