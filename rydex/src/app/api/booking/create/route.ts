import { NextResponse } from "next/server";
import axios from "axios";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { z } from "zod";
import { AuthError, requireSessionUser } from "@/server/auth/guards";
import {
  BookingValidationError,
  buildRidePricing,
  ensureNoActiveBooking,
  parseCreateBookingInput,
  resolveBookingAssignment,
  sanitizeMobileNumber,
} from "@/server/booking/service";
import { mongoIdSchema, parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const pointLocationSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
});

const createBookingSchema = z.object({
  driverId: mongoIdSchema,
  vehicleId: mongoIdSchema,
  pickupAddress: z.string().trim().min(1),
  dropAddress: z.string().trim().min(1),
  pickupLocation: pointLocationSchema,
  dropLocation: pointLocationSchema,
  mobileNumber: z.string().trim().min(1),
});

export async function POST(req: Request) {
  try {
    await connectDb();

    const user = await requireSessionUser();
    const body = await parseJsonBody(req, createBookingSchema);
    const input = parseCreateBookingInput(body);
    const sanitizedMobileNumber = sanitizeMobileNumber(input.mobileNumber);
    const { driver, vehicle } = await resolveBookingAssignment(input.driverId, input.vehicleId);
    const existing = await ensureNoActiveBooking(user.id);

    if (existing) {
      return NextResponse.json({ success: true, booking: existing });
    }

    const pricing = buildRidePricing({
      pickupLocation: input.pickupLocation,
      dropLocation: input.dropLocation,
      baseFare: vehicle.baseFare,
      pricePerKm: vehicle.pricePerKm,
      waitingCharge: vehicle.waitingCharge,
    });

    const booking = await Booking.create({
      user: user.id,
      driver: input.driverId,
      vehicle: input.vehicleId,
      pickupAddress: input.pickupAddress,
      dropAddress: input.dropAddress,
      pickupLocation: input.pickupLocation,
      dropLocation: input.dropLocation,
      fare: pricing.fare,
      userMobileNumber: sanitizedMobileNumber,
      driverMobileNumber: driver.mobileNumber || "",
      status: "requested",
    });

    if (process.env.NEXT_PUBLIC_SOCKET_SERVER) {
      await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER}/emit`, {
        userId: input.driverId,
        event: "new-booking",
        data: booking,
      });
    }

    return NextResponse.json({
      success: true,
      booking,
      pricing: {
        distanceKm: Math.round(pricing.distanceKm * 100) / 100,
        fare: pricing.fare,
      },
    });
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    if (error instanceof AuthError || error instanceof BookingValidationError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("BOOKING CREATE ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
