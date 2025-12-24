"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl"; //
import { ReadColumnDto, ReadTaskItemDto } from "@/types/dtos";
import { usePermissions } from "@/providers/permission-provider";
import { Permission } from "@/lib/rbac/permissions";
import { TaskCard } from "./task-card";
import { CreateTaskModal } from "./create-task-modal";
import { useColumnMutations } from "@/hooks/use-mutations";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";

interface ColumnProps {
  column: ReadColumnDto;
  tasks: ReadTaskItemDto[];
  workspaceId: string;
  boardId: string;
  isArchived?: boolean;
}

export function Column({ column, tasks, workspaceId, boardId, isArchived = false }: ColumnProps) {
  const t = useTranslations("Column"); //
  const { can } = usePermissions();
  const router = useRouter();
  const { deleteColumn, updateColumn } = useColumnMutations(workspaceId, boardId);
  
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(column.name);

  // DnD sensors & state (Logic preserved)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "Column", column },
    disabled: isArchived,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const handleNameSave = () => {
    if (editName.trim() !== column.name && editName.trim() !== "") {
      updateColumn.mutate({ id: column.id, data: { ...column, name: editName } });
    } else {
      setEditName(column.name);
    }
    setIsEditingName(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-72 flex-shrink-0 flex flex-col max-h-full"
    >
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        workspaceId={workspaceId}
        boardId={boardId}
        columnId={column.id}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => deleteColumn.mutate(column.id)}
        title={t("delete_modal.title")}
        description={t("delete_modal.description")}
        confirmText={t("delete_modal.confirm")}
        variant="danger"
      />

      {/* Header (DnD Trigger) */}
      <div 
        {...attributes} 
        {...listeners}
        className={`flex items-center justify-between mb-3 px-1 group/header ${isArchived ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
      >
         <div className="flex-1 mr-2 min-w-0">
            {isEditingName ? (
               <input 
                  autoFocus
                  className="w-full bg-white dark:bg-[#1a2430] border-2 border-primary rounded px-2 py-1 text-sm font-bold outline-none text-[#0e141b] dark:text-[#e8edf3]"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  onPointerDown={(e) => e.stopPropagation()} 
               />
            ) : (
               <div className="flex items-center gap-2">
                  <h3 
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isArchived && can(Permission.UpdateColumn)) setIsEditingName(true);
                    }}
                    className={`font-bold text-[#0e141b] dark:text-[#e8edf3] text-sm truncate ${!isArchived ? "cursor-text hover:border-b-2 hover:border-dashed hover:border-[#507395]" : ""}`}
                  >
                     {column.name}
                  </h3>
                  <span className="text-[10px] font-bold text-[#507395] bg-gray-200 dark:bg-[#2d3a4a] px-1.5 py-0.5 rounded-full flex-shrink-0">
                     {tasks.length}
                  </span>
               </div>
            )}
         </div>
         
         <div className="opacity-0 group-hover/header:opacity-100 transition-opacity flex items-center">
            {can(Permission.DeleteColumn) && !isArchived && (
               <button 
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="p-1 text-[#507395] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors hover:cursor-pointer"
               >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
               </button>
            )}
         </div>
      </div>

      {/* Task List (DnD Context) */}
      <div className="flex-1 overflow-y-auto min-h-[100px] bg-gray-100/50 dark:bg-[#111921]/50 rounded-xl border border-transparent p-2 space-y-2 custom-scrollbar">
         <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 && (
                <div className="h-24 flex flex-col items-center justify-center text-[#507395]/50 border-2 border-dashed border-[#e8edf3] dark:border-[#2d3a4a] rounded-lg select-none">
                   <span className="text-xs font-medium">
                      {isArchived ? t("no_tasks") : t("drop_tasks")}
                   </span>
                </div>
            )}
            
            {tasks.map((task) => (
                <TaskCard 
                    key={task.id} 
                    task={task} 
                    onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/boards/${boardId}/tasks/${task.id}`)}
                />
            ))}
         </SortableContext>
      </div>

      {can(Permission.CreateTask) && !isArchived && (
         <button 
            onClick={() => setIsCreateTaskOpen(true)}
            className="hover:cursor-pointer mt-3 flex items-center gap-2 p-2 rounded-lg text-[#507395] hover:text-primary hover:bg-white dark:hover:bg-[#1a2430] transition-colors text-sm font-bold w-full"
         >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {t("add_task")}
         </button>
      )}
    </div>
  );
}