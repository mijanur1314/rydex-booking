"use client";

import { motion } from "framer-motion";
import { AlertCircle, User2, XCircle } from "lucide-react";
import type { BookingStatus, IBooking } from "../types";

export function FailedScreen({ booking, status, cfg }: {
  booking: IBooking;
  status: BookingStatus;
  cfg: { label: string; sublabel: string; dot: string };
}) {
  const isExpired = status === "expired";
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center px-6"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className={`w-28 h-28 rounded-full flex items-center justify-center ${isExpired ? "bg-orange-400/10" : "bg-red-400/10"}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isExpired ? "bg-orange-400/20" : "bg-red-400/20"}`}>
            {isExpired ? <AlertCircle size={44} className="text-orange-400" /> : <XCircle size={44} className="text-red-400" />}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-sm text-center"
      >
        <h1 className="text-white text-2xl font-black mb-2">{cfg.label}</h1>
        <p className="text-zinc-500 text-sm mb-8">{cfg.sublabel}</p>

        {booking.user && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 mb-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <User2 size={18} className="text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Customer</p>
              <p className="text-white text-sm font-bold">{booking.user?.name || "Customer"}</p>
            </div>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6 text-left">
          <div className="flex gap-3 p-4 border-b border-zinc-800">
            <div className="flex flex-col items-center flex-shrink-0 pt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <div className="w-px bg-zinc-700 mt-1" style={{ height: 18 }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-0.5">Pickup</p>
              <p className="text-sm text-zinc-300 leading-snug">{booking.pickupAddress || "—"}</p>
            </div>
          </div>
          <div className="flex gap-3 p-4">
            <div className="flex-shrink-0 pt-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-zinc-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-0.5">Drop</p>
              <p className="text-sm text-zinc-300 leading-snug">{booking.dropAddress || "—"}</p>
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => window.location.href = "/partner"}
          className="w-full bg-white text-zinc-900 py-4 rounded-2xl text-sm font-bold hover:bg-zinc-100 transition-colors"
        >
          Back to Dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
