"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function VideoKycModals({
  actionLoading,
  rejectReason,
  showApproveModal,
  showRejectModal,
  onApprove,
  onCloseApprove,
  onCloseReject,
  onReject,
  onRejectReasonChange,
}: {
  actionLoading: boolean;
  rejectReason: string;
  showApproveModal: boolean;
  showRejectModal: boolean;
  onApprove: () => void;
  onCloseApprove: () => void;
  onCloseReject: () => void;
  onReject: () => void;
  onRejectReasonChange: (value: string) => void;
}) {
  return (
    <>
      <AnimatePresence>
        {showApproveModal && (
          <Modal onClose={onCloseApprove}>
            <h2 className="text-lg font-semibold mb-4">Confirm Approval</h2>
            <div className="flex gap-4">
              <button onClick={onCloseApprove} className="flex-1 border rounded-xl py-2">Cancel</button>
              <button onClick={onApprove} className="flex-1 bg-green-600 rounded-xl py-2">
                {actionLoading ? "Processing..." : "Approve"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <Modal onClose={onCloseReject}>
            <h2 className="text-lg font-semibold mb-4">Reject Vendor</h2>
            <textarea value={rejectReason} onChange={(event) => onRejectReasonChange(event.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl p-3 mb-4 text-sm" />
            <div className="flex gap-4">
              <button onClick={onCloseReject} className="flex-1 border rounded-xl py-2">Cancel</button>
              <button onClick={onReject} className="flex-1 bg-red-600 rounded-xl py-2">
                {actionLoading ? "Processing..." : "Reject"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-[#111] w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400">
          <X size={16} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
