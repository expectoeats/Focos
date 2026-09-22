import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-handler";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    await connectDB();

    const activeSession = await Session.findOne({
      userId: authUser.userId,
      status: "running",
    }).lean();

    if (!activeSession) {
      return successResponse({ session: null });
    }

    const category = await Category.findById(activeSession.categoryId)
      .select("name icon color")
      .lean();

    return successResponse({
      session: {
        ...activeSession,
        categoryId: category || { _id: activeSession.categoryId, name: "Unknown", icon: "help-circle", color: "#64748B" },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
