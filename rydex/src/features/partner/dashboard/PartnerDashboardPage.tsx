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
  LogOut,
  User,
  Settings,
  Car as CarIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { getSocket } from "@/lib/socket";
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

const STATUS_MESSAGES: Record<number, { title: string; desc: string; icon: React.ReactNode }> = {
  0: { title: "Start Onboarding", desc: "Complete registration to start accepting rides.", icon: <Car size={24} className="text-white" /> },
  1: { title: "Vehicle Added", desc: "Upload your documents to continue.", icon: <FileText size={24} className="text-white" /> },
  2: { title: "Documents Uploaded", desc: "Add your bank details to complete registration.", icon: <IndianRupee size={24} className="text-white" /> },
  3: { title: "Documents Under Review", desc: "Admin is verifying your documents.", icon: <Clock size={24} className="text-white" /> },
  4: { title: "Documents Verified", desc: "Complete your Video KYC to unlock your account.", icon: <Video size={24} className="text-white" /> },
  5: { title: "Video KYC Done", desc: "Set your vehicle pricing to go live.", icon: <IndianRupee size={24} className="text-white" /> },
  6: { title: "Pricing Set", desc: "Final review is in progress. You'll be live soon!", icon: <Clock size={24} className="text-white" /> },
  7: { title: "You're Live!", desc: "Your account is active. You can now accept ride requests.", icon: <CheckCircle2 size={24} className="text-white" /> },
};

/**
 * OnboardingProgress Component
 */
