import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-handler";
import { getTodayString, getUserTimezone, splitSessionAcrossMidnight } from "@/lib/time";
import { format, subDays, startOfWeek, endOfWeek, parseISO } from "date-fns";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || getTodayString();

    await connectDB();
    const timezone = getUserTimezone();

    const weekStart = startOfWeek(parseISO(dateStr), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(parseISO(dateStr), { weekStartsOn: 1 });

    const start = new Date(weekStart);
    const end = new Date(weekEnd);

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

    const dailyData: Record<string, Record<string, number>> = {};
    const categoryTotals: Record<string, { seconds: number; name: string; color: string }> = {};
    let totalSeconds = 0;

    for (let i = 0; i < 7; i++) {
      const day = format(subDays(weekEnd, 6 - i), "yyyy-MM-dd");
      dailyData[day] = {};
    }

    for (const session of sessions) {
      const catId = session.categoryId._id.toString();
      const cat = categoryMap.get(catId);

      const splits = splitSessionAcrossMidnight(
        new Date(session.startedAt),
        new Date(session.endedAt!),
        timezone
      );

      for (const split of splits) {
        if (dailyData[split.date] !== undefined) {
          if (!dailyData[split.date][catId]) {
            dailyData[split.date][catId] = 0;
          }
          dailyData[split.date][catId] += split.durationSeconds;

          if (!categoryTotals[catId]) {
            categoryTotals[catId] = {
              seconds: 0,
              name: cat?.name || "Unknown",
              color: cat?.color || "#64748B",
            };
          }
          categoryTotals[catId].seconds += split.durationSeconds;
          totalSeconds += split.durationSeconds;
        }
      }
    }

    const dailyTotals = Object.entries(dailyData).map(([date, cats]) => ({
      date,
      totalSeconds: Object.values(cats).reduce((s, v) => s + v, 0),
      categories: Object.entries(cats).map(([catId, seconds]) => ({
        categoryId: catId,
        seconds,
      })),
    }));

    return successResponse({
      weekStart: format(weekStart, "yyyy-MM-dd"),
      weekEnd: format(weekEnd, "yyyy-MM-dd"),
      totalSeconds,
      totalSessions: sessions.length,
      dailyTotals,
      categoryTotals: Object.entries(categoryTotals)
        .map(([id, data]) => ({ categoryId: id, ...data }))
        .sort((a, b) => b.seconds - a.seconds),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
