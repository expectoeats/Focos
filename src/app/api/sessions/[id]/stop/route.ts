import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-handler";
import { getCurrentServerTime, calculateDuration } from "@/lib/time";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const { id } = await params;

    await connectDB();

    const session = await Session.findOne({
      _id: id,
      userId: authUser.userId,
      status: "running",
    });

    if (!session) {
      return errorResponse("SESSION_NOT_FOUND", "No active session found to stop", 404);
    }

    const serverTime = getCurrentServerTime();
    const duration = calculateDuration(session.startedAt, serverTime);

    session.endedAt = serverTime;
    session.durationSeconds = duration;
    session.status = "completed";
    await session.save();

    return successResponse({ session });
  } catch (error) {
    return handleApiError(error);
  }
}
