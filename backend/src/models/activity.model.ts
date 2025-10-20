import mongoose, { Document, Schema } from "mongoose";

export enum ActivityType {
  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_DELETED = "TASK_DELETED",
  COMMENT_ADDED = "COMMENT_ADDED",
  COMMENT_UPDATED = "COMMENT_UPDATED",
  COMMENT_DELETED = "COMMENT_DELETED",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_STATUS_CHANGED = "TASK_STATUS_CHANGED",
  TASK_PRIORITY_CHANGED = "TASK_PRIORITY_CHANGED",
  SUBTASK_CREATED = "SUBTASK_CREATED",
  SUBTASK_UPDATED = "SUBTASK_UPDATED",
  SUBTASK_DELETED = "SUBTASK_DELETED",
  SUBTASK_STATUS_CHANGED = "SUBTASK_STATUS_CHANGED",
  CHECKLIST_CREATED = "CHECKLIST_CREATED",
  CHECKLIST_UPDATED = "CHECKLIST_UPDATED",
  CHECKLIST_DELETED = "CHECKLIST_DELETED",
  CHECKLIST_ITEM_ADDED = "CHECKLIST_ITEM_ADDED",
  CHECKLIST_ITEM_COMPLETED = "CHECKLIST_ITEM_COMPLETED",
  CHECKLIST_ITEM_UNCOMPLETED = "CHECKLIST_ITEM_UNCOMPLETED",
  CHECKLIST_ITEM_DELETED = "CHECKLIST_ITEM_DELETED",
}

export interface ActivityDocument extends Document {
  task: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: ActivityType;
  description: string;
  metadata?: any; // For storing additional data like old/new values
  createdAt: Date;
}

const activitySchema = new Schema<ActivityDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const ActivityModel = mongoose.model<ActivityDocument>("Activity", activitySchema);

export default ActivityModel;