import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import Category from "@/models/Category";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-handler";
import { getTodayString, getUserTimezone, splitSessionAcrossMidnight } from "@/lib/time";
import { format, subDays, parseISO } from "date-fns";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || getTodayString();
    const month = searchParams.get("month"); // 0-11

    await connectDB();
    const timezone = getUserTimezone();

    const baseDate = parseISO(dateStr);
    const targetMonth = month !== null ? parseInt(month) : baseDate.getMonth();
    const targetYear = baseDate.getFullYear();

    const monthStart = new Date(targetYear, targetMonth, 1);
    const monthEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const sessions = await Session.find({
      userId: authUser.userId,
      status: "completed",
      startedAt: { $gte: monthStart, $lte: monthEnd },
    })
      .populate("categoryId", "name icon color")
      .lean();

    const categories = await Category.find({
      userId: authUser.userId,
      isActive: true,
    }).lean();

    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

    const categoryTotals: Record<string, { seconds: number; name: string; color: string }> = {};
    const dailyTotals: Record<string, number> = {};
    let totalSeconds = 0;
    let longestSession = 0;

    for (let d = 1; d <= monthEnd.getDate(); d++) {
      const dayStr = format(new Date(targetYear, targetMonth, d), "yyyy-MM-dd");
      dailyTotals[dayStr] = 0;
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
        if (dailyTotals[split.date] !== undefined) {
          dailyTotals[split.date] += split.durationSeconds;

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

      if (session.durationSeconds && session.durationSeconds > longestSession) {
        longestSession = session.durationSeconds;
      }
    }

    const daysInMonth = monthEnd.getDate();
    const avgDailyTracked = totalSeconds / daysInMonth;

    return successResponse({
      month: targetMonth,
      year: targetYear,
      totalSeconds,
      totalSessions: sessions.length,
      longestSession,
      avgDailyTracked,
      daysInMonth,
      dailyTotals: Object.entries(dailyTotals)
        .map(([date, seconds]) => ({ date, seconds }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      categoryTotals: Object.entries(categoryTotals)
        .map(([id, data]) => ({ categoryId: id, ...data }))
        .sort((a, b) => b.seconds - a.seconds),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
