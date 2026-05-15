import { NextResponse } from "next/server";
import { z } from "zod";

import { getBookingDetails } from "@/server/booking/history";
import { mongoIdSchema, parseParams, validationErrorResponse } from "@/server/http/validation";

const paramsSchema = z.object({
  id: mongoIdSchema,
});

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  void req;

  try {
    const { id } = parseParams(paramsSchema, await context.params);
    const booking = await getBookingDetails(id);

    return NextResponse.json(booking);
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
