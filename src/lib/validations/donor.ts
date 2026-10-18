import { z } from "zod";

import { BLOOD_TYPES } from "@/lib/constants";

const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

// Mirrors registerDonorSchema / updateDonorSchema in the backend.
export const donorProfileSchema = z.object({
  bloodType: z.enum(BLOOD_TYPES, { error: "Select your blood type" }),
  location: z
    .string()
    .trim()
    .min(2, "Location is required")
    .max(120, "Location is too long"),
  lastDonationDate: z
    .date()
    .refine((d) => d <= endOfToday(), "Last donation can't be in the future")
    .optional(),
  isAvailable: z.boolean(),
});

export type DonorProfileValues = z.infer<typeof donorProfileSchema>;
