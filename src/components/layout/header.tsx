"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/use-auth-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useUnreadNotificationCount, useWorkspaces, useBoardSearch, useTask, useBoard } from "@/hooks/use-queries";
import { useUIStore } from "@/store/use-ui-store";
import { useState, useRef, useEffect, useMemo } from "react";
import { NotificationDropdown } from "./notification-dropdown";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";
import { ReadBoardDto } from "@/types/dtos";
import { ProfileDropdown } from "../dashboard/profile-dropdown";

export function Header() {
  const t = useTranslations("Header");
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
  const debouncedSearch = useDebounce(searchQuery, 500);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Extract IDs from URL for task/board pages
  const urlParams = useMemo(() => {
    const taskMatch = pathname.match(/\/workspaces\/([^/]+)\/boards\/([^/]+)\/tasks\/([^/]+)/);
    const boardMatch = pathname.match(/\/workspaces\/([^/]+)\/boards\/([^/]+)(?:\/|$)/);

    if (taskMatch) {
      return { workspaceId: taskMatch[1], boardId: taskMatch[2], taskId: taskMatch[3] };
    }
    if (boardMatch) {
      return { workspaceId: boardMatch[1], boardId: boardMatch[2], taskId: null };
    }
    return { workspaceId: null, boardId: null, taskId: null };
  }, [pathname]);

  // Fetch task data if on task page
  const { data: currentTask } = useTask(
    urlParams.workspaceId || "",
    urlParams.taskId || ""
  );

  // Fetch board data if on board/task page
  const { data: currentBoard } = useBoard(
    urlParams.workspaceId || "",
    urlParams.boardId || ""
  );

  const { data: searchResults, isLoading: isSearching } = useBoardSearch(
    activeWorkspaceId || "",
    debouncedSearch,
    10
  );

  const { data: unreadCount } = useUnreadNotificationCount();
  const activeWorkspace = workspaces?.find(w => w.id === activeWorkspaceId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isOutsideDesktop = desktopSearchRef.current && !desktopSearchRef.current.contains(target);
      const isOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(target);

      if (isOutsideDesktop && isOutsideMobile) {
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
    type BreadcrumbItem = { label: string; href: string | null };

    // Settings pages
    if (pathname.includes("/workspace-invitations")) {
      return [
        { label: t("breadcrumbs.account"), href: "/dashboard" },
        { label: t("breadcrumbs.invitations"), href: null }
      ];
    }
    if (pathname.startsWith("/dashboard/settings")) {
      if (pathname.includes("/general")) return [
        { label: t("breadcrumbs.settings"), href: "/dashboard/settings" },
        { label: t("breadcrumbs.appearance"), href: null }
      ];
      if (pathname.includes("/notifications")) return [
        { label: t("breadcrumbs.settings"), href: "/dashboard/settings" },
        { label: t("breadcrumbs.notifications"), href: null }
      ];
      if (pathname.includes("/account")) return [
        { label: t("breadcrumbs.settings"), href: "/dashboard/settings" },
        { label: t("breadcrumbs.account"), href: null }
      ];
      return [
        { label: t("breadcrumbs.dashboard"), href: "/dashboard" },
        { label: t("breadcrumbs.app_settings"), href: null }
      ];
    }

    // Task detail page - show: Workspace > Panolar > Board Name > Task Title
    if (urlParams.taskId && currentTask) {
      return [
        { label: activeWorkspace?.name || t("breadcrumbs.dashboard"), href: "/dashboard" },
        { label: t("breadcrumbs.boards"), href: "/dashboard" },
        { label: currentBoard?.name || t("breadcrumbs.board_view"), href: `/dashboard/workspaces/${urlParams.workspaceId}/boards/${urlParams.boardId}` },
        { label: currentTask.title, href: null }
      ];
    }

    // Board page - show: Workspace > Panolar > Board Name
    if (urlParams.boardId && currentBoard && !urlParams.taskId) {
      return [
        { label: activeWorkspace?.name || t("breadcrumbs.dashboard"), href: "/dashboard" },
        { label: t("breadcrumbs.boards"), href: "/dashboard" },
        { label: currentBoard.name, href: null }
      ];
    }

    // Workspace settings/members pages
    let current = t("breadcrumbs.boards");
    if (pathname.includes("/members")) current = t("breadcrumbs.members");
    else if (pathname.includes("/audit-logs")) current = t("breadcrumbs.audit_logs");
    else if (pathname.includes("/settings")) current = t("breadcrumbs.settings");

    return [
      { label: activeWorkspace?.name || t("breadcrumbs.dashboard"), href: "/dashboard" },
      { label: current, href: null }
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  // Shared search dropdown JSX
  const renderSearchDropdown = () => {
    if (!isSearchFocused || searchQuery.length <= 1) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-xl border border-border-base overflow-hidden min-w-[280px] z-50 animate-in fade-in zoom-in-95 duration-100">
        {isSearching ? (
          <div className="p-4 text-center text-muted-foreground text-sm bg-card">{t("searching")}</div>
        ) : searchResults && searchResults.length > 0 ? (
          <ul className="py-2 bg-card">
            <li className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("results_header_boards")}</li>
            {searchResults.map((board: ReadBoardDto) => (
              <li key={board.id}>
                <button
                  onClick={() => handleBoardClick(board.id)}
                  className="hover:cursor-pointer w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors flex items-center gap-3 bg-card"
                >
                  <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {board.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{board.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{board.description || t("no_description")}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-sm bg-card">
            {t("no_results", { query: searchQuery })}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="relative z-40 border-b border-border-base bg-card flex-shrink-0 font-sans transition-all duration-300">
      {/* Main header row - icons always visible */}
      <div className="h-14 flex items-center justify-between px-4 md:px-6 gap-2">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="hover:cursor-pointer flex items-center justify-center p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-colors flex-shrink-0"
              title={t("open_sidebar")}
            >
              <span className="material-symbols-outlined text-[24px] leading-none">menu</span>
            </button>
          )}

          {/* Desktop breadcrumbs - inline */}
          <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground overflow-hidden min-w-0">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 min-w-0">
                {index > 0 && (
                  <span className="material-symbols-outlined text-base flex-shrink-0">chevron_right</span>
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-primary hover:cursor-pointer transition-colors truncate max-w-[150px] lg:max-w-[200px]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium truncate max-w-[200px]">
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Mobile - show only first breadcrumb item inline */}
          <div className="md:hidden flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
            {breadcrumbs[0] && (
              <Link
                href={breadcrumbs[0].href || "/dashboard"}
                className="hover:text-primary hover:cursor-pointer transition-colors truncate max-w-[120px]"
              >
                {breadcrumbs[0].label}
              </Link>
            )}
            {breadcrumbs.length > 1 && (
              <span className="material-symbols-outlined text-base flex-shrink-0">chevron_right</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
          {/* Desktop Search Bar */}
          <div className="relative group hidden md:block w-48 lg:w-64" ref={desktopSearchRef}>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors text-[20px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="pl-10 pr-4 py-2 bg-background border border-border-base focus:border-primary/50 focus:bg-card rounded-full text-sm w-full outline-none transition-all placeholder-muted-foreground/60 text-foreground"
              placeholder={t("search_placeholder")}
              type="text"
            />
            {renderSearchDropdown()}
          </div>

          <div className="h-6 w-px bg-border-base hidden md:block"></div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`flex items-center hover:cursor-pointer justify-center p-2 rounded-full transition-colors ${isNotifOpen
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

            <div className="relative">
              <button
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                className="flex items-center gap-2 hover:cursor-pointer focus:outline-none"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName || "Profile"}
                    className={`size-9 rounded-full object-cover transition-all bg-background ${isProfileOpen ? "ring-2 ring-primary" : "ring-2 ring-transparent hover:ring-primary/50"
                      }`}
                  />
                ) : (
                  <div className={`bg-primary rounded-full size-9 flex items-center justify-center text-white font-bold text-sm transition-all ${isProfileOpen ? "ring-2 ring-primary" : "ring-2 ring-transparent hover:ring-primary/50"
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
      </div>

      {/* Mobile Breadcrumb Row - shows remaining breadcrumb items */}
      {breadcrumbs.length > 1 && (
        <div className="md:hidden px-4 pb-2 flex items-center gap-1.5 text-sm text-muted-foreground overflow-hidden">
          {breadcrumbs.slice(1).map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 min-w-0">
              {index > 0 && (
                <span className="material-symbols-outlined text-base flex-shrink-0">chevron_right</span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-primary hover:cursor-pointer transition-colors truncate max-w-[100px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium truncate max-w-[120px]">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mobile Search Row - appears below breadcrumbs on small screens */}
      <div className="md:hidden px-4 pb-3" ref={mobileSearchRef}>
        <div className="relative group w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors text-[20px]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="pl-10 pr-4 py-2 bg-background border border-border-base focus:border-primary/50 focus:bg-card rounded-full text-sm w-full outline-none transition-all placeholder-muted-foreground/60 text-foreground"
            placeholder={t("search_placeholder")}
            type="text"
          />
          {renderSearchDropdown()}
        </div>
      </div>
    </header>
  );
}