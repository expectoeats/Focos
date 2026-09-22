import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Goal from "@/models/Goal";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-handler";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: authUser.userId },
      { $set: { dailyMinutes: body.dailyMinutes } },
      { new: true }
    );

    if (!goal) {
      return errorResponse("NOT_FOUND", "Goal not found", 404);
    }

    return successResponse({ goal });
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

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: authUser.userId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!goal) {
      return errorResponse("NOT_FOUND", "Goal not found", 404);
    }

    return successResponse({ message: "Goal deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
