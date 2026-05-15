"use client";

import { useCallback, useEffect, useState } from "react";
import type { VehicleSearchResult } from "../types";

export function useNearbyVehicles(vehicleType: string, pickupLat: number, pickupLng: number) {
  const [vehicles, setVehicles] = useState<VehicleSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNearbyVehicles = useCallback(async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicles/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, vehicleType }),
      });
      const data = await res.json();
      if (data.success) setVehicles(data.vehicles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [vehicleType]);

  useEffect(() => {
    if (!pickupLat || !pickupLng) return;
    fetchNearbyVehicles(pickupLat, pickupLng);
  }, [fetchNearbyVehicles, pickupLat, pickupLng]);

  return { vehicles, loading, fetchNearbyVehicles };
}

