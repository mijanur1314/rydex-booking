import { NextRequest, NextResponse } from "next/server";
import { calculateDynamicPricing } from "@/lib/ai";
import { auth } from "@/auth";
import { z } from "zod";
import { parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const pricingSchema = z.object({
  baseFare: z.number().positive("Base fare is required"),
  weather: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { baseFare, weather } = await parseJsonBody(req, pricingSchema);

    // In a real app, activeDriversNearby and pendingRequests would be queried from DB
    const mockActiveDrivers = Math.floor(Math.random() * 10);
    const mockPendingRequests = Math.floor(Math.random() * 15);
    const timeOfDay = new Date().toLocaleTimeString();

    const pricing = await calculateDynamicPricing({
      baseFare,
      activeDriversNearby: mockActiveDrivers,
      pendingRequests: mockPendingRequests,
      weather: weather || "clear",
      timeOfDay
    });

    return NextResponse.json({
      ...pricing,
      finalFare: Math.round(baseFare * pricing.multiplier),
      metrics: { drivers: mockActiveDrivers, demand: mockPendingRequests }
    });
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    console.error("Dynamic Pricing Route Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
