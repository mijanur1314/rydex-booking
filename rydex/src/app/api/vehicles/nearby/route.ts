import { NextResponse } from "next/server";
import { z } from "zod";

import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const nearbyVehiclesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  vehicleType: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    await connectDb();

    const { latitude, longitude, vehicleType } = await parseJsonBody(req, nearbyVehiclesSchema);

    const vendors = await User.find({
      role: "vendor",
      isOnline: true,
      vendorStatus: "approved",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 5000,
        },
      },
    }).select("_id");

    const vendorIds = vendors.map((vendor) => vendor._id);

    if (!vendorIds.length) {
      return NextResponse.json({ success: true, vehicles: [] });
    }

    const vehicles = await Vehicle.find({
      owner: { $in: vendorIds },
      status: "approved",
      isActive: true,
      ...(vehicleType && { type: vehicleType }),
    }).lean();

    return NextResponse.json({
      success: true,
      vehicles,
    });
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
