import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, CheckCircle, FileText, Palette } from "lucide-react";
import { updateStickyMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import useWorkspaceId from "@/hooks/use-workspace-id";

interface StickyType {
  _id: string;
  title: string;
  content: string;
  type: "project" | "task" | "scribble";
  color: string;
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
}

interface EditStickyDialogProps {
  sticky: StickyType;
  isOpen: boolean;
  onClose: () => void;
}

const STICKY_COLORS = [
  { name: "Yellow", value: "#fef3c7" },
  { name: "Pink", value: "#fce7f3" },
  { name: "Blue", value: "#dbeafe" },
  { name: "Green", value: "#d1fae5" },
  { name: "Purple", value: "#e9d5ff" },
  { name: "Orange", value: "#fed7aa" },
  { name: "Red", value: "#fecaca" },
  { name: "Gray", value: "#f3f4f6" },
];

const EditStickyDialog = ({ sticky, isOpen, onClose }: EditStickyDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("#fef3c7");
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sticky) {
      setTitle(sticky.title);
      setContent(sticky.content);
      setSelectedColor(sticky.color);
    }
  }, [sticky]);

  const updateSticky = useMutation({
    mutationFn: updateStickyMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickies"] });
      toast({
        title: "Success",
        description: "Sticky updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update sticky",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    updateSticky.mutate({
      workspaceId,
      stickyId: sticky._id,
      data: {
        title: title.trim(),
        content: content.trim(),
        color: selectedColor,
      },
    });
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(sticky.type)}
            Edit {getTypeLabel(sticky.type)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Badge */}
          <div className="flex justify-center">
            <Badge className={getTypeColor(sticky.type)}>
              {getTypeIcon(sticky.type)}
              <span className="ml-1">{getTypeLabel(sticky.type)}</span>
            </Badge>
          </div>

          {/* Related Info */}
          {sticky.project && (
            <div className="text-center text-sm text-gray-600">
              Related to: {sticky.project.emoji} {sticky.project.name}
            </div>
          )}
          {sticky.task && (
            <div className="text-center text-sm text-gray-600">
              Related to: {sticky.task.taskCode} - {sticky.task.title}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter sticky title..."
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content..."
              rows={6}
              required
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color
            </Label>
            <div className="flex flex-wrap gap-2">
              {STICKY_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color.value
                      ? "border-gray-900 scale-110"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateSticky.isPending}
              className="flex-1"
            >
              {updateSticky.isPending ? "Updating..." : "Update Sticky"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStickyDialog;