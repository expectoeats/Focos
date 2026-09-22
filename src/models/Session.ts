import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  startedAt: Date;
  endedAt: Date | null;
  durationSeconds: number | null;
  note: string;
  status: "running" | "completed";
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: null },
    note: { type: String, default: "" },
    status: { type: String, enum: ["running", "completed"], default: "running" },
    timezone: { type: String, default: "Asia/Kolkata" },
  },
  { timestamps: true }
);

SessionSchema.index({ userId: 1, status: 1 });
SessionSchema.index({ userId: 1, startedAt: -1 });
SessionSchema.index({ userId: 1, categoryId: 1, startedAt: -1 });
SessionSchema.index({ userId: 1, categoryId: 1 });
SessionSchema.index({ status: 1, userId: 1 });

const Session = mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);

export default Session;
