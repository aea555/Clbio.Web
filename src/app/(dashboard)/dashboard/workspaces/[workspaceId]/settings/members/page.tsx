"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useWorkspaceMembers } from "@/hooks/use-queries";
import { useWorkspaceMutations } from "@/hooks/use-mutations";
import { useAuthStore } from "@/store/use-auth-store";
import { AddMemberModal } from "@/components/dashboard/add-member-modal";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { ArchivedBanner } from "@/components/dashboard/archived-banner"; 
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions";
import { ConfirmationModal } from "@/components/ui/confirmation-modal"; // Import Modal

const ROLE_MAP: Record<number, string> = {
  0: "Member",
  1: "Admin",
  2: "Owner",
};

export default function WorkspaceMembersPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { user: currentUser } = useAuthStore();
  
  // State for modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null); // Track member ID to remove

  // Permissions Check
  const { isArchived, canInviteMember, canRemoveMember } = useWorkspacePermissions(workspaceId);

  const { data: members, isLoading } = useWorkspaceMembers(workspaceId);
  const { removeMember } = useWorkspaceMutations();

  // Open modal instead of confirm()
  const confirmRemove = (userId: string) => {
    setMemberToRemove(userId);
  };

  const handleRemoveMember = () => {
    if (memberToRemove) {
      removeMember.mutate(
        { workspaceId, userId: memberToRemove },
        {
          onSuccess: () => setMemberToRemove(null), // Close modal on success
        }
      );
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading members...</div>;
  }

  // Find the user name for the modal description
  const memberName = members?.find((m: any) => m.userId === memberToRemove)?.userDisplayName || "this member";

  return (
    <div className="flex flex-col min-h-full">
       {/* Banner Logic */}
       {isArchived && (
        <div className="-mt-4 -mx-4 md:-mx-8 mb-6">
           <ArchivedBanner workspaceId={workspaceId} workspaceName="Current Workspace" />
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Member?"
        description={`Are you sure you want to remove ${memberName} from the workspace? They will lose access to all boards and tasks.`}
        confirmText="Remove Member"
        variant="danger"
        isLoading={removeMember.isPending}
      />

      <div className="max-w-4xl mx-auto w-full">
        <AddMemberModal 
          workspaceId={workspaceId} 
          isOpen={isInviteOpen} 
          onClose={() => setIsInviteOpen(false)} 
        />

        {/* ... Rest of UI (Header, Tabs, Table) ... */}
        <h2 className="text-2xl font-bold text-[#0e141b] dark:text-[#e8edf3] mb-2">Workspace Settings</h2>
        <p className="text-[#507395] dark:text-[#94a3b8] mb-6">Manage members and roles.</p>
        
        <SettingsTabs workspaceId={workspaceId} />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="font-bold text-lg text-[#0e141b] dark:text-[#e8edf3]">Member List</h3>
          
          {canInviteMember && (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-[#4c99e6] hover:bg-[#3b7ec4] text-white text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>Invite Member</span>
            </button>
          )}
        </div>

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
                        {ROLE_MAP[member.role] || "Member"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#507395] dark:text-[#94a3b8]">
                      {new Date(member.joinedAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.userId !== currentUser?.id && canRemoveMember && (
                        <button 
                          onClick={() => confirmRemove(member.userId)} // Open modal
                          className="text-[#507395] hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Remove member"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}