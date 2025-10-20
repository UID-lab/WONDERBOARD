import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import { getTaskActivitiesService } from "../services/activity.service";
import { taskIdSchema } from "../validation/task.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";

export const getTaskActivitiesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { activities } = await getTaskActivitiesService(taskId, workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Task activities fetched successfully",
      activities,
    });
  }
);