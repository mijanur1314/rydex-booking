import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { AuthError, requireRole } from "@/server/auth/guards";
import { getDriverBookingCounts } from "@/server/partner-bookings/queries";

export async function GET() {
  try {
    await connectDb();
    const user = await requireRole("vendor");
    return NextResponse.json(await getDriverBookingCounts(user.id));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("Booking Count Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
