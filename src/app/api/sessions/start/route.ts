import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError, validateBody } from "@/lib/api-handler";
import { getCurrentServerTime } from "@/lib/time";

const startSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
});

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const body = await request.json();
    const { categoryId } = validateBody(startSchema, body);

    await connectDB();

    const category = await Category.findOne({
      _id: categoryId,
      userId: authUser.userId,
      isActive: true,
    });

    if (!category) {
      return errorResponse("CATEGORY_NOT_FOUND", "Category not found", 404);
    }

    const existingActive = await Session.findOne({
      userId: authUser.userId,
      status: "running",
    });

    if (existingActive) {
      return errorResponse(
        "ACTIVE_SESSION_EXISTS",
        "Another session is currently running. Stop it first or confirm switching.",
        409
      );
    }

    const serverTime = getCurrentServerTime();

    const session = await Session.create({
      userId: authUser.userId,
      categoryId,
      startedAt: serverTime,
      status: "running",
      timezone: "Asia/Kolkata",
    });

    return successResponse({ session }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
