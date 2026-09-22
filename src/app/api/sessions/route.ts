import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-handler";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  categoryId: z.string().optional(),
  status: z.enum(["running", "completed"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = querySchema.safeParse(query);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    const { page, limit, categoryId, status, startDate, endDate } = parsed.data;

    await connectDB();

    const filter: Record<string, unknown> = { userId: authUser.userId };
    if (categoryId) filter.categoryId = categoryId;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.startedAt = {};
      if (startDate) (filter.startedAt as Record<string, Date>).$gte = new Date(startDate);
      if (endDate) (filter.startedAt as Record<string, Date>).$lte = new Date(endDate);
    }

    const [sessions, total] = await Promise.all([
      Session.find(filter)
        .populate("categoryId", "name icon color")
        .sort({ startedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Session.countDocuments(filter),
    ]);

    return successResponse({
      sessions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
