import { NextResponse } from "next/server";
import { z } from "zod";
import connectDb from "@/lib/db";
import ChatMessage from "@/models/chatMessage.model";
import { AuthError, requireSessionUser } from "@/server/auth/guards";
import { getRideParticipantRole } from "@/server/chat/permissions";
import { mongoIdSchema, parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const sendChatMessageSchema = z.object({
  rideId: mongoIdSchema,
  text: z.string().trim().min(1, "Message text is required"),
});

export async function POST(req: Request) {
  try {
    await connectDb();

    const user = await requireSessionUser();

    const { rideId, text } = await parseJsonBody(req, sendChatMessageSchema);

    const participant = await getRideParticipantRole(rideId, user.id);
    if (!participant.exists) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    if (!participant.role) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const msg = await ChatMessage.create({
      rideId,
      text,
      sender: participant.role,
    });

    return NextResponse.json({
      success: true,
      message: msg,
    });
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("CHAT SEND ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
