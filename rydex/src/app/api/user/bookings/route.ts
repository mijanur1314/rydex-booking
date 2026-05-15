import { NextResponse } from "next/server";

import { requireSessionUser } from "@/server/auth/guards";
import { listUserBookingHistory } from "@/server/booking/history";
import { validationErrorResponse } from "@/server/http/validation";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const bookings = await listUserBookingHistory(user.id);

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: true, bookings: [], message: "No bookings found" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, bookings },
      { status: 200 }
    );
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    console.error("USER BOOKINGS API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
