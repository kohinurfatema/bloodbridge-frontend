import { z } from "zod";

// Mirrors loginSchema in the backend (auth.validation.ts).
export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;
