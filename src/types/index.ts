// Types mirror the BloodBridge backend Prisma schema and response shapes.

export type Role = "DONOR" | "REQUESTER" | "ADMIN";

export type BloodType =
  | "A_POS"
  | "A_NEG"
  | "B_POS"
  | "B_NEG"
  | "AB_POS"
  | "AB_NEG"
  | "O_POS"
  | "O_NEG";

export type Urgency = "NORMAL" | "URGENT" | "EMERGENCY";
export type RequestStatus = "PENDING" | "MATCHED" | "FULFILLED" | "CANCELLED";
export type MatchStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors: string[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResult {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
}

export interface DonorProfile {
  id: string;
  userId: string;
  bloodType: BloodType;
  location: string;
  isAvailable: boolean;
  lastDonationDate: string | null;
  totalDonations: number;
  medicalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  donorProfile?: DonorProfile | null;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  donorProfile: Pick<DonorProfile, "bloodType" | "isAvailable" | "totalDonations"> | null;
}

export interface DonorSearchResult extends DonorProfile {
  user: { id: string; name: string; phone: string | null };
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  bloodType: BloodType;
  units: number;
  urgency: Urgency;
  status: RequestStatus;
  location: string;
  hospital: string | null;
  notes: string | null;
  requiredDate: string;
  createdAt: string;
  updatedAt: string;
  requester?: { id: string; name: string; email?: string; phone: string | null };
  matches?: {
    id: string;
    status: MatchStatus;
    createdAt?: string;
    donor: { name: string; phone: string | null };
  }[];
}

export interface DonationMatch {
  id: string;
  requestId: string;
  donorId: string;
  donorProfileId: string;
  status: MatchStatus;
  scheduledDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  request?: Pick<
    BloodRequest,
    "id" | "bloodType" | "hospital" | "location" | "urgency" | "status"
  >;
  donor?: { id: string; name: string; phone: string | null };
  donorProfile?: Pick<DonorProfile, "id" | "bloodType" | "location">;
}

export interface Payment {
  id: string;
  requestId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripeSessionId: string | null;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  request?: Pick<BloodRequest, "id" | "bloodType" | "hospital">;
}

export interface EmergencyAlert {
  id: string;
  requestId: string;
  notifiedCount: number;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  request?: Pick<
    BloodRequest,
    "id" | "bloodType" | "hospital" | "location" | "urgency" | "status"
  >;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; role: Role } | null;
}

export interface DashboardStats {
  users: { total: number; donors: number; requesters: number; admins: number };
  bloodRequests: {
    total: number;
    pending: number;
    matched: number;
    fulfilled: number;
    cancelled: number;
  };
  donations: { total: number; completed: number };
  alerts: { total: number; unresolved: number };
  payments: { total: number; completed: number; totalRevenue: number };
  recent: {
    requests: Pick<
      BloodRequest,
      "id" | "hospital" | "bloodType" | "urgency" | "status" | "createdAt"
    >[];
    matches: (DonationMatch & {
      request: { hospital: string | null; bloodType: BloodType };
      donor: { name: string };
    })[];
  };
}
