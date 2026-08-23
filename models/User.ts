import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string;
  timezone: string;
  gradeScale: {
    max: number;
    conversionTable: Array<{
      label: string;
      min: number;
      max: number;
      value: number;
    }>;
  };
  preferences: {
    theme: "light" | "dark" | "system";
    weekStartsOn: 0 | 1;
  };
  createdAt: Date;
  updatedAt: Date;
}

const defaultGradeScale = {
  max: 4.0,
  conversionTable: [
    { label: "A+", min: 9.0, max: 10.0, value: 4.0 },
    { label: "A", min: 8.5, max: 8.9, value: 4.0 },
    { label: "B+", min: 8.0, max: 8.4, value: 3.5 },
    { label: "B", min: 7.0, max: 7.9, value: 3.0 },
    { label: "C+", min: 6.5, max: 6.9, value: 2.5 },
    { label: "C", min: 5.5, max: 6.4, value: 2.0 },
    { label: "D+", min: 5.0, max: 5.4, value: 1.5 },
    { label: "D", min: 4.0, max: 4.9, value: 1.0 },
    { label: "F", min: 0.0, max: 3.9, value: 0.0 },
  ],
};

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String },
    timezone: { type: String, default: "Asia/Ho_Chi_Minh" },
    gradeScale: {
      max: { type: Number, default: 4.0 },
      conversionTable: [
        {
          label: { type: String, required: true },
          min: { type: Number, required: true },
          max: { type: Number, required: true },
          value: { type: Number, required: true },
        },
      ],
    },
    preferences: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
      weekStartsOn: { type: Number, enum: [0, 1], default: 1 },
    },
  },
  {
    timestamps: true,
  }
);

if (!UserSchema.path("gradeScale.conversionTable")) {
  UserSchema.path("gradeScale").default(() => defaultGradeScale);
}

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
