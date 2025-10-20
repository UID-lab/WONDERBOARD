import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Trash2, Edit2, Check, X } from "lucide-react";
import { TaskStatusEnumType } from "@/constant";
import { getAvatarFallbackText } from "@/lib/helper";
import API from "@/lib/axios-client";



interface Subtask {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatusEnumType;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  dueDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskSubtasksProps {
  taskId: string;
}

export const TaskSubtasks = ({ taskId }: TaskSubtasksProps) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  const fetchSubtasks = async () => {
    try {
      const response = await API.get(`/subtask/task/${taskId}`);
      if (response.data.success) {
        setSubtasks(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching subtasks:", error);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    setLoading(true);
    try {
      const response = await API.post("/subtask", {
        title: newSubtaskTitle,
        parentTask: taskId,
      });

      if (response.data.success) {
        setSubtasks([...subtasks, response.data.data]);
        setNewSubtaskTitle("");
        setIsAddingSubtask(false);
      }
    } catch (error) {
      console.error("Error creating subtask:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubtask = async (subtaskId: string, updates: Partial<Subtask>) => {
    try {
      const response = await API.put(`/subtask/${subtaskId}`, updates);
      if (response.data.success) {
        setSubtasks(subtasks.map(st => 
          st._id === subtaskId ? { ...st, ...updates } : st
        ));
      }
    } catch (error) {
      console.error("Error updating subtask:", error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const response = await API.delete(`/subtask/${subtaskId}`);
      if (response.data.success) {
        setSubtasks(subtasks.filter(st => st._id !== subtaskId));
      }
    } catch (error) {
      console.error("Error deleting subtask:", error);
    }
  };

  const handleStatusChange = (subtaskId: string, status: TaskStatusEnumType) => {
    handleUpdateSubtask(subtaskId, { status });
  };

  const handleEditSave = (subtaskId: string) => {
    if (editTitle.trim()) {
      handleUpdateSubtask(subtaskId, { title: editTitle });
    }
    setEditingSubtask(null);
    setEditTitle("");
  };

  const statusOptions = [
    { value: "TODO", label: "To Do", color: "bg-gray-100 text-gray-800" },
    { value: "IN_PROGRESS", label: "In Progress", color: "bg-blue-100 text-blue-800" },
    { value: "IN_REVIEW", label: "In Review", color: "bg-yellow-100 text-yellow-800" },
    { value: "DONE", label: "Done", color: "bg-green-100 text-green-800" },
  ];

  const getStatusColor = (status: TaskStatusEnumType) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Subtasks ({subtasks.length})
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAddingSubtask(true)}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Subtask
        </Button>
      </div>

      {/* Add new subtask form */}
      {isAddingSubtask && (
        <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
          <Input
            placeholder="Enter subtask title..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddSubtask()}
            className="flex-1"
          />
          <Button size="sm" onClick={handleAddSubtask} disabled={loading}>
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsAddingSubtask(false);
              setNewSubtaskTitle("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Subtasks list */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask._id}
            className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:bg-gray-50"
          >
            <Checkbox
              checked={subtask.status === "DONE"}
              onCheckedChange={(checked) =>
                handleStatusChange(subtask._id, checked ? "DONE" : "TODO")
              }
            />

            <div className="flex-1 min-w-0">
              {editingSubtask === subtask._id ? (
                <div className="flex gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleEditSave(subtask._id)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => handleEditSave(subtask._id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingSubtask(null);
                      setEditTitle("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        subtask.status === "DONE"
                          ? "line-through text-gray-500"
                          : "text-gray-900"
                      }`}
                    >
                      {subtask.title}
                    </span>
                    <Badge
                      className={`text-xs ${getStatusColor(subtask.status)}`}
                      variant="secondary"
                    >
                      {subtask.status.replace("_", " ")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {subtask.assignedTo && (
                      <div className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={subtask.assignedTo.profilePicture || ""} />
                          <AvatarFallback className="text-xs">
                            {getAvatarFallbackText(subtask.assignedTo.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{subtask.assignedTo.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Select
                value={subtask.status}
                onValueChange={(value) => handleStatusChange(subtask._id, value as TaskStatusEnumType)}
              >
                <SelectTrigger className="w-auto h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingSubtask(subtask._id);
                      setEditTitle(subtask.title);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteSubtask(subtask._id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {subtasks.length === 0 && !isAddingSubtask && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No subtasks yet</p>
          <p className="text-xs">Break down this task into smaller pieces</p>
        </div>
      )}
    </div>
  );
};