"use client";

import { useState, useEffect } from "react";
import { useTaskMutations } from "@/hooks/use-mutations";
import { ReadTaskItemDto } from "@/types/dtos";
import { usePermissions } from "@/providers/permission-provider";
import { Permission } from "@/lib/rbac/permissions";

export function TaskDescription({ task, workspaceId, isArchived = false }: { task: ReadTaskItemDto, workspaceId: string, isArchived?: boolean }) {
  const { updateTask } = useTaskMutations(workspaceId);
  const { can } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(task.description || "");

  useEffect(() => setDescription(task.description || ""), [task.description]);

  const handleSave = () => {
    if (description !== task.description) {
      updateTask.mutate({ id: task.id, data: { ...task, description } });
    }
    setIsEditing(false);
  };

  const canEdit = !isArchived && can(Permission.UpdateTask);

  if (isEditing) {
    return (
      <div className="space-y-3">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full p-3 rounded-lg border border-primary bg-white dark:bg-[#111921] focus:outline-none resize-none text-sm leading-relaxed"
          placeholder="Add a more detailed description..."
          autoFocus
        />
        <div className="flex gap-2">
          <button 
            onClick={handleSave}
            disabled={updateTask.isPending}
            className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-md hover:bg-primary-hover transition-colors"
          >
            Save
          </button>
          <button 
            onClick={() => setIsEditing(false)}
            className="px-4 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2d3a4a] text-sm font-medium rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative min-h-[60px]">
      <div 
        onClick={() => canEdit && setIsEditing(true)}
        className={`text-sm leading-relaxed whitespace-pre-wrap rounded-md p-2 -ml-2 transition-colors ${
            !task.description ? "text-[#507395] italic" : "text-[#0e141b] dark:text-[#e8edf3]"
        } ${canEdit ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a2430]" : "cursor-default"}`}
      >
        {task.description || "Add a description..."}
      </div>
    </div>
  );
}