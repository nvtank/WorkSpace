import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITracker extends Document {
  userId: Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  unitType: "duration" | "currency" | "count" | "custom";
  unitLabel?: string;
  goal?: {
    period: "daily" | "weekly" | "monthly";
    targetValue: number;
  };
  order: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrackerSchema = new Schema<ITracker>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "Activity" },
    color: { type: String, default: "#4a154b" },
    unitType: {
      type: String,
      enum: ["duration", "currency", "count", "custom"],
      default: "count",
    },
    unitLabel: { type: String },
    goal: {
      period: { type: String, enum: ["daily", "weekly", "monthly"] },
      targetValue: { type: Number },
    },
    order: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

TrackerSchema.index({ userId: 1, order: 1 });

export const Tracker: Model<ITracker> =
  mongoose.models.Tracker || mongoose.model<ITracker>("Tracker", TrackerSchema);
