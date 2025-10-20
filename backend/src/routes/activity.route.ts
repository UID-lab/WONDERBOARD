import { Router } from "express";
import { getTaskActivitiesController } from "../controllers/activity.controller";

const activityRoutes = Router();

// GET /api/activity/workspace/:workspaceId/task/:taskId - Get all activities for a task
activityRoutes.get("/workspace/:workspaceId/task/:taskId", getTaskActivitiesController);

export default activityRoutes;