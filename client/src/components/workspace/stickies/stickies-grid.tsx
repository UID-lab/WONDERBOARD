import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StickyNote, FolderOpen, CheckCircle, FileText } from "lucide-react";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getStickiesQueryFn } from "@/lib/api";
import StickyCard from "./sticky-card";

interface StickiesGridProps {
  selectedType: string;
  selectedProject: string;
  selectedTask: string;
}

const StickiesGrid = ({ selectedType, selectedProject, selectedTask }: StickiesGridProps) => {
  const workspaceId = useWorkspaceId();

  const { data: stickiesData, isLoading } = useQuery({
    queryKey: [
      "stickies",
      workspaceId,
      selectedType,
      selectedProject,
      selectedTask,
    ],
    queryFn: () =>
      getStickiesQueryFn({
        workspaceId,
        type: selectedType || undefined,
        projectId: selectedProject || undefined,
        taskId: selectedTask || undefined,
      }),
    enabled: !!workspaceId,
  });

  const stickies = stickiesData || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FolderOpen className="h-4 w-4" />;
      case "task":
        return <CheckCircle className="h-4 w-4" />;
      case "scribble":
        return <FileText className="h-4 w-4" />;
      default:
        return <StickyNote className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "project":
        return "Project Note";
      case "task":
        return "Task Note";
      case "scribble":
        return "Scribble Pad";
      default:
        return "Note";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project":
        return "bg-blue-100 text-blue-800";
      case "task":
        return "bg-green-100 text-green-800";
      case "scribble":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading stickies...</p>
        </div>
      </div>
    );
  }

  if (stickies.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <StickyNote className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stickies found</h3>
          <p className="text-gray-500 text-center max-w-md">
            {selectedType
              ? `No ${getTypeLabel(selectedType).toLowerCase()}s found. Create your first one using the form above.`
              : "Select a note type and create your first sticky note!"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Summary */}
      {(selectedType || selectedProject || selectedTask) && (
        <div className="flex flex-wrap gap-2">
          {selectedType && (
            <Badge variant="secondary" className={getTypeColor(selectedType)}>
              {getTypeIcon(selectedType)}
              <span className="ml-1">{getTypeLabel(selectedType)}</span>
            </Badge>
          )}
        </div>
      )}

      {/* Stickies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stickies.map((sticky) => (
          <StickyCard key={sticky._id} sticky={sticky} />
        ))}
      </div>
    </div>
  );
};

export default StickiesGrid;