"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  MapPin,
  Navigation,
  Car,
  ArrowRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

type BookingAssistantResponse = {
  pickup: string | null;
  dropoff: string | null;
  vehicleType: "car" | "bike" | "auto" | "truck" | "loading" | null;
  passengers: number | null;
  specialInstructions: string | null;
  bookingCategory: "personal" | "delivery" | "scheduled" | "unknown";
  confidence: number;
  missingFields: string[];
  safetyFlags: string[];
  readyToBook: boolean;
};

export default function AIBookingAssistant({ onAuthRequired }: { onAuthRequired: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<BookingAssistantResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (!userData) {
      onAuthRequired();
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setParsedData(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/ai/parse-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (res.ok && data) {
        setParsedData(data);
      } else {
        setErrorMsg(data.message || "Failed to parse booking. Is the API key loaded?");
      }
    } catch (err) {
      console.error("AI booking error:", err);
      setErrorMsg("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!parsedData) return;

    const url = new URLSearchParams();
    if (parsedData.pickup) url.set("pickup", parsedData.pickup);
    if (parsedData.dropoff) url.set("drop", parsedData.dropoff);
    if (parsedData.vehicleType) url.set("vehicleType", parsedData.vehicleType.toLowerCase());

    router.push(`/book?${url.toString()}`);
    setIsOpen(false);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl flex items-center justify-center border-2 border-white/20 group"
      >
        <Sparkles size={24} className="group-hover:animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden"
          >
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Sparkles size={16} />
                </div>
                <h3 className="font-bold">AI Ride Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {!parsedData ? (
                <>
                  <p className="text-slate-600 text-sm mb-4">
                    Describe your ride and I&apos;ll turn it into a booking draft.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-xs text-slate-500 font-medium italic">
                    &quot;Get me a car from Central Station to the Airport for 3 people.&quot;
                  </div>

                  {errorMsg && (
                    <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 mb-4 text-xs font-medium">
                      Warning: {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="relative">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Where do you want to go?"
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !prompt.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </form>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        parsedData.readyToBook
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <Sparkles size={12} />
                      {parsedData.readyToBook ? "Ready to book" : "Needs a quick review"}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex gap-3">
                      <MapPin size={16} className="text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Pickup</p>
                        <p className="text-sm font-semibold text-slate-800">{parsedData.pickup || "Not clear yet"}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Navigation size={16} className="text-indigo-500 mt-0.5" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Dropoff</p>
                        <p className="text-sm font-semibold text-slate-800">{parsedData.dropoff || "Not clear yet"}</p>
                      </div>
                    </div>
                    {parsedData.vehicleType && (
                      <div className="flex gap-3">
                        <Car size={16} className="text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Vehicle Type</p>
                          <p className="text-sm font-semibold text-slate-800 capitalize">{parsedData.vehicleType}</p>
                        </div>
                      </div>
                    )}
                    {parsedData.passengers && (
                      <div className="flex gap-3">
                        <Users size={16} className="text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Passengers</p>
                          <p className="text-sm font-semibold text-slate-800">{parsedData.passengers}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <p className="text-blue-500 uppercase font-bold tracking-wide">Category</p>
                      <p className="text-slate-800 font-semibold capitalize mt-1">{parsedData.bookingCategory}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <p className="text-slate-500 uppercase font-bold tracking-wide">Confidence</p>
                      <p className="text-slate-800 font-semibold mt-1">{Math.round(parsedData.confidence * 100)}%</p>
                    </div>
                  </div>

                  {parsedData.specialInstructions && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                      <p className="uppercase font-bold text-slate-400">Notes</p>
                      <p className="text-slate-700 mt-1">{parsedData.specialInstructions}</p>
                    </div>
                  )}

                  {parsedData.missingFields.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase">
                        <AlertTriangle size={13} />
                        Missing details
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {parsedData.missingFields.map((field) => (
                          <span key={field} className="px-2 py-1 rounded-full bg-white text-amber-800 text-xs border border-amber-200">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedData.safetyFlags.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-red-700 text-xs font-bold uppercase">
                        <AlertTriangle size={13} />
                        Review flags
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-red-700">
                        {parsedData.safetyFlags.map((flag) => (
                          <li key={flag}>• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parsedData.readyToBook && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-700 text-xs font-medium">
                      <CheckCircle2 size={14} />
                      This looks complete enough to prefill the booking form.
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setParsedData(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors"
                    >
                      Continue <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
