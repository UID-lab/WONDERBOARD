import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskType } from "@/types/api.type";
import { TaskStatusEnumType } from "@/constant";
import { Badge } from "@/components/ui/badge";
import TaskCard from "./task-card";

interface KanbanColumnProps {
  id: TaskStatusEnumType;
  title: string;
  tasks: TaskType[];
  taskCount: number;
}

const KanbanColumn = ({ id, title, tasks, taskCount }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const taskIds = useMemo(() => tasks.map((task) => task._id), [tasks]);

  const getColumnColor = (status: TaskStatusEnumType) => {
    switch (status) {
      case "BACKLOG":
        return "bg-gray-100 border-gray-300";
      case "TODO":
        return "bg-blue-50 border-blue-300";
      case "IN_PROGRESS":
        return "bg-yellow-50 border-yellow-300";
      case "IN_REVIEW":
        return "bg-purple-50 border-purple-300";
      case "DONE":
        return "bg-green-50 border-green-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const getHeaderColor = (status: TaskStatusEnumType) => {
    switch (status) {
      case "BACKLOG":
        return "text-gray-700";
      case "TODO":
        return "text-blue-700";
      case "IN_PROGRESS":
        return "text-yellow-700";
      case "IN_REVIEW":
        return "text-purple-700";
      case "DONE":
        return "text-green-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div
      className={`flex flex-col w-80 h-full rounded-lg border-2 transition-colors ${
        getColumnColor(id)
      } ${isOver ? "ring-2 ring-blue-400 ring-opacity-50" : ""}`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-sm ${getHeaderColor(id)}`}>
            {title}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {taskCount}
          </Badge>
        </div>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className="flex-1 p-4 space-y-3 overflow-y-auto min-h-0"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            <div className="text-center">
              <p>No tasks</p>
              <p className="text-xs mt-1">Drag tasks here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;