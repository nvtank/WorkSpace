import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  categoryId?: Types.ObjectId;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  color?: string;
  isRecurring: boolean;
  recurrenceRule?: {
    freq: "daily" | "weekly" | "custom";
    daysOfWeek?: number[];
    until?: Date;
  };
  templateId?: Types.ObjectId;
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
  };
  subtasks?: Array<{
    title: string;
    done: boolean;
  }>;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: String }, // "HH:mm"
    endTime: { type: String }, // "HH:mm"
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    color: { type: String },
    isRecurring: { type: Boolean, default: false },
    recurrenceRule: {
      freq: { type: String, enum: ["daily", "weekly", "custom"] },
      daysOfWeek: [{ type: Number }],
      until: { type: Date },
    },
    templateId: { type: Schema.Types.ObjectId, ref: "TaskTemplate" },
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
  {
    timestamps: true,
  }
);

TaskSchema.index({ userId: 1, date: -1 });
TaskSchema.index({ userId: 1, status: 1 });

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
