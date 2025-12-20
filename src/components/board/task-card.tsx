"use client";

import { ReadTaskItemDto } from "@/types/dtos";
import { TaskProgressStatus } from "@/types/enums";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: ReadTaskItemDto;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  // DnD Hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1, // Dim when dragging
  };

  const getStatusColor = (status: TaskProgressStatus) => {
    switch (status) {
      case TaskProgressStatus.InProgress: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case TaskProgressStatus.ReadyForReview: return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case TaskProgressStatus.Received: return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group bg-white dark:bg-[#1a2430] p-3 rounded-lg shadow-sm border border-transparent hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all hover:shadow-md select-none relative"
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h4 className="text-sm font-medium text-[#0e141b] dark:text-[#e8edf3] line-clamp-2 leading-snug">
          {task.title}
        </h4>
        
        {task.assigneeAvatarUrl && (
           <img 
             src={task.assigneeAvatarUrl} 
             alt="Assignee" 
             className="w-5 h-5 rounded-full object-cover flex-shrink-0 ring-1 ring-white dark:ring-[#2d3a4a]" 
           />
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
         <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getStatusColor(task.progressStatus)}`}>
            {TaskProgressStatus[task.progressStatus]}
         </span>

         <div className="flex items-center gap-2 text-[#507395] text-xs">
            {(task.attachmentCount || 0) > 0 && (
               <div className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px] leading-none">attachment</span>
                  <span>{task.attachmentCount}</span>
               </div>
            )}
            {(task.commentCount || 0) > 0 && (
               <div className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px] leading-none">chat_bubble</span>
                  <span>{task.commentCount}</span>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}