"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useWorkspaces, useWorkspaceInvitations } from "@/hooks/use-queries"; 
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useAuthMutations } from "@/hooks/use-mutations";
import { CreateWorkspaceModal } from "../dashboard/create-workspace-modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useUIStore } from "@/store/use-ui-store";
import { WorkspaceSwitcher } from "./workspace-switcher"; // Import the new component

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const [isMobile, setIsMobile] = useState(false);

  const { data: invitations } = useWorkspaceInvitations(); 
  const pendingCount = invitations?.items?.filter((i: any) => i.status === 0).length || 0; 

  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();
  const { logoutMutation } = useAuthMutations();

  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setSidebarOpen]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile, setSidebarOpen]);

  // --- Active State Logic ---
  const isBoardsActive = pathname === "/dashboard" || pathname.startsWith("/w/");
  const isWorkspaceMembersActive = pathname.includes("/settings/members");
  const isWorkspaceSettingsActive = pathname.includes("/workspaces/") && pathname.includes("/settings") && !pathname.includes("/members");
  const isInvitationsActive = pathname.includes("/dashboard/settings/account/workspace-invitations");
  const isAppSettingsActive = pathname.startsWith("/dashboard/settings") && !isInvitationsActive;

  const getLinkClasses = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative ${isActive
      ? "bg-white dark:bg-[#1a2430] shadow-sm text-primary font-medium"
      : "text-[#507395] dark:text-[#94a3b8] hover:bg-white dark:hover:bg-[#1a2430] hover:text-[#0e141b] dark:hover:text-[#e8edf3]"
    }`;

  return (
    <>
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => logoutMutation.mutate()}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmText="Sign Out"
        variant="primary"
        isLoading={logoutMutation.isPending}
      />

      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        />
      )}

      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 h-full flex flex-col 
          border-r border-[#e8edf3] dark:border-[#2d3a4a] bg-[#f8fafb] dark:bg-[#111921] font-sans
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isSidebarOpen ? "w-64" : "lg:w-0 lg:border-none lg:overflow-hidden"} 
        `}
      >
        {/* Header containing the Workspace Switcher */}
        <div className="p-4 border-b border-[#e8edf3] dark:border-[#2d3a4a] flex items-center justify-between gap-2">
          
          <div className="flex-1 min-w-0">
             <WorkspaceSwitcher onCreateClick={() => setIsCreateWorkspaceModalOpen(true)} />
          </div>
          
          <button 
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-center p-2 text-[#507395] hover:text-primary hover:bg-gray-100 dark:hover:bg-[#1a2430] rounded-lg transition-colors flex-shrink-0"
            title="Collapse Sidebar"
          >
             <span className="material-symbols-outlined text-[20px] leading-none">
               {isMobile ? "close" : "first_page"}
             </span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6 whitespace-nowrap">
          
          {/* CLUSTER 1: WORKSPACE */}
          <div className="flex flex-col gap-1">
             <div className="px-3 mb-1">
                <span className="text-xs font-bold text-[#507395] dark:text-[#94a3b8] uppercase tracking-wider opacity-80">
                   Workspace
                </span>
             </div>

             <Link href="/dashboard" className={getLinkClasses(isBoardsActive)}>
               <span className={`material-symbols-outlined text-[24px] ${isBoardsActive ? "fill-1" : ""}`}>dashboard</span>
               <span className="text-sm">Boards</span>
             </Link>

             <Link
               href={activeWorkspaceId ? `/dashboard/workspaces/${activeWorkspaceId}/settings/members` : "#"}
               onClick={(e) => !activeWorkspaceId && e.preventDefault()}
               className={`${getLinkClasses(isWorkspaceMembersActive)} ${!activeWorkspaceId ? "opacity-50 cursor-not-allowed" : ""}`}
             >
               <span className={`material-symbols-outlined text-[24px] ${isWorkspaceMembersActive ? "fill-1" : ""}`}>group</span>
               <span className="text-sm">Members</span>
             </Link>

             <Link
               href={activeWorkspaceId ? `/dashboard/workspaces/${activeWorkspaceId}/settings` : "#"}
               className={getLinkClasses(isWorkspaceSettingsActive)}
             >
               <span className={`material-symbols-outlined text-[24px] ${isWorkspaceSettingsActive ? "fill-1" : ""}`}>settings</span>
               <span className="text-sm">Settings</span>
             </Link>
          </div>

          {/* CLUSTER 2: GENERAL (APP) */}
          <div className="flex flex-col gap-1">
             <div className="px-3 mb-1">
                <span className="text-xs font-bold text-[#507395] dark:text-[#94a3b8] uppercase tracking-wider opacity-80">
                   General
                </span>
             </div>

             <Link
               href="/dashboard/settings/account/workspace-invitations"
               className={getLinkClasses(isInvitationsActive)}
             >
               <span className={`material-symbols-outlined text-[24px] ${isInvitationsActive ? "fill-1" : ""}`}>mail</span>
               <span className="text-sm">Invitations</span>
               {pendingCount > 0 && (
                 <span className="absolute right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                   {pendingCount}
                 </span>
               )}
             </Link>

             <Link
               href="/dashboard/settings"
               className={getLinkClasses(isAppSettingsActive)}
             >
               <span className={`material-symbols-outlined text-[24px] ${isAppSettingsActive ? "fill-1" : ""}`}>tune</span>
               <span className="text-sm">App Settings</span>
             </Link>
          </div>

        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#e8edf3] dark:border-[#2d3a4a] flex items-center justify-between border-dashed">
            <button className="flex items-center gap-2 p-2 text-[#507395] hover:text-primary transition-colors text-sm font-medium">
              <span className="material-symbols-outlined text-[20px]">help</span>
              Help & Support
            </button>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 text-[#507395] hover:text-red-500 hover:cursor-pointer transition-colors"
              title="Logout"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
        </div>
      </aside>

      <div 
         className={`flex-shrink-0 transition-all duration-300 ease-in-out hidden lg:block ${isSidebarOpen ? "w-64" : "w-0"}`} 
      />
    </>
  );
}