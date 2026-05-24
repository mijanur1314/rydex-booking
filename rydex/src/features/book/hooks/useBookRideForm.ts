"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PhotonFeature, Place, VehicleType } from "../types";

const VEHICLE_TYPES = ["bike", "auto", "car", "loading", "truck"];

export function formatPlace(place: Place) {
  return [place.name, place.city, place.state, place.country].filter(Boolean).join(", ");
}

export function useBookRideForm() {
  const searchParams = useSearchParams();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [vehicle, setVehicle] = useState<VehicleType | null>(null);
  const [mobile, setMobile] = useState("");
  const [pickupResults, setPickupResults] = useState<Place[]>([]);
  const [dropResults, setDropResults] = useState<Place[]>([]);
  const [pickupCountry, setPickupCountry] = useState<string | null>(null);
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropLat, setDropLat] = useState<number | null>(null);
  const [dropLng, setDropLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const pickupParam = searchParams.get("pickup");
    const dropParam = searchParams.get("drop");
    const vehicleParam = searchParams.get("vehicleType");

    if (pickupParam) setPickup(pickupParam);
    if (dropParam) setDrop(dropParam);
    if (vehicleParam && VEHICLE_TYPES.includes(vehicleParam)) {
      setVehicle(vehicleParam as VehicleType);
    }
  }, [searchParams]);

  const searchAddress = async (query: string, setResults: (results: Place[]) => void, restrict?: string | null) => {
    if (!query || query.trim().length < 3) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&limit=8&lang=en`);
      const data = await res.json();
      let results: Place[] = ((data?.features ?? []) as PhotonFeature[]).map((feature) => ({
        id: String(feature.properties.osm_id),
        name: feature.properties.name || "Unknown place",
        city: feature.properties.city,
        state: feature.properties.state,
        country: feature.properties.country,
        countrycode: feature.properties.countrycode?.toLowerCase(),
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
      }));

      if (restrict) results = results.filter((place) => place.countrycode === restrict);
      setResults(results);
    } catch {
      setResults([]);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`https://photon.komoot.io/reverse?lat=${coords.latitude}&lon=${coords.longitude}&limit=1`);
          const data = await res.json();
          if (data?.features?.length) {
            const place = data.features[0].properties;
            const address = [place.name, place.street, place.city, place.state, place.country].filter(Boolean).join(", ");
            setPickup(address);
            setPickupCountry(place.countrycode?.toLowerCase() || null);
            setPickupLat(coords.latitude);
            setPickupLng(coords.longitude);
            setPickupResults([]);
          }
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        alert(`Could not access GPS location: ${err.message}. Please check browser permissions or type your address manually.`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const selectPickup = (place: Place) => {
    setPickup(formatPlace(place));
    setPickupCountry(place.countrycode || null);
    setPickupLat(place.lat);
    setPickupLng(place.lng);
    setPickupResults([]);
  };

  const selectDrop = (place: Place) => {
    setDrop(formatPlace(place));
    setDropLat(place.lat);
    setDropLng(place.lng);
    setDropResults([]);
  };

  const canContinue = !!(pickup && drop && vehicle && mobile && pickupLat && pickupLng && dropLat && dropLng);
  const progress = [!!vehicle, mobile.length >= 10, !!pickup, !!drop].filter(Boolean).length;

  return {
    canContinue,
    drop,
    dropLat,
    dropLng,
    dropResults,
    locating,
    mobile,
    pickup,
    pickupCountry,
    pickupLat,
    pickupLng,
    pickupResults,
    progress,
    searchAddress,
    selectDrop,
    selectPickup,
    setDrop,
    setDropResults,
    setMobile,
    setPickup,
    setPickupResults,
    setVehicle,
    useCurrentLocation,
    vehicle,
  };
}
