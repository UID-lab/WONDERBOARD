import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageCircle, Activity, Save, X, Calendar as CalendarIcon, Settings } from "lucide-react";
import { TaskType } from "@/types/api.type";
import { TaskPriorityEnumType, TaskStatusEnumType } from "@/constant";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TaskComments } from "./task-comments";
import { TaskActivities } from "./task-activities";
import { TaskSubtasks } from "./task-subtasks";
import { TaskChecklists } from "./task-checklists";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import useWorkspaceId from "@/hooks/use-workspace-id";

interface TaskUpdateData {
  title: string;
  description: string;
  status: TaskStatusEnumType;
  priority: TaskPriorityEnumType;
  assignedTo: string | null;
  dueDate: string | null;
}

interface TaskDetailModalProps {
  task: TaskType | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<TaskUpdateData>) => void;
}

export const TaskDetailModal = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
}: TaskDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"comments" | "activity" | "subtasks" | "checklists">("comments");
  const workspaceId = useWorkspaceId();
  const { data: memberData } = useGetWorkspaceMembers(workspaceId);

  // Form state
  const [formData, setFormData] = useState<TaskUpdateData>({
    title: "",
    description: "",
    status: "TODO" as TaskStatusEnumType,
    priority: "MEDIUM" as TaskPriorityEnumType,
    assignedTo: null,
    dueDate: null,
  });

  // Update form data when task changes
  React.useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo?._id || null,
        dueDate: task.dueDate || null,
      });
    }
  }, [task]);

  if (!task) return null;

  const members = memberData?.members || [];

  const handleSave = () => {
    onUpdateTask(task._id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original task values
    setFormData({
      title: task.title || "",
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo?._id || null,
      dueDate: task.dueDate || null,
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof TaskUpdateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const assignee = task.assignedTo;
  const assigneeName = assignee?.name || "";
  const assigneeInitials = getAvatarFallbackText(assigneeName);
  const assigneeAvatarColor = getAvatarColor(assigneeName);

  const statusOptions = [
    { value: "BACKLOG", label: "Backlog" },
    { value: "TODO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "IN_REVIEW", label: "In Review" },
    { value: "DONE", label: "Done" },
  ];

  const priorityOptions = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {task.taskCode}
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="text-xl font-semibold"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {task.taskCode}
                    </Badge>
                    <Badge variant={task.status as any} className="capitalize">
                      {task.status.replace("_", " ")}
                    </Badge>
                    <Badge variant={task.priority as any} className="capitalize">
                      {task.priority}
                    </Badge>
                  </div>
                  <DialogTitle className="text-xl font-semibold">
                    {task.title}
                  </DialogTitle>
                </div>
              )}
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="ml-4"
              >
                <Settings className="h-4 w-4 mr-1" />
                Edit Task
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 pt-0">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                {isEditing ? (
                  <div>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Add a description..."
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md min-h-[60px]">
                    {task.description || (
                      <span className="text-gray-400 italic">
                        No description provided
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Edit Form Fields - Only show when editing */}
              {isEditing && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900">Task Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleInputChange("status", value as TaskStatusEnumType)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => handleInputChange("priority", value as TaskPriorityEnumType)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assigned To */}
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assigned To</Label>
                      <Select
                        value={formData.assignedTo || "unassigned"}
                        onValueChange={(value) => handleInputChange("assignedTo", value === "unassigned" ? null : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {members.map((member) => (
                            <SelectItem key={member.userId._id} value={member.userId._id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={member.userId.profilePicture || ""} />
                                  <AvatarFallback className="text-xs">
                                    {getAvatarFallbackText(member.userId.name)}
                                  </AvatarFallback>
                                </Avatar>
                                {member.userId.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.dueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.dueDate ? format(new Date(formData.dueDate), "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                            onSelect={(date) => handleInputChange("dueDate", date ? date.toISOString() : null)}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                            className="rounded-md border"
                          />
                          {formData.dueDate && (
                            <div className="p-3 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleInputChange("dueDate", null)}
                                className="w-full"
                              >
                                Clear Date
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Subtasks Section */}
              <div className="space-y-3">
                <TaskSubtasks taskId={task._id} />
              </div>

              <Separator />

              {/* Checklists Section */}
              <div className="space-y-3">
                <TaskChecklists taskId={task._id} />
              </div>

              <Separator />

              {/* Comments and Activity Tabs */}
              <div className="space-y-4">
                <div className="flex gap-4 border-b">
                  <button
                    className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "comments"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("comments")}
                  >
                    <MessageCircle className="h-4 w-4 inline mr-1" />
                    Comments
                  </button>
                  <button
                    className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "activity"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("activity")}
                  >
                    <Activity className="h-4 w-4 inline mr-1" />
                    Activity
                  </button>
                </div>

                <div className="h-[350px] overflow-hidden">
                  {activeTab === "comments" ? (
                    <TaskComments taskId={task._id} />
                  ) : (
                    <ScrollArea className="h-full pr-4">
                      <TaskActivities taskId={task._id} />
                    </ScrollArea>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Task Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Details</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge variant={task.status as any} className="capitalize">
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Priority
                    </label>
                    <div className="mt-1">
                      <Badge variant={task.priority as any} className="capitalize">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Assigned To
                    </label>
                    {assignee ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={assignee.profilePicture || ""} alt={assigneeName} />
                          <AvatarFallback className={assigneeAvatarColor}>
                            {assigneeInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{assigneeName}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 mt-1">Unassigned</div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Due Date
                    </label>
                    <div className="text-sm mt-1">
                      {task.dueDate ? format(new Date(task.dueDate), "PPP") : "No due date"}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Project
                    </label>
                    <div className="flex items-center gap-1 mt-1">
                      <span>{task.project.emoji}</span>
                      <span className="text-sm">{task.project.name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Created
                    </label>
                    <div className="text-sm mt-1">
                      {task.createdAt ? format(new Date(task.createdAt), "PPP") : "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Updated
                    </label>
                    <div className="text-sm mt-1">
                      {task.updatedAt ? format(new Date(task.updatedAt), "PPP") : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};