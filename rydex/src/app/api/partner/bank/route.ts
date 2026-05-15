import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { z } from "zod";
import { AuthError, requireSessionUser } from "@/server/auth/guards";
import { getBankStepData, saveBankStep } from "@/server/vendor-onboarding/bank";
import { getOnboardingUserById, OnboardingError } from "@/server/vendor-onboarding/types";
import { parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const bankStepSchema = z.object({
  name: z.string().trim().min(1, "Account holder name is required"),
  account: z.string().trim().min(9, "Account number must be at least 9 digits"),
  ifsc: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  upi: z.string().trim().optional(),
  mobileNumber: z.string().transform((value) => value.replace(/\D/g, "").trim()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const sessionUser = await requireSessionUser();
    const user = await getOnboardingUserById(sessionUser.id);
    const input = await parseJsonBody(req, bankStepSchema);

    await saveBankStep(sessionUser.id, input);

    user.vendorOnboardingStep = 3;
    user.vendorStatus = "pending";
    if (input.mobileNumber) {
      user.mobileNumber = input.mobileNumber;
    }
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Bank details saved",
    });
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    if (error instanceof AuthError || error instanceof OnboardingError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("BANK STEP ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDb();

    const sessionUser = await requireSessionUser();
    const bank = await getBankStepData(sessionUser.id);

    return NextResponse.json({ bank });
  } catch (error) {
    if (error instanceof AuthError || error instanceof OnboardingError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
