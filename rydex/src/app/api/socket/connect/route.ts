import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { mongoIdSchema, parseJsonBody, validationErrorResponse } from "@/server/http/validation";
import { NextResponse } from "next/server";
import { z } from "zod";

const socketConnectSchema = z.object({
  userId: mongoIdSchema,
  socketId: z.string().trim().min(1),
});

export async function POST(req: Request) {
  try {
    await connectDb();
    const { userId, socketId } = await parseJsonBody(req, socketConnectSchema);
    const user = await User.findByIdAndUpdate(
      userId,
      {
        socketId,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: "user not found" }, { status: 400 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
