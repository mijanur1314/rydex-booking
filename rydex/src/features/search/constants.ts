import { Bike, Car, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { VehicleType } from "./types";

export const VEHICLE_TYPES: VehicleType[] = [
  "bike",
  "auto",
  "car",
  "loading",
  "truck",
];

export const VEHICLE_META: Record<VehicleType, { label: string; Icon: LucideIcon }> = {
  bike: { label: "Bike", Icon: Bike },
  auto: { label: "Auto", Icon: Car },
  car: { label: "Car", Icon: Car },
  loading: { label: "Loading", Icon: Truck },
  truck: { label: "Truck", Icon: Truck },
};

export function isVehicleType(value: string): value is VehicleType {
  return VEHICLE_TYPES.includes(value as VehicleType);
}

