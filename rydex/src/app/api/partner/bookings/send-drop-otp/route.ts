import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import { sendMail } from "@/lib/mailer";
import { z } from "zod";
import { mongoIdSchema, parseJsonBody, validationErrorResponse } from "@/server/http/validation";
import axios from "axios";

const sendOtpSchema = z.object({
  bookingId: mongoIdSchema,
});

export async function POST(req: Request) {

  await connectDB();

  try {

    const { bookingId } = await parseJsonBody(req, sendOtpSchema);

    const booking = await Booking
      .findById(bookingId)
      .populate("user");

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    /* Generate OTP */
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    booking.dropOtp = otp;
    booking.dropOtpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await booking.save();

    if (process.env.NEXT_PUBLIC_SOCKET_SERVER) {
      await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER}/emit`, {
        userId: booking.user._id,
        event: 'booking-updated',
        data: { dropOtp: otp }
      }).catch(console.error);
    }

    /* Send Mail */

    if (booking.user?.email) {
      try {
        await sendMail(
          booking.user.email,
          "Your Drop OTP - RYDEX",
          `
          <div style="font-family:sans-serif;padding:20px">
            <h2>Ride OTP</h2>

            <p>Your Drop OTP is:</p>

            <h1 style="letter-spacing:6px">${otp}</h1>

            <p>This OTP is valid for 5 minutes.</p>

            <p>Share this OTP with your driver to complete the ride.</p>

            <br/>

            <b>RYDEX</b>
          </div>
          `
        );
      } catch (mailError) {
        console.error("Failed to send drop OTP email:", mailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "drop OTP sent",
    });

  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    console.error(error);

    return NextResponse.json(
      { message: "OTP send failed" },
      { status: 500 }
    );

  }

}
