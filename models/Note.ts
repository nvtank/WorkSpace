import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INote extends Document {
  userId: Types.ObjectId;
  content: string;
  images: string[];
  tags: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    tags: [{ type: String, trim: true }],
    isPinned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

NoteSchema.index({ userId: 1, isPinned: -1, createdAt: -1 });

export const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
