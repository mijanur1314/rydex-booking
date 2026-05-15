import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireSessionUser } from "@/server/auth/guards";
import { getOnboardingUserById, OnboardingError } from "@/server/vendor-onboarding/types";
import { getVehiclePricing, saveVehiclePricing } from "@/server/vendor-onboarding/pricing";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const sessionUser = await requireSessionUser();
    const user = await getOnboardingUserById(sessionUser.id);
    return NextResponse.json(await saveVehiclePricing(user, await req.formData()));
  } catch (error) {
    if (error instanceof AuthError || error instanceof OnboardingError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("PRICING ERROR:", error);
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
    return NextResponse.json(await getVehiclePricing(user));
  } catch (error) {
    if (error instanceof AuthError || error instanceof OnboardingError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("GET PRICING ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
