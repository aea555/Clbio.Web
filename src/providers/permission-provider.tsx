"use client";

import { createContext, useContext, useMemo } from "react";
import { useWorkspaceStore } from "@/store/use-workspace-store"; // You likely have this
import { useAuthStore } from "@/store/use-auth-store";
import { useWorkspaceMembers } from "@/hooks/use-queries"; // Fetches members for active workspace
import { WorkspaceRole } from "@/types/enums";
import { Permission, hasPermission } from "@/lib/rbac/permissions";

interface PermissionsContextType {
  role: WorkspaceRole | null;
  isLoading: boolean;
  can: (permission: Permission) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { user } = useAuthStore();
  
  // Fetch members for the active workspace
  // React Query will cache this, so it's cheap to use here
  const { data: members, isLoading } = useWorkspaceMembers(activeWorkspaceId!);

  // Derive the current user's role
  const currentRole = useMemo(() => {
    if (!members || !user || !activeWorkspaceId) return null;
    const membership = members.find((m: any) => m.userId === user.id);
    return membership ? (membership.role as WorkspaceRole) : null;
  }, [members, user, activeWorkspaceId]);

  const value = {
    role: currentRole,
    isLoading,
    // The Magic Function: checks the mapping
    can: (permission: Permission) => hasPermission(currentRole, permission),
    
    // Convenience flags
    isOwner: currentRole === WorkspaceRole.Owner,
    isAdmin: currentRole === WorkspaceRole.PrivilegedMember,
    isMember: currentRole === WorkspaceRole.Member,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

// Hook to consume the context
export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}