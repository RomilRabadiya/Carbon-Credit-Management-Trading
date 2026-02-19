// Credit Types
export type CreditStatus = "ACTIVE" | "RETIRED" | "EXPIRED";

export interface Credit {
  id: number;
  serialNumber: string;
  amount: number;
  status: CreditStatus;
  issuanceDate: string;
}

export interface CreditsResponse {
  credits: Credit[];
  totalCount: number;
}

// Audit Types
export type AuditAction =
  | "EMISSION_REPORTED"
  | "VERIFICATION_COMPLETED" // Backend sends this, not APPROVED
  | "CREDIT_ISSUED"          // Backend sends this, not MINTED
  | "TRADE_COMPLETED"        // Backend sends this, not TRANSFERRED
  | "CREDIT_RETIRED";

export interface AuditEvent {
  id: number;
  action: AuditAction;
  timestamp: string;
  actor: string;
  details: string;
}

export interface AuditChainResponse {
  serialNumber: string;
  events: AuditEvent[];
}

// User & Auth Types
export type UserRole = "USER" | "VERIFIER" | "ADMIN";

export interface User {
  id: string | number; // Backend sends Long, Supabase sends UUID string
  email: string;
  name: string;
  organizationId?: string | number;
  organizationName?: string;
  role?: string; // Backend sends string, strict UserRole might cause issues if case matches don't align
  isProfileComplete?: boolean;
}

export interface VerificationRequest {
  id: number;
  reportId: number;
  projectId: number;
  organizationId: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verifiedAt?: string;
  carbonCreditsCalculated?: number;
  remarks?: string;
  createdAt: string;
  // Frontend computed fields (optional)
  projectName?: string;
  organizationName?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Activity Types
export interface Activity {
  id: string;
  type: "mint" | "transfer" | "retire" | "sale";
  description: string;
  amount: number;
  timestamp: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalCarbonShare: number;
  creditsMinted: number;
  creditsRetired: number;
}

export interface MarketListing {
  id: string; // UUID from backend
  creditId: number;
  sellerId: number; // Changed from string to number
  pricePerUnit: number; // Backend sends pricePerUnit, not pricePerCredit
  status: "ACTIVE" | "SOLD" | "CANCELLED";
  createdAt: string;
  // Frontend computed/fetched fields
  sellerName?: string;
  projectType?: string;
  location?: string;
  vintage?: string;
  amount?: number; // Fetched from credit details
}
