import CommentModel from "../models/comment.model";
import TaskModel from "../models/task.model";
import ActivityModel, { ActivityType } from "../models/activity.model";
import { NotFoundException, BadRequestException } from "../utils/appError";

import { MediaAttachment } from "../models/comment.model";

export const createCommentService = async (
  taskId: string,
  workspaceId: string,
  userId: string,
  content: string,
  attachments: MediaAttachment[] = []
) => {
  // Verify task exists and belongs to workspace
  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!task) {
    throw new NotFoundException("Task not found");
  }

  const comment = new CommentModel({
    task: taskId,
    workspace: workspaceId,
    author: userId,
    content,
    attachments,
  });

  await comment.save();

  // Create activity log
  await ActivityModel.create({
    task: taskId,
    workspace: workspaceId,
    user: userId,
    type: ActivityType.COMMENT_ADDED,
    description: "Added a comment",
  });

  // Populate author details
  await comment.populate("author", "name email profilePicture");

  return { comment };
};

export const getTaskCommentsService = async (
  taskId: string,
  workspaceId: string
) => {
  // Verify task exists and belongs to workspace
  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!task) {
    throw new NotFoundException("Task not found");
  }

  const comments = await CommentModel.find({
    task: taskId,
    workspace: workspaceId,
  })
    .populate("author", "name email profilePicture")
    .sort({ createdAt: 1 });

  return { comments };
};

export const updateCommentService = async (
  commentId: string,
  taskId: string,
  workspaceId: string,
  userId: string,
  content: string,
  attachments?: MediaAttachment[]
) => {
  const comment = await CommentModel.findOne({
    _id: commentId,
    task: taskId,
    workspace: workspaceId,
    author: userId, // Only author can edit their comment
  });

  if (!comment) {
    throw new NotFoundException("Comment not found or you don't have permission to edit it");
  }

  comment.content = content;
  if (attachments !== undefined) {
    comment.attachments = attachments;
  }
  comment.isEdited = true;
  comment.editedAt = new Date();

  await comment.save();

  // Create activity log
  await ActivityModel.create({
    task: taskId,
    workspace: workspaceId,
    user: userId,
    type: ActivityType.COMMENT_UPDATED,
    description: "Updated a comment",
  });

  await comment.populate("author", "name email profilePicture");

  return { comment };
};

export const deleteCommentService = async (
  commentId: string,
  taskId: string,
  workspaceId: string,
  userId: string
) => {
  const comment = await CommentModel.findOne({
    _id: commentId,
    task: taskId,
    workspace: workspaceId,
    author: userId, // Only author can delete their comment
  });

  if (!comment) {
    throw new NotFoundException("Comment not found or you don't have permission to delete it");
  }

  await CommentModel.findByIdAndDelete(commentId);

  // Create activity log
  await ActivityModel.create({
    task: taskId,
    workspace: workspaceId,
    user: userId,
    type: ActivityType.COMMENT_DELETED,
    description: "Deleted a comment",
  });

  return { message: "Comment deleted successfully" };
};