"use client";

import { useEffect, useState } from "react";
import { RotateCcwIcon, SearchIcon } from "lucide-react";

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
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryParams } from "@/hooks/use-query-params";
import { BLOOD_TYPE_LABELS, BLOOD_TYPES, REQUEST_STATUSES, URGENCIES } from "@/lib/constants";
import { type parseRequestFilters, REQUEST_SORTS } from "@/lib/filters/request-filters";

type Filters = ReturnType<typeof parseRequestFilters>["filters"];

interface RequestFilterBarProps {
  filters: Filters;
  /** Status options are hidden for donors, who only browse open requests. */
  showStatus?: boolean;
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const titleCase = (v: string) => v.charAt(0) + v.slice(1).toLowerCase();

/** URL-driven filters for blood request lists (donor and admin views). */
export function RequestFilterBar({ filters, showStatus = false }: RequestFilterBarProps) {
  const { setParams } = useQueryParams();
  const [location, setLocation] = useState(filters.location ?? "");
  const debouncedLocation = useDebounce(location.trim());

  useEffect(() => {
    if (debouncedLocation !== (filters.location ?? "")) {
      setParams({ location: debouncedLocation, page: null });
    }
    // Only react to the debounced value, not to URL changes it causes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLocation]);

  const set = (key: string, value: string, empty = "ALL") =>
    setParams({ [key]: value === empty ? null : value, page: null });

  const reset = () => {
    setLocation("");
    setParams({ bloodType: null, urgency: null, status: null, location: null, sort: null, page: null });
  };

  return (
    <Card>
      <CardContent>
        <form
          role="search"
          aria-label="Filter blood requests"
          onSubmit={(e) => e.preventDefault()}
          className={
            showStatus
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto] lg:items-end"
              : "grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-end"
          }
        >
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="req-location">Location</Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="req-location"
                type="search"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or area"
                className="pl-8"
              />
            </div>
          </div>
          <FilterSelect
            id="req-blood"
            label="Blood type"
            value={filters.bloodType ?? "ALL"}
            onChange={(v) => set("bloodType", v)}
            options={[
              { value: "ALL", label: "All types" },
              ...BLOOD_TYPES.map((t) => ({ value: t, label: BLOOD_TYPE_LABELS[t] })),
            ]}
          />
          <FilterSelect
            id="req-urgency"
            label="Urgency"
            value={filters.urgency ?? "ALL"}
            onChange={(v) => set("urgency", v)}
            options={[
              { value: "ALL", label: "Any urgency" },
              ...URGENCIES.map((u) => ({ value: u, label: titleCase(u) })),
            ]}
          />
          {showStatus && (
            <FilterSelect
              id="req-status"
              label="Status"
              value={filters.status ?? "ALL"}
              onChange={(v) => setParams({ status: v === "ALL" ? null : v, page: null })}
              options={[
                { value: "ALL", label: "Any status" },
                ...REQUEST_STATUSES.map((s) => ({ value: s, label: titleCase(s) })),
              ]}
            />
          )}
          <FilterSelect
            id="req-sort"
            label="Sort by"
            value={filters.sort}
            onChange={(v) => set("sort", v, "urgent")}
            options={Object.entries(REQUEST_SORTS).map(([value, { label }]) => ({ value, label }))}
          />
          <Button type="button" variant="ghost" onClick={reset} className="lg:mb-0">
            <RotateCcwIcon /> Reset
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
