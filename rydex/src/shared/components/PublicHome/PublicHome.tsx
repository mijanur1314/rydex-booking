"use client";

import { useState } from "react";
import HeroSection from "@/features/home/components/Herosection";
import VehicleCategoriesSlider from "@/features/book/components/VehicleCategoriesSlider";
import AuthModal from "@/features/auth/components/AuthModal";
import AIBookingAssistant from "@/features/book/components/AIBookingAssistant";

export default function PublicHome() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <HeroSection onAuthRequired={() => setAuthOpen(true)} />
      <VehicleCategoriesSlider />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />

      {/* Floating AI Widget */}
      <AIBookingAssistant onAuthRequired={() => setAuthOpen(true)} />
    </>
  );
}
