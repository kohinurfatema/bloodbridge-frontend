"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { plural } from "@/lib/format";
import type { DashboardStats } from "@/types";

const pct = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);

/**
 * Requests by status — one series, so one hue and no legend; values sit at
 * each bar tip. Bars cap at 24px with a 4px rounded data-end.
 */
export function RequestStatusChart({ data }: { data: DashboardStats["bloodRequests"] }) {
  const rows = [
    { label: "Pending", value: data.pending },
    { label: "Matched", value: data.matched },
    { label: "Fulfilled", value: data.fulfilled },
    { label: "Cancelled", value: data.cancelled },
  ];
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requests by status</CardTitle>
        <CardDescription>{plural(data.total, "blood request")} in total</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4" aria-label="Blood requests by status">
          {rows.map((row) => (
            <li key={row.label} className="grid grid-cols-[5.5rem_1fr] items-center gap-3 text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* Hit target is the full row height, larger than the bar itself */}
                    <div
                      tabIndex={0}
                      role="img"
                      aria-label={`${row.label}: ${row.value} requests (${pct(row.value, data.total)}%)`}
                      className="group flex h-7 min-w-2 items-center rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      style={{ width: `${(row.value / max) * 85}%` }}
                    >
                      {/* A zero value draws no bar — only the label at the baseline */}
                      {row.value > 0 && (
                        <div className="h-5 w-full rounded-r-[4px] bg-chart-1 transition-opacity group-hover:opacity-80" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="font-semibold">{row.value}</span> {row.label.toLowerCase()} ·{" "}
                    {pct(row.value, data.total)}%
                  </TooltipContent>
                </Tooltip>
                <span className="text-sm font-medium tabular-nums">{row.value}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 ml-[6.25rem] border-t" aria-hidden />
      </CardContent>
    </Card>
  );
}

const ROLE_SERIES = [
  { key: "donors", label: "Donors", color: "bg-chart-1" },
  { key: "requesters", label: "Requesters", color: "bg-chart-2" },
  { key: "admins", label: "Admins", color: "bg-chart-3" },
] as const;

/**
 * Users by role — part-to-whole, so a single 100% stacked bar with a 2px
 * surface gap between segments. The legend carries counts as visible labels.
 */
export function UserRoleChart({ data }: { data: DashboardStats["users"] }) {
  const total = data.donors + data.requesters + data.admins;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users by role</CardTitle>
        <CardDescription>{plural(data.total, "active account")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex h-6 w-full gap-0.5" role="img" aria-label="Share of users by role">
          {ROLE_SERIES.map((s, i) => {
            const value = data[s.key];
            if (!value) return null;
            return (
              <Tooltip key={s.key}>
                <TooltipTrigger asChild>
                  <div
                    tabIndex={0}
                    role="img"
                    aria-label={`${s.label}: ${value} (${pct(value, total)}%)`}
                    className={`${s.color} h-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50 ${
                      i === 0 ? "rounded-l-[4px]" : ""
                    } ${i === ROLE_SERIES.length - 1 || ROLE_SERIES.slice(i + 1).every((n) => !data[n.key]) ? "rounded-r-[4px]" : ""}`}
                    style={{ flexGrow: value, flexBasis: 0, minWidth: 4 }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <span className="font-semibold">{value}</span> {s.label.toLowerCase()} · {pct(value, total)}%
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <ul className="grid gap-3 sm:grid-cols-3" aria-label="Legend">
          {ROLE_SERIES.map((s) => (
            <li key={s.key} className="flex items-start gap-2">
              <span className={`${s.color} mt-1 size-2.5 shrink-0 rounded-[2px]`} aria-hidden />
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-lg font-semibold">
                  {data[s.key]}{" "}
                  <span className="text-sm font-normal text-muted-foreground">{pct(data[s.key], total)}%</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/** Share of matches that ended in a completed donation, as a meter. */
export function CompletionMeter({ data }: { data: DashboardStats["donations"] }) {
  const rate = pct(data.completed, data.total);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation completion</CardTitle>
        <CardDescription>Matches that ended in a donation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-4xl font-bold">{rate}%</p>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-chart-1/20"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rate}
          aria-label="Donation completion rate"
        >
          <div className="h-full rounded-full bg-chart-1" style={{ width: `${rate}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">
          {data.completed} of {data.total} matches completed
        </p>
      </CardContent>
    </Card>
  );
}
