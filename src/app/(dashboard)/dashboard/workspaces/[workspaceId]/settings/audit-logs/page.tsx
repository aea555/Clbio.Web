"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useActivityLogs } from "@/hooks/use-queries";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions";
import { ArchivedBanner } from "@/components/dashboard/archived-banner";

export default function WorkspaceAuditLogsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  // Pagination State
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: result, isLoading, isFetching } = useActivityLogs(workspaceId, page, pageSize);
  const { isArchived, canInviteMember, canRemoveMember } = useWorkspacePermissions(workspaceId);

  const logs = result?.items || [];
  const meta = result?.meta;

  // Helper to color-code actions
  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case "create": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "delete": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "update": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full">
      {/* Banner Logic */}
      {isArchived && (
        <div className="-mt-4 -mx-4 md:-mx-8 mb-6">
          <ArchivedBanner workspaceId={workspaceId} workspaceName="Current Workspace" />
        </div>
      )}
      <h2 className="text-2xl font-bold text-[#0e141b] dark:text-[#e8edf3] mb-2">Workspace Settings</h2>
      <p className="text-[#507395] dark:text-[#94a3b8] mb-6">Track all activity and security events in this workspace.</p>

      <SettingsTabs workspaceId={workspaceId} />

      <div className="bg-white dark:bg-[#1a2430] rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden shadow-sm flex flex-col min-h-[500px]">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-[#e8edf3] dark:border-[#2d3a4a] flex justify-between items-center bg-[#f8fafb] dark:bg-[#111921]">
          <h3 className="font-bold text-[#0e141b] dark:text-[#e8edf3]">Activity Log</h3>
          <div className="flex items-center gap-2">
            {isFetching && <span className="text-xs text-[#4c99e6]">Refreshing...</span>}
            <span className="text-xs text-[#507395] dark:text-[#94a3b8]">
              Page {meta?.page || 1} of {meta?.totalPages || 1}
            </span>
          </div>
        </div>

        {/* Loading State (Initial) */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4c99e6]"></div>
          </div>
        )}

        {/* Logs Table */}
        {!isLoading && (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white dark:bg-[#1a2430] border-b border-[#e8edf3] dark:border-[#2d3a4a]">
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Actor</th>
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Action</th>
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Details</th>
                  <th className="px-6 py-3 font-semibold text-[#0e141b] dark:text-[#e8edf3]">Entity</th>
                  <th className="px-6 py-3 text-right font-semibold text-[#0e141b] dark:text-[#e8edf3]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8edf3] dark:divide-[#2d3a4a]">
                {logs.map((log) => (
                  <tr key={log.id} className="group hover:bg-[#f8fafb] dark:hover:bg-[#111921]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200">
                          {log.actorDisplayName?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="font-medium text-[#0e141b] dark:text-[#e8edf3]">
                          {log.actorDisplayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getActionColor(log.actionType)}`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#507395] dark:text-[#94a3b8] max-w-xs truncate" title={log.metadata}>
                      {log.metadata}
                    </td>
                    <td className="px-6 py-4 text-[#0e141b] dark:text-[#e8edf3]">
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-[#507395] dark:text-[#94a3b8] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </td>
                  </tr>
                ))}

                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#507395]">
                      No activity recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#e8edf3] dark:border-[#2d3a4a] bg-white dark:bg-[#1a2430] flex items-center justify-between">
            <p className="text-sm text-[#507395] dark:text-[#94a3b8]">
              Showing <span className="font-medium">{(meta.page - 1) * meta.pageSize + 1}</span> to <span className="font-medium">{Math.min(meta.page * meta.pageSize, meta.totalCount)}</span> of <span className="font-medium">{meta.totalCount}</span> results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                className="px-3 py-1.5 rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#111921] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages || isFetching}
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