import axios from "axios";

import connectDb from "@/lib/db";
import Booking, { BookingStatus } from "@/models/booking.model";
import { buildDriverTransitionUpdate } from "@/server/booking/transition-policy";

type TransitionInput = {
  bookingId: string;
  driverId: string;
};

type DriverTransitionInput = TransitionInput & {
  from: BookingStatus | BookingStatus[];
  to: BookingStatus;
  timestampField?: "arrivedAt" | "startedAt" | "completedAt";
  paymentDeadlineMs?: number;
};

export class BookingTransitionError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

async function emitBookingUpdated(booking: { _id: unknown; user: unknown; status: BookingStatus }) {
  const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER;

  if (!socketServerUrl) {
    return;
  }

  try {
    await axios.post(`${socketServerUrl}/emit`, {
      userId: booking.user,
      event: "booking-updated",
      data: {
        bookingId: booking._id,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Failed to emit booking update", error);
  }
}

async function updateDriverBooking(input: DriverTransitionInput) {
  await connectDb();

  const update = buildDriverTransitionUpdate(input);

  const booking = await Booking.findOneAndUpdate(
    {
      _id: input.bookingId,
      driver: input.driverId,
      status: Array.isArray(input.from) ? { $in: input.from } : input.from,
    },
    update,
    { new: true }
  );

  if (!booking) {
    throw new BookingTransitionError("Ride already processed or invalid");
  }

  await emitBookingUpdated(booking);

  return booking;
}

export async function acceptBooking(input: TransitionInput) {
  return updateDriverBooking({
    ...input,
    from: "requested",
    to: "awaiting_payment",
  });
}

export async function rejectBooking(input: TransitionInput) {
  return updateDriverBooking({
    ...input,
    from: "requested",
    to: "rejected",
  });
}

export async function markDriverArriving(input: TransitionInput) {
  return updateDriverBooking({
    ...input,
    from: "confirmed",
    to: "arriving",
  });
}

export async function markDriverArrived(input: TransitionInput) {
  return updateDriverBooking({
    ...input,
    from: "arriving",
    to: "arrived",
    timestampField: "arrivedAt",
  });
}

export async function startBooking(input: TransitionInput) {
  return updateDriverBooking({
    ...input,
    from: "arrived",
    to: "started",
    timestampField: "startedAt",
  });
}

export async function completeBooking(input: TransitionInput) {
  return updateDriverBooking({
    ...input,
    from: "started",
    to: "completed",
    timestampField: "completedAt",
  });
}
