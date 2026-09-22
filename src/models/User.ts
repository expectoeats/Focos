import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    timezone: { type: String, default: "Asia/Kolkata" },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
