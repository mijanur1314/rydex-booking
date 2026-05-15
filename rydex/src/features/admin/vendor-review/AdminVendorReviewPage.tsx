"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Car,
  FileText,
  Landmark,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

type ReviewSummary = {
  headline?: string;
  summary?: string;
  riskLevel?: string;
  keyChecks?: string[];
  openQuestions?: string[];
  recommendedAction?: string;
};

type DocumentReview = {
  status?: string;
  summary?: string;
};

type VendorReview = {
  name: string;
  email: string;
  vendorStatus?: string;
  vehicle?: {
    type?: string;
    number?: string;
    model?: string;
  };
  documents?: {
    aadhaarUrl?: string;
    licenseUrl?: string;
    rcUrl?: string;
    aiReview?: {
      aadhaar?: DocumentReview;
      license?: DocumentReview;
      rc?: DocumentReview;
      riskFlags?: string[];
    };
  };
  bank?: {
    accountHolderName?: string;
    ifsc?: string;
    upi?: string;
  };
};

export default function AdminVendorReviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<VendorReview | null>(null);
  const [aiSummary, setAiSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await axios.get(`/api/admin/vendors/${id}`);
      setData(res.data.vendor);
      setAiSummary(res.data.aiSummary);
      setLoading(false);
    }
    load();
  }, [id]);

  const approveVendor = async () => {
    setActionLoading(true);
    await axios.post(`/api/admin/vendors/${id}/approve`);
    router.push("/admin/dashboard");
  };

  const rejectVendor = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    await axios.post(`/api/admin/vendors/${id}/reject`, {
      reason: rejectReason,
    });
    router.push("/admin/dashboard");
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-gray-500">Loading vendor review...</div>;
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1">
            <p className="font-semibold text-lg">{data.name}</p>
            <p className="text-xs text-gray-500">{data.email}</p>
          </div>

          <StatusBadge status={data.vendorStatus} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {aiSummary && (
            <AnimatedCard title="AI Review Summary" icon={<Sparkles size={18} />}>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{aiSummary.headline}</p>
                    <p className="text-sm text-slate-600 mt-1">{aiSummary.summary}</p>
                  </div>
                  <RiskBadge risk={aiSummary.riskLevel} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <SummaryList title="Key Checks" items={aiSummary.keyChecks} />
                  <SummaryList title="Open Questions" items={aiSummary.openQuestions} />
                </div>
              </div>
            </AnimatedCard>
          )}

          <AnimatedCard title="Vehicle Details" icon={<Car size={18} />}>
            <InfoRow label="Vehicle Type" value={data.vehicle?.type} />
            <InfoRow label="Registration Number" value={data.vehicle?.number} />
            <InfoRow label="Model" value={data.vehicle?.model} />
          </AnimatedCard>

          <AnimatedCard title="Documents" icon={<FileText size={18} />}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <DocPreview label="Aadhaar" url={data.documents?.aadhaarUrl} review={data.documents?.aiReview?.aadhaar} />
              <DocPreview label="License" url={data.documents?.licenseUrl} review={data.documents?.aiReview?.license} />
              <DocPreview label="RC" url={data.documents?.rcUrl} review={data.documents?.aiReview?.rc} />
            </div>

            {(data.documents?.aiReview?.riskFlags?.length ?? 0) > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-700">
                  <AlertTriangle size={13} />
                  Document review flags
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.documents?.aiReview?.riskFlags?.map((flag: string) => (
                    <span key={flag} className="rounded-full border border-amber-200 bg-white px-2 py-1 text-xs text-amber-800">
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </AnimatedCard>
        </div>

        <div className="space-y-8">
          <AnimatedCard title="Bank Details" icon={<Landmark size={18} />}>
            <InfoRow label="Account Holder" value={data.bank?.accountHolderName} />
            <InfoRow label="IFSC Code" value={data.bank?.ifsc} />
            <InfoRow label="UPI ID" value={data.bank?.upi || "-"} />
          </AnimatedCard>

          {data.vendorStatus === "pending" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-xl space-y-6"
            >
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={18} />
                Admin Decision
              </div>

              <p className="text-sm text-gray-500">
                Verify documents carefully before approving.
                {aiSummary?.recommendedAction ? ` AI suggestion: ${String(aiSummary.recommendedAction).replaceAll("_", " ")}.` : ""}
              </p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setShowApprove(true)}
                  className="py-3 rounded-2xl bg-gradient-to-r from-black to-gray-800 text-white font-semibold hover:opacity-90 transition"
                >
                  Approve Vendor
                </button>

                <button
                  onClick={() => setShowReject(true)}
                  className="py-3 rounded-2xl border font-semibold hover:bg-gray-100 transition"
                >
                  Reject Vendor
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <ConfirmModal
        open={showApprove}
        title="Approve Vendor?"
        description="Confirm all information has been verified."
        confirmText="Yes, Approve"
        loading={actionLoading}
        onClose={() => setShowApprove(false)}
        onConfirm={approveVendor}
      />

      <RejectModal
        open={showReject}
        reason={rejectReason}
        setReason={setRejectReason}
        loading={actionLoading}
        onClose={() => setShowReject(false)}
        onConfirm={rejectVendor}
      />
    </div>
  );
}

function AnimatedCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white rounded-[32px] p-8 shadow-xl space-y-6">
      <div className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </div>
      {children}
    </motion.div>
  );
}

