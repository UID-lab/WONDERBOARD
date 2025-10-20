import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, StickyNote } from "lucide-react";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import { getAllTasksQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import StickiesGrid from "@/components/workspace/stickies/stickies-grid";
import CreateStickyDialog from "@/components/workspace/stickies/create-sticky-dialog";

type StickyType = "project" | "task" | "scribble";

export default function Stickies() {
  const [selectedType, setSelectedType] = useState<StickyType | "">("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const workspaceId = useWorkspaceId();
  
  // Fetch projects
  const { data: projectsData } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageSize: 100,
    pageNumber: 1,
  });
  
  // Fetch tasks
  const { data: tasksData } = useQuery({
    queryKey: ["stickies-tasks", workspaceId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        keyword: "",
        projectId: "",
        assignedTo: "",
        priority: "",
        status: "",
        dueDate: "",
        pageNumber: 1,
        pageSize: 1000,
      }),
    enabled: !!workspaceId,
  });

  const projects = projectsData?.projects || [];
  const tasks = tasksData?.tasks || [];

  const handleTypeChange = (type: StickyType) => {
    setSelectedType(type);
    setSelectedProject("");
    setSelectedTask("");
  };

  const canCreateSticky = () => {
    if (selectedType === "scribble") return true;
    if (selectedType === "project" && selectedProject) return true;
    if (selectedType === "task" && selectedTask) return true;
    return false;
  };

  const handleCreateSticky = () => {
    if (!canCreateSticky()) return;
    setIsCreateDialogOpen(true);
  };

  const getCreateButtonText = () => {
    switch (selectedType) {
      case "project":
        return "Add Project Note";
      case "task":
        return "Add Task Note";
      case "scribble":
        return "Add Scribble Pad";
      default:
        return "Add Note";
    }
  };

  return (
    <div className="w-full h-full flex-col space-y-8 pt-3">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stickies</h2>
          <p className="text-muted-foreground">
            Create and manage your notes, project notes, and task notes!
          </p>
        </div>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Create New Sticky
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Note Type</label>
              <Select
                value={selectedType}
                onValueChange={(value) => handleTypeChange(value as StickyType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">Existing Project</SelectItem>
                  <SelectItem value="task">Task Notes</SelectItem>
                  <SelectItem value="scribble">Scribble Pad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project Selection */}
            {selectedType === "project" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        <div className="flex items-center gap-2">
                          <span>{project.emoji}</span>
                          <span>{project.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Task Selection */}
            {selectedType === "task" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Task</label>
                <Select value={selectedTask} onValueChange={setSelectedTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task._id} value={task._id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{task.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {task.project.emoji} {task.project.name} • {task.taskCode}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Create Button */}
            <Button
              onClick={handleCreateSticky}
              disabled={!canCreateSticky()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {getCreateButtonText()}
            </Button>
          </div>

          {/* Helper Text */}
          {selectedType && (
            <div className="text-sm text-muted-foreground">
              {selectedType === "project" && !selectedProject && (
                <p>Please select a project to create a project note.</p>
              )}
              {selectedType === "task" && !selectedTask && (
                <p>Please select a task to create a task note.</p>
              )}
              {selectedType === "scribble" && (
                <p>Create a general scribble pad for quick notes and ideas.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stickies Grid */}
      <StickiesGrid
        selectedType={selectedType}
        selectedProject={selectedProject}
        selectedTask={selectedTask}
      />

      {/* Create Sticky Dialog */}
      <CreateStickyDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        type={selectedType as StickyType}
        projectId={selectedProject}
        taskId={selectedTask}
      />
    </div>
  );
}