import { api } from "@/lib/api/client";
import type {
  BloodType,
  DonorProfile,
  DonorSearchResult,
  PaginationMeta,
} from "@/types";

export interface DonorSearchParams {
  bloodType?: BloodType;
  location?: string;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "totalDonations" | "lastDonationDate";
  sortOrder?: "asc" | "desc";
}

export interface DonorProfileInput {
  bloodType: BloodType;
  location: string;
  lastDonationDate?: string;
  isAvailable?: boolean;
}

export const donorService = {
  search: (query: DonorSearchParams = {}) =>
    api<{ donors: DonorSearchResult[]; meta: PaginationMeta }>("/donors", {
      query: { ...query },
    }),
  getMyProfile: () => api<DonorProfile>("/donors/me"),
  register: (body: DonorProfileInput) =>
    api<DonorProfile>("/donors/register", { method: "POST", body }),
  updateMyProfile: (body: Partial<DonorProfileInput>) =>
    api<DonorProfile>("/donors/me", { method: "PATCH", body }),
};
