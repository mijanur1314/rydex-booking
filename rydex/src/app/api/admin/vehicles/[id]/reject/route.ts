import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { AuthError, requireRole } from "@/server/auth/guards";
import { AdminReviewError, rejectVehicleReview } from "@/server/admin/reviews";
import { z } from "zod";
import { mongoIdSchema, parseJsonBody, parseParams, validationErrorResponse } from "@/server/http/validation";

const paramsSchema = z.object({ id: mongoIdSchema });
const rejectSchema = z.object({ reason: z.string().trim().min(1, "Rejection reason required") });

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("admin");
    await connectDb();

    const { id } = parseParams(paramsSchema, await context.params);
    const { reason } = await parseJsonBody(req, rejectSchema);
    return NextResponse.json(await rejectVehicleReview(id, reason));
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    if (error instanceof AuthError || error instanceof AdminReviewError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("VEHICLE REJECT ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
