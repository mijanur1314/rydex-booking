"use client";

import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export function useVideoKycCall() {
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const zpRef = useRef<ReturnType<typeof ZegoUIKitPrebuilt.create> | null>(null);
  const joinedRef = useRef(false);
  const params = useParams();
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);

  const roomId =
    typeof params?.roomId === "string"
      ? params.roomId
      : Array.isArray(params?.roomId)
        ? params.roomId[0]
        : null;
  const isAdmin = userData?.role === "admin";

  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (joined) return;
    let localStream: MediaStream;

    const init = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(localStream);
        if (previewRef.current) previewRef.current.srcObject = localStream;
      } catch (err) {
        console.error(err);
      }
    };

    void init();
    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [joined]);

  const toggleCamera = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !cameraOn;
    });
    setCameraOn(!cameraOn);
  };

  const toggleMic = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !micOn;
    });
    setMicOn(!micOn);
  };

  const startCall = async () => {
    if (!roomId || !containerRef.current || joinedRef.current) return;
    joinedRef.current = true;
    setLoading(true);

    try {
      const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      const displayName = isAdmin ? "Admin" : `${userData?.name} (${userData?.email})`;
      const userId = userData?._id?.toString();

      if (!userId || !serverSecret) throw new Error("Video KYC is not configured");

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomId, userId, displayName);
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zp;
      zp.joinRoom({
        container: containerRef.current,
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        showPreJoinView: false,
      });
      setJoined(true);
    } catch (err) {
      console.error(err);
      joinedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  const completeKyc = async (action: "approve" | "reject", reason?: string) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/vendors/video-kyc/complete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, action, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      zpRef.current?.destroy();
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : `${action} failed`);
    } finally {
      setActionLoading(false);
    }
  };

  return {
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
  };
}
