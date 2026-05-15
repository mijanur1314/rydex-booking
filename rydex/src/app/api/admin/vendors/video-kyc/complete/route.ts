import { NextResponse } from "next/server";
import { z } from "zod";

import { completeVideoKyc } from "@/server/admin/video-kyc";
import { requireRole } from "@/server/auth/guards";
import { parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const completeVideoKycSchema = z.discriminatedUnion("action", [
  z.object({
    roomId: z.string().trim().min(1, "Room ID required"),
    action: z.literal("approve"),
  }),
  z.object({
    roomId: z.string().trim().min(1, "Room ID required"),
    action: z.literal("reject"),
    reason: z.string().trim().min(1, "Rejection reason required"),
  }),
]);

export async function PATCH(req: Request) {
  try {
    await requireRole("admin");
    const input = await parseJsonBody(req, completeVideoKycSchema);

    return NextResponse.json(await completeVideoKyc(input));
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
