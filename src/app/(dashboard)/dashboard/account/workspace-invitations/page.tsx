"use client";

import { useState } from "react";
import { useWorkspaceInvitations } from "@/hooks/use-queries";
import { useInvitationMutations } from "@/hooks/use-mutations";
import { formatDistanceToNow } from "date-fns";
import { WorkspaceRole } from "@/types/enums";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

const ROLE_MAP: Record<number, string> = {
  0: "Member",
  1: "Admin",
  2: "Owner",
};

export default function WorkspaceInvitationsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Fetch paginated data
  const { data: result, isLoading } = useWorkspaceInvitations();
  const { respondToInvitation } = useInvitationMutations();

  // Modal State
  const [actionInvitation, setActionInvitation] = useState<{ id: string, accept: boolean } | null>(null);

  const invitations = result?.items || [];
  const totalPages = result?.meta?.totalPages || 0;

  const handleConfirmAction = () => {
    if (actionInvitation) {
      respondToInvitation.mutate({ 
        invitationId: actionInvitation.id, 
        accept: actionInvitation.accept 
      }, {
        onSuccess: () => setActionInvitation(null)
      });
    }
  };

  // Helper for Status Badge
  const getStatusBadge = (status: number) => {
    switch(status) {
      case 0: return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium">Pending</span>;
      case 1: return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">Accepted</span>;
      case 2: return <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">Declined</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full py-8">
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!actionInvitation}
        onClose={() => setActionInvitation(null)}
        onConfirm={handleConfirmAction}
        title={actionInvitation?.accept ? "Accept Invitation?" : "Decline Invitation?"}
        description={
          actionInvitation?.accept 
            ? "You will join this workspace immediately and gain access to its boards." 
            : "This invitation will be removed from your list."
        }
        confirmText={actionInvitation?.accept ? "Join Workspace" : "Decline"}
        variant={actionInvitation?.accept ? "primary" : "danger"}
        isLoading={respondToInvitation.isPending}
      />

      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-2xl font-bold text-[#0e141b] dark:text-[#e8edf3]">Workspace Invitations</h2>
        <p className="text-[#507395] dark:text-[#94a3b8]">Manage your pending invitations to join other workspaces.</p>
      </div>

      <div className="bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden shadow-sm flex flex-col min-h-[400px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8edf3] dark:border-[#2d3a4a] bg-[#f8fafb] dark:bg-[#111921] flex justify-between items-center">
          <h3 className="font-bold text-[#0e141b] dark:text-[#e8edf3]">Incoming Invitations</h3>
          <span className="text-xs text-[#507395]">Page {page} of {totalPages || 1}</span>
        </div>

        {/* Loading State */}
        {isLoading && (
           <div className="flex-1 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4c99e6]"></div>
           </div>
        )}

        {/* Empty State */}
        {!isLoading && invitations.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-[#507395] p-10">
            <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">mail</span>
            <p>You have no pending invitations.</p>
          </div>
        )}

        {/* List */}
        {!isLoading && invitations.length > 0 && (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white dark:bg-[#1a2430] border-b border-[#e8edf3] dark:border-[#2d3a4a]">
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Workspace</th>
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Invited By</th>
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Role</th>
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Sent</th>
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Status</th>
                  <th className="px-6 py-3 text-right font-semibold text-[#0e141b] dark:text-[#e8edf3]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8edf3] dark:divide-[#2d3a4a]">
                {invitations.map((invite: any) => (
                  <tr key={invite.id} className="group hover:bg-[#f8fafb] dark:hover:bg-[#111921]/50 transition-colors">
                    {/* Workspace Name */}
                    <td className="px-6 py-4 font-medium text-[#0e141b] dark:text-[#e8edf3]">
                      {invite.workspaceName || "Unknown Workspace"}
                    </td>

                    {/* Inviter */}
                    <td className="px-6 py-4 text-[#507395] dark:text-[#94a3b8]">
                      {invite.inviterName || "System"}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                         {ROLE_MAP[invite.role] || "Member"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-[#507395] dark:text-[#94a3b8]">
                      {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(invite.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {invite.status === 0 && ( // Only show actions for Pending
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setActionInvitation({ id: invite.id, accept: true })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#4c99e6] hover:bg-[#3b82f6] text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                            Accept
                          </button>
                          <button
                            onClick={() => setActionInvitation({ id: invite.id, accept: false })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg text-xs font-bold transition-colors shadow-sm dark:bg-transparent dark:border-gray-700 dark:text-gray-400"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                            Decline
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#e8edf3] dark:border-[#2d3a4a] bg-white dark:bg-[#1a2430] flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="px-3 py-1.5 rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#111921] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
                className="px-3 py-1.5 rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#111921] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}