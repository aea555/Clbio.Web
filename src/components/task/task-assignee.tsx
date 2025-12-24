"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl"; //
import { useAuthStore } from "@/store/use-auth-store";
import { useWorkspaceMembers, useOnlinePresence } from "@/hooks/use-queries";
import { useTaskMutations } from "@/hooks/use-mutations";
import { ReadTaskItemDto } from "@/types/dtos";
import { usePermissions } from "@/providers/permission-provider";
import { Permission } from "@/lib/rbac/permissions";
import { WorkspaceRole } from "@/types/enums";
import { UserAvatar } from "@/components/ui/user-avatar";

interface TaskAssigneeProps {
  task: ReadTaskItemDto;
  workspaceId: string;
  boardId: string;
  isArchived?: boolean;
}

export function TaskAssignee({ task, workspaceId, boardId, isArchived = false }: TaskAssigneeProps) {
  const t = useTranslations("TaskAssignee"); //
  const { user } = useAuthStore();
  const { role } = usePermissions();
  const { assignTask } = useTaskMutations(workspaceId, boardId);
  const { data: members } = useWorkspaceMembers(workspaceId);

  const memberIds = useMemo(() => members?.map(m => m.userId) || [], [members]);
  const { data: onlineUserIds } = useOnlinePresence(memberIds);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const isAssignedToMe = task.assigneeId === user?.id;
  const isPrivileged = role === WorkspaceRole.Owner || role === WorkspaceRole.PrivilegedMember;

  const assigneeMember = useMemo(() => {
    if (!task.assigneeId || !members) return null;
    return members.find(m => m.userId === task.assigneeId);
  }, [task.assigneeId, members]);

  const displayName = assigneeMember?.userDisplayName || task.assigneeDisplayName || t("unknown");
  const avatarUrl = assigneeMember?.userAvatarUrl || task.assigneeAvatarUrl;
  
  const isAssigneeOnline = task.assigneeId ? onlineUserIds?.includes(task.assigneeId) : false;

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter(m => 
        m.userDisplayName.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  const handleAssign = (userId: string | null) => {
    assignTask.mutate({ taskId: task.id, userId });
    setIsOpen(false);
  };

  const isDisabled = isArchived;

  if (isDisabled) {
     return (
        <div className="mb-4">
            <label className="text-xs text-[#507395] block mb-1 font-bold uppercase tracking-wider">{t("label")}</label>
            <div className="flex items-center gap-2 opacity-80 p-1.5 -ml-1.5">
                 <UserAvatar 
                    workspaceId={workspaceId}
                    src={avatarUrl} 
                    name={displayName} 
                    isOnline={false} 
                    size="sm"
                 />
                 <span className="text-sm font-medium text-[#0e141b] dark:text-[#e8edf3]">{displayName}</span>
            </div>
        </div>
     );
  }

  if (!isPrivileged) {
     if (!task.assigneeId) {
        return (
           <div className="mb-4">
              <label className="text-xs text-[#507395] block mb-1 font-bold uppercase tracking-wider">{t("label")}</label>
              <button 
                onClick={() => handleAssign(user?.id || null)}
                disabled={assignTask.isPending}
                className="flex items-center gap-2 text-sm text-[#507395] hover:text-primary transition-colors font-medium group w-full p-1.5 -ml-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2d3a4a] hover:cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full border border-dashed border-gray-400 flex items-center justify-center group-hover:border-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[14px]">add</span>
                </div>
                <span>{t("assign_to_me")}</span>
              </button>
           </div>
        );
     }
     
     if (isAssignedToMe) {
        return (
           <div className="mb-4">
               <label className="text-xs text-[#507395] block mb-1 font-bold uppercase tracking-wider">{t("label")}</label>
               <div className="flex items-center justify-between group p-1.5 -ml-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2d3a4a]">
                  <div className="flex items-center gap-2">
                     <UserAvatar 
                        workspaceId={workspaceId}
                        src={user?.avatarUrl} 
                        name={user?.displayName || t("me")} 
                        isOnline={true} 
                        size="sm"
                     />
                     <span className="text-sm font-bold text-[#0e141b] dark:text-[#e8edf3]">{t("me")}</span>
                  </div>
                  <button 
                    onClick={() => handleAssign(null)}
                    className="text-xs text-[#507395] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer"
                    title={t("remove_assignment")}
                  >
                     <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
               </div>
           </div>
        );
     }

     return (
        <div className="mb-4">
            <label className="text-xs text-[#507395] block mb-1 font-bold uppercase tracking-wider">{t("label")}</label>
            <div className="flex items-center gap-2 opacity-80 p-1.5 -ml-1.5">
                 <UserAvatar 
                    workspaceId={workspaceId}
                    src={avatarUrl} 
                    name={displayName} 
                    isOnline={isAssigneeOnline}
                    size="sm"
                 />
                 <span className="text-sm font-medium text-[#0e141b] dark:text-[#e8edf3]">{displayName}</span>
            </div>
        </div>
     );
  }

  return (
    <div className="mb-4 relative">
        <label className="text-xs text-[#507395] block mb-1 font-bold uppercase tracking-wider">{t("label")}</label>
        
        <button 
           onClick={() => setIsOpen(!isOpen)}
           className="hover:cursor-pointer flex items-center gap-2 w-full hover:bg-gray-100 dark:hover:bg-[#2d3a4a] p-1.5 -ml-1.5 rounded-lg transition-colors text-left"
        >
            {task.assigneeId ? (
                <>
                    <UserAvatar 
                        workspaceId={workspaceId}
                        src={avatarUrl} 
                        name={displayName} 
                        isOnline={isAssigneeOnline}
                        size="sm"
                    />
                    <span className="text-sm font-bold text-[#0e141b] dark:text-[#e8edf3] truncate flex-1">
                        {displayName}
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-[#507395]">expand_more</span>
                </>
            ) : (
                <>
                    <div className="w-6 h-6 rounded-full border-gray-400 flex items-center justify-center text-[#507395] flex-shrink-0">
                        <span className="material-symbols-outlined text-[14px]">person_add</span>
                    </div>
                    <span className="text-sm text-[#507395] font-medium flex-1">{t("unassigned")}</span>
                    <span className="material-symbols-outlined text-[18px] text-[#507395]">expand_more</span>
                </>
            )}
        </button>

        {isOpen && (
            <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                <div className="absolute top-full left-0 w-64 mt-2 bg-white dark:bg-[#1a2430] rounded-xl shadow-xl border border-[#e8edf3] dark:border-[#2d3a4a] z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-[#e8edf3] dark:border-[#2d3a4a]">
                        <input 
                            autoFocus
                            placeholder={t("search_placeholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-sm px-2 py-1 bg-transparent outline-none text-[#0e141b] dark:text-[#e8edf3] placeholder-gray-400"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {task.assigneeId && (
                            <button 
                                onClick={() => handleAssign(null)}
                                className="hover:cursor-pointer w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm mb-1"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                                {t("remove_assignment")}
                            </button>
                        )}
                        
                        {filteredMembers.map(member => (
                            <button
                                key={member.id}
                                onClick={() => handleAssign(member.userId)}
                                className={`hover:cursor-pointer w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                                    task.assigneeId === member.userId 
                                        ? "bg-primary/10 text-primary font-bold" 
                                        : "text-[#0e141b] dark:text-[#e8edf3] hover:bg-gray-100 dark:hover:bg-[#2d3a4a]"
                                }`}
                            >
                                <UserAvatar 
                                    workspaceId={workspaceId}
                                    src={member.userAvatarUrl} 
                                    name={member.userDisplayName} 
                                    isOnline={onlineUserIds?.includes(member.userId)}
                                    size="sm"
                                />
                                <span className="truncate">{member.userDisplayName}</span>
                                {task.assigneeId === member.userId && (
                                    <span className="material-symbols-outlined text-[16px] ml-auto">check</span>
                                )}
                            </button>
                        ))}

                        {filteredMembers.length === 0 && (
                            <div className="px-2 py-3 text-center text-xs text-[#507395]">
                                {t("no_members")}
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}
    </div>
  );
}