import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITaskTemplateItem {
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  categoryId?: Types.ObjectId;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  color?: string;
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
  };
  subtasks?: Array<{
    title: string;
    done: boolean;
  }>;
  order: number;
}

export interface ITaskTemplate extends Document {
  userId: Types.ObjectId;
  name: string;
  tasks: ITaskTemplateItem[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskTemplateSchema = new Schema<ITaskTemplate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    tasks: [
      {
        title: { type: String, required: true },
        description: { type: String },
        startTime: { type: String },
        endTime: { type: String },
        categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
        priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
        status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
        color: { type: String },
        reminder: {
          enabled: { type: Boolean, default: false },
          minutesBefore: { type: Number, default: 15 },
        },
        subtasks: [
          {
            title: { type: String, required: true },
            done: { type: Boolean, default: false },
          },
        ],
        order: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const TaskTemplate: Model<ITaskTemplate> =
  mongoose.models.TaskTemplate || mongoose.model<ITaskTemplate>("TaskTemplate", TaskTemplateSchema);
