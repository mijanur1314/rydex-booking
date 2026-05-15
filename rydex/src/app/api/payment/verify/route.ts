import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { mongoIdSchema, parseJsonBody, validationErrorResponse } from "@/server/http/validation";
import crypto from "crypto";
import { z } from "zod";

const verifyPaymentSchema = z.object({
  bookingId: mongoIdSchema,
  razorpay_order_id: z.string().trim().min(1),
  razorpay_payment_id: z.string().trim().min(1),
  razorpay_signature: z.string().trim().min(1),
});

export async function POST(req: Request) {
  try {
    await connectDb();

    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await parseJsonBody(req, verifyPaymentSchema);

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return Response.json({ success: false, message: "Payment is not configured" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return Response.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return Response.json({ success: false }, { status: 404 });
    }

    const adminCommission = booking.fare * 0.1;
    const partnerAmount = booking.fare - adminCommission;

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.adminCommission = adminCommission;
    booking.partnerAmount = partnerAmount;

    await booking.save();

    return Response.json({
      success: true,
      adminCommission,
      partnerAmount,
    });
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    return Response.json({ success: false, message: "Payment verification failed" }, { status: 500 });
  }
}
