"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react";
import type { ReactNode } from "react";

export function ReviewCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="bg-white rounded-3xl p-8 shadow-lg border space-y-6">
      <div className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </div>
      {children}
    </motion.div>
  );
}

export function SummaryList({ title, items }: { title: string; items?: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase font-bold text-slate-500">{title}</p>
      <div className="mt-2 space-y-2">
        {(items?.length ? items : ["No additional notes."]).map((item) => (
          <p key={item} className="text-sm text-slate-700">
            - {item}
          </p>
        ))}
      </div>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-right">{value || "-"}</span>
    </div>
  );
}

export function ReviewStatusBadge({ status }: { status?: string }) {
  if (status === "approved") {
    return (
      <span className="px-4 py-2 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-2">
        <CheckCircle size={14} />
        Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="px-4 py-2 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-2">
        <XCircle size={14} />
        Rejected
      </span>
    );
  }

  return (
    <span className="px-4 py-2 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center gap-2">
      <Clock size={14} />
      Pending
    </span>
  );
}

export function RiskBadge({ risk }: { risk?: string }) {
  const className =
    risk === "high"
      ? "bg-red-100 text-red-700"
      : risk === "low"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-amber-100 text-amber-700";

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${className}`}>{risk || "medium"} risk</span>;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold">{title}</h2>
            {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-2 rounded-xl border">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-2 rounded-xl bg-black text-white flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={16} />}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function RejectModal({
  open,
  title,
  reason,
  setReason,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
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
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold">{title}</h2>
            <textarea
              placeholder="Enter rejection reason (required)"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full mt-4 border rounded-xl p-3 text-sm"
            />

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-2 rounded-xl border">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-2 rounded-xl bg-black text-white flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={16} />}
                Reject
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
