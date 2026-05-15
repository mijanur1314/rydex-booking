import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRole } from "@/server/auth/guards";
import { BookingTransitionError, completeBooking } from "@/server/booking/transitions";
import { mongoIdSchema, parseParams, validationErrorResponse } from "@/server/http/validation";

const paramsSchema = z.object({
  id: mongoIdSchema,
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  void req;

  try {
    const user = await requireRole("vendor");
    const { id } = parseParams(paramsSchema, await params);

    await completeBooking({ bookingId: id, driverId: user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    const validationResponse = validationErrorResponse(error);
    if (validationResponse) return validationResponse;

    if (error instanceof BookingTransitionError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
