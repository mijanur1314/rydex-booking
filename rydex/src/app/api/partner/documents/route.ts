import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { AuthError, requireSessionUser } from "@/server/auth/guards";
import {
  getDocumentStepData,
  parseDocumentUploads,
  saveDocumentStep,
} from "@/server/vendor-onboarding/documents";
import { getOnboardingUserById, OnboardingError } from "@/server/vendor-onboarding/types";

/* ===========================
   GET → Fetch vendor documents
=========================== */

export async function GET() {
  try {
    await connectDb();
    const sessionUser = await requireSessionUser();
    const user = await getOnboardingUserById(sessionUser.id);
    return NextResponse.json(await getDocumentStepData(user));
  } catch (error) {
    if (error instanceof AuthError || error instanceof OnboardingError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("GET DOCUMENT ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}





/* ===========================
   POST → Upload / Update docs
=========================== */

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const sessionUser = await requireSessionUser();
    const user = await getOnboardingUserById(sessionUser.id);
    const uploads = parseDocumentUploads(await req.formData());
    return NextResponse.json(await saveDocumentStep(user, uploads));
  } catch (error) {
    if (error instanceof AuthError || error instanceof OnboardingError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("POST DOCUMENT ERROR:", error);
    return NextResponse.json(
      { message: "Document upload failed" },
      { status: 500 }
    );
  }
}
