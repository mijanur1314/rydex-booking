import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import {
  PointLocation,
  calculateDistanceKm,
  calculateRideFare,
  isValidPointLocation,
} from "@/server/booking/pricing";

export type CreateBookingInput = {
  driverId: string;
  vehicleId: string;
  pickupAddress: string;
  dropAddress: string;
  pickupLocation: PointLocation;
  dropLocation: PointLocation;
  mobileNumber: string;
};

export class BookingValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function parseCreateBookingInput(body: unknown): CreateBookingInput {
  if (!body || typeof body !== "object") {
    throw new BookingValidationError("Missing or invalid required fields");
  }

  const data = body as Record<string, unknown>;

  if (
    typeof data.driverId !== "string" ||
    typeof data.vehicleId !== "string" ||
    typeof data.pickupAddress !== "string" ||
    typeof data.dropAddress !== "string" ||
    typeof data.mobileNumber !== "string" ||
    !isValidPointLocation(data.pickupLocation) ||
    !isValidPointLocation(data.dropLocation)
  ) {
    throw new BookingValidationError("Missing or invalid required fields");
  }

  return {
    driverId: data.driverId,
    vehicleId: data.vehicleId,
    pickupAddress: data.pickupAddress.trim(),
    dropAddress: data.dropAddress.trim(),
    pickupLocation: data.pickupLocation,
    dropLocation: data.dropLocation,
    mobileNumber: data.mobileNumber,
  };
}

export function sanitizeMobileNumber(mobileNumber: string) {
  const sanitizedMobileNumber = mobileNumber.replace(/\D/g, "").trim();

  if (sanitizedMobileNumber.length < 10) {
    throw new BookingValidationError("A valid mobile number is required");
  }

  return sanitizedMobileNumber;
}

export async function ensureNoActiveBooking(userId: string) {
  return Booking.findOne({
    user: userId,
    status: {
      $in: ["requested", "awaiting_payment", "confirmed", "started"],
    },
  });
}

export async function resolveBookingAssignment(driverId: string, vehicleId: string) {
  const [driver, vehicle] = await Promise.all([
    User.findById(driverId).select("role vendorStatus isOnline mobileNumber"),
    Vehicle.findById(vehicleId).select("owner baseFare pricePerKm waitingCharge status isActive"),
  ]);

  if (!driver || driver.role !== "vendor" || driver.vendorStatus !== "approved" || !driver.isOnline) {
    throw new BookingValidationError("Driver is not available");
  }

  if (!vehicle || vehicle.status !== "approved" || !vehicle.isActive) {
    throw new BookingValidationError("Vehicle is not available");
  }

  if (String(vehicle.owner) !== String(driver._id)) {
    throw new BookingValidationError("Selected vehicle does not belong to the driver");
  }

  if (typeof vehicle.baseFare !== "number" || typeof vehicle.pricePerKm !== "number") {
    throw new BookingValidationError("Vehicle pricing is not configured");
  }

  return { driver, vehicle };
}

export function buildRidePricing(input: {
  pickupLocation: PointLocation;
  dropLocation: PointLocation;
  baseFare: number;
  pricePerKm: number;
  waitingCharge?: number;
}) {
  const distanceKm = calculateDistanceKm(input.pickupLocation.coordinates, input.dropLocation.coordinates);

  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    throw new BookingValidationError("Unable to calculate route distance");
  }

  const fare = calculateRideFare({
    baseFare: input.baseFare,
    pricePerKm: input.pricePerKm,
    waitingCharge: input.waitingCharge,
    distanceKm,
  });

  return {
    distanceKm,
    fare,
  };
}
