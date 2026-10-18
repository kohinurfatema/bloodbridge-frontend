import { api } from "@/lib/api/client";
import type { EmergencyAlert, PaginationMeta } from "@/types";

export const alertService = {
  list: (params: { page?: number; limit?: number; active?: boolean } = {}) =>
    api<{ alerts: EmergencyAlert[]; meta: PaginationMeta }>("/alerts", {
      query: { ...params },
    }),
  create: (requestId: string) =>
    api<EmergencyAlert>("/alerts", { method: "POST", body: { requestId } }),
  resolve: (id: string) =>
    api<EmergencyAlert>(`/alerts/${id}/resolve`, { method: "PATCH" }),
};
