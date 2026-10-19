import { BLOOD_TYPES, REQUEST_STATUSES, URGENCIES } from "@/lib/constants";
import type { RequestListParams } from "@/services/request.service";
import type { BloodType, RequestStatus, Urgency } from "@/types";

export const REQUEST_PAGE_SIZE = 10;

export const REQUEST_SORTS = {
  urgent: { label: "Most urgent", sortBy: "urgency", sortOrder: "desc" },
  soonest: { label: "Needed soonest", sortBy: "requiredDate", sortOrder: "asc" },
  newest: { label: "Newest", sortBy: "createdAt", sortOrder: "desc" },
} as const;

export type RequestSort = keyof typeof REQUEST_SORTS;

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

const read = (params: RawParams, key: string) => {
  const value = params instanceof URLSearchParams ? params.get(key) : params[key];
  return Array.isArray(value) ? value[0] : (value ?? undefined);
};

const oneOf = <T extends string>(list: readonly T[], value?: string) =>
  list.includes(value as T) ? (value as T) : undefined;

/**
 * URL → API params for blood request lists. Shared by Server Components
 * (prefetch) and the client so both use the same query key.
 * `defaultStatus` lets donors default to open (PENDING) requests while
 * admins default to everything; "?status=ALL" clears it explicitly.
 */
export function parseRequestFilters(params: RawParams, defaultStatus?: RequestStatus) {
  const rawStatus = read(params, "status");
  const sort = read(params, "sort");
  const page = Number(read(params, "page"));

  const filters = {
    bloodType: oneOf<BloodType>(BLOOD_TYPES, read(params, "bloodType")),
    urgency: oneOf<Urgency>(URGENCIES, read(params, "urgency")),
    status: rawStatus === "ALL" ? undefined : (oneOf<RequestStatus>(REQUEST_STATUSES, rawStatus) ?? defaultStatus),
    location: read(params, "location")?.trim() || undefined,
    sort: (sort && sort in REQUEST_SORTS ? sort : "urgent") as RequestSort,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };

  const { sortBy, sortOrder } = REQUEST_SORTS[filters.sort];
  const query: RequestListParams = {
    bloodType: filters.bloodType,
    urgency: filters.urgency,
    status: filters.status,
    location: filters.location,
    page: filters.page,
    limit: REQUEST_PAGE_SIZE,
    sortBy,
    sortOrder,
  };

  return { filters, query };
}
