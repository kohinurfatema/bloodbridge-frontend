import { api } from "@/lib/api/client";
import type {
  BloodRequest,
  BloodType,
  PaginationMeta,
  RequestStatus,
  Urgency,
} from "@/types";

export interface RequestListParams {
  bloodType?: BloodType;
  urgency?: Urgency;
  status?: RequestStatus;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "urgency" | "requiredDate";
  sortOrder?: "asc" | "desc";
}

export interface CreateRequestInput {
  bloodType: BloodType;
  urgency?: Urgency;
  units?: number;
  hospital?: string;
  location: string;
  notes?: string;
  requiredDate: string;
}

type RequestList = { requests: BloodRequest[]; meta: PaginationMeta };

export const requestService = {
  list: (query: RequestListParams = {}) =>
    api<RequestList>("/requests", { query: { ...query } }),
  listMine: (page = 1, limit = 10) =>
    api<RequestList>("/requests/my", { query: { page, limit } }),
  getById: (id: string) => api<BloodRequest>(`/requests/${id}`),
  create: (body: CreateRequestInput) =>
    api<BloodRequest>("/requests", { method: "POST", body }),
  updateStatus: (id: string, status: RequestStatus) =>
    api<BloodRequest>(`/requests/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),
  remove: (id: string) =>
    api<Record<string, never>>(`/requests/${id}`, { method: "DELETE" }),
};
