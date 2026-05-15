"use client";

import {
  MapPinned,
  ReceiptText,
  UserRoundCheck,
} from "lucide-react";
import MarketingPageShell from "@/features/marketing/components/MarketingPageShell";

export default function FaqPage() {
  return (
    <MarketingPageShell
      eyebrow="FAQ"
      title="Answers for the most common questions before you book or partner."
      description="This page brings together the essentials behind how Rydex works, from booking flow and pricing visibility to onboarding and ride updates."
      heroStats={[
        { label: "Bookings", value: "Simple" },
        { label: "Updates", value: "Live" },
        { label: "Support", value: "Guided" },
      ]}
      features={[
        {
          title: "Transparent Booking",
          description: "Search, compare vehicles, and continue into checkout with route-aware information and fare visibility.",
          icon: ReceiptText,
        },
        {
          title: "Live Tracking",
          description: "Once a ride is active, both users and partners can follow ride progress with status updates and location signals.",
          icon: MapPinned,
        },
        {
          title: "Verified Network",
          description: "Partner steps include documents, bank setup, review, and video KYC before activation.",
          icon: UserRoundCheck,
        },
      ]}
      detailsTitle="The questions most users usually ask first."
      details={[
        {
          title: "How do I book a ride?",
          description: "Log in, enter pickup and drop details, select a vehicle, and continue through checkout to confirm the ride.",
        },
        {
          title: "Do I see pricing before confirmation?",
          description: "Yes. The search and checkout flow is designed to show fare context before the final confirmation step.",
        },
        {
          title: "Can I track the ride after booking?",
          description: "Yes. Active rides include status changes, map-based tracking, and ride-specific updates while the trip is in progress.",
        },
        {
          title: "How does partner approval work?",
          description: "Partners complete onboarding, upload documents, provide payout details, pass review stages, and may be asked to complete video KYC.",
        },
      ]}
      ctaTitle="Still deciding?"
      ctaDescription="You can move from browsing to booking without losing context, and the same polished Rydex interface follows through the full ride journey."
    />
  );
}
