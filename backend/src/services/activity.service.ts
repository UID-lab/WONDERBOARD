import ActivityModel, { ActivityType } from "../models/activity.model";
import TaskModel from "../models/task.model";
import { NotFoundException } from "../utils/appError";

export const getTaskActivitiesService = async (
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

  const activities = await ActivityModel.find({
    task: taskId,
    workspace: workspaceId,
  })
    .populate("user", "name email profilePicture")
    .sort({ createdAt: -1 }); // Most recent first

  return { activities };
};

export class ActivityService {
  static async logActivity(data: {
    type: string;
    task: string;
    user: string;
    details?: any;
  }) {
    try {
      // Get task to find workspace
      const task = await TaskModel.findById(data.task);
      if (!task) {
        throw new Error("Task not found");
      }

      // Generate description based on activity type
      const description = ActivityService.generateDescription(data.type, data.details);

      const activity = new ActivityModel({
        task: data.task,
        workspace: task.workspace,
        user: data.user,
        type: data.type.toUpperCase(),
        description,
        metadata: data.details,
      });

      await activity.save();
      return activity;
    } catch (error) {
      console.error("Error logging activity:", error);
      // Don't throw error to prevent breaking the main operation
    }
  }

  private static generateDescription(type: string, details?: any): string {
    switch (type) {
      case "subtask_created":
        return `created subtask "${details?.subtaskTitle}"`;
      case "subtask_status_changed":
        return `changed subtask "${details?.subtaskTitle}" status from ${details?.oldStatus} to ${details?.newStatus}`;
      case "subtask_deleted":
        return `deleted subtask "${details?.subtaskTitle}"`;
      case "checklist_created":
        return `created checklist "${details?.checklistTitle}"`;
      case "checklist_updated":
        return `updated checklist "${details?.checklistTitle}"`;
      case "checklist_deleted":
        return `deleted checklist "${details?.checklistTitle}"`;
      case "checklist_item_added":
        return `added item "${details?.itemText}" to checklist "${details?.checklistTitle}"`;
      case "checklist_item_completed":
        return `completed item "${details?.itemText}" in checklist "${details?.checklistTitle}"`;
      case "checklist_item_uncompleted":
        return `uncompleted item "${details?.itemText}" in checklist "${details?.checklistTitle}"`;
      case "checklist_item_deleted":
        return `deleted item "${details?.itemText}" from checklist "${details?.checklistTitle}"`;
      case "task_title_changed":
        return `changed title from "${details?.oldValue}" to "${details?.newValue}"`;
      case "task_description_changed":
        return `updated task description`;
      case "task_status_changed":
        return `changed status from "${details?.oldValue}" to "${details?.newValue}"`;
      case "task_priority_changed":
        return `changed priority from "${details?.oldValue}" to "${details?.newValue}"`;
      case "task_due_date_changed":
        return `changed due date from "${details?.oldValue}" to "${details?.newValue}"`;
      case "task_assigned":
        return `assigned task to ${details?.assigneeName}`;
      case "task_unassigned":
        return `unassigned task`;
      default:
        return `performed ${type} action`;
    }
  }
}