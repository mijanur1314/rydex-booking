"use client";

import { motion } from "framer-motion";
import VehicleBookingCard from "@/features/book/components/VehicleBookingCard";
import type { VehicleSearchResult } from "../types";

type VehicleResultsGridProps = {
  vehicles: VehicleSearchResult[];
  distanceKm: number | null;
  onBook: (vehicle: VehicleSearchResult) => void;
};

export function VehicleResultsGrid({
  vehicles,
  distanceKm,
  onBook,
}: VehicleResultsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {vehicles.map((vehicle, i) => (
        <motion.div
          key={vehicle._id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <VehicleBookingCard
            vehicle={vehicle}
            distanceKm={distanceKm ?? undefined}
            isRecommended={i === 0}
            onBook={() => onBook(vehicle)}
          />
        </motion.div>
      ))}
    </div>
  );
}

