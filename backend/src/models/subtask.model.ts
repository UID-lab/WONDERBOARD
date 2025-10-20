import mongoose, { Document, Schema } from "mongoose";
import {
  TaskStatusEnum,
  TaskStatusEnumType,
} from "../enums/task.enum";

export interface SubtaskDocument extends Document {
  title: string;
  description: string | null;
  parentTask: mongoose.Types.ObjectId;
  status: TaskStatusEnumType;
  assignedTo: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  dueDate: Date | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const subtaskSchema = new Schema<SubtaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    parentTask: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatusEnum),
      default: TaskStatusEnum.TODO,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
subtaskSchema.index({ parentTask: 1, order: 1 });

const SubtaskModel = mongoose.model<SubtaskDocument>("Subtask", subtaskSchema);

export default SubtaskModel;