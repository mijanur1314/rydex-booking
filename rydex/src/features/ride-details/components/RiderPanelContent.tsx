"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Car, Clock, IndianRupee, MessageCircle, Phone, Star, User2 } from "lucide-react";
import RideChat from "@/features/ride-details/components/RideChat";
import { PAYMENT_LABEL } from "../constants";
import type { BookingDetails, BookingStatus, PaymentStatus } from "../types";

type PanelContentProps = {
  booking: BookingDetails;
  status: BookingStatus;
  isActive: boolean;
  canChat: boolean;
  showDriver: boolean;
  displayEta: number;
  chatOpen: boolean;
  onChatToggle: () => void;
  onRetryPayment: () => void;
};

export function PanelContent({
  booking, status, isActive, canChat, showDriver,
  displayEta,
  chatOpen, onChatToggle, onRetryPayment,
}: PanelContentProps) {
  return (
    <div className="flex flex-col pt-5 pb-6 gap-3">

      {/* SEARCHING (requested) */}
      {status === "requested" && (
        <div className="mx-5 lg:mx-6">
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-zinc-900">Finding your driver</p>
              <p className="text-xs text-zinc-400 mt-0.5">This usually takes less than a minute</p>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT (awaiting_payment) */}
      {status === "awaiting_payment" && (
        <div className="mx-5 lg:mx-6">
          <div className="bg-purple-950 rounded-2xl p-5">
            <p className="text-purple-200 text-[10px] uppercase tracking-widest font-semibold mb-1">Action Required</p>
            <p className="text-white font-bold text-lg mb-1 flex items-center gap-1">
              <IndianRupee size={18} /> {booking.fare}
            </p>
            <p className="text-purple-300 text-xs mb-4">Complete payment to confirm your ride</p>
            <button onClick={onRetryPayment} className="w-full bg-white text-purple-900 py-3 rounded-xl text-sm font-bold hover:bg-purple-50 transition-colors">
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* ETA + FARE (active, not requested/payment) */}
      {isActive && !["requested", "awaiting_payment"].includes(status) && (
        <div className="mx-5 lg:mx-6 grid grid-cols-2 gap-2">
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-zinc-600" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">ETA</p>
              <p className="text-lg font-black text-zinc-900 leading-none mt-0.5">
                {Math.round(displayEta)}<span className="text-xs font-normal text-zinc-400 ml-0.5">min</span>
              </p>
            </div>
          </div>
          <div className="bg-zinc-950 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <IndianRupee size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Fare</p>
              <p className="text-lg font-black text-white leading-none mt-0.5">₹{booking.fare}</p>
            </div>
          </div>
        </div>
      )}

      {/* DRIVER CARD */}
      {showDriver && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-5 lg:mx-6">
          <div className="bg-zinc-950 rounded-2xl p-4 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center">
                <User2 size={26} className="text-zinc-300" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-400 w-4 h-4 rounded-full border-2 border-zinc-950" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-white font-bold text-base truncate">{booking.driver?.name || "Your Driver"}</p>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full flex-shrink-0">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  <span className="text-white text-xs font-semibold">4.9</span>
                </div>
              </div>
              {booking.vehicle && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-zinc-400 text-xs">{booking.vehicle.vehicleModel}</span>
                  <span className="text-zinc-700 text-xs">•</span>
                  <span className="text-zinc-300 text-xs bg-white/10 px-2 py-0.5 rounded-full font-mono">{booking.vehicle.number}</span>
                </div>
              )}
              <div className="mt-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${PAYMENT_LABEL[booking.paymentStatus as PaymentStatus]?.cls}`}>
                  {PAYMENT_LABEL[booking.paymentStatus as PaymentStatus]?.label}
                </span>
              </div>
            </div>
          </div>

          {/* Call always when active; Message only when canChat */}
          {isActive && (
            <div className="flex gap-2 mt-2">
              {booking.driverMobileNumber && (
                <a href={`tel:${booking.driverMobileNumber}`}
                  className={`flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 active:scale-[0.97] transition-all text-zinc-900 py-3 rounded-xl text-sm font-semibold ${canChat ? "flex-1" : "w-full"}`}
                >
                  <Phone size={15} /> Call
                </a>
              )}
              {canChat && (
                <button onClick={onChatToggle}
                  className={`flex-1 flex items-center justify-center gap-2 active:scale-[0.97] transition-all py-3 rounded-xl text-sm font-semibold ${chatOpen ? "bg-zinc-200 text-zinc-900" : "bg-zinc-900 hover:bg-zinc-800 text-white"}`}
                >
                  <MessageCircle size={15} />
                  {chatOpen ? "Close Chat" : "Message"}
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* CHAT — confirmed only */}
      <AnimatePresence>
        {chatOpen && canChat && (
          <motion.div key="chat"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-5 lg:mx-6 overflow-hidden"
          >
            <div className="rounded-2xl overflow-hidden border border-zinc-100 h-[460px]">
              <RideChat currentRole="user" rideId={booking._id.toString()} driverName={booking.driver?.name} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROUTE CARD */}
      <div className="mx-5 lg:mx-6">
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden">
          <div className="flex gap-3 p-4 border-b border-zinc-100">
            <div className="flex flex-col items-center flex-shrink-0 pt-1">
              <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shadow-sm" />
              <div className="w-px bg-zinc-200 mt-1" style={{ height: 20 }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Pickup</p>
              <p className="text-sm text-zinc-800 leading-snug">{booking.pickupAddress || "—"}</p>
              {booking.pickupOtp && status === "confirmed" && (
                <div className="mt-1.5 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                  <p className="text-emerald-700 text-xs font-black tracking-widest font-mono">{booking.pickupOtp}</p>
                  <p className="text-emerald-600 text-[10px] font-semibold">OTP</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 p-4">
            <div className="flex-shrink-0 pt-1">
              <div className="w-3 h-3 rounded-sm bg-zinc-900 border-2 border-white shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Drop</p>
              <p className="text-sm text-zinc-800 leading-snug">{booking.dropAddress || "—"}</p>
              {booking.dropOtp && status === "started" && (
                <div className="mt-1.5 inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg">
                  <p className="text-rose-700 text-xs font-black tracking-widest font-mono">{booking.dropOtp}</p>
                  <p className="text-rose-600 text-[10px] font-semibold">DROP OTP</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VEHICLE CARD */}
      {booking.vehicle && showDriver && (
        <div className="mx-5 lg:mx-6">
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-zinc-900 flex items-center justify-center flex-shrink-0">
              <Car size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-0.5">Vehicle</p>
              <p className="text-sm font-bold text-zinc-900 truncate">{booking.vehicle.vehicleModel}</p>
            </div>
            <div className="flex-shrink-0 bg-zinc-900 px-3 py-1.5 rounded-lg">
              <p className="text-white text-xs font-black tracking-widest font-mono">{booking.vehicle.number}</p>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL BUTTON */}
     

    </div>
  );
}
