"use client";

import { ActivityIcon, Loader2Icon, RotateCcwIcon } from "lucide-react";

import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditLogs } from "@/hooks/use-admin";
import { useQueryParams } from "@/hooks/use-query-params";
import { ROLE_LABELS } from "@/lib/constants";
import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCES,
  humanize,
  parseAuditFilters,
} from "@/lib/filters/audit-filters";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/types";

const actionTone = (action: string) => {
  if (/DELETED|DEACTIVATED/.test(action)) return "bg-red-500/15 text-red-700 dark:text-red-300";
  if (/CREATED|REGISTERED|ACTIVATED/.test(action)) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (/PAYMENT/.test(action)) return "bg-violet-500/15 text-violet-700 dark:text-violet-300";
  return "bg-muted text-muted-foreground";
};

function Details({ log }: { log: AuditLog }) {
  if (!log.details || Object.keys(log.details).length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <details className="group text-xs">
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View</summary>
      <pre className="mt-1 max-w-xs overflow-x-auto rounded-md bg-muted p-2 font-mono">
        {JSON.stringify(log.details, null, 2)}
      </pre>
    </details>
  );
}

export function AuditLogs() {
  const { searchParams, setParams } = useQueryParams();
  const { filters, query } = parseAuditFilters(searchParams);
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useAuditLogs(query);

  return (
    <>
      <Card>
        <CardContent>
          <form
            aria-label="Filter audit logs"
            onSubmit={(e) => e.preventDefault()}
            className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="audit-action">Action</Label>
              <Select value={filters.action ?? "ALL"} onValueChange={(v) => setParams({ action: v === "ALL" ? null : v, page: null })}>
                <SelectTrigger id="audit-action" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All actions</SelectItem>
                  {AUDIT_ACTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {humanize(a)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="audit-entity">Resource</Label>
              <Select value={filters.entity ?? "ALL"} onValueChange={(v) => setParams({ entity: v === "ALL" ? null : v, page: null })}>
                <SelectTrigger id="audit-entity" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All resources</SelectItem>
                  {AUDIT_RESOURCES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {humanize(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              disabled={!filters.action && !filters.entity}
              onClick={() => setParams({ action: null, entity: null, page: null })}
            >
              <RotateCcwIcon /> Reset
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="flex min-h-5 items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
        {data && `${data.meta.total} event${data.meta.total !== 1 ? "s" : ""}`}
        {isFetching && !isPending && <Loader2Icon className="size-4 animate-spin" aria-label="Updating" />}
      </p>

      {isPending ? (
        <TableSkeleton rows={10} columns={5} />
      ) : isError ? (
        <ErrorState error={error} title="Couldn't load audit logs" onRetry={() => refetch()} />
      ) : data.logs.length === 0 ? (
        <EmptyState icon={ActivityIcon} title="No events match these filters" />
      ) : (
        <Card className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Resource</TableHead>
                  <TableHead className="hidden lg:table-cell">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.logs.map((log) => (
                  <TableRow key={log.id} className="align-top">
                    <TableCell className="whitespace-nowrap">
                      <time dateTime={log.createdAt} title={formatDate(log.createdAt, true)}>
                        {formatRelative(log.createdAt)}
                      </time>
                      <p className="text-xs text-muted-foreground">{formatDate(log.createdAt, true)}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={actionTone(log.action)}>
                        {humanize(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <>
                          <p className="font-medium">{log.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ROLE_LABELS[log.user.role]} · {log.user.email}
                          </p>
                        </>
                      ) : (
                        <span className="text-muted-foreground">System</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p>{humanize(log.resource)}</p>
                      {log.resourceId && (
                        <p className="font-mono text-xs text-muted-foreground">{log.resourceId.slice(0, 8)}</p>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Details log={log} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {data && (
        <DataPagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={(p) => setParams({ page: p === 1 ? null : p })}
        />
      )}
    </>
  );
}
