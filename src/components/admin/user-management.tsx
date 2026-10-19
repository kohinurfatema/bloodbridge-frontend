"use client";

import { useEffect, useState } from "react";
import {
  Loader2Icon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldIcon,
  Trash2Icon,
  UserCheckIcon,
  UserXIcon,
  UsersIcon,
} from "lucide-react";

import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { BloodTypeBadge } from "@/components/shared/status-badges";
import { TableSkeleton } from "@/components/skeletons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { useAdminUsers, useDeleteUser, useToggleUserStatus } from "@/hooks/use-admin";
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryParams } from "@/hooks/use-query-params";
import { ROLE_LABELS } from "@/lib/constants";
import { parseUserFilters } from "@/lib/filters/user-filters";
import { formatDate, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminUserRow, Role } from "@/types";

const ROLE_STYLES: Record<Role, string> = {
  ADMIN: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  DONOR: "bg-primary/10 text-primary",
  REQUESTER: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
};

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
      <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden /> Active
    </Badge>
  ) : (
    <Badge variant="secondary" className="text-muted-foreground">
      <span className="size-1.5 rounded-full bg-muted-foreground" aria-hidden /> Inactive
    </Badge>
  );
}

function UserActions({ user, onDelete }: { user: AdminUserRow; onDelete: (u: AdminUserRow) => void }) {
  const toggle = useToggleUserStatus();

  // The backend does not allow admins to change other admins.
  if (user.role === "ADMIN") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <ShieldIcon className="size-3.5" aria-hidden /> Protected
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.name}`}>
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => toggle.mutate(user)}>
          {user.isActive ? (
            <>
              <UserXIcon /> Deactivate
            </>
          ) : (
            <>
              <UserCheckIcon /> Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(user)}>
          <Trash2Icon /> Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserIdentity({ user }: { user: AdminUserRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar>
        <AvatarFallback className="bg-muted text-xs font-semibold">{initials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
  );
}

export function UserManagement() {
  const { searchParams, setParams } = useQueryParams();
  const { filters, query } = parseUserFilters(searchParams);
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useAdminUsers(query);
  const remove = useDeleteUser();
  const [pendingDelete, setPendingDelete] = useState<AdminUserRow | null>(null);

  const [search, setSearch] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(search.trim());
  useEffect(() => {
    if (debouncedSearch !== (filters.search ?? "")) setParams({ search: debouncedSearch, page: null });
    // Only react to the debounced value, not to URL changes it causes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const hasFilters = !!(filters.search || filters.role || filters.status);
  const reset = () => {
    setSearch("");
    setParams({ search: null, role: null, status: null, page: null });
  };

  return (
    <>
      <Card>
        <CardContent>
          <form
            role="search"
            aria-label="Filter users"
            onSubmit={(e) => e.preventDefault()}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end"
          >
            <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="user-search">Search</Label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="user-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name or email"
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-role">Role</Label>
              <Select value={filters.role ?? "ALL"} onValueChange={(v) => setParams({ role: v === "ALL" ? null : v, page: null })}>
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All roles</SelectItem>
                  {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-status">Status</Label>
              <Select value={filters.status ?? "all"} onValueChange={(v) => setParams({ status: v === "all" ? null : v, page: null })}>
                <SelectTrigger id="user-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="ghost" onClick={reset} disabled={!hasFilters}>
              <RotateCcwIcon /> Reset
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="flex min-h-5 items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
        {data && `${data.meta.total} user${data.meta.total !== 1 ? "s" : ""}`}
        {isFetching && !isPending && <Loader2Icon className="size-4 animate-spin" aria-label="Updating" />}
      </p>

      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState error={error} title="Couldn't load users" onRetry={() => refetch()} />
      ) : data.users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users found" description="Try a different name, role or status." />
      ) : (
        <Card className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
          <CardContent>
            {/* Desktop table */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Blood</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((u) => (
                  <TableRow key={u.id} className={cn(!u.isActive && "text-muted-foreground")}>
                    <TableCell className="max-w-64">
                      <UserIdentity user={u} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={ROLE_STYLES[u.role]}>
                        {ROLE_LABELS[u.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.donorProfile ? <BloodTypeBadge type={u.donorProfile.bloodType} size="sm" /> : "—"}
                    </TableCell>
                    <TableCell className="tabular-nums">{u.phone ?? "—"}</TableCell>
                    <TableCell>
                      <ActiveBadge active={u.isActive} />
                    </TableCell>
                    <TableCell>{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <UserActions user={u} onDelete={setPendingDelete} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Mobile cards */}
            <ul className="divide-y md:hidden">
              {data.users.map((u) => (
                <li key={u.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1 space-y-2">
                    <UserIdentity user={u} />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className={ROLE_STYLES[u.role]}>
                        {ROLE_LABELS[u.role]}
                      </Badge>
                      <ActiveBadge active={u.isActive} />
                      {u.donorProfile && <BloodTypeBadge type={u.donorProfile.bloodType} size="sm" />}
                    </div>
                  </div>
                  <UserActions user={u} onDelete={setPendingDelete} />
                </li>
              ))}
            </ul>
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

      {/* One dialog for the whole table, opened from any row's menu */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Their account will be deactivated and removed from the platform. Their past requests
              and donations stay in the records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Keep user</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingDelete) {
                  remove.mutate(pendingDelete, { onSettled: () => setPendingDelete(null) });
                }
              }}
            >
              {remove.isPending && <Loader2Icon className="animate-spin" aria-hidden />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
