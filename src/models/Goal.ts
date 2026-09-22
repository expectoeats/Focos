import mongoose, { Schema, Document } from "mongoose";

export interface IGoal extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  dailyMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    dailyMinutes: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

GoalSchema.index({ userId: 1, categoryId: 1 }, { unique: true });

const Goal = mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);

export default Goal;
