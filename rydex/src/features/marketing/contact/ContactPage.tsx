"use client";

import {
  Headset,
  ShieldAlert,
  Workflow,
} from "lucide-react";
import MarketingPageShell from "@/features/marketing/components/MarketingPageShell";

export default function ContactPage() {
  return (
    <MarketingPageShell
      eyebrow="Contact"
      title="Reach the Rydex team for booking help, partner questions, or operational support."
      description="Whether you are planning a ride, following up on a booking, or getting started as a partner, this page gives the app a proper contact surface that matches the rest of the product."
      heroStats={[
        { label: "Responses", value: "Fast" },
        { label: "Partner Help", value: "Available" },
        { label: "Ride Support", value: "Active" },
      ]}
      features={[
        {
          title: "Customer Support",
          description: "Use the platform when you need clarity on booking flow, payments, or ride progress.",
          icon: Headset,
        },
        {
          title: "Partner Assistance",
          description: "Onboarding, KYC, documents, pricing review, and payout setup questions all have a clear home now.",
          icon: Workflow,
        },
        {
          title: "Issue Escalation",
          description: "For urgent ride issues or verification delays, the app now has a dedicated page instead of a dead-end link.",
          icon: ShieldAlert,
        },
      ]}
      detailsTitle="Ways people typically get in touch."
      details={[
        {
          title: "Email Queries",
          description: "Best for booking questions, partner onboarding help, payout clarification, or verification follow-ups.",
        },
        {
          title: "Ride Assistance",
          description: "Useful when an active trip needs attention around arrival, updates, or coordination during the booking lifecycle.",
        },
        {
          title: "Partner Operations",
          description: "Covers documents, bank setup, pricing submissions, and post-review next steps for fleet partners.",
        },
        {
          title: "General Feedback",
          description: "A simple channel for users who want to share ideas, service feedback, or product-level suggestions.",
        },
      ]}
      ctaTitle="Keep the experience moving."
      ctaDescription="The contact surface now feels intentional and complete, matching the premium black-and-white Rydex aesthetic instead of sending users to missing pages."
    />
  );
}
