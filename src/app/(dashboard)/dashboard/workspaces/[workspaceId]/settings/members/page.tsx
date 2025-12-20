"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useWorkspaceMembers, useOnlinePresence } from "@/hooks/use-queries"; // Added useOnlinePresence
import { useWorkspaceMutations } from "@/hooks/use-mutations";
import { useAuthStore } from "@/store/use-auth-store";
import { AddMemberModal } from "@/components/dashboard/add-member-modal";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { ArchivedBanner } from "@/components/dashboard/archived-banner";
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions"; 
import { usePermissions } from "@/providers/permission-provider"; 
import { Permission } from "@/lib/rbac/permissions"; 
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { UserAvatar } from "@/components/ui/user-avatar"; // Added Component
import { WorkspaceRole } from "@/types/enums";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-utils";

const ROLE_MAP: Record<number, string> = {
  0: "Member",
  1: "Admin",
  2: "Owner",
};

export default function WorkspaceMembersPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { user: currentUser } = useAuthStore();

  const { can, isOwner, isAdmin } = usePermissions();
  const { isArchived } = useWorkspacePermissions(workspaceId);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [memberToUpdate, setMemberToUpdate] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string | null>(null);

  const { data: members, isLoading } = useWorkspaceMembers(workspaceId);
  const { removeMember, updateMemberRole } = useWorkspaceMutations(workspaceId);

  // 1. Extract Member IDs for Presence Check
  const memberIds = useMemo(() => {
    return members?.map((m) => m.userId) || [];
  }, [members]);

  // 2. Poll for Online Status
  const { data: onlineUserIds } = useOnlinePresence(memberIds);

  const confirmRemove = (userId: string) => {
    setMemberToRemove(userId);
  };

  const confirmRoleChange = (userId: string, newRoleValue: string) => {
    setMemberToUpdate(userId);
    setNewRole(newRoleValue);
  };

  const handleRoleUpdate = () => {
    if (memberToUpdate && newRole && canManageMember(members?.find(m => m.userId === memberToUpdate))) {
      updateMemberRole.mutate(
        { memberId: memberToUpdate, data: { id: memberToUpdate, role: parseInt(newRole) } },
        {
          onSuccess: () => {
            setMemberToUpdate(null);
            setNewRole(null);
          }
        }
      );
    }
  };

  const handleRemoveMember = () => {
    if (memberToRemove) {
      removeMember.mutate(
        { workspaceId, userId: memberToRemove },
        {
          onSuccess: () => setMemberToRemove(null),
          onError: (err) => toast.error(getErrorMessage(err))
        }
      );
    }
  };

  const canManageMember = (targetMember: any) => {
    if (!targetMember) return false;
    
    if (isArchived) return false;
    if (targetMember.userId === currentUser?.id) return false;

    if (isOwner) return true; 
    
    if (isAdmin) {
      return targetMember.role === WorkspaceRole.Member;
    }

    return false;
  };

  const canInvite = can(Permission.AddMember) && !isArchived;

  if (isLoading) {
    return <div className="p-8">Loading members...</div>;
  }

  const memberName = members?.find((m: any) => m.userId === memberToRemove)?.userDisplayName || "this member";
  const memberUpdateName = members?.find((m: any) => m.userId === memberToUpdate)?.userDisplayName || "this member";
  const memberUpdateOldRole = members?.find((m: any) => m.userId === memberToUpdate)?.role || 0;

  return (
    <div className="flex flex-col min-h-full">
      {isArchived && (
        <div className="-mt-4 -mx-4 md:-mx-8 mb-6">
          <ArchivedBanner workspaceId={workspaceId} workspaceName="Current Workspace" />
        </div>
      )}

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

      <ConfirmationModal
        isOpen={!!memberToUpdate}
        onClose={() => { setMemberToUpdate(null); setNewRole(null); }}
        onConfirm={handleRoleUpdate}
        title="Update Member Role?"
        description={`Are you sure you want to update ${memberUpdateName}'s workspace role from ${ROLE_MAP[memberUpdateOldRole]} to ${newRole ? ROLE_MAP[Number(newRole)] : "unknown"}?`}
        confirmText="Update Role"
        variant="warning"
        isLoading={updateMemberRole.isPending}
      />

      <div className="max-w-4xl mx-auto w-full">
        <AddMemberModal
          workspaceId={workspaceId}
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
        />

        <h2 className="text-2xl font-bold text-[#0e141b] dark:text-[#e8edf3] mb-2">Workspace Settings</h2>
        <p className="text-[#507395] dark:text-[#94a3b8] mb-6">Manage members and roles.</p>

        <SettingsTabs workspaceId={workspaceId} />

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="font-bold text-lg text-[#0e141b] dark:text-[#e8edf3]">Member List</h3>

          {canInvite && (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>Invite Member</span>
            </button>
          )}
        </div>

        {/* Members Table */}
        <div className="bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#f8fafb] dark:bg-[#111921] border-b border-[#e8edf3] dark:border-[#2d3a4a]">
                  <th className="px-6 py-4 font-semibold text-[#0e141b] dark:text-[#e8edf3]">User</th>
                  <th className="px-6 py-4 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Role</th>
                  <th className="px-6 py-4 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Joined</th>
                  <th className="px-6 py-4 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Update Role</th>
                  <th className="px-6 py-4 font-semibold text-[#0e141b] dark:text-[#e8edf3] text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8edf3] dark:divide-[#2d3a4a]">
                {members?.map((member) => {
                  const isManaged = canManageMember(member);
                  // Check status
                  const isOnline = onlineUserIds?.includes(member.userId);
                  
                  return (
                    <tr key={member.id} className="group hover:bg-[#f8fafb] dark:hover:bg-[#111921]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Replaced manual div with UserAvatar */}
                          <UserAvatar 
                            src={member.userAvatarUrl} 
                            name={member.userDisplayName} 
                            isOnline={isOnline}
                            size="md"
                          />
                          <div>
                            <div className="font-medium text-[#0e141b] dark:text-[#e8edf3]">{member.userDisplayName}</div>
                            {/*<div className="text-xs text-[#507395]">{member.email}</div>*/}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === WorkspaceRole.Owner
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            : member.role === WorkspaceRole.PrivilegedMember
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}>
                          {ROLE_MAP[member.role] || "Member"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-[#507395] dark:text-[#94a3b8]">
                        {new Date(member.createdAt || Date.now()).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        {isManaged ? (
                          <select
                            value={member.role}
                            onChange={(e) => confirmRoleChange(member.userId, e.target.value)}
                            disabled={updateMemberRole.isPending}
                            className="block w-full max-w-[120px] rounded-lg border-0 py-1.5 pl-3 pr-8 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-primary sm:text-xs sm:leading-6 bg-transparent cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2d3a4a] transition-colors"
                          >
                            <option value={WorkspaceRole.PrivilegedMember}>Admin</option>
                            <option value={WorkspaceRole.Member}>Member</option>
                          </select>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No access</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isManaged && can(Permission.RemoveMember) && (
                          <button
                            onClick={() => confirmRemove(member.userId)}
                            className="inline-flex items-center justify-center text-[#507395] hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Remove member"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}