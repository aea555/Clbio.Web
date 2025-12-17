"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWorkspaces } from "@/hooks/use-queries";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useAuthStore } from "@/store/use-auth-store";
import { CreateWorkspaceModal } from "../dashboard/create-workspace-modal";
import { usePathname, useRouter } from "next/navigation";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: workspaces, isLoading } = useWorkspaces();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);

  const logout = useAuthStore((state) => state.logout);

  // Default to first workspace if none selected
  useEffect(() => {
    if (!activeWorkspaceId && workspaces && workspaces.length > 0) {
      setActiveWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, activeWorkspaceId, setActiveWorkspaceId]);

  const activeWorkspace = workspaces?.find(w => w.id === activeWorkspaceId);

  const handleWorkspaceSwitch = (newWorkspaceId: string) => {
    // 1. Update the Store (Instant UI feedback for Sidebar)
    setActiveWorkspaceId(newWorkspaceId);

    if (pathname.includes("/workspaces/")) {
      const pathParts = pathname.split("/");
      const workspaceIndex = pathParts.indexOf("workspaces");

      if (workspaceIndex !== -1 && pathParts[workspaceIndex + 1]) {
        pathParts[workspaceIndex + 1] = newWorkspaceId;
        const newPath = pathParts.join("/");
        router.push(newPath); // Navigate to the new context
      }
    } else {
      if (pathname === "/dashboard") {
      } else {
        router.push("/dashboard");
      }
    }
  };

  // 1. Boards: Active if strictly on /dashboard or on a specific board route (starts with /w/)
  const isBoardsActive = pathname === "/dashboard" || pathname.startsWith("/w/");

  // 2. Members: Active if URL contains "/members"
  const isMembersActive = pathname.includes("/members");

  // 3. Settings: Active if URL starts with "/settings"
  const isSettingsActive = pathname.startsWith("/settings");

  // Helper for consistent styling
  const getLinkClasses = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
      ? "bg-white dark:bg-[#1a2430] shadow-sm text-[#4c99e6] font-medium"
      : "text-[#507395] dark:text-[#94a3b8] hover:bg-white dark:hover:bg-[#1a2430] hover:text-[#0e141b] dark:hover:text-[#e8edf3]"
    }`;

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-[#e8edf3] dark:border-[#2d3a4a] bg-[#f8fafb] dark:bg-[#111921] h-full transition-all duration-300 font-sans">
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
      />
      {/* Workspace Switcher */}
      <div className="p-4 border-b border-[#e8edf3] dark:border-[#2d3a4a]">
        <button className="flex items-center gap-3 w-full p-2 hover:bg-white dark:hover:bg-[#1a2430] rounded-lg transition-colors group">
          <div className="bg-blue-500 rounded-lg size-10 shadow-sm flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
            {activeWorkspace?.name?.charAt(0) || "W"}
          </div>
          <div className="flex flex-col items-start min-w-0">
            <h1 className="text-sm font-semibold truncate w-full text-left text-[#0e141b] dark:text-[#e8edf3]">
              {isLoading ? "Loading..." : (activeWorkspace?.name || "Select Workspace")}
            </h1>
            <p className="text-xs text-[#507395] dark:text-[#94a3b8]">Free Plan</p>
          </div>
          <span className="material-symbols-outlined ml-auto text-[#507395] dark:text-[#94a3b8] group-hover:text-[#4c99e6] text-[20px]">
            expand_more
          </span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {/* BOARDS */}
        <Link
          href="/dashboard"
          className={getLinkClasses(isBoardsActive)}
        >
          <span className={`material-symbols-outlined text-[24px] ${isBoardsActive ? "fill-1" : ""}`}>dashboard</span>
          <span className="text-sm">Boards</span>
        </Link>

        {/* MEMBERS */}
        <Link
          href={activeWorkspaceId ? `/dashboard/workspaces/${activeWorkspaceId}/members` : "#"}
          onClick={(e) => !activeWorkspaceId && e.preventDefault()}
          className={`${getLinkClasses(isMembersActive)} ${!activeWorkspaceId ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className={`material-symbols-outlined text-[24px] ${isMembersActive ? "fill-1" : ""}`}>group</span>
          <span className="text-sm">Members</span>
        </Link>

        {/* SETTINGS */}
        <Link
          href="/settings"
          className={getLinkClasses(isSettingsActive)}
        >
          <span className={`material-symbols-outlined text-[24px] ${isSettingsActive ? "fill-1" : ""}`}>settings</span>
          <span className="text-sm">Settings</span>
        </Link>

        {/* Workspace List Section */}
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
                <div className={`w-2 h-2 rounded-full ${activeWorkspaceId === ws.id ? "bg-[#4c99e6]" : "bg-gray-400"}`}></div>
                <span className="text-sm truncate">{ws.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[#e8edf3] dark:border-[#2d3a4a] flex flex-col gap-2">
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
            onClick={logout}
            className="p-2 text-[#507395] hover:text-red-500 transition-colors"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}