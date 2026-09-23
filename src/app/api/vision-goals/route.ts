import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import VisionGoal from "@/models/VisionGoal";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-handler";

const saveVisionGoalSchema = z.object({
  permanentGoal: z
    .object({
      title: z.string().default(""),
      targetDeadline: z.string().default(""),
      whyItMatters: z.string().default(""),
      stakes: z.string().default(""),
    })
    .optional(),
  dailyTarget: z.string().default(""),
  weeklyTarget: z.string().default(""),
  monthlyTarget: z.string().default(""),
  yearlyTarget: z.string().default(""),
});

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    await connectDB();

    let vision = await VisionGoal.findOne({ userId: authUser.userId }).lean();

    if (!vision) {
      vision = {
        userId: authUser.userId,
        permanentGoal: {
          title: "",
          targetDeadline: "",
          whyItMatters: "",
          stakes: "",
        },
        dailyTarget: "",
        weeklyTarget: "",
        monthlyTarget: "",
        yearlyTarget: "",
      };
    }

    return successResponse({ vision });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const body = await request.json();
    const parsed = saveVisionGoalSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    await connectDB();

    const vision = await VisionGoal.findOneAndUpdate(
      { userId: authUser.userId },
      {
        $set: {
          userId: authUser.userId,
          ...(parsed.data.permanentGoal ? { permanentGoal: parsed.data.permanentGoal } : {}),
          dailyTarget: parsed.data.dailyTarget ?? "",
          weeklyTarget: parsed.data.weeklyTarget ?? "",
          monthlyTarget: parsed.data.monthlyTarget ?? "",
          yearlyTarget: parsed.data.yearlyTarget ?? "",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return successResponse({ vision });
  } catch (error) {
    return handleApiError(error);
  }
}
