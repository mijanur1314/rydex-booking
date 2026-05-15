"use client";

import dynamic from "next/dynamic";
import { Car, ChevronUp, Zap } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MAP_STATUS, PEEK_H, STATUS_LABEL, TERMINAL } from "./constants";
import { ActionBar, CompletedScreen, FailedScreen, PanelContent } from "./components/DriverRideScreens";
import type { BookingStatus, IBooking, SocketLocationPayload } from "./types";

export type { BookingStatus, IBooking, PaymentStatus } from "./types";

const LiveRideMap = dynamic(() => import("@/features/ride-details/components/LiveTrackingMap"), { ssr: false });

/* ══════════════════════════════════════════════════════════════════════ */
export default function DriverRidePage() {

  const [booking,       setBooking]       = useState<IBooking | null>(null);
  const [fetchDone,     setFetchDone]     = useState(false);
  const [driverPos,     setDriverPos]     = useState<[number, number] | null>(null);
  const [pickupPos,     setPickupPos]     = useState<[number, number] | null>(null);
  const [dropPos,       setDropPos]       = useState<[number, number] | null>(null);
  const [etaToPickup,   setEtaToPickup]   = useState(0);
  const [etaToDrop,     setEtaToDrop]     = useState(0);
  const [distanceToPickup, setDistanceToPickup] = useState(0);
  const [distanceToDrop,   setDistanceToDrop]   = useState(0);

  /* Pickup OTP */
  const [otpMode,     setOtpMode]     = useState(false);
  const [otp,         setOtp]         = useState("");
  const [loadingOtp,  setLoadingOtp]  = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError,    setOtpError]    = useState("");

  /* Drop OTP */
  const [dropOtpMode,    setDropOtpMode]    = useState(false);
  const [dropOtp,        setDropOtp]        = useState("");
  const [loadingDropOtp, setLoadingDropOtp] = useState(false);
  const [dropOtpError,   setDropOtpError]   = useState("");

  /* Chat & Sheet */
  const [chatOpen, setChatOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  /* Keep latest booking in a ref so GPS callback never has stale closure */
  const bookingRef = useRef<IBooking | null>(null);
  bookingRef.current = booking;

  /* ── FETCH ── */
  useEffect(() => {
    fetch("/api/partner/bookings/active")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data._id) {
          setBooking(data);
          if (data.pickupLocation?.coordinates) {
            setPickupPos([data.pickupLocation.coordinates[1], data.pickupLocation.coordinates[0]]);
          }
          if (data.dropLocation?.coordinates) {
            setDropPos([data.dropLocation.coordinates[1], data.dropLocation.coordinates[0]]);
          }
          if (data.status === "started")   { setOtpVerified(true); setOtpMode(false); }
          if (data.status === "completed") { setOtpVerified(true); }
        }
      })
      .catch(err => console.error("Fetch error:", err))
      .finally(() => setFetchDone(true));
  }, []);

  /* ── GPS — only for active rides, uses ref to avoid stale closure ── */
  useEffect(() => {
    if (!booking?._id) return;
    if (TERMINAL.includes(booking.status)) return;
    if (!navigator.geolocation) return;

    const socket = getSocket();
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const b = bookingRef.current;
        if (!b?._id || TERMINAL.includes(b.status)) return;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDriverPos([lat, lng]);
        socket.emit("driver-location-update", {
          bookingId: b._id, latitude: lat, longitude: lng, status: b.status,
        });
      },
      err => console.error("GPS error:", err),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [booking?._id, booking?.status]);

  /* ── SOCKET ── */
  useEffect(() => {
    if (!booking?._id) return;
    if (TERMINAL.includes(booking.status)) return;
    const socket = getSocket();
    socket.emit("join-booking", booking._id);
    socket.on("driver-location", (d: SocketLocationPayload) => setDriverPos([d.latitude, d.longitude]));
    return () => { socket.off("driver-location"); };
  }, [booking?._id, booking?.status]);

  /* ── OTP HANDLERS ── */
  const sendPickupOtp = async () => {
    if (!booking?._id) return;
    await fetch("/api/partner/bookings/send-pickup-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking._id }),
    }).catch(console.error);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) return;
    setOtpError("");
    try {
      setLoadingOtp(true);
      const res  = await fetch("/api/partner/bookings/verify-pickup-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking?._id, otp }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.message || "Invalid OTP"); return; }
      setOtpVerified(true);
      setOtpMode(false);
      setOtp("");
      setChatOpen(false);
      setBooking(prev => prev ? { ...prev, status: "started" } : prev);
    } catch { setOtpError("Verification failed"); }
    finally   { setLoadingOtp(false); }
  };

  const sendDropOtp = async () => {
    if (!booking?._id) return;
    await fetch("/api/partner/bookings/send-drop-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking._id }),
    }).catch(console.error);
  };

  const handleVerifyDropOtp = async () => {
    if (!dropOtp || dropOtp.length < 4) return;
    setDropOtpError("");
    try {
      setLoadingDropOtp(true);
      const res  = await fetch("/api/partner/bookings/verify-drop-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking?._id, otp: dropOtp }),
      });
      const data = await res.json();
      if (!res.ok) { setDropOtpError(data.message || "Invalid OTP"); return; }
      setDropOtp("");
      setDropOtpMode(false);
      setBooking(prev => prev ? { ...prev, status: "completed" } : prev);
    } catch { setDropOtpError("Verification failed"); }
    finally   { setLoadingDropOtp(false); }
  };

  /* ══════════════════════════════════════════════════════════════════
     RENDER LOGIC — all hooks above, early returns below
  ══════════════════════════════════════════════════════════════════ */

  /* Loading */
  if (!fetchDone) return (
    <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-white/40 text-sm tracking-widest uppercase font-medium">Loading ride…</p>
      </div>
    </div>
  );

  /* No active booking */
  if (!booking) return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="w-28 h-28 rounded-full bg-zinc-800/60 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-zinc-700/60 flex items-center justify-center">
            <Car size={40} className="text-zinc-500" />
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-white text-2xl font-black mb-2">No Active Ride</h1>
        <p className="text-zinc-500 text-sm mb-8 max-w-xs">You don&apos;t have any active booking right now. Go online to start receiving ride requests.</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => window.location.href = "/partner"}
          className="bg-white text-zinc-900 px-8 py-4 rounded-2xl text-sm font-bold hover:bg-zinc-100 transition-colors"
        >
          Back to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );

  const status    = (booking?.status ?? "confirmed") as BookingStatus;
  const cfg       = STATUS_LABEL[status];
  const mapStatus = MAP_STATUS[status];

  /* ── COMPLETED — full screen, no map ── */
  if (status === "completed" && booking) {
    return <CompletedScreen booking={booking} />;
  }

  /* ── FAILED (cancelled / rejected / expired) — full screen, no map ── */
  if (TERMINAL.includes(status) && status !== "completed" && booking) {
    return <FailedScreen booking={booking} status={status} cfg={cfg} />;
  }

  /* No booking found after fetch */
  if (!booking || !pickupPos || !dropPos) return (
    <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-white/40 text-sm tracking-widest uppercase font-medium">Loading ride…</p>
      </div>
    </div>
  );

  const isActive        = ["confirmed", "started"].includes(status);
  const canChat         = status === "confirmed";
  const displayEta      = mapStatus === "arriving" ? etaToPickup : etaToDrop;
  const displayDistance = mapStatus === "arriving" ? distanceToPickup : distanceToDrop;

  const panelProps = {
    booking, status, cfg, isActive, canChat, displayEta, displayDistance,
    otpMode, otp, loadingOtp, otpVerified, otpError,
    setOtpMode, setOtp, setOtpError, handleVerifyOtp, sendPickupOtp,
    dropOtpMode, dropOtp, loadingDropOtp, dropOtpError,
    setDropOtpMode, setDropOtp, setDropOtpError, handleVerifyDropOtp, sendDropOtp,
    chatOpen, onChatToggle: () => canChat && setChatOpen(v => !v),
  };

  return (
    <div className="h-screen w-full bg-zinc-100 flex flex-col lg:flex-row overflow-hidden">

      {/* MAP */}
      <div className="relative flex-1 h-full z-0">
        <LiveRideMap
          driverLocation={driverPos}
          pickupLocation={pickupPos}
          dropLocation={dropPos}
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

      {/* DESKTOP PANEL */}
      <motion.div
        initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-[420px] xl:w-[460px] bg-white border-l border-zinc-100 flex-col overflow-hidden"
      >
        <div className="bg-zinc-950 px-6 py-5 flex-shrink-0">
          <p className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-semibold mb-1">Driver Panel</p>
          <div className="flex items-center justify-between">
            <h1 className="text-white text-xl font-bold">Active Ride</h1>
            {isActive && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                <Zap size={12} className="text-amber-400" />
                <span className="text-white text-xs font-semibold">{Math.round(displayEta)} min</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <PanelContent {...panelProps} />
          </div>
          <ActionBar {...panelProps} />
        </div>
      </motion.div>

      {/* MOBILE BOTTOM SHEET */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
        <motion.div
          className="bg-white rounded-t-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
          animate={{ height: expanded ? "82vh" : PEEK_H }}
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
          <div className="flex-1 overflow-y-auto min-h-0">
            <PanelContent {...panelProps} />
          </div>
          <ActionBar {...panelProps} />
        </motion.div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ACTION BAR
══════════════════════════════════════════════════════════════════════ */
