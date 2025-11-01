import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Image,
  Video,
  FileText,
  Download,
  Eye,
  X,
  ZoomIn,
  MessageCircle,
} from "lucide-react";
import { getTaskCommentsQueryFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { format } from "date-fns";

export interface MediaAttachment {
  url: string;
  publicId: string;
  type: "image" | "video" | "document";
  filename: string;
  size: number;
}

interface Comment {
  _id: string;
  content: string;
  attachments: MediaAttachment[];
  author: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  createdAt: string;
}

interface TaskAttachmentsProps {
  taskId: string;
  onScrollToComment?: (commentId: string) => void;
}

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
  onDownload: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  src,
  alt,
  onClose,
  onDownload,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full">
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            className="text-white hover:bg-white/20"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  taskId,
  onScrollToComment,
}) => {
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
    downloadUrl: string;
  } | null>(null);
  const workspaceId = useWorkspaceId();

  const { data, isLoading } = useQuery({
    queryKey: ["task-comments", workspaceId, taskId],
    queryFn: () => getTaskCommentsQueryFn(workspaceId, taskId),
    enabled: !!workspaceId && !!taskId,
  });

  const comments: Comment[] = data?.comments || [];

  // Get all attachments from all comments
  const allAttachments = comments.reduce((acc, comment) => {
    if (comment.attachments && comment.attachments.length > 0) {
      comment.attachments.forEach((attachment) => {
        acc.push({
          ...attachment,
          commentId: comment._id,
          author: comment.author,
          createdAt: comment.createdAt,
        });
      });
    }
    return acc;
  }, [] as Array<MediaAttachment & { commentId: string; author: Comment["author"]; createdAt: string }>);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageView = (attachment: MediaAttachment) => {
    setSelectedImage({
      src: attachment.url,
      alt: attachment.filename,
      downloadUrl: attachment.url,
    });
  };

  const handleGoToComment = (commentId: string) => {
    onScrollToComment?.(commentId);
  };

  if (isLoading) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        Loading attachments...
      </div>
    );
  }

  if (allAttachments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <div className="text-sm">No attachments yet.</div>
        <div className="text-xs mt-1">
          Files shared in comments will appear here.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            Attachments ({allAttachments.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {allAttachments.map((attachment, index) => {
            const authorName = attachment.author.name;
            const authorInitials = getAvatarFallbackText(authorName);
            const authorAvatarColor = getAvatarColor(authorName);

            return (
              <Card
                key={`${attachment.commentId}-${index}`}
                className="p-3 hover:shadow-sm transition-shadow"
              >
                {attachment.type === "image" ? (
                  <div className="space-y-3">
                    <div className="relative group">
                      <img
                        src={attachment.url}
                        alt={attachment.filename}
                        className="w-full max-w-xs h-auto rounded cursor-pointer"
                        onClick={() => handleImageView(attachment)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center">
                        <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={attachment.author.profilePicture || ""}
                            alt={authorName}
                          />
                          <AvatarFallback
                            className={`${authorAvatarColor} text-xs`}
                          >
                            {authorInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {attachment.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {authorName} •{" "}
                            {format(new Date(attachment.createdAt), "MMM d")} •{" "}
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleImageView(attachment)}
                          className="h-6 w-6 p-0"
                          title="View image"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDownload(attachment.url, attachment.filename)
                          }
                          className="h-6 w-6 p-0"
                          title="Download"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleGoToComment(attachment.commentId)
                          }
                          className="h-6 w-6 p-0"
                          title="Go to comment"
                        >
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : attachment.type === "video" ? (
                  <div className="space-y-3">
                    <video
                      src={attachment.url}
                      controls
                      className="w-full max-w-xs h-auto rounded"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={attachment.author.profilePicture || ""}
                            alt={authorName}
                          />
                          <AvatarFallback
                            className={`${authorAvatarColor} text-xs`}
                          >
                            {authorInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {attachment.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {authorName} •{" "}
                            {format(new Date(attachment.createdAt), "MMM d")} •{" "}
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(attachment.url, "_blank")}
                          className="h-6 w-6 p-0"
                          title="Open in new tab"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDownload(attachment.url, attachment.filename)
                          }
                          className="h-6 w-6 p-0"
                          title="Download"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleGoToComment(attachment.commentId)
                          }
                          className="h-6 w-6 p-0"
                          title="Go to comment"
                        >
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                      {getFileIcon(attachment.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {authorName} •{" "}
                        {format(new Date(attachment.createdAt), "MMM d")} •{" "}
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.url, "_blank")}
                        className="h-6 w-6 p-0"
                        title="Open in new tab"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDownload(attachment.url, attachment.filename)
                        }
                        className="h-6 w-6 p-0"
                        title="Download"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGoToComment(attachment.commentId)}
                        className="h-6 w-6 p-0"
                        title="Go to comment"
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          src={selectedImage.src}
          alt={selectedImage.alt}
          onClose={() => setSelectedImage(null)}
          onDownload={() => {
            handleDownload(selectedImage.downloadUrl, selectedImage.alt);
            setSelectedImage(null);
          }}
        />
      )}
    </>
  );
};
