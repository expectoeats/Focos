import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-handler";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return errorResponse("UNAUTHORIZED", "Not authenticated", 401);
    }

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user) {
      return errorResponse("USER_NOT_FOUND", "User not found", 404);
    }

    return successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        profileContext: user.profileContext || {
          age: null,
          runway: "",
          currentSituation: "",
          coreWeaknesses: "",
          worstCaseFear: "",
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  timezone: z.string().optional(),
  profileContext: z
    .object({
      age: z.union([z.number(), z.null(), z.string().transform((v) => (v ? Number(v) : null))]).optional(),
      runway: z.string().optional(),
      currentSituation: z.string().optional(),
      coreWeaknesses: z.string().optional(),
      worstCaseFear: z.string().optional(),
    })
    .optional(),
});

export async function PATCH(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return errorResponse("UNAUTHORIZED", "Not authenticated", 401);
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    await connectDB();

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updatePayload.name = parsed.data.name;
    if (parsed.data.timezone !== undefined) updatePayload.timezone = parsed.data.timezone;
    if (parsed.data.profileContext !== undefined) {
      updatePayload.profileContext = parsed.data.profileContext;
    }

    const user = await User.findByIdAndUpdate(
      authUser.userId,
      { $set: updatePayload },
      { new: true }
    );

    if (!user) {
      return errorResponse("USER_NOT_FOUND", "User not found", 404);
    }

    return successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        profileContext: user.profileContext,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
