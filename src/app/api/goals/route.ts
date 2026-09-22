import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Goal from "@/models/Goal";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError, validateBody } from "@/lib/api-handler";

const createGoalSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  dailyMinutes: z.number().min(1, "Daily minutes must be at least 1"),
});

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    await connectDB();

    const goals = await Goal.find({
      userId: authUser.userId,
      isActive: true,
    })
      .populate("categoryId", "name icon color")
      .lean();

    return successResponse({ goals });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const body = await request.json();
    const data = validateBody(createGoalSchema, body);

    await connectDB();

    const category = await Category.findOne({
      _id: data.categoryId,
      userId: authUser.userId,
      isActive: true,
    });

    if (!category) {
      return errorResponse("CATEGORY_NOT_FOUND", "Category not found", 404);
    }

    const existingGoal = await Goal.findOne({
      userId: authUser.userId,
      categoryId: data.categoryId,
      isActive: true,
    });

    if (existingGoal) {
      existingGoal.dailyMinutes = data.dailyMinutes;
      await existingGoal.save();
      return successResponse({ goal: existingGoal });
    }

    const goal = await Goal.create({
      userId: authUser.userId,
      categoryId: data.categoryId,
      dailyMinutes: data.dailyMinutes,
      isActive: true,
    });

    return successResponse({ goal }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
