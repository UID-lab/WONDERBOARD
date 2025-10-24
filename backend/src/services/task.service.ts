import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import UserModel from "../models/user.model";
import ActivityModel, { ActivityType } from "../models/activity.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { sendTaskAssignmentEmail } from "./email.service";

export const createTaskService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string | null;
    dueDate?: string;
  }
) => {
  const { title, description, priority, status, assignedTo, dueDate } = body;

  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }
  if (assignedTo) {
    const isAssignedUserMember = await MemberModel.exists({
      userId: assignedTo,
      workspaceId,
    });

    if (!isAssignedUserMember) {
      throw new Error("Assigned user is not a member of this workspace.");
    }
  }
  const task = new TaskModel({
    title,
    description,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: status || TaskStatusEnum.TODO,
    assignedTo,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    dueDate,
  });

  await task.save();

  // Send email notification asynchronously (don't wait for it)
  if (assignedTo) {
    console.log('🔍 Task assigned to:', assignedTo);
    // Send email in background without blocking task creation
    setImmediate(async () => {
      try {
        const assignee = await UserModel.findById(assignedTo);
        const creator = await UserModel.findById(userId);
        
        console.log('👤 Assignee found:', assignee ? { id: assignee._id, name: assignee.name, email: assignee.email } : 'Not found');
        console.log('👤 Creator found:', creator ? { id: creator._id, name: creator.name, email: creator.email } : 'Not found');
        
        if (assignee && creator) {
          const assigneeId = (assignee._id as any).toString();
          const creatorId = userId.toString();
          console.log('🔍 Checking if assignee !== creator:', assigneeId, '!==', creatorId, '=', assigneeId !== creatorId);
          
          if (assigneeId !== creatorId) {
            console.log('📧 Sending task assignment email asynchronously...');
            const emailResult = await sendTaskAssignmentEmail(
              assignee.email,
              assignee.name,
              title,
              description || '',
              creator.name,
              creator.email,
              workspaceId,
              (task._id as any).toString()
            );
            console.log('📧 Email result:', emailResult);
            console.log('✅ Email sent successfully');
          } else {
            console.log('⏭️ Skipping email - assignee is the same as creator');
          }
        } else {
          console.log('❌ Missing assignee or creator data');
        }
      } catch (emailError) {
        console.error('❌ Failed to send task assignment email:', emailError);
        if (emailError instanceof Error) {
          console.error('❌ Email error stack:', emailError.stack);
        }
      }
    });
  } else {
    console.log('⏭️ No assignee specified, skipping email notification');
  }

  // Create activity log
  await ActivityModel.create({
    task: task._id,
    workspace: workspaceId,
    user: userId,
    type: ActivityType.TASK_CREATED,
    description: `Created task "${title}"`,
  });

  return { task };
};

export const updateTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  userId: string,
  body: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assignedTo?: string | null;
    dueDate?: string;
  }
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findById(taskId);

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "Task not found or does not belong to this project"
    );
  }

  // Track changes for activity log
  const changes: string[] = [];
  if (body.title !== undefined && task.title !== body.title) {
    changes.push(`title from "${task.title}" to "${body.title}"`);
  }
  if (body.description !== undefined && task.description !== body.description) {
    changes.push(`description`);
  }
  if (body.status !== undefined && task.status !== body.status) {
    changes.push(`status from "${task.status}" to "${body.status}"`);
  }
  if (body.priority !== undefined && task.priority !== body.priority) {
    changes.push(`priority from "${task.priority}" to "${body.priority}"`);
  }
  if (body.assignedTo !== undefined && task.assignedTo?.toString() !== body.assignedTo) {
    changes.push(`assignment`);
  }
  if (body.dueDate !== undefined) {
    const oldDueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'no due date';
    const newDueDate = body.dueDate ? new Date(body.dueDate).toLocaleDateString() : 'no due date';
    if (oldDueDate !== newDueDate) {
      changes.push(`due date from "${oldDueDate}" to "${newDueDate}"`);
    }
  }

  // Only update fields that are provided
  const updateData: any = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.priority !== undefined) updateData.priority = body.priority;
  if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
  if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    updateData,
    { new: true }
  );

  // Send email notification asynchronously if assignee changed
  if (body.assignedTo !== undefined && task.assignedTo?.toString() !== body.assignedTo && body.assignedTo) {
    console.log('🔍 Task assignee changed to:', body.assignedTo);
    console.log('🔍 Previous assignee:', task.assignedTo?.toString());
    
    // Send email in background without blocking task update
    setImmediate(async () => {
      try {
        const assignee = await UserModel.findById(body.assignedTo);
        const updater = await UserModel.findById(userId);
        
        console.log('👤 New assignee found:', assignee ? { id: assignee._id, name: assignee.name, email: assignee.email } : 'Not found');
        console.log('👤 Updater found:', updater ? { id: updater._id, name: updater.name, email: updater.email } : 'Not found');
        
        if (assignee && updater) {
          const assigneeId = (assignee._id as any).toString();
          const updaterId = userId.toString();
          console.log('🔍 Checking if assignee !== updater:', assigneeId, '!==', updaterId, '=', assigneeId !== updaterId);
          
          if (assigneeId !== updaterId) {
            console.log('📧 Sending task assignment email for updated task asynchronously...');
            const emailResult = await sendTaskAssignmentEmail(
              assignee.email,
              assignee.name,
              updatedTask?.title || task.title,
              updatedTask?.description || task.description || '',
              updater.name,
              updater.email,
              workspaceId,
              (task._id as any).toString()
            );
            console.log('📧 Email result:', emailResult);
            console.log('✅ Email sent successfully');
          } else {
            console.log('⏭️ Skipping email - assignee is the same as updater');
          }
        } else {
          console.log('❌ Missing assignee or updater data');
        }
      } catch (emailError) {
        console.error('❌ Failed to send task assignment email:', emailError);
        if (emailError instanceof Error) {
          console.error('❌ Email error stack:', emailError.stack);
        }
      }
    });
  } else {
    console.log('⏭️ No assignee change detected, skipping email notification');
  }

  if (!updatedTask) {
    throw new BadRequestException("Failed to update task");
  }

  // Create activity log if there were changes
  if (changes.length > 0) {
    await ActivityModel.create({
      task: taskId,
      workspace: workspaceId,
      user: userId,
      type: ActivityType.TASK_UPDATED,
      description: `Updated ${changes.join(', ')}`,
      metadata: { changes, oldValues: task.toObject(), newValues: body },
    });
  }

  return { updatedTask };
};

