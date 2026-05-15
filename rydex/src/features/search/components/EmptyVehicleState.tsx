"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Search } from "lucide-react";

type EmptyVehicleStateProps = {
  loading: boolean;
  hasVehicles: boolean;
  vehicleLabel?: string;
  onRetry: () => void;
};

export function EmptyVehicleState({
  loading,
  hasVehicles,
  vehicleLabel,
  onRetry,
}: EmptyVehicleStateProps) {
  return (
    <AnimatePresence>
      {!loading && !hasVehicles && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-14 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4">
            <Search size={26} className="text-zinc-400" />
          </div>
          <p className="text-zinc-900 font-bold text-base mb-1">No vehicles found</p>
          <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
            No {vehicleLabel || "vehicle"} drivers are available near your pickup right now.
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="mt-5 flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw size={14} /> Retry Search
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

