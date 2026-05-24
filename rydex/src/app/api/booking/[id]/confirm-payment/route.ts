import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { mongoIdSchema, parseJsonBody, parseParams, validationErrorResponse } from "@/server/http/validation";
import { NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";

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

    if (!booking) {
      return NextResponse.json({ message: "Invalid" }, { status: 400 });
    }

    if (booking.status === "confirmed") {
      return NextResponse.json({ success: true });
    }

    if (booking.status !== "awaiting_payment") {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const adminCommission = booking.fare * 0.10;
    const partnerAmount = booking.fare - adminCommission;

    booking.status = "confirmed";
    booking.paymentStatus = method === "cash" ? "cash" : "paid";
    booking.paymentDeadline = undefined;
    booking.partnerAmount = partnerAmount;

    await booking.save();

    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER;
    if (socketServerUrl) {
      await axios.post(`${socketServerUrl}/emit-room`, {
        room: `booking-${booking._id}`,
        event: "booking-updated",
        data: {
          bookingId: booking._id,
          status: booking.status,
        },
      }).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
