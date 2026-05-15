import { NextRequest, NextResponse } from "next/server";
import { verifyDocumentVision } from "@/lib/ai";
import { auth } from "@/auth";
import { z } from "zod";
import { parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const verifyDocumentSchema = z.object({
  imageUrl: z.string().url("Image URL is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl } = await parseJsonBody(req, verifyDocumentSchema);

    const verificationResult = await verifyDocumentVision(imageUrl);
    
    if (!verificationResult) {
      return NextResponse.json({ message: "Failed to verify document" }, { status: 500 });
    }

    return NextResponse.json(verificationResult);
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    console.error("Verify Document Route Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
