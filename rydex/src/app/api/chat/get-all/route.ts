import { NextResponse } from "next/server";
import { z } from "zod";
import connectDb from "@/lib/db";
import ChatMessage from "@/models/chatMessage.model";
import { AuthError, requireSessionUser } from "@/server/auth/guards";
import { getRideParticipantRole } from "@/server/chat/permissions";
import { mongoIdSchema, parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const getChatMessagesSchema = z.object({
  rideId: mongoIdSchema,
});

export async function POST(req: Request) {
  try {
    await connectDb();

    const user = await requireSessionUser();

    const { rideId } = await parseJsonBody(req, getChatMessagesSchema);

    const participant = await getRideParticipantRole(rideId, user.id);
    if (!participant.exists) {
      return NextResponse.json({ message: "Ride not found" }, { status: 404 });
    }

    if (!participant.role) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const messages = await ChatMessage.find({ rideId }).sort({ createdAt: 1 });

    return NextResponse.json({
      messages,
    });
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("CHAT GET ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
