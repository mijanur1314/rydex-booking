import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { AuthError, requireRole } from "@/server/auth/guards";
import { listPendingDriverBookings } from "@/server/partner-bookings/queries";

export async function GET() {
  try {
    await connectDb();
    const user = await requireRole("vendor");
    const bookings = await listPendingDriverBookings(user.id);
    return NextResponse.json({ bookings });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("Pending Bookings Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
