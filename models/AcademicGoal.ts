import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAcademicGoal extends Document {
  userId: Types.ObjectId;
  targetGPA: number;
  totalCreditsRequired: number;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicGoalSchema = new Schema<IAcademicGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    targetGPA: { type: Number, required: true, default: 3.5 },
    totalCreditsRequired: { type: Number, required: true, default: 120 },
  },
  {
    timestamps: true,
  }
);

export const AcademicGoal: Model<IAcademicGoal> =
  mongoose.models.AcademicGoal ||
  mongoose.model<IAcademicGoal>("AcademicGoal", AcademicGoalSchema);
