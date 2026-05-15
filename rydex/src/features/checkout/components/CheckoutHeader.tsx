"use client";

import { motion } from "framer-motion";

export function CheckoutHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px w-8 bg-zinc-900" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Booking</span>
      </div>
      <h1 className="text-4xl font-black tracking-tight text-zinc-900">Checkout</h1>
      <p className="text-zinc-400 text-sm mt-1.5 font-medium">Review your ride and confirm</p>
    </motion.div>
  );
}
