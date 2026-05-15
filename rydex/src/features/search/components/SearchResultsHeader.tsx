"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";

type SearchResultsHeaderProps = {
  loading: boolean;
  vehicleCount: number;
  vehicleLabel?: string;
};

export function SearchResultsHeader({
  loading,
  vehicleCount,
  vehicleLabel,
}: SearchResultsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex items-center justify-between mb-4"
    >
      <div>
        <h2 className="text-zinc-900 text-lg font-black tracking-tight">
          {loading
            ? "Finding vehicles..."
            : vehicleCount > 0
              ? `${vehicleCount} Available`
              : "No vehicles nearby"}
        </h2>
        {vehicleLabel && (
          <p className="text-zinc-400 text-xs mt-0.5">
            {vehicleLabel} rides near your pickup
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-full"
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 border-t-zinc-700 animate-spin" />
            <span className="text-zinc-500 text-xs font-semibold">Searching</span>
          </motion.div>
        ) : vehicleCount > 0 ? (
          <motion.div
            key="live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
          >
            <Zap size={11} className="text-emerald-600 fill-emerald-600" />
            <span className="text-emerald-700 text-xs font-bold">Live</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

