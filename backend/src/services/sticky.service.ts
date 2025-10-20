import StickyModel, { StickyDocument } from "../models/sticky.model";
import WorkspaceModel from "../models/workspace.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import { NotFoundException, BadRequestException } from "../utils/appError";

export class StickyService {
  static async createSticky(data: {
    title: string;
    content: string;
    type: "project" | "task" | "scribble";
    workspace: string;
    project?: string;
    task?: string;
    createdBy: string;
    color?: string;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
  }): Promise<StickyDocument> {
    // Verify workspace exists
    const workspace = await WorkspaceModel.findById(data.workspace);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    // Validate based on type
    if (data.type === "project") {
      if (!data.project) {
        throw new BadRequestException("Project ID is required for project stickies");
      }
      const project = await ProjectModel.findById(data.project);
      if (!project || project.workspace.toString() !== data.workspace) {
        throw new NotFoundException("Project not found in this workspace");
      }
    }

    if (data.type === "task") {
      if (!data.task) {
        throw new BadRequestException("Task ID is required for task stickies");
      }
      const task = await TaskModel.findById(data.task);
      if (!task || task.workspace.toString() !== data.workspace) {
        throw new NotFoundException("Task not found in this workspace");
      }
    }

    const sticky = new StickyModel({
      ...data,
      color: data.color || "#fef3c7",
      position: data.position || { x: Math.random() * 100, y: Math.random() * 100 },
      size: data.size || { width: 250, height: 200 },
    });

    await sticky.save();
    await sticky.populate([
      { path: "project", select: "name emoji" },
      { path: "task", select: "title taskCode" },
      { path: "createdBy", select: "name email profilePicture" },
    ]);

    return sticky;
  }

  static async getStickiesByWorkspace(
    workspaceId: string,
    filters?: {
      type?: "project" | "task" | "scribble";
      projectId?: string;
      taskId?: string;
    }
  ): Promise<StickyDocument[]> {
    const query: any = { workspace: workspaceId };

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.projectId) {
      query.project = filters.projectId;
    }

    if (filters?.taskId) {
      query.task = filters.taskId;
    }

    return StickyModel.find(query)
      .populate([
        { path: "project", select: "name emoji" },
        { path: "task", select: "title taskCode" },
        { path: "createdBy", select: "name email profilePicture" },
      ])
      .sort({ createdAt: -1 });
  }

  static async updateSticky(
    stickyId: string,
    workspaceId: string,
    userId: string,
    data: Partial<{
      title: string;
      content: string;
      color: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
    }>
  ): Promise<StickyDocument | null> {
    const sticky = await StickyModel.findOne({
      _id: stickyId,
      workspace: workspaceId,
    });

    if (!sticky) {
      throw new NotFoundException("Sticky not found");
    }

    // Check if user has permission to update (creator or workspace admin)
    if (sticky.createdBy.toString() !== userId) {
      // TODO: Add workspace admin check if needed
    }

    const updatedSticky = await StickyModel.findByIdAndUpdate(
      stickyId,
      data,
      { new: true }
    ).populate([
      { path: "project", select: "name emoji" },
      { path: "task", select: "title taskCode" },
      { path: "createdBy", select: "name email profilePicture" },
    ]);

    return updatedSticky;
  }

  static async deleteSticky(
    stickyId: string,
    workspaceId: string,
    userId: string
  ): Promise<boolean> {
    const sticky = await StickyModel.findOne({
      _id: stickyId,
      workspace: workspaceId,
    });

    if (!sticky) {
      throw new NotFoundException("Sticky not found");
    }

    // Check if user has permission to delete (creator or workspace admin)
    if (sticky.createdBy.toString() !== userId) {
      // TODO: Add workspace admin check if needed
    }

    await StickyModel.findByIdAndDelete(stickyId);
    return true;
  }

  static async getStickyById(
    stickyId: string,
    workspaceId: string
  ): Promise<StickyDocument | null> {
    return StickyModel.findOne({
      _id: stickyId,
      workspace: workspaceId,
    }).populate([
      { path: "project", select: "name emoji" },
      { path: "task", select: "title taskCode" },
      { path: "createdBy", select: "name email profilePicture" },
    ]);
  }
}