"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWorkspaceMutations } from "@/hooks/use-mutations";
import { useEffect } from "react";
import { CreateWorkspaceMemberDto, createWorkspaceMemberSchema } from "@/lib/schemas/schemas";
import { WorkspaceRole } from "@/types/enums";

export function AddMemberModal({ workspaceId, isOpen, onClose }: { workspaceId: string; isOpen: boolean; onClose: () => void }) {
  const { inviteMember } = useWorkspaceMutations(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceMemberDto>({
    resolver: zodResolver(createWorkspaceMemberSchema),
    defaultValues: {
      workspaceId: workspaceId,
      role: WorkspaceRole.Member,
      email: ""
    }
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        workspaceId: workspaceId,
        email: "",
        role: WorkspaceRole.Member
      });
    }
  }, [isOpen, workspaceId, reset]);

  const onSubmit = (data: CreateWorkspaceMemberDto) => {
    // FIX: Match the mutation signature defined in useWorkspaceMutations
    // It expects { email: string; role: WorkspaceRole }
    inviteMember.mutate(
      { 
        email: data.email, 
        role: Number(data.role) 
      }, 
      {
        onSuccess: () => {
          onClose();
          // Success toast is handled in the mutation definition
        }
        // Error toast is handled in the mutation definition
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a2430] rounded-xl shadow-2xl w-full max-w-md border border-[#e8edf3] dark:border-[#2d3a4a] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e8edf3] dark:border-[#2d3a4a] flex justify-between items-center bg-[#f8fafb] dark:bg-[#111921]">
          <h3 className="text-lg font-bold text-[#0e141b] dark:text-[#e8edf3]">Invite Member</h3>
          <button onClick={onClose} className="text-[#507395] hover:text-[#0e141b] dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Hidden Input for Workspace ID (needed for Zod schema validation) */}
          <input type="hidden" {...register("workspaceId")} />

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]" htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register("email")}
              id="email"
              type="email"
              placeholder="colleague@company.com"
              autoFocus
              className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] py-2.5 px-4 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] outline-none transition-colors text-sm"
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#0e141b] dark:text-[#e8edf3]" htmlFor="role">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                {...register("role", { valueAsNumber: true })}
                id="role"
                className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] py-2.5 px-4 text-[#0e141b] dark:text-white appearance-none focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] outline-none transition-colors text-sm cursor-pointer"
              >
                <option value={WorkspaceRole.Member}>Member</option>
                <option value={WorkspaceRole.PrivilegedMember}>Admin</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#507395] pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>
            {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#507395] hover:bg-gray-100 dark:hover:bg-[#2d3a4a] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteMember.isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#4c99e6] text-white text-sm font-bold shadow-sm hover:bg-[#3b7ec4] transition-colors disabled:opacity-70"
            >
              {/* Updated text to reflect Invitation flow */}
              <span className="material-symbols-outlined text-[18px]">send</span>
              {inviteMember.isPending ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}