"use client";

import { ShieldCheck } from "lucide-react";

export function AdminDashboardHeader() {
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold">
            R
          </div>
          <span className="font-bold text-lg tracking-wide">RYDEX ADMIN</span>
        </div>

        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700">
          <ShieldCheck size={14} />
          Secure Mode
        </div>
      </div>
    </header>
  );
}
