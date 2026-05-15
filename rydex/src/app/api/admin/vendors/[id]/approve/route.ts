import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { AuthError, requireRole } from "@/server/auth/guards";
import { AdminReviewError, approveVendor } from "@/server/admin/reviews";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("admin");
    await connectDb();

    return NextResponse.json(await approveVendor((await context.params).id));
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminReviewError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("APPROVE VENDOR ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
