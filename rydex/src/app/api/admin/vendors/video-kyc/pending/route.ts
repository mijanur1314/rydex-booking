import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { AuthError, requireRole } from "@/server/auth/guards";
import { listPendingVideoKycVendors } from "@/server/admin/vendor-kyc";

export async function GET() {
  try {
    await requireRole("admin");
    await connectDb();
    const vendors = await listPendingVideoKycVendors();

    return NextResponse.json(vendors);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("ADMIN VIDEO KYC PENDING ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
