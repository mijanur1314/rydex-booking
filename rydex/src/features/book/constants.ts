import { Bike, Car, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { VehicleType } from "./types";

export const VEHICLES: Array<{ id: VehicleType; label: string; Icon: LucideIcon; desc: string }> = [
  { id: "bike", label: "Bike", Icon: Bike, desc: "Quick & affordable" },
  { id: "auto", label: "Auto", Icon: Car, desc: "Everyday rides" },
  { id: "car", label: "Car", Icon: Car, desc: "Comfort rides" },
  { id: "loading", label: "Loading", Icon: Truck, desc: "Small cargo" },
  { id: "truck", label: "Truck", Icon: Truck, desc: "Heavy transport" },
];

export const stepVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};
