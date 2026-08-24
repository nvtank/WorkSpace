import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IJournal extends Document {
  userId: Types.ObjectId;
  date: Date;
  mood: 1 | 2 | 3 | 4 | 5;
  content: string;
  prompt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new Schema<IJournal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    mood: { type: Number, required: true, enum: [1, 2, 3, 4, 5], min: 1, max: 5 },
    content: { type: String, required: true, trim: true },
    prompt: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// Unique index: mỗi user chỉ có 1 entry mỗi ngày
JournalSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Journal: Model<IJournal> =
  mongoose.models.Journal || mongoose.model<IJournal>("Journal", JournalSchema);
