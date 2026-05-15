import { NextRequest, NextResponse } from "next/server";
import { parseBookingNLP } from "@/lib/ai";
import { auth } from "@/auth";
import { z } from "zod";
import { parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const parseBookingSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await parseJsonBody(req, parseBookingSchema);

    const parsedData = await parseBookingNLP(prompt);
    
    if (!parsedData || "error" in parsedData) {
      return NextResponse.json({ message: parsedData?.error || "Failed to parse booking request" }, { status: 500 });
    }

    const readyToBook =
      Boolean(parsedData.pickup) &&
      Boolean(parsedData.dropoff) &&
      parsedData.missingFields.length === 0 &&
      parsedData.safetyFlags.length === 0;

    return NextResponse.json({
      ...parsedData,
      readyToBook,
    });
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    console.error("Parse Booking Route Error:", error);
    const message = error instanceof Error ? error.message : "Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
