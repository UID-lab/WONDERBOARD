import { Request, Response } from "express";
import { ChecklistService } from "../services/checklist.service";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";

export class ChecklistController {
  static createChecklist = asyncHandler(async (req: Request, res: Response) => {
    const { title, task } = req.body;
    const createdBy = req.user?._id;

    const checklist = await ChecklistService.createChecklist({
      title,
      task,
      createdBy,
    });

    res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Checklist created successfully",
      data: checklist,
    });
  });

  static getChecklistsByTask = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const checklists = await ChecklistService.getChecklistsByTask(taskId);

    res.status(HTTPSTATUS.OK).json({
      success: true,
      data: checklists,
    });
  });

  static updateChecklist = asyncHandler(async (req: Request, res: Response) => {
    const { checklistId } = req.params;
    const userId = req.user?._id;
    const updateData = req.body;

    const checklist = await ChecklistService.updateChecklist(checklistId, updateData, userId);

    if (!checklist) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Checklist not found",
      });
    }

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Checklist updated successfully",
      data: checklist,
    });
  });

  static addChecklistItem = asyncHandler(async (req: Request, res: Response) => {
    const { checklistId } = req.params;
    const { text } = req.body;
    const userId = req.user?._id;

    const checklist = await ChecklistService.addChecklistItem(checklistId, text, userId);

    if (!checklist) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Checklist not found",
      });
    }

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Checklist item added successfully",
      data: checklist,
    });
  });

  static updateChecklistItem = asyncHandler(async (req: Request, res: Response) => {
    const { checklistId, itemId } = req.params;
    const userId = req.user?._id;
    const updateData = req.body;

    const checklist = await ChecklistService.updateChecklistItem(
      checklistId,
      itemId,
      updateData,
      userId
    );

    if (!checklist) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Checklist or item not found",
      });
    }

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Checklist item updated successfully",
      data: checklist,
    });
  });

  static deleteChecklistItem = asyncHandler(async (req: Request, res: Response) => {
    const { checklistId, itemId } = req.params;
    const userId = req.user?._id;

    const checklist = await ChecklistService.deleteChecklistItem(checklistId, itemId, userId);

    if (!checklist) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Checklist or item not found",
      });
    }

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Checklist item deleted successfully",
      data: checklist,
    });
  });

  static deleteChecklist = asyncHandler(async (req: Request, res: Response) => {
    const { checklistId } = req.params;
    const userId = req.user?._id;

    await ChecklistService.deleteChecklist(checklistId, userId);

    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Checklist deleted successfully",
    });
  });
}