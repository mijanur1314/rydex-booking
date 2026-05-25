"use client";

import { useState } from "react";
import { VideoKycHeader } from "./components/VideoKycHeader";
import { VideoKycModals } from "./components/VideoKycModals";
import { VideoKycPreJoin } from "./components/VideoKycPreJoin";
import { useVideoKycCall } from "./hooks/useVideoKycCall";

export default function VideoKYCPage() {
  const {
    actionLoading,
    cameraOn,
    completeKyc,
    containerRef,
    isAdmin,
    joined,
    loading,
    micOn,
    previewRef,
    router,
    startCall,
    toggleCamera,
    toggleMic,
  } = useVideoKycCall();

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert("Rejection reason required");
      return;
    }
    void completeKyc("reject", rejectReason);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <VideoKycHeader
        isAdmin={isAdmin}
        joined={joined}
        router={router}
        onApprove={() => setShowApproveModal(true)}
        onReject={() => setShowRejectModal(true)}
      />

      <div className="flex-1 relative">
        <div ref={containerRef} className={`absolute inset-0 ${joined ? "block" : "hidden"}`} />
        {!joined && (
          <VideoKycPreJoin
            cameraOn={cameraOn}
            loading={loading}
            micOn={micOn}
            previewRef={previewRef}
            onStartCall={startCall}
            onToggleCamera={toggleCamera}
            onToggleMic={toggleMic}
          />
        )}
      </div>

      <VideoKycModals
        actionLoading={actionLoading}
        rejectReason={rejectReason}
        showApproveModal={showApproveModal}
        showRejectModal={showRejectModal}
        onApprove={() => void completeKyc("approve")}
        onCloseApprove={() => setShowApproveModal(false)}
        onCloseReject={() => setShowRejectModal(false)}
        onReject={handleReject}
        onRejectReasonChange={setRejectReason}
      />
    </div>
  );
}
