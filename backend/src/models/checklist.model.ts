import mongoose, { Document, Schema } from "mongoose";

export interface ChecklistItemDocument extends Document {
  text: string;
  completed: boolean;
  order: number;
}

export interface ChecklistDocument extends Document {
  title: string;
  task: mongoose.Types.ObjectId;
  items: ChecklistItemDocument[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const checklistItemSchema = new Schema<ChecklistItemDocument>({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const checklistSchema = new Schema<ChecklistDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    items: [checklistItemSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
checklistSchema.index({ task: 1 });

const ChecklistModel = mongoose.model<ChecklistDocument>("Checklist", checklistSchema);

export default ChecklistModel;