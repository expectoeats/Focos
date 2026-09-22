import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError, validateBody } from "@/lib/api-handler";

const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const { id } = await params;

    const body = await request.json();
    const data = validateBody(updateCategorySchema, body);

    await connectDB();

    const category = await Category.findOneAndUpdate(
      { _id: id, userId: authUser.userId },
      { $set: data },
      { new: true }
    );

    if (!category) {
      return errorResponse("NOT_FOUND", "Category not found", 404);
    }

    return successResponse({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const { id } = await params;

    await connectDB();

    const category = await Category.findOneAndUpdate(
      { _id: id, userId: authUser.userId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!category) {
      return errorResponse("NOT_FOUND", "Category not found", 404);
    }

    return successResponse({ message: "Category deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
