export {
  calculateDynamicPricing,
  generateAdminVehicleSummary,
  generateAdminVendorSummary,
  parseBookingNLP,
  reviewVendorDocumentsAI,
  verifyDocumentVision,
} from "@/server/ai/service";

export type {
  BookingAssistantResult,
  DocumentCheckResult,
  VendorDocumentReviewResult,
} from "@/server/ai/service";
