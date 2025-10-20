import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { Calendar, User, AlertCircle } from "lucide-react";

import { TaskType } from "@/types/api.type";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { TaskDetailModal } from "../task/task-detail-modal";
import { useTaskUpdate } from "@/hooks/use-task-update";
import useWorkspaceId from "@/hooks/use-workspace-id";

interface TaskCardProps {
  task: TaskType;
  isDragging?: boolean;
}

const TaskCard = ({ task, isDragging = false }: TaskCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const workspaceId = useWorkspaceId();
  const updateTaskMutation = useTaskUpdate();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const assignee = task.assignedTo;

  const handleCardClick = () => {
    if (!isDragging && !isSortableDragging) {
      setIsModalOpen(true);
    }
  };

  const handleUpdateTask = (taskId: string, updates: any) => {
    console.log("Updating task from board:", { taskId, updates });
    
    updateTaskMutation.mutate(
      {
        taskId,
        projectId: task.project._id,
        workspaceId,
        data: updates,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      }
    );
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`cursor-pointer hover:shadow-md transition-shadow ${
          isDragging || isSortableDragging
            ? "opacity-50 rotate-3 shadow-lg"
            : "hover:shadow-sm"
        }`}
        onClick={handleCardClick}
      >
        <CardContent className="p-4 space-y-3">
          {/* Task Code and Priority */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs font-mono">
              {task.taskCode}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </Badge>
          </div>

          {/* Task Title */}
          <h4 className="font-medium text-sm line-clamp-2 text-gray-900">
            {task.title}
          </h4>

          {/* Task Description */}
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Project */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="text-sm">{task.project.emoji}</span>
            <span className="truncate">{task.project.name}</span>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              <span
                className={`${
                  isOverdue ? "text-red-600 font-medium" : "text-gray-500"
                }`}
              >
                {format(new Date(task.dueDate), "MMM d")}
              </span>
              {isOverdue && <AlertCircle className="h-3 w-3 text-red-500" />}
            </div>
          )}

          {/* Assignee */}
          <div className="flex items-center justify-between">
            {assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={assignee.profilePicture || ""}
                    alt={assignee.name}
                  />
                  <AvatarFallback
                    className={`text-xs ${getAvatarColor(assignee.name)}`}
                  >
                    {getAvatarFallbackText(assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-600 truncate">
                  {assignee.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <User className="h-4 w-4" />
                <span className="text-xs">Unassigned</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TaskDetailModal
        task={task}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateTask={handleUpdateTask}
      />
    </>
  );
};

export default TaskCard;