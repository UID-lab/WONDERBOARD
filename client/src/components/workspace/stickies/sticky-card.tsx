import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  FolderOpen,
  CheckCircle,
  FileText,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import EditStickyDialog from "./edit-sticky-dialog";
import ViewStickyDialog from "./view-sticky-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStickyMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import useWorkspaceId from "@/hooks/use-workspace-id";

interface StickyType {
  _id: string;
  title: string;
  content: string;
  type: "project" | "task" | "scribble";
  project?: {
    _id: string;
    name: string;
    emoji: string;
  };
  task?: {
    _id: string;
    title: string;
    taskCode: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface StickyCardProps {
  sticky: StickyType;
}

const StickyCard = ({ sticky }: StickyCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  const deleteSticky = useMutation({
    mutationFn: deleteStickyMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickies"] });
      toast({
        title: "Success",
        description: "Sticky deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete sticky",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this sticky?")) {
      deleteSticky.mutate({
        workspaceId,
        stickyId: sticky._id,
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FolderOpen className="h-3 w-3" />;
      case "task":
        return <CheckCircle className="h-3 w-3" />;
      case "scribble":
        return <FileText className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "project":
        return "Project";
      case "task":
        return "Task";
      case "scribble":
        return "Scribble";
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

  const authorName = sticky.createdBy.name;
  const authorInitials = getAvatarFallbackText(authorName);
  const authorAvatarColor = getAvatarColor(authorName);

  return (
    <>
      <Card
        className="group hover:shadow-md transition-shadow cursor-pointer h-fit"
        style={{ backgroundColor: sticky.color }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 
                className="font-semibold text-sm line-clamp-2 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setIsViewDialogOpen(true)}
                title="Click to view full content"
              >
                {sticky.title}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className={`text-xs ${getTypeColor(sticky.type)}`}
                >
                  {getTypeIcon(sticky.type)}
                  <span className="ml-1">{getTypeLabel(sticky.type)}</span>
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Related Project/Task Info */}
          {sticky.project && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{sticky.project.emoji}</span>
              <span className="truncate">{sticky.project.name}</span>
            </div>
          )}
          {sticky.task && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <CheckCircle className="h-3 w-3" />
              <span className="truncate">
                {sticky.task.taskCode} - {sticky.task.title}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {/* Content Preview */}
          <div className="text-sm text-gray-700 mb-4 line-clamp-4 whitespace-pre-wrap">
            {sticky.content}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={sticky.createdBy.profilePicture || ""}
                  alt={authorName}
                />
                <AvatarFallback className={`text-xs ${authorAvatarColor}`}>
                  {authorInitials}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{authorName}</span>
            </div>
            <span>{format(new Date(sticky.createdAt), "MMM d")}</span>
          </div>
        </CardContent>
      </Card>

      <EditStickyDialog
        sticky={sticky}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />

      <ViewStickyDialog
        sticky={sticky}
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
      />
    </>
  );
};

export default StickyCard;