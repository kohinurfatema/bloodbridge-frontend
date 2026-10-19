import { z } from "zod";

// Mirrors the backend: POST /alerts requires a requestId.
export const createAlertSchema = z.object({
  requestId: z.string().min(1, "Choose the request this emergency is for"),
});

export type CreateAlertValues = z.infer<typeof createAlertSchema>;
