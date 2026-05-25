"use client";

import dynamic from "next/dynamic";
import { AlertCircle, ChevronUp, Zap } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PEEK_H, STATUS_CONFIG } from "./constants";
import { CompletedScreen, FailedScreen, PanelContent } from "./components/RideScreens";
import type {
  BookingDetails,
  BookingUpdatedPayload,
  DriverAssignedPayload,
  DriverLocationPayload,
} from "./types";

const LiveRideMap = dynamic(() => import("@/features/ride-details/components/LiveTrackingMap"), { ssr: false });

/* ══════════════════════════════════════════════════════════════════════ */
export default function RidePage() {
  const { id }  = useParams();
  const router  = useRouter();

  const [booking,          setBooking]          = useState<BookingDetails | null>(null);
  const [driverPos,        setDriverPos]        = useState<[number, number] | null>(null);
  const [pickupPos,        setPickupPos]        = useState<[number, number] | null>(null);
  const [dropPos,          setDropPos]          = useState<[number, number] | null>(null);
  const [, setDistanceToPickup] = useState(0);
  const [etaToPickup,      setEtaToPickup]      = useState(0);
  const [, setDistanceToDrop]   = useState(0);
  const [etaToDrop,        setEtaToDrop]        = useState(0);
  /* chat only for confirmed status */
  const [chatOpen,         setChatOpen]         = useState(false);
  const [expanded,         setExpanded]         = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);

  /* ── FETCH ── */
  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await fetch(`/api/booking/${id}`);
      if (!res.ok) throw new Error("Failed to fetch booking");
      const data = await res.json();
      setBooking(data);
      setPickupPos([data.pickupLocation.coordinates[1], data.pickupLocation.coordinates[0]]);
      setDropPos  ([data.dropLocation.coordinates[1],   data.dropLocation.coordinates[0]]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetchBooking(); }, [fetchBooking]);

  /* ── SOCKET ── */
  useEffect(() => {
    if (!id || !booking) return;
    const socket = getSocket();
    socket.emit("join-booking", id);
    socket.on("driver-location", (data: DriverLocationPayload) => setDriverPos([data.latitude, data.longitude]));
    socket.on("booking-updated", (data: BookingUpdatedPayload) => {
      setBooking(prev => prev ? { ...prev, ...data } : null);
      /* close chat if ride moves past confirmed */
      if (data.status && data.status !== "confirmed") setChatOpen(false);
    });
    socket.on("driver-assigned", (data: DriverAssignedPayload) => {
      setBooking(prev => prev ? { ...prev, driver: data.driver, driverMobileNumber: data.driverMobileNumber } : null);
    });
    return () => {
      socket.off("driver-location");
      socket.off("booking-updated");
      socket.off("driver-assigned");
    };
  }, [id, booking]);

  /* ── CANCEL ── */
  /* ── LOADING ── */
  if (loading) return (
    <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-white/40 text-sm tracking-widest uppercase font-medium">Loading ride…</p>
      </div>
    </div>
  );

  if (error || !booking) return (
    <div className="h-screen w-full bg-zinc-950 flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-white font-bold text-lg">Failed to load ride</p>
        <p className="text-zinc-400 text-sm">{error || "Booking not found"}</p>
        <button onClick={() => router.back()} className="mt-2 bg-white text-zinc-900 px-6 py-3 rounded-xl font-semibold text-sm">
          Go Back
        </button>
      </div>
    </div>
  );

  const status      = booking.status;
  const cfg         = STATUS_CONFIG[status];
  const mapStatus   = cfg.mapStatus;
  const isActive    = ["requested", "awaiting_payment", "confirmed", "started"].includes(status);
  const isFailed    = ["cancelled", "rejected", "expired"].includes(status);
  const isCompleted = status === "completed";
  /* chat only when driver heading to pickup, not yet started */
  const canChat     = status === "confirmed";
  const showDriver  = ["confirmed", "started", "completed"].includes(status) && !!booking.driver;
  const displayEta      = mapStatus === "arriving" ? etaToPickup : etaToDrop;

  /* ══ COMPLETED — FULL SCREEN ══ */
  if (isCompleted) {
    return (
      <CompletedScreen booking={booking} router={router} />
    );
  }

  /* ══ FAILED — FULL SCREEN ══ */
  if (isFailed) {
    return (
      <FailedScreen booking={booking} status={status} cfg={cfg} router={router} />
    );
  }

  const panelProps = {
    booking, status, isActive, canChat, showDriver,
    displayEta,
    chatOpen, onChatToggle: () => canChat && setChatOpen(v => !v),
    onRetryPayment: fetchBooking,
  };

  return (
    <div className="h-screen w-full bg-zinc-100 flex flex-col lg:flex-row overflow-hidden">

      {/* ══ MAP ══ */}
      <div className="relative flex-1 h-full z-0">
        <LiveRideMap
          driverLocation={driverPos}
          pickupLocation={pickupPos!}
          dropLocation={dropPos!}
          status={mapStatus}
          onStats={({ distanceToPickup, durationToPickup, distanceToDrop, durationToDrop }) => {
            setDistanceToPickup(distanceToPickup); setEtaToPickup(durationToPickup);
            setDistanceToDrop(distanceToDrop);     setEtaToDrop(durationToDrop);
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-zinc-100">
            <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
            <span className="text-xs font-semibold tracking-wide text-zinc-900">{cfg.label}</span>
          </div>
        </motion.div>
      </div>

      {/* ══ DESKTOP PANEL ══ */}
      <motion.div
        initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-[420px] xl:w-[460px] bg-white border-l border-zinc-100 flex-col overflow-hidden"
      >
        <div className="bg-zinc-950 px-6 py-5 flex-shrink-0">
          <p className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-semibold mb-1">Live Tracking</p>
          <div className="flex items-center justify-between">
            <h1 className="text-white text-xl font-bold">Your Ride</h1>
            {isActive && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                <Zap size={12} className="text-amber-400" />
                <span className="text-white text-xs font-semibold">{Math.round(displayEta)} min</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <PanelContent {...panelProps} />
        </div>
      </motion.div>

      {/* ══ MOBILE BOTTOM SHEET ══ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
        <motion.div
          className="bg-white rounded-t-3xl shadow-2xl pointer-events-auto overflow-hidden"
          animate={{ height: expanded ? "80vh" : PEEK_H }}
          transition={{ type: "spring", stiffness: 320, damping: 38 }}
        >
          <div
            className="flex-shrink-0 cursor-pointer select-none"
            onClick={() => setExpanded(v => !v)}
            onPointerDown={e => {
              const startY = e.clientY;
              const onUp = (ev: PointerEvent) => {
                if (ev.clientY - startY < -30) setExpanded(true);
                if (ev.clientY - startY >  30) setExpanded(false);
                window.removeEventListener("pointerup", onUp);
              };
              window.addEventListener("pointerup", onUp);
            }}
          >
            <div className="pt-3 pb-1"><div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto" /></div>
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <div>
                  <p className="text-sm font-bold text-zinc-900 leading-tight">{cfg.label}</p>
                  <p className="text-xs text-zinc-400 leading-tight">{cfg.sublabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isActive && (
                  <div className="text-right">
                    <p className="text-2xl font-black text-zinc-900 leading-none">{Math.round(displayEta)}</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">min</p>
                  </div>
                )}
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.28 }}
                  className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"
                >
                  <ChevronUp size={16} className="text-zinc-600" />
                </motion.div>
              </div>
            </div>
            <div className="h-px bg-zinc-100 mx-5" />
          </div>
          <div className="overflow-y-auto h-full pb-10">
            <PanelContent {...panelProps} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   COMPLETED FULL SCREEN
══════════════════════════════════════════════════════════════════════ */