function SummaryList({ title, items }: { title: string; items?: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase font-bold text-slate-500">{title}</p>
      <div className="mt-2 space-y-2">
        {(items?.length ? items : ["No additional notes."]).map((item) => (
          <p key={item} className="text-sm text-slate-700">
            • {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function DocPreview({ label, url, review }: { label: string; url?: string; review?: DocumentReview }) {
  const isImage = url?.match(/\.(jpg|jpeg|png|webp)$/i);
  const isPdf = url?.endsWith(".pdf");

  return (
    <div className="bg-gray-50 rounded-2xl border overflow-hidden shadow-sm">
      <div className="px-4 py-2 border-b text-sm font-semibold flex items-center justify-between gap-2">
        <span>{label}</span>
        {review?.status && <MiniPill value={review.status} />}
      </div>

      <div className="h-52 flex items-center justify-center bg-white">
        {!url && <span className="text-xs text-gray-400">Not uploaded</span>}
        {isImage && url && (
          <div className="relative h-full w-full">
            <Image src={url} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" alt={label} />
          </div>
        )}
        {isPdf && <iframe src={url} className="w-full h-full" title={label} />}
      </div>

      {review?.summary && <div className="px-4 py-3 text-xs text-slate-600 border-t bg-white">{review.summary}</div>}

      {url && (
        <a href={url} target="_blank" rel="noreferrer" className="block text-center text-xs py-2 font-medium hover:bg-gray-100">
          Open full document
        </a>
      )}
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirmText,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm text-gray-500 mt-2">{description}</p>

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-2 rounded-xl border">
                Cancel
              </button>
              <button onClick={onConfirm} disabled={loading} className="flex-1 py-2 rounded-xl bg-black text-white">
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RejectModal({
  open,
  reason,
  setReason,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  reason: string;
  setReason: (reason: string) => void;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold">Reject Vendor</h2>
            <textarea
              placeholder="Enter rejection reason (required)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full mt-3 border rounded-xl p-3 text-sm"
            />

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-2 rounded-xl border">
                Cancel
              </button>
              <button onClick={onConfirm} disabled={loading} className="flex-1 py-2 rounded-xl bg-black text-white">
                Reject
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-right">{value || "-"}</span>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "approved") return <Badge text="Approved" icon={<CheckCircle size={14} />} className="bg-green-100 text-green-700" />;
  if (status === "rejected") return <Badge text="Rejected" icon={<XCircle size={14} />} className="bg-red-100 text-red-700" />;
  return <Badge text="Pending" icon={<Clock size={14} />} className="bg-yellow-100 text-yellow-700" />;
}

function RiskBadge({ risk }: { risk?: string }) {
  const className =
    risk === "high"
      ? "bg-red-100 text-red-700"
      : risk === "low"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${className}`}>{risk || "medium"} risk</span>;
}

function MiniPill({ value }: { value: string }) {
  const className =
    value === "verified"
      ? "bg-emerald-100 text-emerald-700"
      : value === "missing" || value === "unsupported"
      ? "bg-red-100 text-red-700"
      : "bg-amber-100 text-amber-700";

  return <span className={`px-2 py-1 rounded-full text-[11px] font-semibold capitalize ${className}`}>{value.replaceAll("_", " ")}</span>;
}

function Badge({ text, icon, className }: { text: string; icon: React.ReactNode; className: string }) {
  return (
    <span className={`px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 ${className}`}>
      {icon}
      {text}
    </span>
  );
}
