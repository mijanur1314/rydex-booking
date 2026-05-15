import { GoogleGenAI } from "@google/genai";
import dns from "node:dns";
import { fetchImagePartFromUrl } from "./files";
import { safeJsonParse, stripMarkdownFences } from "./json";
import {
  defaultDocumentCheck,
  normalizeBookingAssistantResult,
  normalizeVendorDocumentReview,
} from "./normalizers";
import type { BookingAssistantResult, RemoteFilePart, VendorDocumentReviewResult } from "./types";

export type {
  AdminRecommendation,
  BookingAssistantResult,
  DocumentCheckResult,
  DocumentReviewStatus,
  VendorDocumentReviewResult,
} from "./types";

dns.setDefaultResultOrder("ipv4first");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// gemini-2.0-flash is the stable GA model; 2.5-flash is experimental and can 503 under load
const GEMINI_MODEL = "gemini-2.0-flash";

/**
 * Retries a Gemini API call up to `maxAttempts` times on transient 503 (overloaded)
 * or 429 (rate-limited) errors, backing off between each attempt.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 2000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const isRetryable = status === 503 || status === 429;
      if (isRetryable && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs * attempt));
        lastError = err;
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

export async function parseBookingNLP(prompt: string) {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `You are an AI booking assistant for a ride-booking app called Rydex.
Extract booking details from the user's request and return ONLY a raw JSON object.

Rules:
- Do not invent missing data.
- If pickup or drop is unclear, return null.
- vehicleType must be one of: car, bike, auto, truck, loading, null.
- bookingCategory must be one of: personal, delivery, scheduled, unknown.
- confidence must be between 0 and 1.
- missingFields should mention values still needed to create a booking.
- safetyFlags should mention suspicious or risky instructions, if any.

Return schema:
{
  "pickup": "string or null",
  "dropoff": "string or null",
  "vehicleType": "car | bike | auto | truck | loading | null",
  "passengers": "number or null",
  "specialInstructions": "string or null",
  "bookingCategory": "personal | delivery | scheduled | unknown",
  "confidence": 0.0,
  "missingFields": ["pickup", "dropoff"],
  "safetyFlags": []
}

User prompt: ${JSON.stringify(prompt)}`,
    }));

    return normalizeBookingAssistantResult(
      safeJsonParse<Partial<BookingAssistantResult>>(response.text || "{}", {})
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "AI booking parser failed";
    console.error("AI Booking Parser Error:", message);
    return { error: message };
  }
}

export async function verifyDocumentVision(imageUrl: string) {
  try {
    const imagePart = await fetchImagePartFromUrl(imageUrl);
    if (!imagePart) {
      return { summary: "Document image could not be processed.", isValidDocument: false };
    }

    const response = await withRetry(() => ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          text: `You are an automated KYC verification system. Analyze this document image.
Extract the exact Name, License Number, and Date of Birth when visible.

Return ONLY a raw JSON object:
{
  "extractedName": "string",
  "documentNumber": "string",
  "dateOfBirth": "string",
  "isValidDocument": true,
  "summary": "short explanation",
  "issues": []
}`,
        },
        imagePart,
      ],
    }));

    return safeJsonParse(response.text || "{}", {
      extractedName: "",
      documentNumber: "",
      dateOfBirth: "",
      isValidDocument: false,
      summary: "Document verification unavailable.",
      issues: [],
    });
  } catch (error) {
    console.error("AI Document Verification Error:", error);
    return null;
  }
}

export async function reviewVendorDocumentsAI(input: {
  aadhaarUrl?: string | null;
  licenseUrl?: string | null;
  rcUrl?: string | null;
  vendorProfile?: {
    name?: string | null;
    email?: string | null;
    mobileNumber?: string | null;
  };
}): Promise<VendorDocumentReviewResult> {
  const fallback: VendorDocumentReviewResult = {
    overallStatus: "needs_review",
    recommendation: "manual_review",
    summary: "AI review could not fully validate the submitted documents.",
    riskFlags: [],
    aadhaar: input.aadhaarUrl
      ? defaultDocumentCheck("Aadhaar needs manual review.", "needs_review")
      : defaultDocumentCheck("Aadhaar was not submitted.", "missing"),
    license: input.licenseUrl
      ? defaultDocumentCheck("License needs manual review.", "needs_review")
      : defaultDocumentCheck("License was not submitted.", "missing"),
    rc: input.rcUrl
      ? defaultDocumentCheck("RC needs manual review.", "needs_review")
      : defaultDocumentCheck("RC was not submitted.", "missing"),
    reviewedAt: new Date().toISOString(),
  };

  try {
    const [aadhaarPart, licensePart, rcPart] = await Promise.all([
      input.aadhaarUrl ? fetchImagePartFromUrl(input.aadhaarUrl) : Promise.resolve(null),
      input.licenseUrl ? fetchImagePartFromUrl(input.licenseUrl) : Promise.resolve(null),
      input.rcUrl ? fetchImagePartFromUrl(input.rcUrl) : Promise.resolve(null),
    ]);

    const contents: Array<{ text: string } | RemoteFilePart> = [
      {
        text: `You are helping an admin review vendor onboarding documents for a ride-booking platform.
Compare the submitted Aadhaar, driving license, and RC when provided.
Use the vendor profile as supporting context only; do not assume profile fields are correct.

Return ONLY a raw JSON object:
{
  "overallStatus": "clear | needs_review | incomplete",
  "recommendation": "approve | manual_review | request_resubmission",
  "summary": "2-3 sentence summary for admin",
  "riskFlags": ["string"],
  "aadhaar": {
    "status": "verified | needs_review | missing | unsupported",
    "summary": "short summary",
    "extractedFields": { "name": "", "documentNumber": "", "dateOfBirth": "" },
    "issues": [],
    "confidence": 0.0
  },
  "license": {
    "status": "verified | needs_review | missing | unsupported",
    "summary": "short summary",
    "extractedFields": { "name": "", "documentNumber": "", "dateOfBirth": "" },
    "issues": [],
    "confidence": 0.0
  },
  "rc": {
    "status": "verified | needs_review | missing | unsupported",
    "summary": "short summary",
    "extractedFields": { "ownerName": "", "registrationNumber": "", "vehicleClass": "" },
    "issues": [],
    "confidence": 0.0
  },
  "reviewedAt": "${new Date().toISOString()}"
}

Vendor profile:
${JSON.stringify(input.vendorProfile || {}, null, 2)}

If a document is not visible enough, mark it "needs_review".
If a document is not present, mark it "missing".
If the uploaded file is not an image, mark it "unsupported".`,
      },
    ];

    if (aadhaarPart) contents.push({ text: "Document type: Aadhaar" }, aadhaarPart);
    if (licensePart) contents.push({ text: "Document type: Driving License" }, licensePart);
    if (rcPart) contents.push({ text: "Document type: Registration Certificate (RC)" }, rcPart);

    const response = await withRetry(() => ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
    }));

    const parsed = normalizeVendorDocumentReview(
      safeJsonParse<Partial<VendorDocumentReviewResult>>(response.text || "{}", fallback)
    );

    if (input.aadhaarUrl && !aadhaarPart) {
      parsed.aadhaar = defaultDocumentCheck(
        "Aadhaar file was uploaded in an unsupported or unreadable format.",
        "unsupported"
      );
      parsed.riskFlags = [...parsed.riskFlags, "Aadhaar file could not be processed automatically."];
    }

    if (input.licenseUrl && !licensePart) {
      parsed.license = defaultDocumentCheck(
        "License file was uploaded in an unsupported or unreadable format.",
        "unsupported"
      );
      parsed.riskFlags = [...parsed.riskFlags, "License file could not be processed automatically."];
    }

    if (input.rcUrl && !rcPart) {
      parsed.rc = defaultDocumentCheck(
        "RC file was uploaded in an unsupported or unreadable format.",
        "unsupported"
      );
      parsed.riskFlags = [...parsed.riskFlags, "RC file could not be processed automatically."];
    }

    return parsed;
  } catch (error) {
    console.error("AI Vendor Document Review Error:", error);
    return fallback;
  }
}

export async function generateAdminVendorSummary(input: Record<string, unknown>) {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `You are assisting an admin reviewing a vendor onboarding case for Rydex.
Return ONLY a raw JSON object:
{
  "headline": "one-line summary",
  "riskLevel": "low | medium | high",
  "recommendedAction": "approve | manual_review | request_resubmission",
  "summary": "short admin-facing summary",
  "keyChecks": ["string"],
  "openQuestions": ["string"]
}

Vendor review data:
${JSON.stringify(input, null, 2)}`,
    }));

    return safeJsonParse(response.text || "{}", {
      headline: "Vendor review summary unavailable.",
      riskLevel: "medium",
      recommendedAction: "manual_review",
      summary: "AI summary could not be generated for this vendor.",
      keyChecks: [],
      openQuestions: [],
    });
  } catch (error) {
    console.error("AI Vendor Summary Error:", error);
    return {
      headline: "Vendor review summary unavailable.",
      riskLevel: "medium",
      recommendedAction: "manual_review",
      summary: "AI summary could not be generated for this vendor.",
      keyChecks: [],
      openQuestions: [],
    };
  }
}

export async function generateAdminVehicleSummary(input: Record<string, unknown>) {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `You are assisting an admin reviewing a vehicle pricing and approval case for Rydex.
Return ONLY a raw JSON object:
{
  "headline": "one-line summary",
  "riskLevel": "low | medium | high",
  "recommendedAction": "approve | manual_review | request_resubmission",
  "summary": "short admin-facing summary",
  "keyChecks": ["string"],
  "openQuestions": ["string"]
}

Vehicle review data:
${JSON.stringify(input, null, 2)}`,
    }));

    return safeJsonParse(response.text || "{}", {
      headline: "Vehicle review summary unavailable.",
      riskLevel: "medium",
      recommendedAction: "manual_review",
      summary: "AI summary could not be generated for this vehicle.",
      keyChecks: [],
      openQuestions: [],
    });
  } catch (error) {
    console.error("AI Vehicle Summary Error:", error);
    return {
      headline: "Vehicle review summary unavailable.",
      riskLevel: "medium",
      recommendedAction: "manual_review",
      summary: "AI summary could not be generated for this vehicle.",
      keyChecks: [],
      openQuestions: [],
    };
  }
}

export async function calculateDynamicPricing(context: {
  baseFare: number;
  activeDriversNearby: number;
  pendingRequests: number;
  weather: string;
  timeOfDay: string;
}) {
  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `You are the dynamic pricing engine for Rydex. Calculate surge pricing based on:
- Base Fare: ${context.baseFare}
- Drivers: ${context.activeDriversNearby}
- Requests: ${context.pendingRequests}
- Weather: ${context.weather}
- Time: ${context.timeOfDay}

Return ONLY a JSON object:
{
  "multiplier": number,
  "reason": "short explanation"
}`,
    }));

    const text = response.text || "{}";
    const cleanJson = stripMarkdownFences(text);
    return JSON.parse(cleanJson) as { multiplier: number; reason: string };
  } catch (error) {
    console.error("AI Dynamic Pricing Error:", error);
    return { multiplier: 1.0, reason: "Standard Pricing" };
  }
}
