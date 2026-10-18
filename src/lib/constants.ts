import type {
  BloodType,
  MatchStatus,
  RequestStatus,
  Role,
  Urgency,
} from "@/types";

export const BLOOD_TYPES = [
  "A_POS",
  "A_NEG",
  "B_POS",
  "B_NEG",
  "AB_POS",
  "AB_NEG",
  "O_POS",
  "O_NEG",
] as const satisfies readonly BloodType[];

export const BLOOD_TYPE_LABELS: Record<BloodType, string> = {
  A_POS: "A+",
  A_NEG: "A−",
  B_POS: "B+",
  B_NEG: "B−",
  AB_POS: "AB+",
  AB_NEG: "AB−",
  O_POS: "O+",
  O_NEG: "O−",
};

export const URGENCIES = [
  "NORMAL",
  "URGENT",
  "EMERGENCY",
] as const satisfies readonly Urgency[];

export const REQUEST_STATUSES = [
  "PENDING",
  "MATCHED",
  "FULFILLED",
  "CANCELLED",
] as const satisfies readonly RequestStatus[];

export const MATCH_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "COMPLETED",
] as const satisfies readonly MatchStatus[];

export const ROLE_LABELS: Record<Role, string> = {
  DONOR: "Donor",
  REQUESTER: "Requester",
  ADMIN: "Admin",
};
