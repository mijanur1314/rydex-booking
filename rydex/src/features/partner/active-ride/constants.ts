import type { BookingStatus, PaymentStatus } from "./types";

export const MAP_STATUS: Record<BookingStatus, "arriving" | "ongoing" | "completed"> = {
  requested: "arriving",
  awaiting_payment: "arriving",
  confirmed: "arriving",
  arriving: "arriving",
  arrived: "arriving",
  started: "ongoing",
  completed: "completed",
  cancelled: "completed",
  rejected: "completed",
  expired: "completed",
};

export const STATUS_LABEL: Record<BookingStatus, { label: string; sublabel: string; dot: string }> = {
  requested: { label: "Awaiting Confirmation", sublabel: "Booking is being processed", dot: "bg-amber-400" },
  awaiting_payment: { label: "Payment Pending", sublabel: "Customer payment is pending", dot: "bg-purple-400" },
  confirmed: { label: "Heading to Pickup", sublabel: "Drive to the pickup location", dot: "bg-amber-400" },
  arriving: { label: "Arriving at Pickup", sublabel: "Approaching pickup location", dot: "bg-amber-400" },
  arrived: { label: "At Pickup", sublabel: "Verify pickup OTP", dot: "bg-blue-400" },
  started: { label: "Ride in Progress", sublabel: "Heading to drop location", dot: "bg-emerald-400" },
  completed: { label: "Ride Completed", sublabel: "Trip has ended successfully", dot: "bg-zinc-400" },
  cancelled: { label: "Ride Cancelled", sublabel: "This ride was cancelled", dot: "bg-red-400" },
  rejected: { label: "Ride Rejected", sublabel: "Ride was rejected", dot: "bg-red-400" },
  expired: { label: "Request Expired", sublabel: "Booking timed out", dot: "bg-orange-400" },
};

export const PAYMENT_BADGE: Record<PaymentStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
  paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
  cash: { label: "Cash", cls: "bg-zinc-100 text-zinc-700" },
  failed: { label: "Failed", cls: "bg-red-100 text-red-700" },
};

export const TERMINAL: BookingStatus[] = ["completed", "cancelled", "rejected", "expired"];

export const PEEK_H = 148;
