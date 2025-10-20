import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2, Send, Save, X } from "lucide-react";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { format } from "date-fns";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { toast } from "@/hooks/use-toast";

import {
  getTaskCommentsQueryFn,
  createCommentMutationFn,
  updateCommentMutationFn,
  deleteCommentMutationFn,
} from "@/lib/api";

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskCommentsProps {
  taskId: string;
}

export const TaskComments = ({ taskId }: TaskCommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["task-comments", workspaceId, taskId],
    queryFn: () => getTaskCommentsQueryFn(workspaceId, taskId),
    enabled: !!workspaceId && !!taskId,
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createCommentMutationFn({ workspaceId, taskId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-comments", workspaceId, taskId] });
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateCommentMutationFn({ workspaceId, taskId, commentId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-comments", workspaceId, taskId] });
      setEditingCommentId(null);
      setEditingContent("");
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommentMutationFn({ workspaceId, taskId, commentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-comments", workspaceId, taskId] });
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment);
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editingContent.trim() || !editingCommentId) return;
    updateCommentMutation.mutate({
      commentId: editingCommentId,
      content: editingContent,
    });
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const comments: Comment[] = (data?.comments || []).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Comments list - Show first to prioritize viewing */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm">No comments yet.</div>
            <div className="text-xs mt-1">Be the first to comment!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => {
              const authorName = comment.author.name;
              const authorInitials = getAvatarFallbackText(authorName);
              const authorAvatarColor = getAvatarColor(authorName);
              const isEditing = editingCommentId === comment._id;

              return (
                <Card key={comment._id} className="p-3 hover:shadow-sm transition-shadow group">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage
                        src={comment.author.profilePicture || ""}
                        alt={authorName}
                      />
                      <AvatarFallback className={authorAvatarColor}>
                        {authorInitials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{authorName}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            {comment.isEdited && (
                              <span className="ml-1 italic">(edited)</span>
                            )}
                          </span>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditComment(comment)}
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment._id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2 mt-2">
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="min-h-[60px] resize-none text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={updateCommentMutation.isPending}
                              className="h-7 px-2 text-xs"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="h-7 px-2 text-xs"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700 whitespace-pre-wrap mt-2 leading-relaxed">
                          {comment.content}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add new comment - Fixed at bottom */}
      <div className="border-t pt-3 bg-white flex-shrink-0">
        <div className="space-y-3">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[70px] resize-none text-sm"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || createCommentMutation.isPending}
              size="sm"
              className="h-8 px-3 text-xs"
            >
              <Send className="h-3 w-3 mr-1" />
              {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};