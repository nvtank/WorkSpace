import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICourse {
  name: string;
  credits: number;
  grade?: number;
  difficulty?: "easy" | "medium" | "hard";
  status: "completed" | "planned";
}

export interface ISemester extends Document {
  userId: Types.ObjectId;
  name: string;
  order: number;
  courses: ICourse[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  name: { type: String, required: true, trim: true },
  credits: { type: Number, required: true, min: 0 },
  grade: { type: Number, min: 0 },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  status: { type: String, enum: ["completed", "planned"], default: "planned" },
});

const SemesterSchema = new Schema<ISemester>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    courses: [CourseSchema],
  },
  {
    timestamps: true,
  }
);

SemesterSchema.index({ userId: 1, order: 1 });

export const Semester: Model<ISemester> =
  mongoose.models.Semester || mongoose.model<ISemester>("Semester", SemesterSchema);
