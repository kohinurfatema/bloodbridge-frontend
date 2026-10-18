import { z } from "zod";

// Mirrors loginSchema in the backend (auth.validation.ts).
export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

const phoneRegex = /^\+?[0-9][0-9\s-]{6,19}$/;

// Mirrors registerSchema in the backend; confirmPassword is frontend-only.
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name is too long"),
    email: z.email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .refine((v) => v === "" || phoneRegex.test(v), "Enter a valid phone number"),
    role: z.enum(["DONOR", "REQUESTER"], { error: "Choose how you'll use BloodBridge" }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;
