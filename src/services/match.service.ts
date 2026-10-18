import { api } from "@/lib/api/client";
import type { DonationMatch, PaginationMeta } from "@/types";

export interface CreateMatchInput {
  requestId: string;
  donorId: string;
  donorProfileId: string;
}

export type MatchResponse = "ACCEPTED" | "DECLINED" | "COMPLETED";

export const matchService = {
  create: (body: CreateMatchInput) =>
    api<DonationMatch>("/matches", { method: "POST", body }),
  listMine: (page = 1, limit = 10) =>
    api<{ matches: DonationMatch[]; meta: PaginationMeta }>("/matches/my", {
      query: { page, limit },
    }),
  listForRequest: (requestId: string) =>
    api<DonationMatch[]>(`/matches/request/${requestId}`),
  respond: (id: string, response: MatchResponse) =>
    api<DonationMatch>(`/matches/${id}/respond`, {
      method: "PATCH",
      body: { response },
    }),
};
