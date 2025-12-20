"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useAuthStore } from "@/store/use-auth-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useGetMe, usePresenceHeartbeat } from "@/hooks/use-queries";
import { useUserRealtime } from "@/hooks/use-user-realtime";
import { useWorkspaceRealtime } from "@/hooks/use-workspace-realtime";
import { toTimestamp } from "@/lib/common-utils";

export function SessionManager() {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isAvatarUpdating,
    setUser,
    logout,
  } = useAuthStore();

  const { activeWorkspaceId } = useWorkspaceStore();

  // Fetch current user from backend
  const { data: remoteUser, isError } = useGetMe();

  // Start presence heartbeat only when authenticated
  usePresenceHeartbeat(isAuthenticated);

  // Realtime hooks
  useUserRealtime();
  useWorkspaceRealtime(activeWorkspaceId || "");

  // Sync server user → local store 
  useEffect(() => {
    /**
     * A. Sync remote user only when:
     *  - we are NOT mutating avatar
     *  - server version is newer than local
     */
    if (remoteUser && !isAvatarUpdating) {
      const remoteUpdatedAt = toTimestamp(remoteUser.updatedAt);

      const localUpdatedAt = toTimestamp(user?.updatedAt);


      if (!user || remoteUpdatedAt > localUpdatedAt) {
        console.log("Syncing user profile from server");

        setUser((prev) => {
          if (!prev) return remoteUser;

          return {
            ...prev,
            ...remoteUser,

            // Protect locally-mutated avatar
            avatarUrl: remoteUser.avatarUrl ?? prev.avatarUrl,
          };
        });
      }
    }

    /**
     * B. Session mismatch / expiry handling
     * If backend says session is invalid but client thinks otherwise
     */
    if (isAuthenticated && (isError || remoteUser === null)) {
      console.warn("Session mismatch detected. Logging out.");
      handleForceLogout();
    }
  }, [
    remoteUser,
    isError,
    isAuthenticated,
    isAvatarUpdating,
    user,
    setUser,
  ]);

  // Forced logout handler
  const handleForceLogout = async () => {
    // Clear client state
    logout();

    // Clear HTTP-only cookies
    try {
      await axios.post("/api/auth/logout");
    } catch (e) {
      console.error("Cookie clear failed", e);
    }

    // Redirect to login
    router.replace("/auth/login");
  };

  return null; // This component renders nothing
}
