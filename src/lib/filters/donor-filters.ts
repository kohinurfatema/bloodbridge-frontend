import { BLOOD_TYPES } from "@/lib/constants";
import type { DonorSearchParams } from "@/services/donor.service";
import type { BloodType } from "@/types";

export const DONOR_PAGE_SIZE = 9;

export const DONOR_SORTS = {
  newest: { label: "Newest donors", sortBy: "createdAt", sortOrder: "desc" },
  donations: { label: "Most donations", sortBy: "totalDonations", sortOrder: "desc" },
  rested: { label: "Longest since donating", sortBy: "lastDonationDate", sortOrder: "asc" },
} as const;

export type DonorSort = keyof typeof DONOR_SORTS;

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

const read = (params: RawParams, key: string) => {
  const value = params instanceof URLSearchParams ? params.get(key) : params[key];
  return Array.isArray(value) ? value[0] : (value ?? undefined);
};

/**
 * Turns URL search params into API params. Shared by the Server Component
 * (prefetch) and the client (useQuery) so both build the same query key.
 */
export function parseDonorFilters(params: RawParams) {
  const bloodType = read(params, "bloodType");
  const sort = read(params, "sort");
  const page = Number(read(params, "page"));

  const filters = {
    bloodType: BLOOD_TYPES.includes(bloodType as BloodType) ? (bloodType as BloodType) : undefined,
    location: read(params, "location")?.trim() || undefined,
    // Available-only is the default; "?available=all" shows everyone.
    available: read(params, "available") !== "all",
    sort: (sort && sort in DONOR_SORTS ? sort : "newest") as DonorSort,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };

  const { sortBy, sortOrder } = DONOR_SORTS[filters.sort];
  const query: DonorSearchParams = {
    bloodType: filters.bloodType,
    location: filters.location,
    isAvailable: filters.available ? true : undefined,
    page: filters.page,
    limit: DONOR_PAGE_SIZE,
    sortBy,
    sortOrder,
  };

  return { filters, query };
}
