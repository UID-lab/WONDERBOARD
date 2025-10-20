import SubtaskModel, { SubtaskDocument } from "../models/subtask.model";
import TaskModel from "../models/task.model";
import { ActivityService } from "./activity.service";
import mongoose from "mongoose";

export class SubtaskService {
  static async createSubtask(data: {
    title: string;
    description?: string;
    parentTask: string;
    assignedTo?: string;
    dueDate?: Date;
    createdBy: string;
  }): Promise<SubtaskDocument> {
    // Verify parent task exists
    const parentTask = await TaskModel.findById(data.parentTask);
    if (!parentTask) {
      throw new Error("Parent task not found");
    }

    // Get the next order number
    const lastSubtask = await SubtaskModel.findOne({ parentTask: data.parentTask })
      .sort({ order: -1 });
    const order = lastSubtask ? lastSubtask.order + 1 : 0;

    const subtask = new SubtaskModel({
      ...data,
      order,
    });

    await subtask.save();
    await subtask.populate("assignedTo", "name email avatar");
    await subtask.populate("createdBy", "name email avatar");

    // Log activity
    await ActivityService.logActivity({
      type: "subtask_created",
      task: data.parentTask,
      user: data.createdBy,
      details: {
        subtaskTitle: data.title,
      },
    });

    return subtask;
  }

  static async getSubtasksByTask(taskId: string): Promise<SubtaskDocument[]> {
    return SubtaskModel.find({ parentTask: taskId })
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar")
      .sort({ order: 1 });
  }

  static async updateSubtask(
    subtaskId: string,
    data: Partial<SubtaskDocument>,
    userId: string
  ): Promise<SubtaskDocument | null> {
    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      throw new Error("Subtask not found");
    }

    const oldStatus = subtask.status;
    const updatedSubtask = await SubtaskModel.findByIdAndUpdate(
      subtaskId,
      data,
      { new: true }
    )
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar");

    if (!updatedSubtask) {
      return null;
    }

    // Log activity for status changes
    if (data.status && data.status !== oldStatus) {
      await ActivityService.logActivity({
        type: "subtask_status_changed",
        task: subtask.parentTask.toString(),
        user: userId,
        details: {
          subtaskTitle: updatedSubtask.title,
          oldStatus,
          newStatus: data.status,
        },
      });
    }

    return updatedSubtask;
  }

  static async deleteSubtask(subtaskId: string, userId: string): Promise<boolean> {
    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      throw new Error("Subtask not found");
    }

    await SubtaskModel.findByIdAndDelete(subtaskId);

    // Log activity
    await ActivityService.logActivity({
      type: "subtask_deleted",
      task: subtask.parentTask.toString(),
      user: userId,
      details: {
        subtaskTitle: subtask.title,
      },
    });

    return true;
  }

  static async reorderSubtasks(
    taskId: string,
    subtaskOrders: { id: string; order: number }[]
  ): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (const { id, order } of subtaskOrders) {
        await SubtaskModel.findByIdAndUpdate(id, { order }, { session });
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}