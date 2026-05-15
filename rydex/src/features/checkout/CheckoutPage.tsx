"use client";

import { Suspense } from "react";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutStatusPanel } from "./components/CheckoutStatusPanel";
import { RideDetailsCard } from "./components/RideDetailsCard";
import { useCheckoutFlow } from "./hooks/useCheckoutFlow";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-100" />}>
      <CheckoutPageContent />
    </Suspense>
  );
}

function CheckoutPageContent() {
  const checkout = useCheckoutFlow();

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-12">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #d4d4d8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.45,
        }}
      />

      <div className="relative max-w-6xl mx-auto z-10">
        <CheckoutHeader />
        <div className="grid lg:grid-cols-2 gap-6">
          <RideDetailsCard {...checkout.ride} />
          <CheckoutStatusPanel
            bookingId={checkout.bookingId}
            loading={checkout.loading}
            paymentMethod={checkout.paymentMethod}
            status={checkout.status}
            onCancelBooking={checkout.cancelBooking}
            onConfirmPayment={checkout.confirmPayment}
            onCreateBooking={checkout.createBooking}
            onReset={checkout.resetCheckout}
            onSelectPaymentMethod={checkout.setPaymentMethod}
          />
        </div>
      </div>
    </div>
  );
}
