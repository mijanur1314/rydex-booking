import type {
  AdminRecommendation,
  BookingAssistantResult,
  DocumentCheckResult,
  DocumentReviewStatus,
  VendorDocumentReviewResult,
} from "./types";

function normalizeBookingVehicleType(value: unknown): BookingAssistantResult["vehicleType"] {
  const normalized = String(value || "").toLowerCase().trim();
  if (["car", "bike", "auto", "truck", "loading"].includes(normalized)) {
    return normalized as BookingAssistantResult["vehicleType"];
  }
  return null;
}

export function normalizeBookingAssistantResult(data: Partial<BookingAssistantResult>): BookingAssistantResult {
  return {
    pickup: typeof data.pickup === "string" && data.pickup.trim() ? data.pickup.trim() : null,
    dropoff: typeof data.dropoff === "string" && data.dropoff.trim() ? data.dropoff.trim() : null,
    vehicleType: normalizeBookingVehicleType(data.vehicleType),
    passengers: typeof data.passengers === "number" && Number.isFinite(data.passengers) ? data.passengers : null,
    specialInstructions:
      typeof data.specialInstructions === "string" && data.specialInstructions.trim()
        ? data.specialInstructions.trim()
        : null,
    bookingCategory: ["personal", "delivery", "scheduled"].includes(String(data.bookingCategory))
      ? (data.bookingCategory as BookingAssistantResult["bookingCategory"])
      : "unknown",
    confidence:
      typeof data.confidence === "number" && Number.isFinite(data.confidence)
        ? Math.max(0, Math.min(1, data.confidence))
        : 0,
    missingFields: Array.isArray(data.missingFields)
      ? data.missingFields.map((item) => String(item)).filter(Boolean)
      : [],
    safetyFlags: Array.isArray(data.safetyFlags)
      ? data.safetyFlags.map((item) => String(item)).filter(Boolean)
      : [],
  };
}

export function defaultDocumentCheck(summary: string, status: DocumentReviewStatus): DocumentCheckResult {
  return { status, summary, issues: [], confidence: 0 };
}

function normalizeDocumentCheck(value: unknown, fallbackSummary: string): DocumentCheckResult {
  if (!value || typeof value !== "object") {
    return defaultDocumentCheck(fallbackSummary, "needs_review");
  }

  const raw = value as DocumentCheckResult;
  const status: DocumentReviewStatus = ["verified", "needs_review", "missing", "unsupported"].includes(
    String(raw.status),
  )
    ? (raw.status as DocumentReviewStatus)
    : "needs_review";

  return {
    status,
    summary: typeof raw.summary === "string" && raw.summary.trim() ? raw.summary.trim() : fallbackSummary,
    extractedFields:
      raw.extractedFields && typeof raw.extractedFields === "object"
        ? Object.fromEntries(Object.entries(raw.extractedFields).map(([key, fieldValue]) => [key, String(fieldValue)]))
        : undefined,
    issues: Array.isArray(raw.issues) ? raw.issues.map((item) => String(item)).filter(Boolean) : [],
    confidence:
      typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
        ? Math.max(0, Math.min(1, raw.confidence))
        : 0,
  };
}

export function normalizeVendorDocumentReview(data: Partial<VendorDocumentReviewResult>): VendorDocumentReviewResult {
  const overallStatus = ["clear", "needs_review", "incomplete"].includes(String(data.overallStatus))
    ? (data.overallStatus as VendorDocumentReviewResult["overallStatus"])
    : "needs_review";

  const recommendation = ["approve", "manual_review", "request_resubmission"].includes(String(data.recommendation))
    ? (data.recommendation as AdminRecommendation)
    : "manual_review";

  return {
    overallStatus,
    recommendation,
    summary: typeof data.summary === "string" && data.summary.trim() ? data.summary.trim() : "AI review unavailable.",
    riskFlags: Array.isArray(data.riskFlags) ? data.riskFlags.map((item) => String(item)).filter(Boolean) : [],
    aadhaar: normalizeDocumentCheck(data.aadhaar, "Aadhaar review needs manual verification."),
    license: normalizeDocumentCheck(data.license, "License review needs manual verification."),
    rc: normalizeDocumentCheck(data.rc, "RC review needs manual verification."),
    reviewedAt: typeof data.reviewedAt === "string" && data.reviewedAt ? data.reviewedAt : new Date().toISOString(),
  };
}
