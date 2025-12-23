"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useUnreadNotificationCount, useWorkspaces, useBoardSearch } from "@/hooks/use-queries";
import { useUIStore } from "@/store/use-ui-store";
import { useState, useRef, useEffect } from "react";
import { NotificationDropdown } from "./notification-dropdown";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";
import { ReadBoardDto } from "@/types/dtos";
import { ProfileDropdown } from "../dashboard/profile-dropdown";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const { toggleSidebar, isSidebarOpen } = useUIStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300); 
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading: isSearching } = useBoardSearch(
    activeWorkspaceId || "", 
    debouncedSearch, 
    10
  );

  const { data: unreadCount } = useUnreadNotificationCount();
  const activeWorkspace = workspaces?.find(w => w.id === activeWorkspaceId);

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
    router.push(`/dashboard/workspaces/${activeWorkspaceId}/boards/${boardId}`);
  };

  const getBreadcrumbs = () => {
    if (pathname.includes("/workspace-invitations")) {
        return { parent: "Account", parentHref: "/dashboard", current: "Invitations" };
    }
    if (pathname.startsWith("/dashboard/settings")) {
        if (pathname.includes("/general")) return { parent: "Settings", parentHref: "/dashboard/settings", current: "Appearance" };
        if (pathname.includes("/account")) return { parent: "Settings", parentHref: "/dashboard/settings", current: "Account" };
        if (pathname.includes("/notifications")) return { parent: "Settings", parentHref: "/dashboard/settings", current: "Notifications" };
        return { parent: "Dashboard", parentHref: "/dashboard", current: "App Settings" };
    }

    let current = "Boards";
    if (pathname.includes("/members")) current = "Members";
    else if (pathname.includes("/audit-logs")) current = "Audit Logs";
    else if (pathname.includes("/settings")) current = "Settings"; 
    else if (pathname.includes("/b/")) current = "Board View";

    return { 
        parent: activeWorkspace?.name || "Dashboard", 
        parentHref: "/dashboard", 
        current 
    };
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    // FIX: Lowered Z-index to z-40 so it sits BELOW the sidebar (z-50) on mobile
    <header className="relative z-40 h-16 border-b border-border-base flex items-center justify-between px-4 md:px-6 bg-card flex-shrink-0 font-sans transition-all duration-300">
      
      {/* Left: Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="hover:cursor-pointer flex items-center justify-center p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-colors"
            title="Open Sidebar"
          >
            <span className="material-symbols-outlined text-[24px] leading-none">menu</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={breadcrumbs.parentHref} className="hover:text-primary hover:cursor-pointer transition-colors sm:inline">
            {breadcrumbs.parent}
          </Link>
          <span className="material-symbols-outlined text-base hidden sm:inline">chevron_right</span>
          <span className="text-foreground font-medium truncate max-w-[150px] sm:max-w-none">
            {breadcrumbs.current}
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {/* --- Search Bar --- */}
        <div className="relative group hidden md:block" ref={searchRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors text-[20px]">
            search
          </span>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="pl-10 pr-4 py-2 bg-background border border-border-base focus:border-primary/50 focus:bg-card rounded-full text-sm w-48 lg:w-64 outline-none transition-all placeholder-muted-foreground/60 text-foreground" 
            placeholder="Search boards..." 
            type="text"
          />

          {/* Search Dropdown */}
          {isSearchFocused && searchQuery.length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover rounded-xl shadow-xl border border-border-base overflow-hidden min-w-[280px] z-50 animate-in fade-in zoom-in-95 duration-100">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground text-sm">Searching...</div>
              ) : searchResults && searchResults.length > 0 ? (
                <ul className="py-2">
                  <li className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Boards</li>
                  {searchResults.map((board: ReadBoardDto) => (
                    <li key={board.id}>
                      <button 
                        onClick={() => handleBoardClick(board.id)}
                        className="hover:cursor-pointer w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {board.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{board.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{board.description || "No description"}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No boards found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-border-base hidden md:block"></div>

        {/* User Profile & Notifications */}
        <div className="flex items-center gap-3">
          
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`flex items-center hover:cursor-pointer justify-center p-2 rounded-full transition-colors ${
                isNotifOpen 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-primary hover:bg-background"
              }`}
            >
              <span className="material-symbols-outlined text-[24px] leading-none">notifications</span>
              {unreadCount && unreadCount.count > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-card"></span>
              )}
            </button>

            <NotificationDropdown 
              isOpen={isNotifOpen} 
              onClose={() => setIsNotifOpen(false)} 
            />
          </div>
          
          {/* Profile Avatar */}
          <div className="relative">
            <button 
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
              className="flex items-center gap-2 hover:cursor-pointer focus:outline-none"
            >
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.displayName || "Profile"} 
                  className={`size-9 rounded-full object-cover transition-all bg-background ${
                    isProfileOpen ? "ring-2 ring-primary" : "ring-2 ring-transparent hover:ring-primary/50"
                  }`}
                />
              ) : (
                <div className={`bg-primary rounded-full size-9 flex items-center justify-center text-white font-bold text-sm transition-all ${
                  isProfileOpen ? "ring-2 ring-primary" : "ring-2 ring-transparent hover:ring-primary/50"
                }`}>
                  {user?.displayName?.charAt(0) || "U"}
                </div>
              )}
            </button>

            <ProfileDropdown 
              isOpen={isProfileOpen} 
              onClose={() => setIsProfileOpen(false)} 
            />
          </div>
        </div>
      </div>
    </header>
  );
}