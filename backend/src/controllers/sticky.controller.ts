import { Request, Response } from "express";
import { StickyService } from "../services/sticky.service";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";

export const createStickyController = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, content, type, project, task, color, position, size } = req.body;
    const { workspaceId } = req.params;
    const createdBy = req.user?._id;

    const sticky = await StickyService.createSticky({
      title,
      content,
      type,
      workspace: workspaceId,
      project,
      task,
      createdBy,
      color,
      position,
      size,
    });

    res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Sticky created successfully",
      data: sticky,
    });
  }
);

export const getStickiesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const { type, projectId, taskId } = req.query;

    const stickies = await StickyService.getStickiesByWorkspace(workspaceId, {
      type: type as "project" | "task" | "scribble",
      projectId: projectId as string,
      taskId: taskId as string,
    });

    res.status(HTTPSTATUS.OK).json({
      success: true,
      data: stickies,
    });
  }
);

export const updateStickyController = asyncHandler(
  async (req: Request, res: Response) => {
    const { stickyId, workspaceId } = req.params;
    const userId = req.user?._id;
    const updateData = req.body;

    const sticky = await StickyService.updateSticky(
      stickyId,
      workspaceId,
      userId,
      updateData
    );

    if (!sticky) {
      res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Sticky not found",
      });
      return;
    }

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Sticky updated successfully",
      data: sticky,
    });
  }
);

export const deleteStickyController = asyncHandler(
  async (req: Request, res: Response) => {
    const { stickyId, workspaceId } = req.params;
    const userId = req.user?._id;

    await StickyService.deleteSticky(stickyId, workspaceId, userId);

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Sticky deleted successfully",
    });
  }
);

export const getStickyByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { stickyId, workspaceId } = req.params;

    const sticky = await StickyService.getStickyById(stickyId, workspaceId);

    if (!sticky) {
      res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Sticky not found",
      });
      return;
    }

    res.status(HTTPSTATUS.OK).json({
      success: true,
      data: sticky,
    });
  }
);