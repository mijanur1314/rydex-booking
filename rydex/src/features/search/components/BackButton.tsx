"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  onBack: () => void;
};

export function BackButton({ onBack }: BackButtonProps) {
  return (
    <div className="absolute top-5 left-5 z-50">
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onBack}
        className="w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors"
      >
        <ArrowLeft size={17} className="text-zinc-900" />
      </motion.button>
    </div>
  );
}

