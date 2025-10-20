import { Request, Response } from "express";
import { SubtaskService } from "../services/subtask.service";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";

export class SubtaskController {
  static createSubtask = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, parentTask, assignedTo, dueDate } = req.body;
    const createdBy = req.user?._id;

    const subtask = await SubtaskService.createSubtask({
      title,
      description,
      parentTask,
      assignedTo,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy,
    });

    res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Subtask created successfully",
      data: subtask,
    });
  });

  static getSubtasksByTask = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const subtasks = await SubtaskService.getSubtasksByTask(taskId);

    res.status(HTTPSTATUS.OK).json({
      success: true,
      data: subtasks,
    });
  });

  static updateSubtask = asyncHandler(async (req: Request, res: Response) => {
    const { subtaskId } = req.params;
    const userId = req.user?._id;
    const updateData = req.body;

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const subtask = await SubtaskService.updateSubtask(subtaskId, updateData, userId);

    if (!subtask) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Subtask not found",
      });
    }

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Subtask updated successfully",
      data: subtask,
    });
  });

  static deleteSubtask = asyncHandler(async (req: Request, res: Response) => {
    const { subtaskId } = req.params;
    const userId = req.user?._id;

    await SubtaskService.deleteSubtask(subtaskId, userId);

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Subtask deleted successfully",
    });
  });

  static reorderSubtasks = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const { subtaskOrders } = req.body;

    await SubtaskService.reorderSubtasks(taskId, subtaskOrders);

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Subtasks reordered successfully",
    });
  });
}