import { z } from "zod";

// Mirrors initiatePaymentSchema in the backend (amount >= 1, 3-letter currency).
export const paymentSchema = z.object({
  amount: z
    .number({ error: "Enter an amount" })
    .min(1, "Minimum amount is $1")
    .max(1000, "Maximum amount is $1,000")
    .refine((v) => Number.isInteger(v * 100), "Use at most 2 decimal places"),
});

export type PaymentValues = z.infer<typeof paymentSchema>;
