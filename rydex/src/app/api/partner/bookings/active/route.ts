import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { AuthError, requireRole } from "@/server/auth/guards";
import { getActiveDriverBooking } from "@/server/partner-bookings/queries";

export async function GET() {
  try {
    await connectDb();
    const user = await requireRole("vendor");
    const booking = await getActiveDriverBooking(user.id);
    return NextResponse.json(booking);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ booking: null }, { status: error.status });
    }

    console.error("ACTIVE BOOKING ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
