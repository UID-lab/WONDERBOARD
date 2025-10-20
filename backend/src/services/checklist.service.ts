import ChecklistModel, { ChecklistDocument } from "../models/checklist.model";
import TaskModel from "../models/task.model";
import { ActivityService } from "./activity.service";

export class ChecklistService {
  static async createChecklist(data: {
    title: string;
    task: string;
    createdBy: string;
  }): Promise<ChecklistDocument> {
    // Verify task exists
    const task = await TaskModel.findById(data.task);
    if (!task) {
      throw new Error("Task not found");
    }

    const checklist = new ChecklistModel(data);
    await checklist.save();

    // Log activity
    await ActivityService.logActivity({
      type: "checklist_created",
      task: data.task,
      user: data.createdBy,
      details: {
        checklistTitle: data.title,
      },
    });

    return checklist;
  }

  static async getChecklistsByTask(taskId: string): Promise<ChecklistDocument[]> {
    return ChecklistModel.find({ task: taskId })
      .populate("createdBy", "name email avatar")
      .sort({ createdAt: 1 });
  }

  static async updateChecklist(
    checklistId: string,
    data: { title?: string; items?: any[] },
    userId: string
  ): Promise<ChecklistDocument | null> {
    const checklist = await ChecklistModel.findById(checklistId);
    if (!checklist) {
      throw new Error("Checklist not found");
    }

    const updatedChecklist = await ChecklistModel.findByIdAndUpdate(
      checklistId,
      data,
      { new: true }
    ).populate("createdBy", "name email avatar");

    if (!updatedChecklist) {
      return null;
    }

    // Log activity
    await ActivityService.logActivity({
      type: "checklist_updated",
      task: checklist.task.toString(),
      user: userId,
      details: {
        checklistTitle: updatedChecklist.title,
      },
    });

    return updatedChecklist;
  }

  static async addChecklistItem(
    checklistId: string,
    itemText: string,
    userId: string
  ): Promise<ChecklistDocument | null> {
    const checklist = await ChecklistModel.findById(checklistId);
    if (!checklist) {
      throw new Error("Checklist not found");
    }

    const order = checklist.items.length;
    checklist.items.push({
      text: itemText,
      completed: false,
      order,
    } as any);

    await checklist.save();
    await checklist.populate("createdBy", "name email avatar");

    // Log activity
    await ActivityService.logActivity({
      type: "checklist_item_added",
      task: checklist.task.toString(),
      user: userId,
      details: {
        checklistTitle: checklist.title,
        itemText,
      },
    });

    return checklist;
  }

  static async updateChecklistItem(
    checklistId: string,
    itemId: string,
    data: { text?: string; completed?: boolean },
    userId: string
  ): Promise<ChecklistDocument | null> {
    const checklist = await ChecklistModel.findById(checklistId);
    if (!checklist) {
      throw new Error("Checklist not found");
    }

    const item = checklist.items.find(item => item._id?.toString() === itemId);
    if (!item) {
      throw new Error("Checklist item not found");
    }

    const wasCompleted = item.completed;
    
    if (data.text !== undefined) item.text = data.text;
    if (data.completed !== undefined) item.completed = data.completed;

    await checklist.save();
    await checklist.populate("createdBy", "name email avatar");

    // Log activity for completion status changes
    if (data.completed !== undefined && data.completed !== wasCompleted) {
      await ActivityService.logActivity({
        type: data.completed ? "checklist_item_completed" : "checklist_item_uncompleted",
        task: checklist.task.toString(),
        user: userId,
        details: {
          checklistTitle: checklist.title,
          itemText: item.text,
        },
      });
    }

    return checklist;
  }

  static async deleteChecklistItem(
    checklistId: string,
    itemId: string,
    userId: string
  ): Promise<ChecklistDocument | null> {
    const checklist = await ChecklistModel.findById(checklistId);
    if (!checklist) {
      throw new Error("Checklist not found");
    }

    const item = checklist.items.find(item => item._id?.toString() === itemId);
    if (!item) {
      throw new Error("Checklist item not found");
    }

    const itemText = item.text;
    checklist.items = checklist.items.filter(item => item._id?.toString() !== itemId);
    await checklist.save();
    await checklist.populate("createdBy", "name email avatar");

    // Log activity
    await ActivityService.logActivity({
      type: "checklist_item_deleted",
      task: checklist.task.toString(),
      user: userId,
      details: {
        checklistTitle: checklist.title,
        itemText,
      },
    });

    return checklist;
  }

  static async deleteChecklist(checklistId: string, userId: string): Promise<boolean> {
    const checklist = await ChecklistModel.findById(checklistId);
    if (!checklist) {
      throw new Error("Checklist not found");
    }

    await ChecklistModel.findByIdAndDelete(checklistId);

    // Log activity
    await ActivityService.logActivity({
      type: "checklist_deleted",
      task: checklist.task.toString(),
      user: userId,
      details: {
        checklistTitle: checklist.title,
      },
    });

    return true;
  }
}