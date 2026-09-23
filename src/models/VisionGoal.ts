import mongoose, { Schema, Document } from "mongoose";

export interface IPermanentGoal {
  title: string;
  targetDeadline: string;
  whyItMatters: string;
  stakes: string;
}

export interface IVisionGoal extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  permanentGoal: IPermanentGoal;
  dailyTarget: string;
  weeklyTarget: string;
  monthlyTarget: string;
  yearlyTarget: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisionGoalSchema = new Schema<IVisionGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    permanentGoal: {
      title: { type: String, default: "" },
      targetDeadline: { type: String, default: "" },
      whyItMatters: { type: String, default: "" },
      stakes: { type: String, default: "" },
    },
    dailyTarget: { type: String, default: "" },
    weeklyTarget: { type: String, default: "" },
    monthlyTarget: { type: String, default: "" },
    yearlyTarget: { type: String, default: "" },
  },
  { timestamps: true }
);

VisionGoalSchema.index({ userId: 1 }, { unique: true });

const VisionGoal =
  mongoose.models.VisionGoal ||
  mongoose.model<IVisionGoal>("VisionGoal", VisionGoalSchema);

export default VisionGoal;
