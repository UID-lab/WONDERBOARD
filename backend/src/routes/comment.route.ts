import { Router } from "express";
import {
  createCommentController,
  getTaskCommentsController,
  updateCommentController,
  deleteCommentController,
} from "../controllers/comment.controller";

const commentRoutes = Router();

// GET /api/comment/workspace/:workspaceId/task/:taskId - Get all comments for a task
commentRoutes.get("/workspace/:workspaceId/task/:taskId", getTaskCommentsController);

// POST /api/comment/workspace/:workspaceId/task/:taskId - Create a new comment
commentRoutes.post("/workspace/:workspaceId/task/:taskId", createCommentController);

// PUT /api/comment/:commentId/workspace/:workspaceId/task/:taskId - Update a comment
commentRoutes.put("/:commentId/workspace/:workspaceId/task/:taskId", updateCommentController);

// DELETE /api/comment/:commentId/workspace/:workspaceId/task/:taskId - Delete a comment
commentRoutes.delete("/:commentId/workspace/:workspaceId/task/:taskId", deleteCommentController);

export default commentRoutes;