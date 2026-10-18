import { api } from "@/lib/api/client";
import type {
  AdminUserRow,
  AuditLog,
  DashboardStats,
  PaginationMeta,
  Role,
} from "@/types";

export interface AdminUserParams {
  role?: Role;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogParams {
  action?: string;
  entity?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export const adminService = {
  getStats: () => api<DashboardStats>("/admin/stats"),
  listUsers: (query: AdminUserParams = {}) =>
    api<{ users: AdminUserRow[]; meta: PaginationMeta }>("/admin/users", {
      query: { ...query },
    }),
  toggleUserStatus: (id: string) =>
    api<Pick<AdminUserRow, "id" | "name" | "email" | "role" | "isActive">>(
      `/admin/users/${id}/status`,
      { method: "PATCH" },
    ),
  deleteUser: (id: string) =>
    api<Record<string, never>>(`/admin/users/${id}`, { method: "DELETE" }),
  listAuditLogs: (query: AuditLogParams = {}) =>
    api<{ logs: AuditLog[]; meta: PaginationMeta }>("/audit", {
      query: { ...query },
    }),
};
