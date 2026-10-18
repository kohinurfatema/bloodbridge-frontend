"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CheckCircle2Icon, HourglassIcon, ReceiptIcon, WalletIcon } from "lucide-react";

import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatCard } from "@/components/shared/stat-card";
import { BloodTypeBadge, StatusBadge } from "@/components/shared/status-badges";
import { StatCardsSkeleton, TableSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyPayments } from "@/hooks/use-payments";
import { useQueryParams } from "@/hooks/use-query-params";
import { formatCurrency, formatDate } from "@/lib/format";

const PAGE_SIZE = 10;

export function PaymentHistory() {
  const { data, isPending, isError, error, refetch } = useMyPayments();
  const { searchParams, setParams } = useQueryParams();

  const payments = useMemo(() => data?.payments ?? [], [data]);
  const summary = useMemo(() => {
    const completed = payments.filter((p) => p.status === "COMPLETED");
    return {
      totalPaid: completed.reduce((sum, p) => sum + p.amount, 0),
      completed: completed.length,
      pending: payments.filter((p) => p.status === "PENDING").length,
    };
  }, [payments]);

  if (isPending) {
    return (
      <>
        <StatCardsSkeleton count={3} />
        <TableSkeleton />
      </>
    );
  }
  if (isError) return <ErrorState error={error} title="Couldn't load payments" onRetry={() => refetch()} />;

  const totalPages = Math.max(1, Math.ceil(payments.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(searchParams.get("page")) || 1), totalPages);
  const visible = payments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <section aria-label="Payment summary" className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total paid" value={formatCurrency(summary.totalPaid)} icon={WalletIcon} tone="emerald" />
        <StatCard title="Completed" value={summary.completed} icon={CheckCircle2Icon} tone="violet" />
        <StatCard title="Awaiting confirmation" value={summary.pending} icon={HourglassIcon} tone="amber" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {payments.length === 0 ? (
            <EmptyState
              icon={ReceiptIcon}
              title="No payments yet"
              description="Service fees you pay for your blood requests will appear here."
              action={
                <Button variant="outline" asChild>
                  <Link href="/dashboard/requester">Go to my requests</Link>
                </Button>
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/requester/requests/${p.requestId}`}
                          className="flex items-center gap-2 font-medium hover:underline"
                        >
                          {p.request && <BloodTypeBadge type={p.request.bloodType} size="sm" />}
                          <span className="max-w-40 truncate sm:max-w-none">
                            {p.request?.hospital ?? "Blood request"}
                          </span>
                        </Link>
                        <span className="text-xs text-muted-foreground sm:hidden">{formatDate(p.createdAt)}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(p.createdAt, true)}</TableCell>
                      <TableCell className="hidden font-mono text-xs md:table-cell">
                        {p.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCurrency(p.amount, p.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <DataPagination
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => setParams({ page: p === 1 ? null : p })}
              />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
