import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { AuthError, requireRole } from "@/server/auth/guards";
import { getAdminDashboardData } from "@/server/admin/reviews";

export async function GET() {
  try {
    await requireRole("admin");
    await connectDb();

    return NextResponse.json(await getAdminDashboardData());
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("ADMIN DASHBOARD ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
