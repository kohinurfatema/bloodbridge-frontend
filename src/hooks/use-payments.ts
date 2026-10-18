"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MY_PAYMENTS_LIMIT, queryKeys } from "@/lib/query-keys";
import { type InitiatePaymentInput, paymentService } from "@/services/payment.service";

export function useMyPayments() {
  return useQuery({
    queryKey: queryKeys.payments.mine,
    queryFn: () => paymentService.listMine(1, MY_PAYMENTS_LIMIT),
  });
}

/** Payment for one request, derived from the cached payment list. */
export function useRequestPayment(requestId: string) {
  return useQuery({
    queryKey: queryKeys.payments.mine,
    queryFn: () => paymentService.listMine(1, MY_PAYMENTS_LIMIT),
    select: (data) => data.payments.find((p) => p.requestId === requestId) ?? null,
  });
}

/** Creates a Stripe Checkout session and redirects the browser to it. */
export function useInitiatePayment() {
  return useMutation({
    mutationFn: (input: InitiatePaymentInput) => paymentService.initiate(input),
    onSuccess: ({ checkoutUrl }) => {
      window.location.assign(checkoutUrl);
    },
    onError: () => {},
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => paymentService.verify(sessionId),
    onSuccess: () => toast.success("Payment confirmed."),
    onError: (error) => toast.error(error.message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
  });
}
