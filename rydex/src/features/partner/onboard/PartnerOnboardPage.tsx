"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bike, Car, Truck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

const STEPS = [
  {
    icon: Bike,
    title: "Vehicle Details",
    desc: "Add vehicle type, number & capacity",
  },
  {
    icon: Car,
    title: "Document Verification",
    desc: "Upload RC, license & ID proof",
  },
  {
    icon: Truck,
    title: "Bank & Payout",
    desc: "Set up bank account for earnings",
  },
];

/**
 * PartnerOnboardPage
 *
 * Landing page for new vendors. Checks their current onboarding step
 * and automatically redirects them to the correct step so they never
 * have to restart from the beginning.
 */
export default function PartnerOnboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user has already started onboarding and redirect to the correct step
    axios
      .get("/api/partner/vehicle")
      .then((res) => {
        const step: number = res.data?.user?.vendorOnboardingStep ?? 0;

        if (step >= 3) {
          // Bank done — go to dashboard to see review status
          router.replace("/partner");
        } else if (step >= 2) {
          // Documents done — go to bank step
          router.replace("/partner/onboard/bank");
        } else if (step >= 1) {
          // Vehicle done — go to documents step
          router.replace("/partner/onboard/documents");
        } else {
          // Not started — show this page
          setLoading(false);
        }
      })
      .catch(() => {
        // Not a vendor yet or unauthenticated — just show the intro
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-6 sm:p-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">
            Become a Partner
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            Start earning by listing your vehicle on our platform
          </p>
        </div>

        {/* Steps */}
        <div className="mt-10 space-y-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-gray-200 bg-gray-50"
              >
                <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-black text-sm sm:text-base">
                    {step.title}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/partner/onboard/vehicle")}
          className="mt-10 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 transition"
        >
          Start Registration
          <ArrowRight size={18} />
        </motion.button>

        <p className="text-[11px] text-gray-400 text-center mt-4">
          Takes less than 5 minutes to complete
        </p>
      </motion.div>
    </div>
  );
}
