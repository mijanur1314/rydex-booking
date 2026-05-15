"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BackButton } from "./components/BackButton";
import { EmptyVehicleState } from "./components/EmptyVehicleState";
import { RouteSummary } from "./components/RouteSummary";
import { SearchMapPanel } from "./components/SearchMapPanel";
import { SearchResultsHeader } from "./components/SearchResultsHeader";
import { VehicleResultsGrid } from "./components/VehicleResultsGrid";
import { VEHICLE_META, isVehicleType } from "./constants";
import { useNearbyVehicles } from "./hooks/useNearbyVehicles";
import type { VehicleSearchResult } from "./types";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-100" />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [pickup, setPickup] = useState(params.get("pickup") || "");
  const [drop, setDrop] = useState(params.get("drop") || "");
  const [km, setKm] = useState<number | null>(null);

  const vehicle = params.get("vehicle") || "";
  const mobileNumber = params.get("mobileNumber") || "";
  const pickupLat = Number(params.get("pickupLat"));
  const pickupLng = Number(params.get("pickupLng"));
  const eta = km !== null ? Math.max(3, Math.round((km / 25) * 60)) : null;
  const meta = isVehicleType(vehicle) ? VEHICLE_META[vehicle] : null;
  const { vehicles, loading, fetchNearbyVehicles } = useNearbyVehicles(vehicle, pickupLat, pickupLng);

  const bookVehicle = (selectedVehicle: VehicleSearchResult) => {
    const url = new URLSearchParams({
      pickup,
      drop,
      vehicle: selectedVehicle.type,
      driverId: selectedVehicle.owner,
      vehicleId: selectedVehicle._id,
      fare: String(Math.round(selectedVehicle.baseFare + (km ?? 0) * selectedVehicle.pricePerKm)),
      pickupLat: String(pickupLat),
      pickupLng: String(pickupLng),
      dropLat: params.get("dropLat") || "",
      dropLng: params.get("dropLng") || "",
      mobileNumber,
    });

    router.push(`/checkout?${url.toString()}`);
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 overflow-x-hidden">
      <BackButton onBack={() => router.back()} />

      <SearchMapPanel
        pickup={pickup}
        drop={drop}
        km={km}
        eta={eta}
        onDistance={setKm}
        onRouteChange={(nextPickup, nextDrop) => {
          setPickup(nextPickup);
          setDrop(nextDrop);
        }}
      />

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
        className="relative z-20 -mt-10 bg-white rounded-t-[28px] border-t border-zinc-200 shadow-[0_-8px_40px_rgba(0,0,0,0.08)] pt-5 pb-20 min-h-[52vh]"
      >
        <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-5" />

        <div className="px-5 lg:px-8 max-w-6xl mx-auto">
          <RouteSummary pickup={pickup} drop={drop} />

          <SearchResultsHeader
            loading={loading}
            vehicleCount={vehicles.length}
            vehicleLabel={meta?.label}
          />

          <EmptyVehicleState
            loading={loading}
            hasVehicles={vehicles.length > 0}
            vehicleLabel={meta?.label}
            onRetry={() => fetchNearbyVehicles(pickupLat, pickupLng)}
          />

          <VehicleResultsGrid vehicles={vehicles} distanceKm={km} onBook={bookVehicle} />
        </div>
      </motion.div>
    </div>
  );
}
