import mongoose, { Schema, Document } from "mongoose";

export interface IUserProfileContext {
  age?: number;
  runway?: string;
  currentSituation?: string;
  coreWeaknesses?: string;
  worstCaseFear?: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  timezone: string;
  profileContext?: IUserProfileContext;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    timezone: { type: String, default: "Asia/Kolkata" },
    profileContext: {
      age: { type: Number, default: null },
      runway: { type: String, default: "" },
      currentSituation: { type: String, default: "" },
      coreWeaknesses: { type: String, default: "" },
      worstCaseFear: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
