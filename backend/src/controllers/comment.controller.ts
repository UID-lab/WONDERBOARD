import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
  createCommentService,
  getTaskCommentsService,
  updateCommentService,
  deleteCommentService,
} from "../services/comment.service";
import { taskIdSchema } from "../validation/task.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comment content is required").trim(),
  attachments: z.array(z.object({
    url: z.string(),
    publicId: z.string(),
    type: z.enum(['image', 'video', 'document']),
    filename: z.string(),
    size: z.number(),
  })).optional().default([]),
});

const commentIdSchema = z.string().min(1, "Comment ID is required");

export const createCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const { content, attachments } = commentSchema.parse(req.body);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]); // Anyone who can view can comment

    const { comment } = await createCommentService(taskId, workspaceId, userId, content, attachments);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Comment created successfully",
      comment,
    });
  }
);

export const getTaskCommentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { comments } = await getTaskCommentsService(taskId, workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Comments fetched successfully",
      comments,
    });
  }
);

export const updateCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const commentId = commentIdSchema.parse(req.params.commentId);
    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const { content, attachments } = commentSchema.parse(req.body);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { comment } = await updateCommentService(commentId, taskId, workspaceId, userId, content, attachments);

    return res.status(HTTPSTATUS.OK).json({
      message: "Comment updated successfully",
      comment,
    });
  }
);

export const deleteCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const commentId = commentIdSchema.parse(req.params.commentId);
    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    await deleteCommentService(commentId, taskId, workspaceId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Comment deleted successfully",
    });
  }
);