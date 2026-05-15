"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Clock, Route } from "lucide-react";

const RouteMap = dynamic(() => import("@/features/ride-details/components/RouteMap"), { ssr: false });

type SearchMapPanelProps = {
  pickup: string;
  drop: string;
  km: number | null;
  eta: number | null;
  onDistance: (km: number | null) => void;
  onRouteChange: (pickup: string, drop: string) => void;
};

export function SearchMapPanel({
  pickup,
  drop,
  km,
  eta,
  onDistance,
  onRouteChange,
}: SearchMapPanelProps) {
  return (
    <div className="relative w-full h-[52vh] z-0">
      <RouteMap
        pickup={pickup}
        drop={drop}
        onDistance={onDistance}
        onChange={onRouteChange}
      />

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-100 to-transparent pointer-events-none z-10" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[999]"
      >
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-zinc-200 shadow-sm px-4 py-2 rounded-full text-xs font-semibold text-zinc-700">
          <Route size={12} className="text-zinc-400" />
          <span>{km ? `${km} km` : "Calculating..."}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-zinc-200 shadow-sm px-4 py-2 rounded-full text-xs font-semibold text-zinc-700">
          <Clock size={12} className="text-zinc-400" />
          <span>{eta ? `${eta} min` : "-"}</span>
        </div>
      </motion.div>
    </div>
  );
}

