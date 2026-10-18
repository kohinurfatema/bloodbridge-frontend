import type { AdminUserParams, AuditLogParams } from "@/services/admin.service";
import type { DonorSearchParams } from "@/services/donor.service";
import type { RequestListParams } from "@/services/request.service";

// The requester overview filters and paginates on the client, so it fetches
// the full history once and lets TanStack Query cache it.
export const MY_REQUESTS_LIMIT = 100;
export const MY_PAYMENTS_LIMIT = 100;
export const MY_MATCHES_LIMIT = 100;

// Central query key factory so cache invalidation stays consistent.
export const queryKeys = {
  me: ["me"] as const,
  donorProfile: ["donor", "profile"] as const,
  donors: (params: DonorSearchParams) => ["donors", params] as const,
  requests: {
    all: ["requests"] as const,
    list: (params: RequestListParams) => ["requests", "list", params] as const,
    mine: ["requests", "mine"] as const,
    detail: (id: string) => ["requests", "detail", id] as const,
  },
  matches: {
    all: ["matches"] as const,
    mine: ["matches", "mine"] as const,
    forRequest: (requestId: string) => ["matches", "request", requestId] as const,
  },
  alerts: (params: { page?: number; active?: boolean }) => ["alerts", params] as const,
  payments: {
    all: ["payments"] as const,
    mine: ["payments", "mine"] as const,
  },
  admin: {
    stats: ["admin", "stats"] as const,
    users: (params: AdminUserParams) => ["admin", "users", params] as const,
    audit: (params: AuditLogParams) => ["admin", "audit", params] as const,
  },
};
