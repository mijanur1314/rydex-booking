import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import { z } from "zod";
import { mongoIdSchema, parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const verifyOtpSchema = z.object({
  bookingId: mongoIdSchema,
  otp: z.string().trim().min(4),
});

export async function POST(req: Request) {

  await connectDB();

  try {

    const { bookingId, otp } = await parseJsonBody(req, verifyOtpSchema);

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    if (!booking.pickupOtp) {
      return NextResponse.json(
        { message: "OTP not generated" },
        { status: 400 }
      );
    }

    if (booking.pickupOtp !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (!booking.pickupOtpExpires || booking.pickupOtpExpires < new Date()) {
      return NextResponse.json(
        { message: "OTP expired" },
        { status: 400 }
      );
    }

    /* update status */

    booking.status = "started";

    booking.pickupOtp = "";
    booking.pickupOtpExpires = undefined;

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "OTP verified. Ride started."
    });

  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    console.error(error);

    return NextResponse.json(
      { message: "OTP verification failed" },
      { status: 500 }
    );

  }

}
