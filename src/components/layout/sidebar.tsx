"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaces, useWorkspaceInvitations } from "@/hooks/use-queries"; // Added hook
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useAuthMutations } from "@/hooks/use-mutations";
import { CreateWorkspaceModal } from "../dashboard/create-workspace-modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useUIStore } from "@/store/use-ui-store";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const [isMobile, setIsMobile] = useState(false);

  const { data: workspaces, isLoading } = useWorkspaces();
  // Fetch invitations to show badge count (page 1, small size)
  const { data: invitations } = useWorkspaceInvitations(); 
  const pendingCount = invitations?.items?.filter((i: any) => i.status === 0).length || 0; // Assuming 0 is Pending

  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();
  const { logoutMutation } = useAuthMutations();

  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // ... (Keep existing useEffects for Mobile/Resize/Defaults) ...
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

  useEffect(() => {
    if (!activeWorkspaceId && workspaces && workspaces.length > 0) {
      setActiveWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, activeWorkspaceId, setActiveWorkspaceId]);
  // ... (End existing useEffects) ...

  const activeWorkspace = workspaces?.find(w => w.id === activeWorkspaceId);

  const handleWorkspaceSwitch = (newWorkspaceId: string) => {
    setActiveWorkspaceId(newWorkspaceId);
    if (pathname.includes("/workspaces/")) {
      const pathParts = pathname.split("/");
      const workspaceIndex = pathParts.indexOf("workspaces");
      if (workspaceIndex !== -1 && pathParts[workspaceIndex + 1]) {
        pathParts[workspaceIndex + 1] = newWorkspaceId;
        router.push(pathParts.join("/"));
      }
    } else if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
  };

  const isBoardsActive = pathname === "/dashboard" || pathname.startsWith("/w/");
  const isMembersActive = pathname.includes("/members");
  const isSettingsActive = pathname.includes("/settings") && !pathname.includes("/members");
  // New Active State
  const isInvitationsActive = pathname.includes("/workspace-invitations");

  const getLinkClasses = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative ${isActive
      ? "bg-white dark:bg-[#1a2430] shadow-sm text-[#4c99e6] font-medium"
      : "text-[#507395] dark:text-[#94a3b8] hover:bg-white dark:hover:bg-[#1a2430] hover:text-[#0e141b] dark:hover:text-[#e8edf3]"
    }`;

  return (
    <>
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

        <div className="p-4 border-b border-[#e8edf3] dark:border-[#2d3a4a] flex items-center justify-between gap-2">
          <button className="flex-1 flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-[#1a2430] rounded-lg transition-colors group min-w-0">
            <div className="bg-blue-500 rounded-lg size-8 shadow-sm flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
              {activeWorkspace?.name?.charAt(0) || "W"}
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
              <h1 className="text-sm font-semibold truncate w-full text-left text-[#0e141b] dark:text-[#e8edf3]">
                {isLoading ? "Loading..." : (activeWorkspace?.name || "Workspace")}
              </h1>
            </div>
            <span className="material-symbols-outlined ml-auto text-[#507395] dark:text-[#94a3b8] group-hover:text-[#4c99e6] text-[20px]">
              expand_more
            </span>
          </button>
          
          <button 
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-center p-2 text-[#507395] hover:text-[#4c99e6] hover:bg-gray-100 dark:hover:bg-[#1a2430] rounded-lg transition-colors flex-shrink-0"
            title="Collapse Sidebar"
          >
             <span className="material-symbols-outlined text-[20px] leading-none">
               {isMobile ? "close" : "first_page"}
             </span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1 whitespace-nowrap">
          <Link href="/dashboard" className={getLinkClasses(isBoardsActive)}>
            <span className={`material-symbols-outlined text-[24px] ${isBoardsActive ? "fill-1" : ""}`}>dashboard</span>
            <span className="text-sm">Boards</span>
          </Link>

          <Link
            href={activeWorkspaceId ? `/dashboard/workspaces/${activeWorkspaceId}/settings/members` : "#"}
            onClick={(e) => !activeWorkspaceId && e.preventDefault()}
            className={`${getLinkClasses(isMembersActive)} ${!activeWorkspaceId ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className={`material-symbols-outlined text-[24px] ${isMembersActive ? "fill-1" : ""}`}>group</span>
            <span className="text-sm">Members</span>
          </Link>

          <Link
            href={activeWorkspaceId ? `/dashboard/workspaces/${activeWorkspaceId}/settings` : "#"}
            className={getLinkClasses(isSettingsActive)}
          >
            <span className={`material-symbols-outlined text-[24px] ${isSettingsActive ? "fill-1" : ""}`}>settings</span>
            <span className="text-sm">Settings</span>
          </Link>

          {/* New Link: Workspace Invitations */}
          <Link
            href="/dashboard/account/workspace-invitations"
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

          <div className="mt-6 px-3">
            <p className="text-xs font-semibold text-[#507395] dark:text-[#94a3b8] uppercase tracking-wider mb-2">Workspaces</p>
            <div className="space-y-1">
              {workspaces?.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => handleWorkspaceSwitch(ws.id)}
                  className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors ${activeWorkspaceId === ws.id
                    ? "bg-white dark:bg-[#1a2430] text-[#0e141b] dark:text-[#e8edf3] shadow-sm"
                    : "text-[#507395] dark:text-[#94a3b8] hover:bg-white dark:hover:bg-[#1a2430] hover:text-[#0e141b]"
                    }`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activeWorkspaceId === ws.id ? "bg-[#4c99e6]" : "bg-gray-400"}`}></div>
                  <span className="text-sm truncate">{ws.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-[#e8edf3] dark:border-[#2d3a4a] flex flex-col gap-2 whitespace-nowrap">
          <button
            onClick={() => setIsCreateWorkspaceModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg h-9 px-4 bg-[#4c99e6]/10 text-[#4c99e6] hover:bg-[#4c99e6]/20 transition-colors text-sm font-bold">
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="truncate">Create Workspace</span>
          </button>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#e8edf3] dark:border-[#2d3a4a] border-dashed">
            <button className="p-2 text-[#507395] hover:text-[#4c99e6] transition-colors" title="Help">
              <span className="material-symbols-outlined text-[20px]">help</span>
            </button>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 text-[#507395] hover:text-red-500 hover:cursor-pointer transition-colors"
              title="Logout"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div 
         className={`flex-shrink-0 transition-all duration-300 ease-in-out hidden lg:block ${isSidebarOpen ? "w-64" : "w-0"}`} 
      />
    </>
  );
}