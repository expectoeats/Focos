import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError, validateBody } from "@/lib/api-handler";

const reorderSchema = z.object({
  categoryIds: z.array(z.string()).min(1, "At least one category ID required"),
});

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const body = await request.json();
    const { categoryIds } = validateBody(reorderSchema, body);

    await connectDB();

    const updates = categoryIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, userId: authUser.userId },
        update: { $set: { order: index } },
      },
    }));

    await Category.bulkWrite(updates);

    const categories = await Category.find({
      userId: authUser.userId,
      isActive: true,
    }).sort({ order: 1 });

    return successResponse({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}
