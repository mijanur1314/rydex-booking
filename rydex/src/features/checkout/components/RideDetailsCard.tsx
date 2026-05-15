"use client";

import { motion } from "framer-motion";
import { Car, MapPin, Navigation } from "lucide-react";
import { VEHICLE_ICONS } from "../constants";

type RideDetailsCardProps = {
  pickup: string;
  drop: string;
  vehicle: string;
  vehicleLabel: string;
  fare: number;
};

export function RideDetailsCard({ pickup, drop, vehicle, vehicleLabel, fare }: RideDetailsCardProps) {
  const VehicleIcon = VEHICLE_ICONS[vehicle.toLowerCase()] || Car;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
    >
      <div className="h-1 bg-zinc-900" />
      <div className="p-8 sm:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">Selected Vehicle</p>
            <h2 className="text-3xl font-black tracking-tight text-zinc-900">{vehicleLabel}</h2>
          </div>
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg">
            <VehicleIcon size={28} className="text-white" />
          </div>
        </div>

        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden mb-8">
          <RouteRow label="Pickup" value={pickup} icon={<MapPin size={14} className="text-zinc-400 flex-shrink-0 mt-1" />} />
          <RouteRow label="Drop" value={drop} isDrop icon={<Navigation size={14} className="text-zinc-400 flex-shrink-0 mt-1" />} />
        </div>

        <div className="flex items-end justify-between pt-6 border-t border-zinc-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">Total Fare</p>
            <p className="text-zinc-400 text-xs font-medium">Includes base + distance charges</p>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="flex items-baseline gap-1"
          >
            <span className="text-zinc-400 text-lg font-black">Rs.</span>
            <span className="text-zinc-900 text-5xl font-black tracking-tight leading-none">{fare}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function RouteRow({
  label,
  value,
  icon,
  isDrop = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  isDrop?: boolean;
}) {
  return (
    <div className={`flex gap-4 px-5 py-4 ${isDrop ? "" : "border-b border-zinc-100"}`}>
      <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
        <div className={`${isDrop ? "rounded-sm" : "rounded-full"} w-3 h-3 bg-zinc-900 border-2 border-white ring-1 ring-zinc-300`} />
        {!isDrop && <div className="w-px flex-1 bg-zinc-300 my-1" style={{ minHeight: 12 }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-zinc-900 leading-snug truncate">{value}</p>
      </div>
      {icon}
    </div>
  );
}
