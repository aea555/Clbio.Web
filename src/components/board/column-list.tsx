"use client";

import { ReadColumnDto, ReadTaskItemDto } from "@/types/dtos";
import { usePermissions } from "@/providers/permission-provider";
import { Permission } from "@/lib/rbac/permissions";
// import { useTasks } from "@/hooks/use-queries"; // You need to implement this!

interface ColumnListProps {
  workspaceId: string;
  boardId: string;
  columns: ReadColumnDto[];
}

export function ColumnList({ workspaceId, boardId, columns }: ColumnListProps) {
  // Sort columns by position
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

  return (
    <>
      {sortedColumns.map((col) => (
        <SingleColumn key={col.id} column={col} workspaceId={workspaceId} />
      ))}
    </>
  );
}

function SingleColumn({ column, workspaceId }: { column: ReadColumnDto, workspaceId: string }) {
  const { can } = usePermissions();
  
  // --- TODO: IMPLEMENT TASK FETCHING ---
  // const { data: tasks } = useTasks(workspaceId, column.id); 
  // For now, we mock an empty list to prevent crash
  const tasks: ReadTaskItemDto[] = []; 
  // -------------------------------------

  return (
    <div className="w-72 flex-shrink-0 flex flex-col max-h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
         <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#0e141b] dark:text-[#e8edf3] text-sm truncate max-w-[180px]">
               {column.name}
            </h3>
            <span className="text-xs font-semibold text-[#507395] bg-gray-100 dark:bg-[#1a2430] px-2 py-0.5 rounded-full">
               {column.taskCount || 0}
            </span>
         </div>
         
         <div className="flex items-center">
            {can(Permission.UpdateColumn) && (
               <button className="p-1 text-[#507395] hover:text-primary hover:bg-gray-100 dark:hover:bg-[#1a2430] rounded">
                  <span className="material-symbols-outlined text-[18px]">more_horiz</span>
               </button>
            )}
         </div>
      </div>

      {/* Task List Area */}
      <div className="flex-1 overflow-y-auto min-h-[100px] bg-gray-50/50 dark:bg-[#1a2430]/30 rounded-xl border border-[#e8edf3] dark:border-[#2d3a4a] p-2 space-y-2">
         
         {tasks.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-[#507395] opacity-60">
               <span className="text-xs italic">No tasks</span>
            </div>
         )}

         {/* Task Card Placeholder */}
         {tasks.map((task) => (
             <div key={task.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                {task.title}
             </div>
         ))}
      </div>

      {/* Add Task Button Footer */}
      {can(Permission.CreateTask) && (
         <button className="mt-3 flex items-center gap-2 p-2 rounded-lg text-[#507395] hover:text-primary hover:bg-white dark:hover:bg-[#1a2430] transition-colors text-sm font-bold w-full">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Task
         </button>
      )}
    </div>
  );
}