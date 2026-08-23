import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITrackerEntry extends Document {
  userId: Types.ObjectId;
  trackerId: Types.ObjectId;
  value: number;
  type?: "expense" | "income" | "default";
  category?: string;
  note?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TrackerEntrySchema = new Schema<ITrackerEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    trackerId: { type: Schema.Types.ObjectId, ref: "Tracker", required: true, index: true },
    value: { type: Number, required: true },
    type: { type: String, enum: ["expense", "income", "default"], default: "expense" },
    category: { type: String, trim: true },
    note: { type: String, trim: true },
    date: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

TrackerEntrySchema.index({ userId: 1, date: -1 });
TrackerEntrySchema.index({ trackerId: 1, date: -1 });
TrackerEntrySchema.index({ userId: 1, trackerId: 1, date: -1 });

export const TrackerEntry: Model<ITrackerEntry> =
  mongoose.models.TrackerEntry || mongoose.model<ITrackerEntry>("TrackerEntry", TrackerEntrySchema);
