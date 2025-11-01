import mongoose, { Document, Schema } from "mongoose";

export interface MediaAttachment {
  url: string;
  publicId: string;
  type: 'image' | 'video' | 'document';
  filename: string;
  size: number;
}

export interface CommentDocument extends Document {
  task: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  attachments: MediaAttachment[];
  isEdited: boolean;
  editedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
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
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [{
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['image', 'video', 'document'],
        required: true,
      },
      filename: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
    }],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const CommentModel = mongoose.model<CommentDocument>("Comment", commentSchema);

export default CommentModel;