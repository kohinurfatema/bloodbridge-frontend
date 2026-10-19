import { z } from "zod";

// Mirrors updateProfileSchema in the backend (user.validation.ts).
export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60, "Name is too long"),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\+?[0-9][0-9\s-]{6,19}$/.test(v), "Enter a valid phone number (at least 7 digits)"),
});

export type ProfileValues = z.infer<typeof profileSchema>;
