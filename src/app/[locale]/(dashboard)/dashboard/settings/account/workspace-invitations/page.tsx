"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useWorkspaceInvitations } from "@/hooks/use-queries";
import { useInvitationMutations } from "@/hooks/use-mutations";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { WorkspaceRole } from "@/types/enums";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export default function WorkspaceInvitationsPage() {
  const t = useTranslations("WorkspaceInvitations");
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const { data: result, isLoading } = useWorkspaceInvitations();
  const { respondToInvitation } = useInvitationMutations();

  const [actionInvitation, setActionInvitation] = useState<{ id: string, accept: boolean } | null>(null);

  const invitations = result?.items || [];
  const totalPages = result?.meta?.totalPages || 0;

  // Date-fns locale selector
  const dateLocale = locale === "tr" ? tr : enUS;

  // Localized Role Map
  const ROLE_LABELS: Record<number, string> = {
    0: t("roles.member"),
    1: t("roles.admin"),
    2: t("roles.owner"),
  };

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

  const getStatusBadge = (status: number) => {
    switch(status) {
      case 0: return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium">{t("status.pending")}</span>;
      case 1: return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">{t("status.accepted")}</span>;
      case 2: return <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">{t("status.declined")}</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full py-8">
      
      <ConfirmationModal
        isOpen={!!actionInvitation}
        onClose={() => setActionInvitation(null)}
        onConfirm={handleConfirmAction}
        title={actionInvitation?.accept ? t("modal.accept_title") : t("modal.decline_title")}
        description={
          actionInvitation?.accept 
            ? t("modal.accept_desc") 
            : t("modal.decline_desc")
        }
        confirmText={actionInvitation?.accept ? t("modal.confirm_join") : t("modal.confirm_decline")}
        variant={actionInvitation?.accept ? "primary" : "danger"}
        isLoading={respondToInvitation.isPending}
      />

      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-2xl font-bold text-[#0e141b] dark:text-[#e8edf3]">{t("title")}</h2>
        <p className="text-[#507395] dark:text-[#94a3b8]">{t("subtitle")}</p>
      </div>

      <div className="bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden shadow-sm flex flex-col min-h-[400px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8edf3] dark:border-[#2d3a4a] bg-[#f8fafb] dark:bg-[#111921] flex justify-between items-center">
          <h3 className="font-bold text-[#0e141b] dark:text-[#e8edf3]">{t("incoming_title")}</h3>
          <span className="text-xs text-[#507395]">
            {t("page_info", { page: page, total: totalPages || 1 })}
          </span>
        </div>

        {isLoading && (
           <div className="flex-1 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           </div>
        )}

        {!isLoading && invitations.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-[#507395] p-10">
            <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">mail</span>
            <p>{t("empty_state")}</p>
          </div>
        )}

        {!isLoading && invitations.length > 0 && (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white dark:bg-[#1a2430] border-b border-[#e8edf3] dark:border-[#2d3a4a]">
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">{t("table.workspace")}</th>
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">{t("table.invited_by")}</th>
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">{t("table.role")}</th>
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">{t("table.sent")}</th>
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">{t("table.status")}</th>
                  <th className="px-6 py-3 text-right font-semibold text-[#0e141b] dark:text-[#e8edf3]">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8edf3] dark:divide-[#2d3a4a]">
                {invitations.map((invite: any) => (
                  <tr key={invite.id} className="group hover:bg-[#f8fafb] dark:hover:bg-[#111921]/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#0e141b] dark:text-[#e8edf3]">
                      {invite.workspaceName || t("unknown_workspace")}
                    </td>

                    <td className="px-6 py-4 text-[#507395] dark:text-[#94a3b8]">
                      {invite.inviterName || t("system")}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary dark:bg-primary/20 dark:text-primary-hover">
                         {ROLE_LABELS[invite.role] || t("roles.member")}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[#507395] dark:text-[#94a3b8]">
                      {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true, locale: dateLocale })}
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(invite.status)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {invite.status === 0 && ( 
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setActionInvitation({ id: invite.id, accept: true })}
                            className="hover:cursor-pointer flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                            {t("actions.accept")}
                          </button>
                          <button
                            onClick={() => setActionInvitation({ id: invite.id, accept: false })}
                            className="hover:cursor-pointer flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg text-xs font-bold transition-colors shadow-sm dark:bg-transparent dark:border-gray-700 dark:text-gray-400"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                            {t("actions.decline")}
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

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#e8edf3] dark:border-[#2d3a4a] bg-white dark:bg-[#1a2430] flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="px-3 py-1.5 rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#111921] disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
              >
                {t("pagination.previous")}
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
                className="px-3 py-1.5 rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#111921] disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
              >
                {t("pagination.next")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}