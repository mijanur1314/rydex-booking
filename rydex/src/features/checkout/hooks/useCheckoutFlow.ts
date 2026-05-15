"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import type { CheckoutStatus, RazorpayResponse, RazorpayWindow } from "../types";

export type PaymentMethod = "cash" | "online";

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as RazorpayWindow).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useCheckoutFlow() {
  const params = useSearchParams();
  const pickup = params.get("pickup") || "Pickup Location";
  const drop = params.get("drop") || "Drop Location";
  const vehicle = params.get("vehicle") || "car";
  const vehicleId = params.get("vehicleId");
  const fare = Number(params.get("fare")) || 249;
  const mobileNumber = params.get("mobileNumber") || "";
  const driverId = params.get("driverId");
  const pickupLat = Number(params.get("pickupLat"));
  const pickupLng = Number(params.get("pickupLng"));
  const dropLat = Number(params.get("dropLat"));
  const dropLng = Number(params.get("dropLng"));

  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const ride = useMemo(
    () => ({
      pickup,
      drop,
      vehicle,
      fare,
      vehicleLabel: vehicle.charAt(0).toUpperCase() + vehicle.slice(1),
    }),
    [drop, fare, pickup, vehicle],
  );

  const resetCheckout = () => {
    setBookingId(null);
    setStatus("idle");
    setPaymentMethod(null);
  };

  const createBooking = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          driverId,
          pickupAddress: pickup,
          dropAddress: drop,
          pickupLocation: { type: "Point", coordinates: [pickupLng, pickupLat] },
          dropLocation: { type: "Point", coordinates: [dropLng, dropLat] },
          fare,
          mobileNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBookingId(data.booking._id);
        setStatus(data.booking.status || "requested");
      } else {
        alert(data.message || "Booking failed");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!bookingId || !paymentMethod) return;
    setLoading(true);

    try {
      if (paymentMethod === "cash") {
        const res = await fetch(`/api/booking/${bookingId}/confirm-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method: "cash" }),
        });
        const data = await res.json();
        if (data.success) window.location.href = `/ride/${bookingId}`;
        return;
      }

      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      const orderRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const orderData = await orderRes.json();
      const Razorpay = (window as RazorpayWindow).Razorpay;

      if (!Razorpay) {
        alert("Razorpay SDK failed to load");
        return;
      }

      new Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderData.amount,
        currency: "INR",
        name: "RYDEX",
        description: "Ride Payment",
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          const verify = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId, ...response }),
          });
          const verifyData = await verify.json();
          if (verifyData.success) window.location.href = `/ride/${bookingId}`;
        },
      }).open();
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async () => {
    if (!bookingId) return;
    await fetch(`/api/booking/${bookingId}/cancel`, { method: "POST" });
    setStatus("cancelled");
  };

  useEffect(() => {
    const socket = getSocket();
    socket.on("booking-updated", (data) => {
      if (data.status === "awaiting_payment") setStatus("awaiting_payment");
      if (data.status === "rejected") setStatus("rejected");
      if (data.status === "confirmed") setStatus("confirmed");
    });
    return () => {
      socket.off("booking-updated");
    };
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/booking/my-active");
      const data = await res.json();
      if (data.booking) {
        setBookingId(data.booking._id);
        setStatus(data.booking.status);
      }
    })();
  }, []);

  useEffect(() => {
    if (status !== "awaiting_payment") return;
    const timer = setTimeout(() => setStatus("payment"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  return {
    bookingId,
    cancelBooking,
    confirmPayment,
    createBooking,
    loading,
    paymentMethod,
    resetCheckout,
    ride,
    setPaymentMethod,
    status,
  };
}
