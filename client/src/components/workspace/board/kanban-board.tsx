import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import { TaskType } from "@/types/api.type";
import { TaskStatusEnumType, TaskStatusEnum } from "@/constant";
import { getAllTasksQueryFn, editTaskMutationFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useTaskTableFilter from "@/hooks/use-task-table-filter";
import { toast } from "@/hooks/use-toast";

import KanbanColumn from "./kanban-column";
import TaskCard from "./task-card";
import BoardFilters from "./board-filters";

const KanbanBoard = () => {
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [filters, setFilters] = useTaskTableFilter();
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data, isLoading } = useQuery({
    queryKey: [
      "board-tasks",
      workspaceId,
      filters.keyword,
      filters.projectId,
      filters.assigneeId,
      filters.priority,
      filters.status,
      filters.createdFrom,
      filters.createdTo,
      filters.dueFrom,
      filters.dueTo,
    ],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        keyword: filters.keyword,
        projectId: filters.projectId,
        assignedTo: filters.assigneeId,
        priority: filters.priority,
        status: filters.status,
        createdFrom: filters.createdFrom,
        createdTo: filters.createdTo,
        dueFrom: filters.dueFrom,
        dueTo: filters.dueTo,
        pageNumber: 1,
        pageSize: 1000,
      }),
    enabled: !!workspaceId,
  });

  const updateTaskMutation = useMutation({
    mutationFn: editTaskMutationFn,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["board-tasks"] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(["board-tasks", workspaceId, filters.keyword, filters.projectId, filters.assigneeId, filters.priority, filters.status, filters.createdFrom, filters.createdTo, filters.dueFrom, filters.dueTo]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["board-tasks", workspaceId, filters.keyword, filters.projectId, filters.assigneeId, filters.priority, filters.status, filters.createdFrom, filters.createdTo, filters.dueFrom, filters.dueTo],
        (old: any) => {
          if (!old?.tasks) return old;
          
          return {
            ...old,
            tasks: old.tasks.map((task: TaskType) =>
              task._id === variables.taskId
                ? { ...task, ...variables.data }
                : task
            ),
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (error: any, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ["board-tasks", workspaceId, filters.keyword, filters.projectId, filters.assigneeId, filters.priority, filters.status, filters.createdFrom, filters.createdTo, filters.dueFrom, filters.dueTo],
          context.previousTasks
        );
      }
      
      console.error("Task update error:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update task status",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["board-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
    },
  });

  const tasks = data?.tasks || [];

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatusEnumType, TaskType[]> = {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };

    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }, [tasks]);

  const columns = [
    { id: "BACKLOG" as TaskStatusEnumType, title: "Backlog", tasks: tasksByStatus.BACKLOG },
    { id: "TODO" as TaskStatusEnumType, title: "To Do", tasks: tasksByStatus.TODO },
    { id: "IN_PROGRESS" as TaskStatusEnumType, title: "In Progress", tasks: tasksByStatus.IN_PROGRESS },
    { id: "IN_REVIEW" as TaskStatusEnumType, title: "In Review", tasks: tasksByStatus.IN_REVIEW },
    { id: "DONE" as TaskStatusEnumType, title: "Done", tasks: tasksByStatus.DONE },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    let potentialStatus = over.id as string;

    console.log("🔍 Drag and drop debug:", {
      activeId: active.id,
      overId: over.id,
      taskId,
      potentialStatus,
      overIdType: typeof over.id,
      activeIdType: typeof active.id,
    });

    // If dropped on a task, find which column that task belongs to
    const validStatuses = Object.values(TaskStatusEnum);
    if (!validStatuses.includes(potentialStatus as TaskStatusEnumType)) {
      // Find the task that was dropped on and get its status
      const droppedOnTask = tasks.find((t) => t._id === potentialStatus);
      if (droppedOnTask) {
        potentialStatus = droppedOnTask.status;
        console.log("🔄 Dropped on task, using its column status:", potentialStatus);
      } else {
        console.log("❌ Invalid drop target:", potentialStatus, "- not a valid status or task");
        console.log("✅ Valid statuses:", validStatuses);
        return;
      }
    }

    const newStatus = potentialStatus as TaskStatusEnumType;

    const task = tasks.find((t) => t._id === taskId);
    if (!task) {
      console.log("❌ Task not found for ID:", taskId);
      return;
    }

    // If status hasn't changed, do nothing
    if (task.status === newStatus) {
      console.log("⏭️ Status unchanged, skipping update");
      return;
    }

    console.log("🔄 Updating task:", {
      taskId: task._id,
      projectId: task.project._id,
      workspaceId,
      oldStatus: task.status,
      newStatus,
    });

    console.log("📤 Mutation payload:", {
      taskId: task._id,
      projectId: task.project._id,
      workspaceId,
      data: {
        status: newStatus,
      },
    });

    // Update task status
    updateTaskMutation.mutate({
      taskId: task._id,
      projectId: task.project._id,
      workspaceId,
      data: {
        status: newStatus,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="mb-6">
        <BoardFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max pb-6">
            {columns.map((column) => (
              <SortableContext
                key={column.id}
                items={column.tasks.map((task) => task._id)}
              >
                <KanbanColumn
                  id={column.id}
                  title={column.title}
                  tasks={column.tasks}
                  taskCount={column.tasks.length}
                />
              </SortableContext>
            ))}
          </div>

          {createPortal(
            <DragOverlay>
              {activeTask && <TaskCard task={activeTask} isDragging />}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;