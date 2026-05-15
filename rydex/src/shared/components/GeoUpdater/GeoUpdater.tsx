"use client";

import { getSocket } from "@/lib/socket";
import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";

/**
 * GeoUpdater Component
 * 
 * Silently watches the user's geolocation and emits it to the socket server.
 * Throttles the emission to prevent server overload.
 * 
 * @param {string | undefined} userId - The ID of the current logged-in user
 */
function GeoUpdater({ userId }: { userId: string | undefined }) {
  const socketRef = useRef<Socket | null>(null);
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    if (!userId || !navigator.geolocation) return;

    socketRef.current = getSocket();

    // Authenticate the socket connection with the user ID
    socketRef.current.emit("identity", userId);
       
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();

        // Throttle updates to every 10 seconds
        if (now - lastSentRef.current < 10000) return;

        lastSentRef.current = now;

        socketRef.current?.emit("update-location", {
          userId,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => console.log(err),
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watcher);
    };
  }, [userId]);

  return null;
}

export default GeoUpdater;
