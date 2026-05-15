"use client";

import { useState } from "react";
import { VideoKycHeader } from "./components/VideoKycHeader";
import { VideoKycModals } from "./components/VideoKycModals";
import { VideoKycPreJoin } from "./components/VideoKycPreJoin";
import { useVideoKycCall } from "./hooks/useVideoKycCall";

export default function VideoKYCPage() {
  const call = useVideoKycCall();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert("Rejection reason required");
      return;
    }
    void call.completeKyc("reject", rejectReason);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <VideoKycHeader
        isAdmin={call.isAdmin}
        joined={call.joined}
        router={call.router}
        onApprove={() => setShowApproveModal(true)}
        onReject={() => setShowRejectModal(true)}
      />

      <div className="flex-1 relative">
        <div ref={call.containerRef} className={`absolute inset-0 ${call.joined ? "block" : "hidden"}`} />
        {!call.joined && (
          <VideoKycPreJoin
            cameraOn={call.cameraOn}
            loading={call.loading}
            micOn={call.micOn}
            previewRef={call.previewRef}
            onStartCall={call.startCall}
            onToggleCamera={call.toggleCamera}
            onToggleMic={call.toggleMic}
          />
        )}
      </div>

      <VideoKycModals
        actionLoading={call.actionLoading}
        rejectReason={rejectReason}
        showApproveModal={showApproveModal}
        showRejectModal={showRejectModal}
        onApprove={() => void call.completeKyc("approve")}
        onCloseApprove={() => setShowApproveModal(false)}
        onCloseReject={() => setShowRejectModal(false)}
        onReject={handleReject}
        onRejectReasonChange={setRejectReason}
      />
    </div>
  );
}
