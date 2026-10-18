import { z } from "zod";

import { BLOOD_TYPES, URGENCIES } from "@/lib/constants";

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Mirrors createRequestSchema in the backend (bloodRequest.validation.ts).
// requiredDate is a Date here and converted to an ISO string on submit.
export const createRequestSchema = z.object({
  bloodType: z.enum(BLOOD_TYPES, { error: "Select the blood type needed" }),
  urgency: z.enum(URGENCIES),
  units: z
    .number({ error: "Enter the number of units" })
    .int("Units must be a whole number")
    .min(1, "At least 1 unit is required")
    .max(10, "For more than 10 units, contact the blood bank directly"),
  hospital: z
    .string()
    .trim()
    .refine((v) => v === "" || v.length >= 2, "Hospital name must be at least 2 characters")
    .refine((v) => v.length <= 120, "Hospital name is too long"),
  location: z
    .string()
    .trim()
    .min(2, "Location is required")
    .max(120, "Location is too long"),
  requiredDate: z
    .date({ error: "Pick the date blood is needed by" })
    .refine((d) => d >= startOfToday(), "Date can't be in the past"),
  notes: z.string().trim().max(500, "Notes can be at most 500 characters"),
});

export type CreateRequestValues = z.infer<typeof createRequestSchema>;
