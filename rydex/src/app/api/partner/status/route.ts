import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { AuthError, requireRole } from "@/server/auth/guards";
import User from "@/models/user.model";
import { z } from "zod";
import Redis from "ioredis";

const statusSchema = z.object({
  isOnline: z.boolean(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    await connectDb();
    const userAuth = await requireRole("vendor");
    
    const body = await req.json();
    const { isOnline, latitude, longitude } = statusSchema.parse(body);

    const updateData: Record<string, unknown> = { isOnline };
    if (isOnline && latitude !== undefined && longitude !== undefined) {
      updateData.location = {
        type: "Point",
        coordinates: [longitude, latitude], // MongoDB requires [lng, lat]
      };
      updateData.lastLocationUpdate = new Date();
    }

    const user = await User.findByIdAndUpdate(
      userAuth.id,
      updateData,
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const redis = new Redis(process.env.UPSTASH_REDIS_URL || "");

    if (isOnline && latitude !== undefined && longitude !== undefined) {
      await redis.geoadd("driver-locations", longitude, latitude, userAuth.id);
    } else if (!isOnline) {
      await redis.zrem("driver-locations", userAuth.id);
    }

    return NextResponse.json({ success: true, isOnline: user.isOnline });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
