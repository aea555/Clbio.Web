"use client";

import { useState, useMemo, useEffect } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl"; ///boards/[boardId]/page.tsx]
import { useBoard, useColumns, useBoardTasks, useWorkspace } from "@/hooks/use-queries";
import { useColumnMutations, useTaskMutations } from "@/hooks/use-mutations";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { BoardHeader } from "@/components/board/board-header";
import { Column } from "@/components/board/column";
import { CreateColumnModal } from "@/components/board/create-column-modal";
import { ArchivedBanner } from "@/components/dashboard/archived-banner";
import { usePermissions } from "@/providers/permission-provider";
import { Permission } from "@/lib/rbac/permissions";
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions";
import { useWorkspaceRealtime } from "@/hooks/use-workspace-realtime";

// DnD Imports
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "@/components/board/task-card";
import { ReadColumnDto, ReadTaskItemDto } from "@/types/dtos";

export default function BoardPage() {
  const t = useTranslations("Board"); ///boards/[boardId]/page.tsx]
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const boardId = params.boardId as string;

  // 1. Data Fetching
  const { data: board, isLoading: isBoardLoading } = useBoard(workspaceId, boardId);
  const { data: columnsData, isLoading: isColumnsLoading } = useColumns(workspaceId, boardId);
  const { data: tasksData, isLoading: isTasksLoading } = useBoardTasks(workspaceId, boardId);
  const { data: workspace } = useWorkspace(workspaceId);

  // 2. Local State
  const [columns, setColumns] = useState<ReadColumnDto[]>([]);
  const [tasks, setTasks] = useState<ReadTaskItemDto[]>([]);
  const [activeDragItem, setActiveDragItem] = useState<any>(null);
  const [activeDragType, setActiveDragType] = useState<"Column" | "Task" | null>(null);
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);

  // 3. Hooks & Mutations
  const { reorderColumns } = useColumnMutations(workspaceId, boardId);
  const { moveTask } = useTaskMutations(workspaceId, boardId);
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();
  const { can } = usePermissions();
  const { isArchived } = useWorkspacePermissions(workspaceId);

  // 4. Activate Sockets
  useWorkspaceRealtime(workspaceId);

  // 5. Sync State
  useEffect(() => {
    if (activeWorkspaceId && activeWorkspaceId !== workspaceId) {
      setActiveWorkspaceId(workspaceId);
    }
  }, [workspaceId, activeWorkspaceId, setActiveWorkspaceId]);

  useEffect(() => {
    if (columnsData) setColumns([...columnsData].sort((a, b) => a.position - b.position));
  }, [columnsData]);

  useEffect(() => {
    if (tasksData) setTasks(tasksData);
  }, [tasksData]);

  // 6. DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const onDragStart = (event: DragStartEvent) => {
    if (isArchived) return;
    const { active } = event;
    setActiveDragType(active.data.current?.type);
    setActiveDragItem(active.data.current?.column || active.data.current?.task);
  };

  const onDragOver = (event: DragOverEvent) => {
    if (isArchived) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    if (isOverTask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);

        if (prev[activeIndex].columnId !== prev[overIndex].columnId) {
          const newTasks = [...prev];
          newTasks[activeIndex].columnId = prev[overIndex].columnId;
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    const isOverColumn = over.data.current?.type === "Column";
    if (isOverColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        if (prev[activeIndex].columnId !== overId) {
          const newTasks = [...prev];
          newTasks[activeIndex].columnId = String(overId);
          return arrayMove(newTasks, activeIndex, activeIndex);
        }
        return prev;
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    if (isArchived) return;
    const { active, over } = event;
    setActiveDragItem(null);
    setActiveDragType(null);

    if (!over) return;
    const activeId = active.id;
    const overId = over.id;

    if (active.data.current?.type === "Column" && activeId !== overId) {
      const oldIndex = columns.findIndex((c) => c.id === activeId);
      const newIndex = columns.findIndex((c) => c.id === overId);
      const newColumns = arrayMove(columns, oldIndex, newIndex);
      setColumns(newColumns);
      reorderColumns.mutate(newColumns.map(c => c.id));
    }

    if (active.data.current?.type === "Task") {
      const task = tasks.find(t => t.id === activeId);
      if (!task) return;
      const targetColumnTasks = tasks.filter(t => t.columnId === task.columnId);
      const newPosition = targetColumnTasks.findIndex(t => t.id === activeId);

      moveTask.mutate({
        taskId: String(activeId),
        data: {
          targetColumnId: task.columnId,
          targetPosition: newPosition,
          newPosition: newPosition
        }
      });
    }
  };

  if (isBoardLoading || isColumnsLoading || isTasksLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!board) {
    notFound();
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden transition-colors duration-300 w-full">

      {isArchived && workspace && (
        <ArchivedBanner workspaceId={workspaceId} workspaceName={workspace.name} />
      )}

      <div className="absolute inset-0 bg-black/[0.02] dark:bg-black/[0.15] pointer-events-none" />

      <BoardHeader board={board} workspaceId={workspaceId} isArchived={isArchived} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
          <div className="h-full flex px-6 py-6 gap-6 min-w-max">
            <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              {columns.map((col) => (
                <Column
                  key={col.id}
                  column={col}
                  tasks={tasks.filter(t => t.columnId === col.id)}
                  workspaceId={workspaceId}
                  boardId={boardId}
                  isArchived={isArchived}
                />
              ))}
            </SortableContext>

            {can(Permission.CreateColumn) && !isArchived && (
              <div className="w-72 flex-shrink-0">
                <button
                  onClick={() => setIsCreateColumnOpen(true)}
                  className="hover:cursor-pointer w-full flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-border-base text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary-light transition-all font-bold text-sm h-12"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  {t("add_column")}
                </button>
              </div>
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragItem && activeDragType === "Column" && (
            <Column
              column={activeDragItem}
              tasks={tasks.filter(t => t.columnId === activeDragItem.id)}
              workspaceId={workspaceId}
              boardId={boardId}
              isArchived={isArchived}
            />
          )}
          {activeDragItem && activeDragType === "Task" && (
            <div className="w-72 rotate-3 opacity-90">
              <TaskCard task={activeDragItem} onClick={() => { }} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CreateColumnModal
        isOpen={isCreateColumnOpen}
        onClose={() => setIsCreateColumnOpen(false)}
        workspaceId={workspaceId}
        boardId={boardId}
      />
    </div>
  );
}