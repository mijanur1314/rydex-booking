import { NextResponse } from "next/server";
import { z } from "zod";

import { startVideoKyc } from "@/server/admin/video-kyc";
import { requireRole } from "@/server/auth/guards";
import { mongoIdSchema, parseParams, validationErrorResponse } from "@/server/http/validation";

const paramsSchema = z.object({
  vendorId: mongoIdSchema,
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ vendorId: string }> }
) {
  void req;

  try {
    await requireRole("admin");
    const { vendorId } = parseParams(paramsSchema, await context.params);

    return NextResponse.json(await startVideoKyc(vendorId));
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
