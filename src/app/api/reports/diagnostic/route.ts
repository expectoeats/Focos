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

    const sessions = await Session.find({
      userId: authUser.userId,
      status: "completed",
    })
      .populate("categoryId", "name icon color")
      .lean();

    const categories = await Category.find({
      userId: authUser.userId,
      isActive: true,
    }).lean();

    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

    const categoryTotals: Record<string, { seconds: number; name: string; color: string; count: number }> = {};
    let totalSeconds = 0;
    let longestSession = 0;
    let shortestSession = Infinity;
    let totalSessions = 0;

    const monthlyData: Record<string, number> = {};
    const weeklyData: Record<string, number> = {};
    const dailyData: Record<string, number> = {};

    for (const session of sessions) {
      const catId = session.categoryId._id.toString();
      const cat = categoryMap.get(catId);
      const duration = session.durationSeconds || 0;

      if (!categoryTotals[catId]) {
        categoryTotals[catId] = {
          seconds: 0,
          name: cat?.name || "Unknown",
          color: cat?.color || "#64748B",
          count: 0,
        };
      }
      categoryTotals[catId].seconds += duration;
      categoryTotals[catId].count += 1;

      totalSeconds += duration;
      totalSessions += 1;

      if (duration > longestSession) longestSession = duration;
      if (duration < shortestSession && duration > 0) shortestSession = duration;

      const sessionDate = new Date(session.startedAt);
      const monthKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, "0")}`;
      const weekKey = `W${Math.ceil(sessionDate.getDate() / 7)}`;
      const dayKey = sessionDate.toISOString().split("T")[0];

      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + duration;
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + duration;
      dailyData[dayKey] = (dailyData[dayKey] || 0) + duration;
    }

    const avgSessionDuration = totalSessions > 0 ? totalSeconds / totalSessions : 0;

    const totalDays = Object.keys(dailyData).length;
    const avgDailyTracked = totalDays > 0 ? totalSeconds / totalDays : 0;

    const sortedCategories = Object.entries(categoryTotals)
      .map(([id, data]) => ({
        categoryId: id,
        ...data,
        percentage: totalSeconds > 0 ? (data.seconds / totalSeconds) * 100 : 0,
      }))
      .sort((a, b) => b.seconds - a.seconds);

    return successResponse({
      totalSeconds,
      totalSessions,
      avgSessionDuration,
      longestSession,
      shortestSession: shortestSession === Infinity ? 0 : shortestSession,
      avgDailyTracked,
      totalDays,
      categoryTotals: sortedCategories,
      monthlyTrends: Object.entries(monthlyData)
        .map(([month, seconds]) => ({ month, seconds }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      weeklyTrends: Object.entries(weeklyData)
        .map(([week, seconds]) => ({ week, seconds }))
        .sort((a, b) => a.week.localeCompare(b.week)),
      dailyTrends: Object.entries(dailyData)
        .map(([date, seconds]) => ({ date, seconds }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
