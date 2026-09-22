import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError, validateBody } from "@/lib/api-handler";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().max(200).optional().default(""),
  icon: z.string().optional().default("more-horizontal"),
  color: z.string().optional().default("#64748B"),
  order: z.number().optional(),
});

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    await connectDB();
    const categories = await Category.find({
      userId: authUser.userId,
      isActive: true,
    }).sort({ order: 1 });

    return successResponse({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const body = await request.json();
    const data = validateBody(createCategorySchema, body);

    await connectDB();

    const maxOrder = await Category.findOne({ userId: authUser.userId })
      .sort({ order: -1 })
      .select("order");

    const category = await Category.create({
      userId: authUser.userId,
      ...data,
      order: data.order ?? ((maxOrder?.order ?? -1) + 1),
      isActive: true,
    });

    return successResponse({ category }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
