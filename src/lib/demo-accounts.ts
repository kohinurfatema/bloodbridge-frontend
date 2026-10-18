import type { Role } from "@/types";

// Seeded demo users on the live API, used by the one-click login buttons.
export const DEMO_ACCOUNTS: {
  role: Role;
  label: string;
  description: string;
  email: string;
  password: string;
}[] = [
  {
    role: "ADMIN",
    label: "Admin",
    description: "Stats, users, matching & audit logs",
    email: "admin@bloodbridge.com",
    password: "Admin@1234",
  },
  {
    role: "DONOR",
    label: "Donor",
    description: "Availability, matches & alerts",
    email: "donor@bloodbridge.com",
    password: "Donor@1234",
  },
  {
    role: "REQUESTER",
    label: "Requester",
    description: "Post requests, find donors & pay",
    email: "requester@bloodbridge.com",
    password: "Requester@1234",
  },
];
