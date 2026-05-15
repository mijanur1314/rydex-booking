import Booking from "@/models/booking.model";

export type RideParticipantRole = "user" | "driver";

export async function getRideParticipantRole(
  rideId: string,
  userId: string
): Promise<{ exists: boolean; role: RideParticipantRole | null }> {
  const booking = await Booking.findById(rideId).select("user driver");

  if (!booking) {
    return { exists: false, role: null };
  }

  if (String(booking.driver) === userId) {
    return { exists: true, role: "driver" };
  }

  if (String(booking.user) === userId) {
    return { exists: true, role: "user" };
  }

  return { exists: true, role: null };
}
