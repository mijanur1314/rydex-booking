"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";

type RouteSummaryProps = {
  pickup: string;
  drop: string;
};

export function RouteSummary({ pickup, drop }: RouteSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden mb-5"
    >
      <div className="flex gap-3 px-4 py-3 border-b border-zinc-100">
        <div className="flex flex-col items-center pt-1.5 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
          <div className="w-px flex-1 bg-zinc-300 my-1" style={{ minHeight: 14 }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">Pickup</p>
          <p className="text-sm text-zinc-900 font-semibold leading-snug truncate">{pickup || "-"}</p>
        </div>
        <MapPin size={14} className="text-zinc-400 flex-shrink-0 mt-1.5" />
      </div>
      <div className="flex gap-3 px-4 py-3">
        <div className="flex-shrink-0 pt-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-zinc-900" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">Drop</p>
          <p className="text-sm text-zinc-900 font-semibold leading-snug truncate">{drop || "-"}</p>
        </div>
        <Navigation size={14} className="text-zinc-400 flex-shrink-0 mt-1.5" />
      </div>
    </motion.div>
  );
}

