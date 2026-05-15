import type { BookingStatus, PaymentStatus } from "./types";

export const STATUS_CONFIG: Record<BookingStatus, {
  label: string;
  sublabel: string;
  dot: string;
  mapStatus: "arriving" | "ongoing" | "completed";
}> = {
  requested: { label: "Finding Driver", sublabel: "Searching for nearby drivers", dot: "bg-amber-400", mapStatus: "arriving" },
  awaiting_payment: { label: "Payment Required", sublabel: "Complete payment to confirm your ride", dot: "bg-purple-400", mapStatus: "arriving" },
  confirmed: { label: "Driver on the Way", sublabel: "Driver is heading to pickup", dot: "bg-emerald-400", mapStatus: "arriving" },
  started: { label: "On the Way", sublabel: "Heading to your destination", dot: "bg-blue-400", mapStatus: "ongoing" },
  completed: { label: "Ride Completed", sublabel: "You have reached your destination", dot: "bg-zinc-400", mapStatus: "completed" },
  cancelled: { label: "Ride Cancelled", sublabel: "This ride has been cancelled", dot: "bg-red-400", mapStatus: "completed" },
  rejected: { label: "Ride Rejected", sublabel: "Driver couldn't accept the ride", dot: "bg-red-400", mapStatus: "completed" },
  expired: { label: "Request Expired", sublabel: "Booking request timed out", dot: "bg-orange-400", mapStatus: "completed" },
};

export const PAYMENT_LABEL: Record<PaymentStatus, { label: string; cls: string }> = {
  pending: { label: "Payment Pending", cls: "bg-amber-100 text-amber-700" },
  paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
  cash: { label: "Cash", cls: "bg-zinc-100 text-zinc-700" },
  failed: { label: "Payment Failed", cls: "bg-red-100 text-red-700" },
};

export const PEEK_H = 140;

export type RouteStatusConfig = (typeof STATUS_CONFIG)[BookingStatus];
