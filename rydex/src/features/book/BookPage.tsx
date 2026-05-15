"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { BookFormSections } from "./components/BookFormSections";
import { BookHeader } from "./components/BookHeader";
import { useBookRideForm } from "./hooks/useBookRideForm";
import type { VehicleType } from "./types";

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-100" />}>
      <BookPageContent />
    </Suspense>
  );
}

function BookPageContent() {
  const router = useRouter();
  const form = useBookRideForm();

  const continueToSearch = () => {
    router.push(
      `/search?pickup=${encodeURIComponent(form.pickup)}&drop=${encodeURIComponent(form.drop)}&vehicle=${form.vehicle}&mobileNumber=${encodeURIComponent(form.mobile)}&pickupLat=${form.pickupLat}&pickupLng=${form.pickupLng}&dropLat=${form.dropLat}&dropLng=${form.dropLng}`,
    );
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <BookHeader progress={form.progress} onBack={() => router.back()} />
        <BookFormSections
          canContinue={form.canContinue}
          drop={form.drop}
          dropResults={form.dropResults}
          locating={form.locating}
          mobile={form.mobile}
          pickup={form.pickup}
          pickupCountry={form.pickupCountry}
          pickupResults={form.pickupResults}
          vehicle={form.vehicle}
          onContinue={continueToSearch}
          onDropChange={form.setDrop}
          onMobileChange={form.setMobile}
          onPickupChange={form.setPickup}
          onSearchDrop={(value) => form.searchAddress(value, form.setDropResults, form.pickupCountry)}
          onSearchPickup={(value) => form.searchAddress(value, form.setPickupResults)}
          onSelectDrop={form.selectDrop}
          onSelectPickup={form.selectPickup}
          onUseCurrentLocation={form.useCurrentLocation}
          onVehicleChange={(value: VehicleType) => form.setVehicle(value)}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-zinc-400 text-[10px] mt-4 tracking-wide"
        >
          Rides are subject to driver availability
        </motion.p>
      </motion.div>
    </div>
  );
}
