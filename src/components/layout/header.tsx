"use client";

import { useAuthStore } from "@/store/use-auth-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useWorkspaces } from "@/hooks/use-queries";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  
  const activeWorkspace = workspaces?.find(w => w.id === activeWorkspaceId);

  return (
    <header className="h-16 border-b border-[#e8edf3] dark:border-[#2d3a4a] flex items-center justify-between px-6 bg-white dark:bg-[#1a2430] flex-shrink-0 z-10 font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[#507395] dark:text-[#94a3b8]">
        <span className="hover:text-[#4c99e6] cursor-pointer transition-colors">
          {activeWorkspace?.name || "Dashboard"}
        </span>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="text-[#0e141b] dark:text-[#e8edf3] font-medium">Overview</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#507395] dark:text-[#94a3b8] group-focus-within:text-[#4c99e6] transition-colors text-[20px]">
            search
          </span>
          <input 
            className="pl-10 pr-4 py-2 bg-[#f8fafb] dark:bg-[#111921] border border-transparent focus:border-[#4c99e6]/30 focus:bg-white dark:focus:bg-[#1a2430] rounded-full text-sm w-64 outline-none transition-all placeholder-[#507395]/70" 
            placeholder="Search boards..." 
            type="text"
          />
        </div>

        <div className="h-6 w-px bg-[#e8edf3] dark:border-[#2d3a4a]"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-[#507395] hover:text-[#0e141b] hover:bg-[#f8fafb] dark:hover:bg-[#111921] rounded-full transition-colors">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-[#1a2430]"></span>
          </button>
          
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