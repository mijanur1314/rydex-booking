"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, KeyRound, MapPin, Navigation } from "lucide-react";
import type { BookingStatus } from "../types";

type ActionBarProps = {
  status: BookingStatus;
  otpMode: boolean;
  otp: string;
  loadingOtp: boolean;
  otpVerified: boolean;
  otpError: string;
  setOtpMode: (value: boolean) => void;
  setOtp: (value: string) => void;
  setOtpError: (value: string) => void;
  handleVerifyOtp: () => void;
  sendPickupOtp: () => Promise<void>;
  dropOtpMode: boolean;
  dropOtp: string;
  loadingDropOtp: boolean;
  dropOtpError: string;
  setDropOtpMode: (value: boolean) => void;
  setDropOtp: (value: string) => void;
  setDropOtpError: (value: string) => void;
  handleVerifyDropOtp: () => void;
  sendDropOtp: () => Promise<void>;
};

export function ActionBar({
  status,
  otpMode, otp, loadingOtp, otpVerified, otpError,
  setOtpMode, setOtp, setOtpError, handleVerifyOtp, sendPickupOtp,
  dropOtpMode, dropOtp, loadingDropOtp, dropOtpError,
  setDropOtpMode, setDropOtp, setDropOtpError, handleVerifyDropOtp, sendDropOtp,
}: ActionBarProps) {
  if (!["confirmed", "started"].includes(status)) return null;

  return (
    <div className="flex-shrink-0 border-t border-zinc-100 bg-white px-5 py-4">
      <AnimatePresence mode="wait">

        {/* STATE 1 — Arrived */}
        {status === "confirmed" && !otpMode && !otpVerified && (
          <motion.button key="arrived"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            onClick={async () => { await sendPickupOtp(); setOtpMode(true); }}
            className="w-full bg-zinc-900 hover:bg-zinc-800 active:scale-[0.97] text-white py-4 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
          >
            <MapPin size={16} /> I&apos;ve Arrived at Pickup <ArrowRight size={15} className="ml-1" />
          </motion.button>
        )}

        {/* STATE 2 — Pickup OTP */}
        {status === "confirmed" && otpMode && !otpVerified && (
          <motion.div key="pickup-otp"
            initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }} transition={{ duration: 0.3 }}
            className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden"
          >
            <div className="bg-zinc-950 px-4 py-3 flex items-center gap-2">
              <KeyRound size={14} className="text-amber-400" />
              <p className="text-white text-xs font-bold tracking-wide uppercase">Enter Customer OTP</p>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-zinc-500">Ask the customer for their 4-digit OTP to start the ride.</p>
              <div className="flex justify-center">
                <input type="text" inputMode="numeric" maxLength={4} value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                  placeholder="· · · ·"
                  className="w-48 border-2 border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-black outline-none transition-colors"
                />
              </div>
              {otpError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs text-center font-medium">{otpError}</motion.p>}
              <div className="flex gap-2">
                <button onClick={() => { setOtpMode(false); setOtp(""); setOtpError(""); }}
                  className="flex-1 border border-zinc-200 bg-white text-zinc-700 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] transition-all"
                >Cancel</button>
                <button onClick={handleVerifyOtp} disabled={loadingOtp || otp.length < 4}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-bold active:scale-[0.97] transition-all"
                >
                  {loadingOtp ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying…</span> : "Verify OTP"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STATE 3 — Pickup verified */}
        {otpVerified && status === "confirmed" && (
          <motion.div key="pickup-verified"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-xl">
              <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
              <p className="text-emerald-700 text-xs font-semibold">OTP Verified — Ride has started</p>
            </div>
          </motion.div>
        )}

        {/* STATE 4 — Mark as Dropped */}
        {status === "started" && !dropOtpMode && (
          <motion.button key="drop-btn"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            onClick={async () => { await sendDropOtp(); setDropOtpMode(true); }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] text-white py-4 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
          >
            <Navigation size={16} /> Mark as Dropped <ArrowRight size={15} />
          </motion.button>
        )}

        {/* STATE 5 — Drop OTP */}
        {status === "started" && dropOtpMode && (
          <motion.div key="drop-otp"
            initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }} transition={{ duration: 0.3 }}
            className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden"
          >
            <div className="bg-emerald-700 px-4 py-3 flex items-center gap-2">
              <KeyRound size={14} className="text-white" />
              <p className="text-white text-xs font-bold tracking-wide uppercase">Confirm Drop OTP</p>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-zinc-500">Ask the customer for their drop OTP to complete the ride.</p>
              <div className="flex justify-center">
                <input type="text" inputMode="numeric" maxLength={4} value={dropOtp}
                  onChange={e => { setDropOtp(e.target.value.replace(/\D/g, "")); setDropOtpError(""); }}
                  placeholder="· · · ·"
                  className="w-48 border-2 border-zinc-200 focus:border-emerald-600 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-black outline-none transition-colors"
                />
              </div>
              {dropOtpError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs text-center font-medium">{dropOtpError}</motion.p>}
              <div className="flex gap-2">
                <button onClick={() => { setDropOtpMode(false); setDropOtp(""); setDropOtpError(""); }}
                  className="flex-1 border border-zinc-200 bg-white text-zinc-700 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] transition-all"
                >Cancel</button>
                <button onClick={handleVerifyDropOtp} disabled={loadingDropOtp || dropOtp.length < 4}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-bold active:scale-[0.97] transition-all"
                >
                  {loadingDropOtp ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying…</span> : "Complete Ride"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PANEL CONTENT
══════════════════════════════════════════════════════════════════════ */
