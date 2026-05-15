import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { mongoIdSchema, parseJsonBody, parseParams, validationErrorResponse } from "@/server/http/validation";
import { NextResponse } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  id: mongoIdSchema,
});

const confirmPaymentSchema = z.object({
  method: z.enum(["cash", "online", "paid"]).default("online"),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = parseParams(paramsSchema, await context.params);
    const { method } = await parseJsonBody(req, confirmPaymentSchema);
    const booking = await Booking.findById(id);

    if (!booking || booking.status !== "awaiting_payment") {
      return NextResponse.json({ message: "Invalid" }, { status: 400 });
    }

    booking.status = "confirmed";
    booking.paymentStatus = method === "cash" ? "cash" : "paid";
    booking.paymentDeadline = undefined;

    await booking.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
