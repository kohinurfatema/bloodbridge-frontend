import { api } from "@/lib/api/client";
import type { PaginationMeta, Payment } from "@/types";

export interface InitiatePaymentInput {
  requestId: string;
  amount: number;
  currency?: string;
}

export const paymentService = {
  initiate: (body: InitiatePaymentInput) =>
    api<{ payment: Payment; checkoutUrl: string }>("/payments/initiate", {
      method: "POST",
      body,
    }),
  verify: (sessionId: string) =>
    api<Payment>("/payments/verify", { query: { session_id: sessionId } }),
  listMine: (page = 1, limit = 10) =>
    api<{ payments: Payment[]; meta: PaginationMeta }>("/payments/my", {
      query: { page, limit },
    }),
};
