import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError, validateBody } from "@/lib/api-handler";

const noteSchema = z.object({
  note: z.string().max(2000, "Note is too long"),
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
    const { note } = validateBody(noteSchema, body);

    await connectDB();

    const session = await Session.findOneAndUpdate(
      { _id: id, userId: authUser.userId },
      { $set: { note } },
      { new: true }
    );

    if (!session) {
      return errorResponse("NOT_FOUND", "Session not found", 404);
    }

    return successResponse({ session });
  } catch (error) {
    return handleApiError(error);
  }
}
