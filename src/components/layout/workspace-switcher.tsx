"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWorkspaces } from "@/hooks/use-queries";
import { useWorkspaceStore } from "@/store/use-workspace-store";

interface WorkspaceSwitcherProps {
  onCreateClick: () => void; // Callback to open the modal
}

export function WorkspaceSwitcher({ onCreateClick }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);

  const { data: workspaces, isLoading } = useWorkspaces();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();
  const activeWorkspace = workspaces?.find((w) => w.id === activeWorkspaceId);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSwitch = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    setIsOpen(false);

    router.push("/dashboard")
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`hover: cursor-pointer w-full flex items-center gap-3 p-2 rounded-lg transition-colors group min-w-0 ${
            isOpen ? "bg-white dark:bg-[#1a2430] shadow-sm" : "hover:bg-white dark:hover:bg-[#1a2430]"
        }`}
      >
        {/* Workspace Avatar */}
        <div className="bg-primary rounded-lg size-8 shadow-sm flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
          {activeWorkspace?.name?.charAt(0) || "W"}
        </div>
        
        {/* Workspace Name */}
        <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
          <h1 className="text-sm font-semibold truncate w-full text-left text-[#0e141b] dark:text-[#e8edf3]">
            {isLoading ? "Loading..." : (activeWorkspace?.name || "Select Workspace")}
          </h1>
          <span className="text-[10px] text-[#507395] dark:text-[#94a3b8] truncate">
            {activeWorkspace ? "" : "No workspace"}
          </span>
        </div>

        {/* Chevron */}
        <span className={`material-symbols-outlined ml-auto text-[#507395] hover:cursor-pointer dark:text-[#94a3b8] transition-transform duration-200 text-[20px] ${
            isOpen ? "rotate-180 text-primary" : "group-hover:text-primary"
        }`}>
          expand_more
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a2430] rounded-xl shadow-xl border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top">
           
           {/* Header */}
           <div className="px-3 py-2 border-b border-[#e8edf3] dark:border-[#2d3a4a] bg-[#f8fafb] dark:bg-[#111921]">
              <span className="text-xs font-bold text-[#507395] dark:text-[#94a3b8] uppercase tracking-wider">
                 My Workspaces
              </span>
           </div>

           {/* List */}
           <div className="max-h-[240px] overflow-y-auto py-1">
              {workspaces?.map((ws) => {
                 const isActive = activeWorkspaceId === ws.id;
                 return (
                    <button
                       key={ws.id}
                       onClick={() => handleSwitch(ws.id)}
                       className="hover: cursor-pointer w-full text-left px-3 py-2 flex hover:cursor-pointer items-center gap-3 hover:bg-[#f8fafb] dark:hover:bg-[#2d3a4a] transition-colors"
                    >
                       <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                          isActive ? "bg-primary" : "bg-gray-400 dark:bg-gray-600"
                       }`}>
                          {ws.name.charAt(0)}
                       </div>
                       <span className={`text-sm truncate flex-1 ${
                          isActive ? "font-semibold text-[#0e141b] dark:text-[#e8edf3]" : "text-[#507395] dark:text-[#94a3b8]"
                       }`}>
                          {ws.name}
                       </span>
                       {isActive && (
                          <span className="material-symbols-outlined text-[18px] text-primary">check</span>
                       )}
                    </button>
                 )
              })}
           </div>

           {/* Footer Action */}
           <div className="p-2 border-t border-[#e8edf3] dark:border-[#2d3a4a]">
              <button
                 onClick={() => { setIsOpen(false); onCreateClick(); }}
                 className="flex w-full hover:cursor-pointer items-center justify-center gap-2 rounded-lg py-2 px-3 bg-primary-light text-primary hover:bg-primary-light/80 transition-colors text-xs font-bold"
              >
                 <span className="material-symbols-outlined text-[16px]">add</span>
                 Create New Workspace
              </button>
           </div>
        </div>
      )}
    </div>
  );
}