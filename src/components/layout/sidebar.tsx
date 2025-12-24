"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl"; //
import { useWorkspaceInvitations } from "@/hooks/use-queries"; 
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useAuthMutations } from "@/hooks/use-mutations";
import { CreateWorkspaceModal } from "../dashboard/create-workspace-modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useUIStore } from "@/store/use-ui-store";
import { WorkspaceSwitcher } from "./workspace-switcher"; 

export function Sidebar() {
  const t = useTranslations("Sidebar"); //
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const [isMobile, setIsMobile] = useState(false);

  const { data: invitations } = useWorkspaceInvitations(); 
  const pendingCount = invitations?.items?.filter((i: any) => i.status === 0).length || 0; 

  const { activeWorkspaceId } = useWorkspaceStore();
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

  const isBoardsActive = pathname === "/dashboard" || pathname.startsWith("/w/");
  const isWorkspaceMembersActive = pathname.includes("/settings/members");
  const isWorkspaceSettingsActive = pathname.includes("/workspaces/") && pathname.includes("/settings") && !pathname.includes("/members");
  const isInvitationsActive = pathname.includes("/dashboard/settings/account/workspace-invitations");
  const isAppSettingsActive = pathname.startsWith("/dashboard/settings") && !isInvitationsActive;

  const getLinkClasses = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative ${isActive
      ? "bg-card shadow-sm text-primary font-bold border border-border-base"
      : "text-muted-foreground hover:bg-card hover:text-foreground border border-transparent"
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
        title={t("logout_modal.title")}
        description={t("logout_modal.description")}
        confirmText={t("logout_modal.confirm")}
        variant="primary"
        isLoading={logoutMutation.isPending}
      />

      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        />
      )}

      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 h-full flex flex-col 
          border-r border-border-base bg-background font-sans
          transition-transform duration-300 ease-in-out w-64
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden"} 
        `}
      >
        <div className="p-4 border-b border-border-base flex items-center justify-between gap-2">
          
          <div className="flex-1 min-w-0">
             <WorkspaceSwitcher onCreateClick={() => setIsCreateWorkspaceModalOpen(true)} />
          </div>
          
          <button 
            onClick={() => setSidebarOpen(false)}
            className="flex hover:cursor-pointer items-center justify-center p-2 text-muted-foreground hover:text-primary hover:bg-card rounded-lg transition-colors flex-shrink-0"
            title={t("collapse_sidebar")}
          >
             <span className="material-symbols-outlined text-[20px] leading-none">
               {isMobile ? "close" : "first_page"}
             </span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6 whitespace-nowrap custom-scrollbar z-10">
          
          {/* CLUSTER 1: WORKSPACE */}
          <div className="flex flex-col gap-1">
             <div className="px-3 mb-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider opacity-60">
                   {t("cluster_workspace")}
                </span>
             </div>

             <Link href="/dashboard" className={getLinkClasses(isBoardsActive)}>
               <span className={`material-symbols-outlined text-[24px] ${isBoardsActive ? "fill-1" : ""}`}>dashboard</span>
               <span className="text-sm">{t("boards")}</span>
             </Link>

             <Link
               href={activeWorkspaceId ? `/dashboard/workspaces/${activeWorkspaceId}/settings/members` : "#"}
               onClick={(e) => !activeWorkspaceId && e.preventDefault()}
               className={`${getLinkClasses(isWorkspaceMembersActive)} ${!activeWorkspaceId ? "opacity-40 cursor-not-allowed" : ""}`}
             >
               <span className={`material-symbols-outlined text-[24px] ${isWorkspaceMembersActive ? "fill-1" : ""}`}>group</span>
               <span className="text-sm">{t("members")}</span>
             </Link>

             <Link
               href={activeWorkspaceId ? `/dashboard/workspaces/${activeWorkspaceId}/settings` : "#"}
               className={getLinkClasses(isWorkspaceSettingsActive)}
             >
               <span className={`material-symbols-outlined text-[24px] ${isWorkspaceSettingsActive ? "fill-1" : ""}`}>settings</span>
               <span className="text-sm">{t("settings")}</span>
             </Link>
          </div>

          {/* CLUSTER 2: GENERAL (APP) */}
          <div className="flex flex-col gap-1">
             <div className="px-3 mb-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider opacity-60">
                   {t("cluster_general")}
                </span>
             </div>

             <Link
               href="/dashboard/settings/account/workspace-invitations"
               className={getLinkClasses(isInvitationsActive)}
             >
               <span className={`material-symbols-outlined text-[24px] ${isInvitationsActive ? "fill-1" : ""}`}>mail</span>
               <span className="text-sm">{t("invitations")}</span>
               {pendingCount > 0 && (
                 <span className="absolute right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-background">
                   {pendingCount}
                 </span>
               )}
             </Link>

             <Link
               href="/dashboard/settings"
               className={getLinkClasses(isAppSettingsActive)}
             >
               <span className={`material-symbols-outlined text-[24px] ${isAppSettingsActive ? "fill-1" : ""}`}>tune</span>
               <span className="text-sm">{t("app_settings")}</span>
             </Link>
          </div>

        </nav>

        <div className="p-4 border-t border-border-base flex items-center justify-between border-dashed mt-auto">
            <button className="hover:cursor-pointer flex items-center gap-2 p-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium hover:bg-card rounded-md">
              <span className="material-symbols-outlined text-[20px]">help</span>
              {t("help")}
            </button>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex hover:cursor-pointer items-center justify-center p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
              title={t("logout")}
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