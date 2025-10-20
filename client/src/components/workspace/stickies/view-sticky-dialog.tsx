import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FolderOpen, CheckCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";

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

interface ViewStickyDialogProps {
  sticky: StickyType | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewStickyDialog = ({ sticky, isOpen, onClose }: ViewStickyDialogProps) => {
  if (!sticky) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FolderOpen className="h-4 w-4" />;
      case "task":
        return <CheckCircle className="h-4 w-4" />;
      case "scribble":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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

  const authorName = sticky.createdBy.name;
  const authorInitials = getAvatarFallbackText(authorName);
  const authorAvatarColor = getAvatarColor(authorName);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(sticky.type)}
            {sticky.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Type Badge */}
          <div className="flex justify-center">
            <Badge className={getTypeColor(sticky.type)}>
              {getTypeIcon(sticky.type)}
              <span className="ml-1">{getTypeLabel(sticky.type)}</span>
            </Badge>
          </div>

          {/* Related Info */}
          {sticky.project && (
            <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Related to Project:</strong> {sticky.project.emoji} {sticky.project.name}
            </div>
          )}
          {sticky.task && (
            <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Related to Task:</strong> {sticky.task.taskCode} - {sticky.task.title}
            </div>
          )}

          {/* Content */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Content</h3>
            <div 
              className="p-4 rounded-lg border-2 min-h-[200px] whitespace-pre-wrap text-gray-700"
              style={{ backgroundColor: sticky.color }}
            >
              {sticky.content}
            </div>
          </div>

          {/* Author and Dates */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={sticky.createdBy.profilePicture || ""}
                  alt={authorName}
                />
                <AvatarFallback className={`text-xs ${authorAvatarColor}`}>
                  {authorInitials}
                </AvatarFallback>
              </Avatar>
              <span>Created by {authorName}</span>
            </div>
            <div className="text-right">
              <div>Created: {format(new Date(sticky.createdAt), "MMM d, yyyy 'at' h:mm a")}</div>
              {sticky.updatedAt !== sticky.createdAt && (
                <div>Updated: {format(new Date(sticky.updatedAt), "MMM d, yyyy 'at' h:mm a")}</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewStickyDialog;