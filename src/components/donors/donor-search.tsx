"use client";

import { useEffect, useState } from "react";
import { Loader2Icon, RotateCcwIcon, SearchIcon, UsersIcon } from "lucide-react";

import { DonorCard } from "@/components/donors/donor-card";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CardGridSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDebounce } from "@/hooks/use-debounce";
import { useDonorSearch } from "@/hooks/use-donors";
import { useQueryParams } from "@/hooks/use-query-params";
import { BLOOD_TYPE_LABELS, BLOOD_TYPES } from "@/lib/constants";
import { DONOR_SORTS, parseDonorFilters } from "@/lib/filters/donor-filters";

export function DonorSearch() {
  const { searchParams, setParams } = useQueryParams();
  const { filters, query } = parseDonorFilters(searchParams);
  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } =
    useDonorSearch(query);

  // Typing updates local state instantly; the URL (and API call) follows after a pause.
  const [location, setLocation] = useState(filters.location ?? "");
  const debouncedLocation = useDebounce(location.trim());

  useEffect(() => {
    if (debouncedLocation !== (filters.location ?? "")) {
      setParams({ location: debouncedLocation, page: null });
    }
    // Only react to the debounced value, not to URL changes it causes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLocation]);

  const hasFilters = !!(filters.bloodType || filters.location || !filters.available || filters.sort !== "newest");

  const resetFilters = () => {
    setLocation("");
    setParams({ bloodType: null, location: null, available: null, sort: null, page: null });
  };

  return (
    <>
      <Card>
        <CardContent>
          <form
            role="search"
            aria-label="Filter donors"
            onSubmit={(e) => e.preventDefault()}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1.5fr_1fr_auto] lg:items-end"
          >
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood type</Label>
              <Select
                value={filters.bloodType ?? "ALL"}
                onValueChange={(v) => setParams({ bloodType: v === "ALL" ? null : v, page: null })}
              >
                <SelectTrigger id="bloodType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All blood types</SelectItem>
                  {BLOOD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {BLOOD_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="location"
                  type="search"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or area, e.g. Dhaka"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort">Sort by</Label>
              <Select value={filters.sort} onValueChange={(v) => setParams({ sort: v === "newest" ? null : v, page: null })}>
                <SelectTrigger id="sort" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DONOR_SORTS).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex h-9 items-center gap-2">
              <Switch
                id="available"
                checked={filters.available}
                onCheckedChange={(checked) => setParams({ available: checked ? null : "all", page: null })}
              />
              <Label htmlFor="available" className="whitespace-nowrap">
                Available only
              </Label>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          {data && (
            <>
              {data.meta.total} donor{data.meta.total !== 1 && "s"} found
            </>
          )}
          {isFetching && !isPending && <Loader2Icon className="size-4 animate-spin" aria-label="Updating results" />}
        </p>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcwIcon /> Reset filters
          </Button>
        )}
      </div>

      {isPending ? (
        <CardGridSkeleton />
      ) : isError ? (
        <ErrorState error={error} title="Couldn't search donors" onRetry={() => refetch()} />
      ) : data.donors.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No donors match these filters"
          description="Try another blood type or location, or include donors who are currently unavailable."
          action={
            hasFilters && (
              <Button variant="outline" onClick={resetFilters}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <div className={isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.donors.map((donor) => (
              <li key={donor.id}>
                <DonorCard donor={donor} />
              </li>
            ))}
          </ul>
        </div>
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
