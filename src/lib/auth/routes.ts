import type { Role } from "@/types";

export const LOGIN_PATH = "/login";

export const AUTH_PAGES = ["/login", "/register"];

export const dashboardPath = (role: Role) => `/dashboard/${role.toLowerCase()}`;

// First matching prefix wins. Paths not listed only need a valid session.
export const ROLE_ROUTES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard/admin", roles: ["ADMIN"] },
  { prefix: "/dashboard/donor", roles: ["DONOR"] },
  { prefix: "/dashboard/requester", roles: ["REQUESTER"] },
  { prefix: "/payment", roles: ["REQUESTER"] },
];

export const PROTECTED_PREFIXES = ["/dashboard", "/payment"];

const matches = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export const isProtected = (pathname: string) =>
  PROTECTED_PREFIXES.some((p) => matches(pathname, p));

export const isAuthPage = (pathname: string) =>
  AUTH_PAGES.some((p) => matches(pathname, p));

export function canAccess(pathname: string, role: Role) {
  const rule = ROLE_ROUTES.find((r) => matches(pathname, r.prefix));
  return !rule || rule.roles.includes(role);
}
