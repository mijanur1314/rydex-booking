"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  IndianRupee,
  Car,
  Clock,
  Star,
  ArrowRight,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Circle,
  Video,
  BadgeCheck,
  FileText,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

type OnboardStep = {
  label: string;
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  /** The minimum vendorOnboardingStep value for this step to be "done" */
  doneAfterStep: number;
};

const ONBOARD_STEPS: OnboardStep[] = [
  {
    label: "Vehicle",
    description: "Add your vehicle details",
    icon: <Car size={14} />,
    actionLabel: "Add Vehicle",
    actionHref: "/partner/onboard/vehicle",
    doneAfterStep: 1,
  },
  {
    label: "Documents",
    description: "Upload RC, license & ID proof",
    icon: <FileText size={14} />,
    actionLabel: "Upload Docs",
    actionHref: "/partner/onboard/documents",
    doneAfterStep: 2,
  },
  {
    label: "Bank",
    description: "Set up your payout account",
    icon: <IndianRupee size={14} />,
    actionLabel: "Add Bank",
    actionHref: "/partner/onboard/bank",
    doneAfterStep: 3,
  },
  {
    label: "Review",
    description: "Admin verifying your documents",
    icon: <ShieldCheck size={14} />,
    doneAfterStep: 4,
  },
  {
    label: "Video KYC",
    description: "Complete your video verification",
    icon: <Video size={14} />,
    actionLabel: "Start KYC",
    actionHref: "/video-kyc",
    doneAfterStep: 5,
  },
  {
    label: "Pricing",
    description: "Set your vehicle pricing",
    icon: <IndianRupee size={14} />,
    actionLabel: "Set Pricing",
    actionHref: "/partner/onboard/vehicle/pricing",
    doneAfterStep: 6,
  },
  {
    label: "Final Review",
    description: "Admin final approval",
    icon: <BadgeCheck size={14} />,
    doneAfterStep: 7,
  },
  {
    label: "Live",
    description: "You're ready to take rides!",
    icon: <CheckCircle2 size={14} />,
    doneAfterStep: 8,
  },
];

const STATUS_MESSAGES: Record<number, { title: string; desc: string; color: string }> = {
  0: { title: "Start Onboarding", desc: "Complete registration to start accepting rides.", color: "bg-blue-50 border-blue-200 text-blue-800" },
  1: { title: "Vehicle Added ✓", desc: "Upload your documents to continue.", color: "bg-blue-50 border-blue-200 text-blue-800" },
  2: { title: "Documents Uploaded ✓", desc: "Add your bank details to complete registration.", color: "bg-blue-50 border-blue-200 text-blue-800" },
  3: { title: "Documents Under Review", desc: "Admin is verifying your documents. This usually takes 24–48 hours.", color: "bg-amber-50 border-amber-200 text-amber-800" },
  4: { title: "Documents Verified ✓", desc: "Complete your Video KYC to unlock your account.", color: "bg-purple-50 border-purple-200 text-purple-800" },
  5: { title: "Video KYC Done ✓", desc: "Set your vehicle pricing to go live.", color: "bg-green-50 border-green-200 text-green-800" },
  6: { title: "Pricing Set ✓", desc: "Final review is in progress. You'll be live soon!", color: "bg-amber-50 border-amber-200 text-amber-800" },
  7: { title: "🎉 You're Live!", desc: "Your account is active. You can now accept ride requests.", color: "bg-green-50 border-green-200 text-green-800" },
};

/**
 * OnboardingProgress Component
 *
 * Displays the vendor's onboarding progress as a step tracker.
 * Only shown when onboarding is not yet complete (step < 7).
 */
