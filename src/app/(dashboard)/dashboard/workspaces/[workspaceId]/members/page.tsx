"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWorkspaceMembers } from "@/hooks/use-queries";
import { useWorkspaceMutations } from "@/hooks/use-mutations";
import { useAuthStore } from "@/store/use-auth-store";
import { AddMemberModal } from "@/components/dashboard/add-member-modal";
import { WorkspaceRole } from "@/types/enums";

export default function WorkspaceMembersPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { user: currentUser } = useAuthStore();
  
  const { data: members, isLoading } = useWorkspaceMembers(workspaceId);
  const { removeMember } = useWorkspaceMutations();

  const handleRemove = (userId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      removeMember.mutate({ workspaceId, userId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4c99e6]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full">
      <AddMemberModal 
        workspaceId={workspaceId} 
        isOpen={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)} 
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0e141b] dark:text-[#e8edf3]">Workspace Members</h2>
          <p className="text-[#507395] dark:text-[#94a3b8]">Manage access and roles for this workspace.</p>
        </div>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-[#4c99e6] hover:bg-[#3b7ec4] text-white text-sm font-semibold shadow-sm transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>Invite Member</span>
        </button>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f8fafb] dark:bg-[#111921] border-b border-[#e8edf3] dark:border-[#2d3a4a]">
                <th className="px-6 py-4 font-semibold text-[#0e141b] dark:text-[#e8edf3]">User</th>
                <th className="px-6 py-4 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Role</th>
                <th className="px-6 py-4 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Joined</th>
                <th className="px-6 py-4 text-right font-semibold text-[#0e141b] dark:text-[#e8edf3]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8edf3] dark:divide-[#2d3a4a]">
              {members?.map((member: any) => (
                <tr key={member.id} className="group hover:bg-[#f8fafb] dark:hover:bg-[#111921]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {member.userDisplayName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="font-medium text-[#0e141b] dark:text-[#e8edf3]">{member.userDisplayName}</div>
                        <div className="text-xs text-[#507395] dark:text-[#94a3b8]">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.role === 2
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}>
                      {WorkspaceRole[member.role].toString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#507395] dark:text-[#94a3b8]">
                    {new Date(member.joinedAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Don't allow removing yourself */}
                    {member.userId !== currentUser?.id && (
                      <button 
                        onClick={() => handleRemove(member.userId)}
                        className="text-[#507395] hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Remove member"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {members?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#507395]">
                    No members found. Invite someone to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}