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
  failedLoginAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const defaultGradeScale = {
  max: 4.0,
  conversionTable: [
    { label: "A", min: 3.5, max: 4.0, value: 4.0 },
    { label: "B", min: 2.5, max: 3.49, value: 3.0 },
    { label: "C", min: 1.5, max: 2.49, value: 2.0 },
    { label: "D", min: 1.0, max: 1.49, value: 1.0 },
    { label: "F", min: 0.0, max: 0.99, value: 0.0 },
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
      type: {
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
      default: () => defaultGradeScale,
    },
    preferences: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
      weekStartsOn: { type: Number, enum: [0, 1], default: 1 },
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
