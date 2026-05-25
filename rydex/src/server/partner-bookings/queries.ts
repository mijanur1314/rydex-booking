import Booking from "@/models/booking.model";
import "@/models/user.model";
import "@/models/vehicle.model";

export async function listDriverBookings(driverId: string) {
  return Booking.find({
    driver: driverId,
  })
    .populate({
      path: "vehicle",
      select: "vehicleModel imageUrl type number",
    })
    .populate({
      path: "user",
      select: "name image",
    })
    .populate({
      path: "driver",
      select: "name",
    })
    .sort({ createdAt: -1 });
}

export async function listPendingDriverBookings(driverId: string) {
  return Booking.find({
    driver: driverId,
    status: "requested",
  })
    .sort({ createdAt: -1 })
    .select("_id pickupAddress dropAddress fare createdAt");
}

export async function getActiveDriverBooking(driverId: string) {
  return Booking.findOne({
    driver: driverId,
    status: {
      $in: ["awaiting_payment", "confirmed", "arriving", "arrived", "started"],
    },
  })
    .sort({ createdAt: -1 })
    .populate("user driver vehicle");
}

export async function getDriverBookingCounts(driverId: string) {
  const [pending, active] = await Promise.all([
    Booking.countDocuments({
      driver: driverId,
      status: "requested",
    }),
    Booking.countDocuments({
      driver: driverId,
      status: { $in: ["accepted", "started"] },
    }),
  ]);

  return { pending, active };
}
