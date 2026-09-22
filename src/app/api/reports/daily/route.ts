import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-handler";
import {
  getTodayString,
  getDateRange,
  splitSessionAcrossMidnight,
  calculateDuration,
  getUserTimezone,
} from "@/lib/time";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || getTodayString();

    await connectDB();

    const timezone = getUserTimezone();
    const { start, end } = getDateRange(date, timezone);

    const sessions = await Session.find({
      userId: authUser.userId,
      status: "completed",
      startedAt: { $gte: start, $lte: end },
    })
      .populate("categoryId", "name icon color")
      .lean();

    const categories = await Category.find({
      userId: authUser.userId,
      isActive: true,
    }).lean();

    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));
    const categoryTotals: Record<string, { seconds: number; name: string; color: string; icon: string }> = {};

    let totalSeconds = 0;
    let longestSession = 0;
    const allSplitSessions: Array<{
      category: string;
      color: string;
      icon: string;
      start: string;
      end: string;
      durationSeconds: number;
    }> = [];

    for (const session of sessions) {
      const catId = session.categoryId._id.toString();
      const cat = categoryMap.get(catId);

      const splits = splitSessionAcrossMidnight(
        new Date(session.startedAt),
        new Date(session.endedAt!),
        timezone
      );

      const dateSplits = splits.filter((s) => s.date === date);
      const dayDuration = dateSplits.reduce((sum, s) => sum + s.durationSeconds, 0);

      if (dayDuration > 0) {
        if (!categoryTotals[catId]) {
          categoryTotals[catId] = {
            seconds: 0,
            name: cat?.name || "Unknown",
            color: cat?.color || "#64748B",
            icon: cat?.icon || "more-horizontal",
          };
        }
        categoryTotals[catId].seconds += dayDuration;
        totalSeconds += dayDuration;

        if (session.durationSeconds && session.durationSeconds > longestSession) {
          longestSession = session.durationSeconds;
        }

        allSplitSessions.push({
          category: cat?.name || "Unknown",
          color: cat?.color || "#64748B",
          icon: cat?.icon || "more-horizontal",
          start: new Date(session.startedAt).toISOString(),
          end: new Date(session.endedAt!).toISOString(),
          durationSeconds: dayDuration,
        });
      }
    }

    allSplitSessions.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const avgSessionDuration = sessions.length > 0 ? totalSeconds / sessions.length : 0;

    return successResponse({
      date,
      totalSeconds,
      totalSessions: sessions.length,
      longestSession,
      avgSessionDuration,
      categoryTotals: Object.entries(categoryTotals)
        .map(([id, data]) => ({ categoryId: id, ...data }))
        .sort((a, b) => b.seconds - a.seconds),
      timeline: allSplitSessions,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
