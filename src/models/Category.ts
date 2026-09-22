import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "more-horizontal" },
    color: { type: String, default: "#64748B" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ userId: 1, order: 1 });
CategorySchema.index({ userId: 1, isActive: 1 });

const Category =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
