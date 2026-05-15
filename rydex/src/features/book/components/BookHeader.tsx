"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export function BookHeader({ progress, onBack }: { progress: number; onBack: () => void }) {
  return (
    <div className="flex items-center gap-4 mb-6 px-1">
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onBack}
        className="w-11 h-11 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors flex-shrink-0"
      >
        <ArrowLeft size={17} className="text-zinc-900" />
      </motion.button>
      <div className="flex-1 min-w-0">
        <h1 className="text-zinc-900 text-xl font-black tracking-tight">Book a Ride</h1>
        <p className="text-zinc-400 text-xs mt-0.5">Fill in the details below</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            animate={{ width: index < progress ? 20 : 8, background: index < progress ? "#09090b" : "#d4d4d8" }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
