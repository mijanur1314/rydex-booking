import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireSessionUser } from "@/server/auth/guards";
import { getOnboardingUserById, OnboardingError } from "@/server/vendor-onboarding/types";
import {
  getVehicleStepData,
  saveVehicleStep,
} from "@/server/vendor-onboarding/vehicle";
import { parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const vehicleStepSchema = z.object({
  type: z.enum(["bike", "auto", "car", "loading", "truck"]),
  number: z.string().trim().toUpperCase().regex(/^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4}$/, "Invalid vehicle number format"),
  vehicleModel: z.string().trim().min(3, "Invalid vehicle model"),
});

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const sessionUser = await requireSessionUser();
    const user = await getOnboardingUserById(sessionUser.id);
    const input = await parseJsonBody(req, vehicleStepSchema);
    const result = await saveVehicleStep(user, input);
    return NextResponse.json(result);
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    if (error instanceof AuthError || error instanceof OnboardingError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("VEHICLE STEP ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}




export async function GET() {
  try {
    await connectDb();
    const sessionUser = await requireSessionUser();
    const user = await getOnboardingUserById(sessionUser.id);
    return NextResponse.json(await getVehicleStepData(user));
  } catch (error) {
    if (error instanceof AuthError || error instanceof OnboardingError) {
      return NextResponse.json(
        { message: error.message, authorized: false },
        { status: error.status }
      );
    }

    console.error("GET VEHICLE ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

