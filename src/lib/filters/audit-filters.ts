import type { AuditLogParams } from "@/services/admin.service";

export const AUDIT_PAGE_SIZE = 20;

export const AUDIT_ACTIONS = [
  "USER_REGISTERED",
  "USER_LOGGED_IN",
  "USER_ACTIVATED",
  "USER_DEACTIVATED",
  "USER_DELETED",
  "BLOOD_REQUEST_CREATED",
  "MATCH_CREATED",
  "PAYMENT_INITIATED",
] as const;

export const AUDIT_RESOURCES = ["User", "BloodRequest", "DonationMatch", "Payment"] as const;

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

const read = (params: RawParams, key: string) => {
  const value = params instanceof URLSearchParams ? params.get(key) : params[key];
  return Array.isArray(value) ? value[0] : (value ?? undefined);
};

export function parseAuditFilters(params: RawParams) {
  const action = read(params, "action");
  const entity = read(params, "entity");
  const page = Number(read(params, "page"));

  const filters = {
    action: AUDIT_ACTIONS.includes(action as (typeof AUDIT_ACTIONS)[number]) ? action : undefined,
    entity: AUDIT_RESOURCES.includes(entity as (typeof AUDIT_RESOURCES)[number]) ? entity : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };

  const query: AuditLogParams = {
    action: filters.action,
    entity: filters.entity,
    page: filters.page,
    limit: AUDIT_PAGE_SIZE,
  };

  return { filters, query };
}

/** "BLOOD_REQUEST_CREATED" → "Blood request created" */
export const humanize = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