function OnboardingProgress({ step }: { step: number }) {
  const status = STATUS_MESSAGES[step] ?? STATUS_MESSAGES[3];

  return (
    <motion.div variants={itemVariants} className="max-w-5xl mx-auto mt-8 mb-12">
      <div className="mb-8 px-2">
        <h2 className="text-3xl font-bold text-black tracking-tight">Vendor Onboarding</h2>
        <p className="text-gray-500 mt-2 text-sm">Complete all steps to activate your account</p>
      </div>

      <div className="bg-white rounded-3xl py-10 px-4 sm:px-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 mb-6">
        <div className="relative flex justify-between items-start w-full">
          {ONBOARD_STEPS.map((s, i) => {
            const isDone = step >= s.doneAfterStep;
            const isCurrent = !isDone && (i === 0 || step >= ONBOARD_STEPS[i - 1].doneAfterStep);
            const isLocked = !isDone && !isCurrent;

            return (
              <div key={s.label} className="relative flex flex-col items-center flex-1">
                {/* Connecting line to the PREVIOUS step */}
                {i > 0 && (
                  <div
                    className={`absolute h-[2px] top-6 right-1/2 w-full -z-10 ${
                      isDone || isCurrent ? "bg-black" : "bg-gray-200"
                    }`}
                  />
                )}

                {/* Step circle and label */}
                {s.actionHref && (isDone || isCurrent) ? (
                  <Link href={s.actionHref} className="flex flex-col items-center hover:opacity-80 transition cursor-pointer">
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white ${
                        isDone
                          ? "bg-black text-white"
                          : "border-[2px] border-black text-black"
                      }`}
                    >
                      {isDone ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="font-semibold">{i + 1}</span>
                      )}
                    </div>
                    <span className="mt-4 text-xs font-medium text-center text-black">
                      {s.label}
                    </span>
                  </Link>
                ) : (
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white ${
                        isDone
                          ? "bg-black text-white"
                          : isCurrent
                          ? "border-[2px] border-black text-black"
                          : "border-[1px] border-gray-300 text-gray-300"
                      }`}
                    >
                      {isDone ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isLocked ? (
                        <Lock size={16} strokeWidth={2} />
                      ) : (
                        <span className="font-semibold">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-4 text-xs font-medium text-center ${
                        isDone || isCurrent ? "text-black" : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center gap-6">
        <div className="w-16 h-16 bg-black rounded-[1.25rem] flex items-center justify-center shrink-0">
          {status.icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-black">{status.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{status.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function PartnerDashboard() {
  const [user, setUser] = useState<{ _id?: string, name?: string; image?: string; vendorOnboardingStep?: number; isOnline?: boolean } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [toast, setToast] = useState<{ message: string; href: string } | null>(null);

  const [metrics, setMetrics] = useState({
    todaysEarnings: 0,
    ridesCompleted: 0,
    pendingRequests: 0,
    activeHours: "0h 0m",
    driverRating: 4.9,
  });

  const [earningsData, setEarningsData] = useState<Array<{ name: string; amount: number }>>([]);
  const [recentRides, setRecentRides] = useState<
    Array<{ id: string; pickup: string; dropoff: string; price: string; status: string; time: string; user?: string; date?: string }>
  >([]);

  const DUMMY_EARNINGS = [
    { name: "Mon", amount: 120 },
    { name: "Tue", amount: 350 },
    { name: "Wed", amount: 200 },
    { name: "Thu", amount: 680 },
    { name: "Fri", amount: 500 },
    { name: "Sat", amount: 890 },
    { name: "Sun", amount: 1050 },
  ];

  useEffect(() => {
    // Fetch user (includes onboarding step)
    axios.get("/api/me").then((res) => {
      setUser(res.data);
      if (res.data?.isOnline !== undefined) {
        setIsOnline(res.data.isOnline);
      }
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
          if (bDate === todaysDate && (b.paymentStatus === "paid" || b.paymentStatus === "cash")) {
            todaysEarnings += b.partnerAmount || 0;
          }
        });

        setMetrics((prev) => ({
          ...prev,
          todaysEarnings: Number(todaysEarnings.toFixed(2)),
          ridesCompleted: completedRides.length,
        }));

        setRecentRides(
          bookings.slice(0, 3).map((b: any) => ({
            id: b._id,
            user: b.user?.name || "Customer",
            date: new Date(b.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
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

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const handleNewBooking = () => {
      setMetrics((prev) => ({ ...prev, pendingRequests: prev.pendingRequests + 1 }));
      setToast({
        message: "New ride request received! Tap to view.",
        href: "/partner/pending-requests",
      });
      setTimeout(() => setToast(null), 5000);
    };

    socket.on("new-booking", handleNewBooking);
    return () => {
      socket.off("new-booking", handleNewBooking);
    };
  }, [user]);

  const onboardingStep = user?.vendorOnboardingStep ?? 0; // Default to 0 for new vendors
  const isFullyOnboarded = onboardingStep >= 7;

  const toggleOnlineStatus = async () => {
    if (!isFullyOnboarded) {
      alert("You must complete onboarding before going online.");
      return;
    }

    if (!isOnline) {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }
      setTogglingStatus(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await axios.post("/api/partner/status", {
              isOnline: true,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
            setIsOnline(res.data.isOnline);
          } catch (err) {
            console.error(err);
            alert("Failed to go online");
          } finally {
            setTogglingStatus(false);
          }
        },
        (err) => {
          console.error(err);
          alert("Could not get your location. Please enable location services to go online.");
          setTogglingStatus(false);
        }
      );
    } else {
      try {
        setTogglingStatus(true);
        const res = await axios.post("/api/partner/status", { isOnline: false });
        setIsOnline(res.data.isOnline);
      } catch (err) {
        console.error(err);
        alert("Failed to update status");
      } finally {
        setTogglingStatus(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] font-sans">
      {/* Navigation header */}
      <header className="pt-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-black text-white rounded-[2rem] h-[4.5rem] flex items-center justify-between px-8 shadow-xl">
          <Link href="/partner" className="flex items-center gap-2">
            <Image 
              src="/logo.jpeg" 
              alt="RYDEX Logo" 
              width={100} 
              height={32} 
              className="h-8 w-auto object-contain rounded"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-300">
            <Link href="/partner/active-ride" className="hover:text-white transition-colors">Active Ride</Link>
            <Link href="/partner/pending-requests" className="hover:text-white transition-colors">Pending Requests</Link>
            <Link href="/partner/bookings" className="hover:text-white transition-colors">My Bookings</Link>
          </nav>

          <div className="flex items-center gap-4 relative">
            <button
              onClick={toggleOnlineStatus}
              disabled={togglingStatus || !isFullyOnboarded}
              className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors border ${
                isOnline 
                  ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600" 
                  : "bg-transparent border-gray-600 text-gray-400 hover:bg-gray-800"
              }`}
            >
              {togglingStatus ? "..." : isOnline ? "Online" : "Offline"}
            </button>

            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg cursor-pointer hover:bg-gray-200 transition-colors ml-2"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 w-56 bg-white text-black border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {user?.name || "Vendor"}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    PARTNER
                  </p>
                </div>

                <div className="px-2 py-2">
                  <button 
                    onClick={() => {
                      setProfileOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100]"
        >
          <Link href={toast.href} onClick={() => setToast(null)}>
            <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 cursor-pointer hover:bg-emerald-600 transition-colors">
              <Bell size={18} className="animate-bounce" />
              <span className="font-bold text-sm tracking-wide">{toast.message}</span>
            </div>
          </Link>
        </motion.div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">

          {/* Onboarding progress widget — only shown until fully live */}
          {!isFullyOnboarded && <OnboardingProgress step={onboardingStep} />}

          {/* Dashboard section */}
          <motion.div variants={itemVariants} className="max-w-5xl mx-auto mt-12">
            <div className="mb-8 px-2">
              <p className="text-[11px] font-bold text-blue-500 tracking-[0.2em] uppercase mb-1">PARTNER DASHBOARD</p>
              <h2 className="text-3xl font-bold text-black tracking-tight">Daily Earnings</h2>
              <p className="text-gray-500 mt-1 text-sm">Last 7 days performance</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col md:flex-row gap-8">
               <div className="flex-1 border-r border-gray-100 pr-8">
                 <div className="flex items-center gap-2 text-purple-600 mb-2">
                   <Star size={18} fill="currentColor" />
                   <span className="text-xs font-bold tracking-wider">BEST DAY</span>
                 </div>
                 <h3 className="text-4xl font-bold text-black mt-2">₹1,240</h3>
                 <p className="text-sm text-gray-400 mt-1">Thursday</p>
               </div>
               
               <div className="flex-1 border-r border-gray-100 px-8">
                 <div className="flex items-center gap-2 text-blue-500 mb-2">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                   </svg>
                   <span className="text-xs font-bold tracking-wider">DAILY AVG</span>
                 </div>
                 <h3 className="text-4xl font-bold text-black mt-2">₹850</h3>
                 <p className="text-sm text-gray-400 mt-1">This week</p>
               </div>
               
               <div className="flex-1 pl-8">
                 <div className="flex items-center gap-2 text-emerald-500 mb-2">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <span className="text-xs font-bold tracking-wider">TODAY</span>
                 </div>
                 <h3 className="text-4xl font-bold text-black mt-2">₹{metrics.todaysEarnings}</h3>
                 <p className="text-sm text-gray-400 mt-1">So far</p>
               </div>
            </div>
            
            {/* Full Dashboard Link / Stats (Optional depending on your needs) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {/* Earnings chart */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-black">Earnings Overview</h3>
                    <p className="text-sm text-gray-500">Your recent earnings performance</p>
                  </div>
                </div>
                <div className="h-72 w-full">
                  {earningsData.length > 0 || DUMMY_EARNINGS.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={earningsData.length > 0 ? earningsData : DUMMY_EARNINGS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#000" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 8px 30px rgb(0 0 0 / 0.1)" }}
                          itemStyle={{ color: "#000", fontWeight: "bold" }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      No earning data available yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent rides */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-black">Recent Rides</h3>
                  <Link href="/partner/bookings" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                    View All
                  </Link>
                </div>

                <div className="space-y-4 flex-1">
                  {recentRides.length > 0 ? (
                    recentRides.map((ride) => (
                      <div key={ride.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-bold text-black block">{ride.user}</span>
                            <span className="text-xs text-gray-500">{ride.date} at {ride.time}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-bold text-black">{ride.price}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                                ride.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : ride.status === "Requested" || ride.status === "Pending"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {ride.status}
                            </span>
                          </div>
                        </div>

                        <div className="relative pl-6 space-y-3">
                          <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-300" />
                          <div className="relative">
                            <div className="absolute -left-6 top-1 w-2.5 h-2.5 bg-black rounded-full border-[2px] border-gray-50" />
                            <p className="text-sm text-gray-600 font-medium truncate">{ride.pickup}</p>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-6 top-1 w-2.5 h-2.5 bg-black rounded-sm border-[2px] border-gray-50" />
                            <p className="text-sm text-black font-medium truncate">{ride.dropoff}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      No recent rides found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
