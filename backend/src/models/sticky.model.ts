import mongoose, { Document, Schema } from "mongoose";

export interface StickyDocument extends Document {
  title: string;
  content: string;
  type: "project" | "task" | "scribble";
  workspace: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  task?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  color: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const stickySchema = new Schema<StickyDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["project", "task", "scribble"],
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: function() {
        return this.type === "project";
      },
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: function() {
        return this.type === "task";
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    color: {
      type: String,
      default: "#fef3c7", // Default yellow color
    },
    position: {
      x: {
        type: Number,
        default: 0,
      },
      y: {
        type: Number,
        default: 0,
      },
    },
    size: {
      width: {
        type: Number,
        default: 250,
      },
      height: {
        type: Number,
        default: 200,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
stickySchema.index({ workspace: 1, type: 1 });
stickySchema.index({ project: 1 });
stickySchema.index({ task: 1 });
stickySchema.index({ createdBy: 1 });

const StickyModel = mongoose.model<StickyDocument>("Sticky", stickySchema);

export default StickyModel;