function OnboardingProgress({ step }: { step: number }) {
  const status = STATUS_MESSAGES[step] ?? STATUS_MESSAGES[3];
  const currentStepIndex = ONBOARD_STEPS.findIndex((s) => step < s.doneAfterStep);
  const activeStepData = currentStepIndex >= 0 ? ONBOARD_STEPS[currentStepIndex] : null;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Vendor Onboarding</h2>
          <p className="text-sm text-slate-500 mt-0.5">Complete all steps to activate your account</p>
        </div>
        <span className="text-xs font-semibold text-slate-500 shrink-0">
          {Math.min(step, 7)}/7 steps
        </span>
      </div>

      {/* Step tracker */}
      <div className="relative flex items-center justify-between gap-1 mb-5 overflow-x-auto pb-2">
        {ONBOARD_STEPS.map((s, i) => {
          const isDone = step >= s.doneAfterStep;
          const isCurrent = !isDone && (i === 0 || step >= ONBOARD_STEPS[i - 1].doneAfterStep);
          const isLocked = !isDone && !isCurrent;

          return (
            <div key={s.label} className="flex flex-col items-center gap-1.5 min-w-[60px]">
              {/* Connector line */}
              {i > 0 && (
                <div
                  className={`absolute h-0.5 top-4 transition-colors`}
                  style={{
                    left: `calc(${(i / ONBOARD_STEPS.length) * 100}% - ${100 / ONBOARD_STEPS.length / 2}%)`,
                    width: `calc(${100 / ONBOARD_STEPS.length}%)`,
                    backgroundColor: isDone ? "#16a34a" : "#e2e8f0",
                  }}
                />
              )}

              {/* Step circle */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs transition-all ${
                  isDone
                    ? "bg-green-600"
                    : isCurrent
                    ? "bg-slate-900 ring-2 ring-offset-2 ring-slate-900"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={16} />
                ) : isLocked ? (
                  <Lock size={13} />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium text-center leading-tight ${
                  isDone ? "text-green-700" : isCurrent ? "text-slate-900 font-bold" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl border px-4 py-3 flex items-start justify-between gap-4 ${status.color}`}>
        <div>
          <p className="text-sm font-semibold">{status.title}</p>
          <p className="text-xs mt-0.5 opacity-80">{status.desc}</p>
        </div>

        {/* Action button for current step */}
        {activeStepData?.actionHref && (
          <Link href={activeStepData.actionHref}>
            <button className="shrink-0 flex items-center gap-1.5 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-700 transition whitespace-nowrap">
              {activeStepData.actionLabel}
              <ArrowRight size={12} />
            </button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export default function PartnerDashboard() {
  const [user, setUser] = useState<{ name?: string; image?: string; vendorOnboardingStep?: number } | null>(null);

  const [metrics, setMetrics] = useState({
    todaysEarnings: 0,
    ridesCompleted: 0,
    pendingRequests: 0,
    activeHours: "0h 0m",
    driverRating: 4.9,
  });

  const [earningsData, setEarningsData] = useState<Array<{ name: string; amount: number }>>([]);
  const [recentRides, setRecentRides] = useState<
    Array<{ id: string; pickup: string; dropoff: string; price: string; status: string; time: string }>
  >([]);

  useEffect(() => {
    // Fetch user (includes onboarding step)
    axios.get("/api/me").then((res) => {
      setUser(res.data);
    }).catch(console.error);

    // Fetch earnings for chart
    axios.get("/api/partner/earnings").then((res) => {
      if (res.data?.earnings) {
        setEarningsData(
          (res.data.earnings as Array<{ date: string; earnings: number }>).map((e) => ({
            name: e.date,
            amount: e.earnings,
          }))
        );
      }
    }).catch(console.error);

    // Fetch bookings for metrics & recent rides
    axios.get("/api/partner/bookings").then((res) => {
      if (res.data?.bookings) {
        const bookings = res.data.bookings as Array<{
          _id: string;
          pickupAddress: string;
          dropAddress: string;
          fare: number;
          status: string;
          paymentStatus: string;
          partnerAmount?: number;
          createdAt: string;
        }>;

        const completedRides = bookings.filter((b) => b.status === "completed");
        const todaysDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        let todaysEarnings = 0;

        completedRides.forEach((b) => {
          const bDate = new Date(b.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
          if (bDate === todaysDate && b.paymentStatus === "paid") {
            todaysEarnings += b.partnerAmount || 0;
          }
        });

        setMetrics((prev) => ({
          ...prev,
          todaysEarnings,
          ridesCompleted: completedRides.length,
        }));

        setRecentRides(
          bookings.slice(0, 3).map((b) => ({
            id: b._id,
            pickup: b.pickupAddress,
            dropoff: b.dropAddress,
            price: `₹${b.fare}`,
            status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
            time: new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }))
        );
      }
    }).catch(console.error);

    // Fetch pending booking counts
    axios.get("/api/partner/bookings/counts").then((res) => {
      if (res.data?.pending !== undefined) {
        setMetrics((prev) => ({ ...prev, pendingRequests: res.data.pending }));
      }
    }).catch(console.error);
  }, []);

  const onboardingStep = user?.vendorOnboardingStep ?? 0;
  const isFullyOnboarded = onboardingStep >= 7;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Navigation header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Car size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              Rydex Partner
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/partner/active-ride" className="hover:text-slate-900 transition-colors">Active Ride</Link>
            <Link href="/partner/pending-requests" className="hover:text-slate-900 transition-colors">Pending Requests</Link>
            <Link href="/partner/bookings" className="hover:text-slate-900 transition-colors">My Bookings</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              {metrics.pendingRequests > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>

            <div className="flex items-center gap-3 border-l pl-4 border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-900">{user?.name || "Loading..."}</p>
                <p className="text-xs text-green-600 font-medium flex items-center justify-end gap-1">
                  <ShieldCheck size={12} /> {isFullyOnboarded ? "Verified" : "Onboarding"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center text-blue-700 font-bold shadow-sm overflow-hidden">
                {user?.image ? (
                  <Image src={user.image} alt={user.name || "Partner"} width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.substring(0, 2).toUpperCase() : "..."
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">

          {/* Onboarding progress widget — only shown until fully live */}
          {!isFullyOnboarded && <OnboardingProgress step={onboardingStep} />}

          {/* Welcome / actions section */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                {isFullyOnboarded ? "Overview Dashboard" : "Partner Dashboard"}
              </h2>
              <p className="text-slate-500 mt-1">
                {isFullyOnboarded
                  ? "Here's what's happening with your rides today."
                  : "Complete onboarding above to start accepting rides."}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/partner/bookings">
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all shadow-sm">
                  View Bookings
                </button>
              </Link>
              {isFullyOnboarded && (
                <Link href="/partner/active-ride">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2">
                    Start New Ride <ArrowRight size={18} />
                  </button>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Metric cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Today's Earnings"
              value={`₹${metrics.todaysEarnings}`}
              trend="Updated recently"
              icon={<IndianRupee size={24} className="text-green-600" />}
              bg="bg-green-100"
            />
            <MetricCard
              title="Rides Completed"
              value={metrics.ridesCompleted.toString()}
              trend={`${metrics.pendingRequests} pending requests`}
              icon={<Car size={24} className="text-blue-600" />}
              bg="bg-blue-100"
            />
            <MetricCard
              title="Active Hours"
              value={metrics.activeHours}
              trend="Online"
              icon={<Clock size={24} className="text-orange-600" />}
              bg="bg-orange-100"
            />
            <MetricCard
              title="Driver Rating"
              value={metrics.driverRating.toString()}
              trend="Based on recent reviews"
              icon={<Star size={24} className="text-yellow-600" />}
              bg="bg-yellow-100"
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Earnings chart */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Earnings Overview</h3>
                  <p className="text-sm text-slate-500">Your recent earnings performance</p>
                </div>
              </div>
              <div className="h-72 w-full">
                {earningsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        itemStyle={{ color: "#0f172a", fontWeight: "bold" }}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    No earning data available yet.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent rides */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Recent Rides</h3>
                <Link href="/partner/bookings" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  View All
                </Link>
              </div>

              <div className="space-y-4 flex-1">
                {recentRides.length > 0 ? (
                  recentRides.map((ride) => (
                    <div key={ride.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                            ride.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : ride.status === "Requested" || ride.status === "Pending"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {ride.status}
                        </span>
                        <span className="font-bold text-slate-900">{ride.price}</span>
                      </div>

                      <div className="relative pl-6 space-y-3">
                        <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 bg-slate-200" />
                        <div className="relative">
                          <div className="absolute -left-6 top-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-50" />
                          <p className="text-sm text-slate-600 font-medium truncate">{ride.pickup}</p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-6 top-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-50" />
                          <p className="text-sm text-slate-900 font-medium truncate">{ride.dropoff}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    No recent rides found.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  icon,
  bg,
}: {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bg} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-slate-500 text-sm font-medium mb-1">{title}</h4>
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        <p className="text-xs font-medium text-slate-400 mt-2">{trend}</p>
      </div>
    </div>
  );
}
