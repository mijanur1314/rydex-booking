"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, IndianRupee, User2 } from "lucide-react";
import { PAYMENT_LABEL } from "../constants";
import type { BookingDetails, PageRouter } from "../types";

export function CompletedScreen({ booking, router }: { booking: BookingDetails; router: PageRouter }) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitted,      setSubmitted]      = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen w-full bg-zinc-950 flex flex-col overflow-y-auto"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="w-32 h-32 rounded-full bg-emerald-400/10 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-emerald-400/20 flex items-center justify-center">
              <CheckCircle2 size={52} className="text-emerald-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <p className="text-zinc-400 text-xs uppercase tracking-[0.25em] font-semibold text-center mb-2">Trip Complete</p>
          <h1 className="text-white text-3xl font-black text-center mb-1">You&apos;ve Arrived!</h1>
          <p className="text-zinc-500 text-sm text-center mb-8">Thank you for riding with us.</p>

          {/* Fare card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-3">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-1 text-center">Total Fare</p>
            <p className="text-white text-5xl font-black flex items-center justify-center gap-1 mb-4">
              <IndianRupee size={30} strokeWidth={2.5} /> {booking.fare}
            </p>
            <div className="flex items-center justify-between text-xs border-t border-zinc-800 pt-3">
              <span className="text-zinc-500">Payment</span>
              <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] ${PAYMENT_LABEL[booking.paymentStatus]?.cls ?? "bg-zinc-700 text-zinc-300"}`}>
                {PAYMENT_LABEL[booking.paymentStatus]?.label ?? booking.paymentStatus}
              </span>
            </div>
          </div>

          {/* Driver card */}
          {booking.driver && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <User2 size={20} className="text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Driver</p>
                <p className="text-white text-sm font-bold truncate">{booking.driver.name}</p>
              </div>
              {booking.vehicle && (
                <div className="flex-shrink-0 bg-zinc-800 px-2.5 py-1.5 rounded-lg">
                  <p className="text-zinc-300 text-xs font-black tracking-widest font-mono">{booking.vehicle.number}</p>
                </div>
              )}
            </div>
          )}

          {/* Route */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
            <div className="flex gap-3 p-4 border-b border-zinc-800">
              <div className="flex flex-col items-center flex-shrink-0 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-500 border-2 border-zinc-900" />
                <div className="w-px bg-zinc-700 mt-1" style={{ height: 18 }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-0.5">Pickup</p>
                <p className="text-sm text-zinc-300 leading-snug">{booking.pickupAddress || "—"}</p>
              </div>
            </div>
            <div className="flex gap-3 p-4">
              <div className="flex-shrink-0 pt-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 border-2 border-zinc-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-0.5">Drop</p>
                <p className="text-sm text-zinc-300 leading-snug">{booking.dropAddress || "—"}</p>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
            <p className="text-zinc-400 text-sm font-semibold text-center mb-3">How was your experience?</p>
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => !submitted && setSelectedRating(n)}
                  className={`w-12 h-12 rounded-xl text-xl transition-all active:scale-90 ${
                    selectedRating >= n
                      ? "bg-amber-400 text-zinc-900"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-500"
                  }`}
                >★</button>
              ))}
            </div>
            <AnimatePresence>
              {selectedRating > 0 && !submitted && (
                <motion.button
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  onClick={() => setSubmitted(true)}
                  className="w-full bg-white text-zinc-900 py-3 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors"
                >
                  Submit Rating
                </motion.button>
              )}
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 py-2"
                >
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <p className="text-emerald-400 text-sm font-semibold">Thanks for your feedback!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full border border-zinc-700 text-zinc-400 py-3.5 rounded-2xl text-sm font-semibold hover:bg-zinc-900 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FAILED FULL SCREEN (cancelled / rejected / expired)
══════════════════════════════════════════════════════════════════════ */
