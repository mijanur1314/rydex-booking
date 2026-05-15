import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/user.model";
import connectDb from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { z } from "zod";
import { parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { name, email, password } = await parseJsonBody(req, registerSchema);

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isEmailVerified) {
      return NextResponse.json(
        { message: "User already exists. Please login." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (existingUser && !existingUser.isEmailVerified) {
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpiresAt = otpExpiresAt;

      await existingUser.save();
    } else {
      await User.create({
        name,
        email,
        password: hashedPassword,
        role: "user",
        isEmailVerified: false,
        otp,
        otpExpiresAt,
      });
    }


    let mailSent = true;

    try {
      await sendMail(
        email,
        "Your OTP for Email Verification",
        `<h2>Your Email Verification OTP is <strong>${otp}</strong></h2>`
      );
    } catch (mailError) {
      mailSent = false;
      console.error("REGISTER MAIL ERROR:", mailError);
    }

    return NextResponse.json(
      {
        message: mailSent
          ? "OTP sent to email. Please verify."
          : "OTP generated but email could not be sent. Check the server terminal for the OTP.",
        mailSent,
        ...(process.env.NODE_ENV !== "production" ? { otp } : {}),
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
