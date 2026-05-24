import { NextResponse } from "next/server";
import { z } from "zod";

import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import Redis from "ioredis";

const redis = new Redis(process.env.UPSTASH_REDIS_URL || "");
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

    const nearbyDriverIds = await redis.georadius(
      "driver-locations",
      longitude,
      latitude,
      5000,
      "km"
    );

    console.log("Nearby driver IDs from Redis:", nearbyDriverIds, "for lat:", latitude, "lng:", longitude);

    if (!nearbyDriverIds || !nearbyDriverIds.length) {
      return NextResponse.json({ success: true, vehicles: [] });
    }

    const vendors = await User.find({
      _id: { $in: nearbyDriverIds },
      role: "vendor",
      isOnline: true,
      vendorStatus: "approved",
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

    console.log("Found vehicles for these vendors:", vehicles.length, "matching type:", vehicleType);

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
