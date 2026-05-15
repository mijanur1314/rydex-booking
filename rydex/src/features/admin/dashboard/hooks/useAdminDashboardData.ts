"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import type { ReviewItem, Stats } from "../types";

export function useAdminDashboardData() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [vendorReviews, setVendorReviews] = useState<ReviewItem[]>([]);
  const [vehicleReviews, setVehicleReviews] = useState<ReviewItem[]>([]);
  const [videoKycReviews, setVideoKycReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);

    const [dashboardResult, kycResult] = await Promise.allSettled([
      axios.get("/api/admin/dashboard"),
      axios.get("/api/admin/vendors/video-kyc/pending"),
    ]);

    if (dashboardResult.status === "fulfilled") {
      setStats(dashboardResult.value.data.stats);
      setVendorReviews(dashboardResult.value.data.pendingVendors ?? []);
      setVehicleReviews(dashboardResult.value.data.pendingVehicles ?? []);
    } else {
      const message =
        dashboardResult.reason?.response?.data?.message ||
        "Could not load admin dashboard data.";
      setError(message);
    }

    if (kycResult.status === "fulfilled") {
      setVideoKycReviews(kycResult.value.data ?? []);
    } else {
      console.error("KYC queue error:", kycResult.reason);
      setVideoKycReviews([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadAll();
    });
  }, [loadAll]);

  return {
    error,
    loadAll,
    loading,
    stats,
    vehicleReviews,
    vendorReviews,
    videoKycReviews,
  };
}
