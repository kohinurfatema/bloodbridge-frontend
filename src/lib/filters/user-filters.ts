import type { AdminUserParams } from "@/services/admin.service";
import type { Role } from "@/types";

export const USER_PAGE_SIZE = 10;

const ROLES: Role[] = ["DONOR", "REQUESTER", "ADMIN"];

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

const read = (params: RawParams, key: string) => {
  const value = params instanceof URLSearchParams ? params.get(key) : params[key];
  return Array.isArray(value) ? value[0] : (value ?? undefined);
};

/** URL → API params for the admin user table (shared by server and client). */
export function parseUserFilters(params: RawParams) {
  const role = read(params, "role") as Role | undefined;
  const status = read(params, "status");
  const page = Number(read(params, "page"));

  const filters = {
    search: read(params, "search")?.trim() || undefined,
    role: role && ROLES.includes(role) ? role : undefined,
    status: status === "active" || status === "inactive" ? status : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };

  const query: AdminUserParams = {
    search: filters.search,
    role: filters.role,
    isActive: filters.status ? filters.status === "active" : undefined,
    page: filters.page,
    limit: USER_PAGE_SIZE,
  };

  return { filters, query };
}
