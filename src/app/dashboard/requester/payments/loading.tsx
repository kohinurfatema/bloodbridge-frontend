import { PageHeaderSkeleton, StatCardsSkeleton, TableSkeleton } from "@/components/skeletons";

export default function PaymentsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading payments" className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={3} />
      <TableSkeleton />
    </div>
  );
}
