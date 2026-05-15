"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, Image as ImageIcon, IndianRupee, ShieldCheck, Sparkles, Truck } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ConfirmModal,
  InfoRow,
  RejectModal,
  ReviewCard,
  ReviewStatusBadge,
  RiskBadge,
  SummaryList,
} from "../components/ReviewUi";

type ReviewSummary = {
  headline?: string;
  summary?: string;
  riskLevel?: string;
  keyChecks?: string[];
  openQuestions?: string[];
  recommendedAction?: string;
};

type VehicleReview = {
  owner: { name: string; email: string };
  imageUrl?: string;
  status: "pending" | "approved" | "rejected" | string;
  type?: string;
  number?: string;
  model?: string;
  baseFare?: number;
  pricePerKm?: number;
  waitingCharge?: number;
};

export default function AdminVehicleReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<VehicleReview | null>(null);
  const [aiSummary, setAiSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`/api/admin/vehicles/${id}`);
        setData(res.data.vehicle);
        setAiSummary(res.data.aiSummary);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  const completeAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !rejectReason.trim()) return;
    try {
      setActionLoading(true);
      await axios.post(`/api/admin/vehicles/${id}/${action}`, action === "reject" ? { reason: rejectReason } : undefined);
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
      setShowApprove(false);
      setShowReject(false);
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-gray-400">Loading vehicle review...</div>;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <ReviewHeader title={data.owner.name} subtitle={data.owner.email} status={data.status} onBack={() => router.back()} />

      <main className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12">
        <VehicleImage imageUrl={data.imageUrl} />
        <div className="space-y-8">
          {aiSummary && <AiSummaryCard summary={aiSummary} />}

          <ReviewCard title="Vehicle Details" icon={<Truck size={18} />}>
            <InfoRow label="Vehicle Type" value={data.type} />
            <InfoRow label="Registration Number" value={data.number} />
            <InfoRow label="Model" value={data.model} />
          </ReviewCard>

          <ReviewCard title="Pricing Configuration" icon={<IndianRupee size={18} />}>
            <InfoRow label="Base Fare" value={data.baseFare != null ? `Rs ${data.baseFare}` : "-"} />
            <InfoRow label="Price per KM" value={data.pricePerKm != null ? `Rs ${data.pricePerKm}` : "-"} />
            <InfoRow label="Waiting Charge" value={data.waitingCharge != null ? `Rs ${data.waitingCharge}` : "-"} />
          </ReviewCard>

          {data.status === "pending" && (
            <AdminDecisionCard
              suggestion={aiSummary?.recommendedAction}
              onApprove={() => setShowApprove(true)}
              onReject={() => setShowReject(true)}
            />
          )}
        </div>
      </main>

      <ConfirmModal
        open={showApprove}
        title="Approve this vehicle?"
        loading={actionLoading}
        onClose={() => setShowApprove(false)}
        onConfirm={() => void completeAction("approve")}
      />
      <RejectModal
        open={showReject}
        title="Reject Vehicle"
        reason={rejectReason}
        setReason={setRejectReason}
        loading={actionLoading}
        onClose={() => setShowReject(false)}
        onConfirm={() => void completeAction("reject")}
      />
    </div>
  );
}

function ReviewHeader({ title, subtitle, status, onBack }: { title: string; subtitle: string; status?: string; onBack: () => void }) {
  return (
    <header className="sticky top-0 bg-white border-b shadow-sm z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <p className="font-semibold text-lg">{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <ReviewStatusBadge status={status} />
      </div>
    </header>
  );
}

function VehicleImage({ imageUrl }: { imageUrl?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl overflow-hidden shadow-xl bg-white">
      {imageUrl ? (
        <div className="relative h-[450px]">
          <Image src={imageUrl} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" alt="Vehicle" />
        </div>
      ) : (
        <div className="h-[450px] grid place-items-center text-gray-300">
          <ImageIcon size={50} />
        </div>
      )}
    </motion.div>
  );
}

function AiSummaryCard({ summary }: { summary: ReviewSummary }) {
  return (
    <ReviewCard title="AI Review Summary" icon={<Sparkles size={18} />}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-slate-900">{summary.headline}</p>
            <p className="text-sm text-slate-600 mt-1">{summary.summary}</p>
          </div>
          <RiskBadge risk={summary.riskLevel} />
        </div>
        <SummaryList title="Key Checks" items={summary.keyChecks} />
        <SummaryList title="Open Questions" items={summary.openQuestions} />
      </div>
    </ReviewCard>
  );
}

function AdminDecisionCard({ suggestion, onApprove, onReject }: { suggestion?: string; onApprove: () => void; onReject: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-8 shadow-lg border space-y-6">
      <div className="flex items-center gap-2 font-semibold">
        <ShieldCheck size={18} />
        Admin Decision
      </div>
      <p className="text-sm text-gray-500">
        Review image quality and pricing before approving.
        {suggestion ? ` AI suggestion: ${String(suggestion).replaceAll("_", " ")}.` : ""}
      </p>
      <div className="flex gap-4">
        <button onClick={onApprove} className="flex-1 py-3 rounded-xl bg-black text-white font-semibold">Approve</button>
        <button onClick={onReject} className="flex-1 py-3 rounded-xl border font-semibold">Reject</button>
      </div>
    </motion.div>
  );
}
