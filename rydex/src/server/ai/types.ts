export type DocumentReviewStatus = "verified" | "needs_review" | "missing" | "unsupported";
export type AdminRecommendation = "approve" | "manual_review" | "request_resubmission";

export interface BookingAssistantResult {
  pickup: string | null;
  dropoff: string | null;
  vehicleType: "car" | "bike" | "auto" | "truck" | "loading" | null;
  passengers: number | null;
  specialInstructions: string | null;
  bookingCategory: "personal" | "delivery" | "scheduled" | "unknown";
  confidence: number;
  missingFields: string[];
  safetyFlags: string[];
}

export interface DocumentCheckResult {
  status: DocumentReviewStatus;
  summary: string;
  extractedFields?: Record<string, string>;
  issues?: string[];
  confidence?: number;
}

export interface VendorDocumentReviewResult {
  overallStatus: "clear" | "needs_review" | "incomplete";
  recommendation: AdminRecommendation;
  summary: string;
  riskFlags: string[];
  aadhaar: DocumentCheckResult;
  license: DocumentCheckResult;
  rc: DocumentCheckResult;
  reviewedAt: string;
}

export interface RemoteFilePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}
