import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";

export async function listUserBookingHistory(userId: string) {
  await connectDb();

  return Booking.find({ user: userId })
    .populate({
      path: "vehicle",
      select: "vehicleModel imageUrl type",
    })
    .populate({
      path: "driver",
      select: "name",
    })
    .sort({ createdAt: -1 })
    .lean();
}

export async function getBookingDetails(bookingId: string) {
  await connectDb();

  return Booking.findById(bookingId).populate("driver vehicle");
}
