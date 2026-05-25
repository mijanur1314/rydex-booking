import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { z } from "zod";
import { mongoIdSchema, parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const createPaymentSchema = z.object({
  bookingId: mongoIdSchema,
});


export async function POST(req: Request) {
  try {
    await connectDb();

    const { bookingId } = await parseJsonBody(req, createPaymentSchema);

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    if (!Number.isFinite(booking.fare) || booking.fare <= 0) {
      return NextResponse.json({ success: false, message: "Invalid booking fare" }, { status: 400 });
    }

    if (booking.status !== "awaiting_payment") {
      return NextResponse.json(
        { success: false, message: "Driver must accept the ride before payment." },
        { status: 400 },
      );
    }

    const amount = Math.round(booking.fare * 100);

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: booking._id.toString(),
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      fare: booking.fare,
    });
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    return NextResponse.json({ success: false, message: "Payment order failed" }, { status: 500 });
  }
}
