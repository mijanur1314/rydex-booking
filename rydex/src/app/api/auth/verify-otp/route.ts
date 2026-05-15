import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";
import connectDb from "@/lib/db";
import { z } from "zod";
import { parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const verifyOtpSchema = z.object({
  email: z.email().trim().toLowerCase(),
  otp: z.string().trim().min(1, "OTP is required"),
});

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { email, otp } = await parseJsonBody(req, verifyOtpSchema);

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: "Email already verified. Please login." },
        { status: 400 }
      );
    }

    if (!user.otp || user.otp !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 401 }
      );
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return NextResponse.json(
        { message: "OTP expired. Please request a new one." },
        { status: 410 }
      );
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    return NextResponse.json(
      {
        message: "Email verified successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    console.error("VERIFY OTP ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
