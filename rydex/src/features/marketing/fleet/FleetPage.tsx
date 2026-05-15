"use client";

import {
  Car,
  ShieldCheck,
  Truck,
} from "lucide-react";
import MarketingPageShell from "@/features/marketing/components/MarketingPageShell";

export default function FleetPage() {
  return (
    <MarketingPageShell
      eyebrow="Fleet"
      title="One platform for daily rides, cargo moves, and every vehicle in between."
      description="Rydex is built for flexible mobility. Browse compact rides for city hops, larger vehicles for family movement, and commercial options for heavier jobs without leaving the same booking experience."
      heroStats={[
        { label: "Categories", value: "4+" },
        { label: "Booking Flow", value: "Fast" },
        { label: "Pricing", value: "Clear" },
      ]}
      features={[
        {
          title: "Everyday Rides",
          description: "Bikes and cars for short trips, quick pickups, and reliable city travel.",
          icon: Car,
        },
        {
          title: "Commercial Vehicles",
          description: "Move goods with trucks and load-focused vehicles when the task is bigger than a regular ride.",
          icon: Truck,
        },
        {
          title: "Verified Partners",
          description: "Partner onboarding, document checks, and review layers keep the fleet more dependable.",
          icon: ShieldCheck,
        },
      ]}
      detailsTitle="Choose the vehicle around the job, not the other way around."
      details={[
        {
          title: "Bike",
          description: "Best for urgent single-rider movement and lightweight, time-sensitive travel inside dense city routes.",
        },
        {
          title: "Car",
          description: "A balanced option for personal trips, airport runs, and comfortable point-to-point travel.",
        },
        {
          title: "Truck",
          description: "Useful for shifting goods, inventory drops, and larger transport needs that require payload support.",
        },
        {
          title: "Custom Capacity",
          description: "Vehicle details and pricing can be tailored by partners based on type, route demand, and service style.",
        },
      ]}
      ctaTitle="Ready to book the right fit?"
      ctaDescription="Head to the booking flow, compare available options near your route, and continue with the same clean Rydex experience."
    />
  );
}
