"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, Truck, Users, Video, XCircle } from "lucide-react";
import { useState } from "react";
import AdminEarningsChart from "@/features/admin/components/AdminEarning";
import StatusAreaChart from "@/features/admin/components/AdminStatusChart";
import { AdminDashboardHeader } from "./components/AdminDashboardHeader";
import { KpiCard } from "./components/KpiCard";
import { ReviewList } from "./components/ReviewList";
import { TabButton } from "./components/ReviewTabs";
import { useAdminDashboardData } from "./hooks/useAdminDashboardData";
import type { TabType } from "./types";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("kyc");
  const {
    error,
    loadAll,
    loading,
    stats,
    vehicleReviews,
    vendorReviews,
    videoKycReviews,
  } = useAdminDashboardData();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-400">
        Loading admin dashboard...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-gray-100 to-gray-200 px-6">
        <div className="max-w-md w-full rounded-3xl border border-red-100 bg-white p-8 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">Admin dashboard failed to load</p>
            <p className="text-sm text-gray-500 mt-1">
              {error || "Something went wrong while loading admin data."}
            </p>
          </div>
          <button
            onClick={loadAll}
            className="px-5 py-2.5 rounded-2xl bg-neutral-950 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <AdminDashboardHeader />

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label="Total Vendors"
            value={stats.totalVendors}
            icon={<Users size={18} />}
            variant="totalVendors"
            trend="+12%"
            trendDir="up"
            sub="vs last month"
          />
          <KpiCard
            label="Approved"
            value={stats.approved}
            icon={<CheckCircle2 size={18} />}
            variant="approved"
            trend="+8%"
            trendDir="up"
            sub="verified vendors"
          />
          <KpiCard
            label="Pending"
            value={stats.pending}
            icon={<Clock size={18} />}
            variant="pending"
            trend="0%"
            trendDir="flat"
            sub="awaiting review"
          />
          <KpiCard
            label="Rejected"
            value={stats.rejected}
            icon={<XCircle size={18} />}
            variant="rejected"
            trend="-3%"
            trendDir="down"
            sub="declined"
          />
        </div>

        <StatusAreaChart stats={stats} />
        <AdminEarningsChart />

        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex flex-wrap gap-2">
          <TabButton
            active={activeTab === "kyc"}
            count={videoKycReviews.length}
            onClick={() => setActiveTab("kyc")}
            icon={<Video size={15} />}
          >
            Video KYC
          </TabButton>
          <TabButton
            active={activeTab === "vendor"}
            count={vendorReviews.length}
            onClick={() => setActiveTab("vendor")}
            icon={<Users size={15} />}
          >
            Vendor Reviews
          </TabButton>
          <TabButton
            active={activeTab === "vehicle"}
            count={vehicleReviews.length}
            onClick={() => setActiveTab("vehicle")}
            icon={<Truck size={15} />}
          >
            Pricing &amp; Images
          </TabButton>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-3"
          >
            {activeTab === "kyc" && <ReviewList data={videoKycReviews} type="kyc" />}
            {activeTab === "vendor" && <ReviewList data={vendorReviews} type="vendor" />}
            {activeTab === "vehicle" && <ReviewList data={vehicleReviews} type="vehicle" />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
