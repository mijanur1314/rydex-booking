"use client";

import { motion } from "framer-motion";
import { Clock, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { KPI_CONFIG } from "../constants";

export function KpiCard({
  label,
  value,
  icon,
  trend,
  trendDir = "up",
  sub,
  variant = "totalVendors",
}: {
  label: string;
  value: number;
  icon: ReactNode;
  trend?: string;
  trendDir?: "up" | "down" | "flat";
  sub?: string;
  variant?: keyof typeof KPI_CONFIG;
}) {
  const cfg = KPI_CONFIG[variant];

  const trendIcon =
    trendDir === "up" ? (
      <TrendingUp size={11} />
    ) : trendDir === "down" ? (
      <TrendingDown size={11} />
    ) : (
      <Minus size={11} />
    );

  const trendColor =
    trendDir === "up"
      ? "bg-green-50 text-green-800"
      : trendDir === "down"
        ? "bg-red-50 text-red-800"
        : "bg-gray-100 text-gray-600";

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(0,0,0,0.10)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-default relative overflow-hidden group ${cfg.cardHover}`}
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl ${cfg.iconBg}`}
        style={{ zIndex: 0 }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <motion.div
            whileHover={{ rotate: -6, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${cfg.iconBg} ${cfg.iconColor}`}
          >
            {icon}
          </motion.div>

          {trend && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${trendColor}`}>
              {trendIcon}
              {trend}
            </span>
          )}
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <motion.p
          className="text-3xl font-extrabold text-gray-950 leading-tight"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {value}
        </motion.p>

        {sub && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <p className="text-[11px] text-gray-400">{sub}</p>
            <Clock size={11} className="text-gray-300" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