export const getAllTasksService = async (
  workspaceId: string,
  filters: {
    projectId?: string;
    status?: string[];
    priority?: string[];
    assignedTo?: string[];
    keyword?: string;
    dueDate?: string;
    createdFrom?: string;
    createdTo?: string;
    dueFrom?: string;
    dueTo?: string;
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
  };

  if (filters.projectId) {
    query.project = filters.projectId;
  }

  if (filters.status && filters.status?.length > 0) {
    query.status = { $in: filters.status };
  }

  if (filters.priority && filters.priority?.length > 0) {
    query.priority = { $in: filters.priority };
  }

  if (filters.assignedTo && filters.assignedTo?.length > 0) {
    query.assignedTo = { $in: filters.assignedTo };
  }

  if (filters.keyword && filters.keyword !== undefined) {
    query.title = { $regex: filters.keyword, $options: "i" };
  }

  // Legacy single due date filter (keeping for backward compatibility)
  if (filters.dueDate && !filters.dueFrom && !filters.dueTo) {
    query.dueDate = {
      $eq: new Date(filters.dueDate),
    };
  }

  // Date range filters for created date
  if (filters.createdFrom || filters.createdTo) {
    console.log('📅 Created date filters:', { createdFrom: filters.createdFrom, createdTo: filters.createdTo });
    query.createdAt = {};
    if (filters.createdFrom) {
      const fromDate = new Date(filters.createdFrom);
      fromDate.setHours(0, 0, 0, 0); // Start of day
      console.log('📅 Created from date parsed:', fromDate, 'isValid:', !isNaN(fromDate.getTime()));
      if (!isNaN(fromDate.getTime())) {
        query.createdAt.$gte = fromDate;
      }
    }
    if (filters.createdTo) {
      const toDate = new Date(filters.createdTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      console.log('📅 Created to date parsed:', toDate, 'isValid:', !isNaN(toDate.getTime()));
      if (!isNaN(toDate.getTime())) {
        query.createdAt.$lte = toDate;
      }
    }
    console.log('📅 Created date query:', query.createdAt);
  }

  // Date range filters for due date
  if (filters.dueFrom || filters.dueTo) {
    console.log('📅 Due date filters:', { dueFrom: filters.dueFrom, dueTo: filters.dueTo });
    query.dueDate = {};
    if (filters.dueFrom) {
      const fromDate = new Date(filters.dueFrom);
      fromDate.setHours(0, 0, 0, 0); // Start of day
      console.log('📅 Due from date parsed:', fromDate, 'isValid:', !isNaN(fromDate.getTime()));
      if (!isNaN(fromDate.getTime())) {
        query.dueDate.$gte = fromDate;
      }
    }
    if (filters.dueTo) {
      const toDate = new Date(filters.dueTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      console.log('📅 Due to date parsed:', toDate, 'isValid:', !isNaN(toDate.getTime()));
      if (!isNaN(toDate.getTime())) {
        query.dueDate.$lte = toDate;
      }
    }
    console.log('📅 Due date query:', query.dueDate);
  }

  console.log('🔍 Final MongoDB query:', JSON.stringify(query, null, 2));

  //Pagination Setup
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  console.log('🔍 Executing MongoDB query with filters...');
  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "_id name profilePicture -password")
      .populate("project", "_id emoji name")
      .select("+description"), // Ensure description is included
    TaskModel.countDocuments(query),
  ]);

  console.log(`📊 Found ${totalCount} tasks matching filters, returning ${tasks.length} tasks for page ${pagination.pageNumber}`);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tasks,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTaskByIdService = async (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  })
    .populate("assignedTo", "_id name profilePicture -password")
    .populate("project", "_id emoji name");

  if (!task) {
    throw new NotFoundException("Task not found.");
  }

  return task;
};

export const deleteTaskService = async (
  workspaceId: string,
  taskId: string
) => {
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!task) {
    throw new NotFoundException(
      "Task not found or does not belong to the specified workspace"
    );
  }

  return;
};

export const bulkDeleteTasksService = async (
  workspaceId: string,
  taskIds: string[]
) => {
  // Verify all tasks belong to the workspace
  const tasks = await TaskModel.find({
    _id: { $in: taskIds },
    workspace: workspaceId,
  });

  if (tasks.length !== taskIds.length) {
    throw new BadRequestException(
      "Some tasks do not exist or do not belong to this workspace"
    );
  }

  // Delete all tasks
  const result = await TaskModel.deleteMany({
    _id: { $in: taskIds },
    workspace: workspaceId,
  });

  return {
    deletedCount: result.deletedCount,
    taskIds,
  };
};
