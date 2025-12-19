"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useUnreadNotificationCount, useWorkspaces, useBoardSearch } from "@/hooks/use-queries";
import { useUIStore } from "@/store/use-ui-store";
import { useState, useRef, useEffect } from "react";
import { NotificationDropdown } from "./notification-dropdown";
import { useDebounce } from "@/hooks/use-debounce"; // Ensure you created this hook
import Link from "next/link";
import { ReadBoardDto } from "@/types/dtos"; // Import Type

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const { toggleSidebar, isSidebarOpen } = useUIStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300); 
  const searchRef = useRef<HTMLDivElement>(null);

  // --- Search Query ---
  // FIX: Correct signature (id, query, limit)
  const { data: searchResults, isLoading: isSearching } = useBoardSearch(
    activeWorkspaceId || "", 
    debouncedSearch, 
    10
  );

  const { data: unreadCount } = useUnreadNotificationCount();
  const activeWorkspace = workspaces?.find(w => w.id === activeWorkspaceId);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBoardClick = (boardId: string) => {
    setIsSearchFocused(false);
    setSearchQuery(""); 
    router.push(`/w/${activeWorkspaceId}/b/${boardId}`);
  };

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
        {!isSidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="flex items-center justify-center p-2 -ml-2 text-[#507395] hover:text-[#0e141b] dark:text-[#94a3b8] dark:hover:text-[#e8edf3] hover:bg-gray-100 dark:hover:bg-[#2d3a4a] rounded-lg transition-colors"
            title="Open Sidebar"
          >
            <span className="material-symbols-outlined text-[24px] leading-none">menu</span>
          </button>
        )}

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
        
        {/* --- Search Bar --- */}
        <div className="relative group hidden md:block" ref={searchRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#507395] dark:text-[#94a3b8] group-focus-within:text-[#4c99e6] transition-colors text-[20px]">
            search
          </span>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="pl-10 pr-4 py-2 bg-[#f8fafb] dark:bg-[#111921] border border-transparent focus:border-[#4c99e6]/30 focus:bg-white dark:focus:bg-[#1a2430] rounded-full text-sm w-48 lg:w-64 outline-none transition-all placeholder-[#507395]/70 text-[#0e141b] dark:text-[#e8edf3]" 
            placeholder="Search boards..." 
            type="text"
          />

          {/* Search Dropdown */}
          {isSearchFocused && searchQuery.length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a2430] rounded-xl shadow-xl border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden min-w-[280px] z-50 animate-in fade-in zoom-in-95 duration-100">
              {isSearching ? (
                <div className="p-4 text-center text-[#507395] text-sm">Searching...</div>
              ) : searchResults && searchResults.length > 0 ? (
                <ul className="py-2">
                  <li className="px-4 py-1 text-xs font-semibold text-[#507395] uppercase tracking-wider">Boards</li>
                  {/* Explicitly mapping as ReadBoardDto[] */}
                  {searchResults.map((board: ReadBoardDto) => (
                    <li key={board.id}>
                      <button 
                        onClick={() => handleBoardClick(board.id)}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#f8fafb] dark:hover:bg-[#2d3a4a] transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {board.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#0e141b] dark:text-[#e8edf3] truncate">{board.name}</p>
                          <p className="text-xs text-[#507395] truncate">{board.description || "No description"}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-[#507395] text-sm">
                  No boards found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[#e8edf3] dark:border-[#2d3a4a] hidden md:block"></div>

        {/* User Profile & Notifications */}
        <div className="flex items-center gap-3">
          
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`flex items-center justify-center p-2 rounded-full transition-colors ${
                isNotifOpen 
                  ? "bg-[#4c99e6]/10 text-[#4c99e6]" 
                  : "text-[#507395] hover:text-[#4c99e6] hover:bg-[#f8fafb] dark:hover:bg-[#111921]"
              }`}
            >
              <span className="material-symbols-outlined text-[24px] leading-none">notifications</span>
              {unreadCount && unreadCount.count > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-[#1a2430]"></span>
              )}
            </button>

            <NotificationDropdown 
              isOpen={isNotifOpen} 
              onClose={() => setIsNotifOpen(false)} 
            />
          </div>
          
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