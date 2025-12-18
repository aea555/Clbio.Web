"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useUnreadNotificationCount, useWorkspaces } from "@/hooks/use-queries";
import { useUIStore } from "@/store/use-ui-store";
import { useState } from "react";
import { NotificationDropdown } from "./notification-dropdown";
import Link from "next/link";

export function Header() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const { toggleSidebar, isSidebarOpen } = useUIStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { data: unreadCount } = useUnreadNotificationCount();
  const activeWorkspace = workspaces?.find(w => w.id === activeWorkspaceId);

  const getSectionName = () => {
    if (pathname.includes("/members")) return "Members";
    if (pathname.includes("/audit-logs")) return "Settings / Audit Logs";
    if (pathname.includes("/settings")) return "Settings";
    if (pathname.includes("/b/")) return "Board View";
    return "Boards";
  };

  const sectionName = getSectionName();

  return (
    <header className="h-16 border-b border-[#e8edf3] dark:border-[#2d3a4a] flex items-center justify-between px-4 md:px-6 bg-white dark:bg-[#1a2430] flex-shrink-0 z-10 font-sans transition-all duration-300">
      
      {/* Left: Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        
        {/* TOGGLE BUTTON ("TOASTER")
           - Hidden if sidebar is open (!isSidebarOpen)
           - Fixed alignment using flex/justify-center/leading-none
        */}
        {!isSidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="flex items-center justify-center p-2 -ml-2 text-[#507395] hover:text-[#0e141b] dark:text-[#94a3b8] dark:hover:text-[#e8edf3] hover:bg-gray-100 dark:hover:bg-[#2d3a4a] rounded-lg transition-colors"
            title="Open Sidebar"
          >
            <span className="material-symbols-outlined text-[24px] leading-none">menu</span>
          </button>
        )}

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-[#507395] dark:text-[#94a3b8]">
          <Link href="/dashboard" className="hover:text-[#4c99e6] cursor-pointer transition-colors sm:inline">
            {activeWorkspace?.name || "Dashboard"}
          </Link>
          <span className="material-symbols-outlined text-base hidden sm:inline">chevron_right</span>
          <span className="text-[#0e141b] dark:text-[#e8edf3] font-medium truncate max-w-[150px] sm:max-w-none">
            {sectionName}
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Search */}
        <div className="relative group hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#507395] dark:text-[#94a3b8] group-focus-within:text-[#4c99e6] transition-colors text-[20px]">
            search
          </span>
          <input 
            className="pl-10 pr-4 py-2 bg-[#f8fafb] dark:bg-[#111921] border border-transparent focus:border-[#4c99e6]/30 focus:bg-white dark:focus:bg-[#1a2430] rounded-full text-sm w-48 lg:w-64 outline-none transition-all placeholder-[#507395]/70" 
            placeholder="Search boards..." 
            type="text"
          />
        </div>

        <div className="h-6 w-px bg-[#e8edf3] dark:border-[#2d3a4a] hidden md:block"></div>

        {/* User Profile & Notifications */}
        <div className="flex items-center gap-3">
          
          {/* NOTIFICATION BUTTON */}
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              // FIX: Changed hover color to brand blue (#4c99e6) instead of dark (#0e141b)
              className={`flex items-center justify-center p-2 rounded-full transition-colors ${
                isNotifOpen 
                  ? "bg-[#4c99e6]/10 text-[#4c99e6]" 
                  : "text-[#507395] hover:text-[#4c99e6] hover:bg-[#f8fafb] dark:hover:bg-[#111921]"
              }`}
            >
              <span className="material-symbols-outlined text-[24px] leading-none">notifications</span>
              
              {/* Badge: Shows if unreadCount > 0 */}
              {unreadCount && unreadCount.count > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-[#1a2430]"></span>
              )}
            </button>

            <NotificationDropdown 
              isOpen={isNotifOpen} 
              onClose={() => setIsNotifOpen(false)} 
            />
          </div>
          
          {/* Profile Avatar */}
          <div className="flex items-center gap-2">
             <div className="bg-blue-600 rounded-full size-9 flex items-center justify-center text-white font-bold text-sm ring-2 ring-transparent hover:ring-[#4c99e6]/50 transition-all cursor-pointer">
               {user?.displayName?.charAt(0) || "U"}
             </div>
          </div>
        </div>
      </div>
    </header>
  );
}