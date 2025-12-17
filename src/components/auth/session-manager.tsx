"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { useGetMe, usePresenceHeartbeat } from "@/hooks/use-queries";
import axios from "axios";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useUserRealtime } from "@/hooks/use-user-realtime";
import { useWorkspaceRealtime } from "@/hooks/use-workspace-realtime";

export function SessionManager() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const { activeWorkspaceId } = useWorkspaceStore();
  
  // 1. Fetch User Data
  const { data: remoteUser, isError } = useGetMe();

  // 2. Start Heartbeat (only if authenticated)
  usePresenceHeartbeat(isAuthenticated);

  useUserRealtime();
  useWorkspaceRealtime(activeWorkspaceId || "");

  // 3. Synchronization Logic
  useEffect(() => {
    // A. Sync Remote User to Store
    if (remoteUser) {
      // Only update if data actually changed to avoid render loops
      if (JSON.stringify(remoteUser) !== JSON.stringify(user)) {
        console.log("Syncing user profile from server...");
        setUser(remoteUser);
      }
    }

    // B. Handle Session Mismatch / Expiry
    // If 'getMe' fails (401) OR returns null/undefined while we think we are logged in
    if (isAuthenticated && (isError || remoteUser === null)) {
      console.warn("Session mismatch detected. Logging out.");
      handleForceLogout();
    }
  }, [remoteUser, isError, isAuthenticated, user, setUser]);

  const handleForceLogout = async () => {
    // 1. Clear Client Store
    logout();

    // 2. Clear HTTP Cookies (Call our new API route)
    try {
      await axios.post("/api/auth/logout"); 
    } catch (e) {
      console.error("Cookie clear failed", e);
    }

    // 3. Redirect
    router.replace("/auth/login");
  };

  return null; // This component renders nothing
}