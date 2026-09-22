"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { getCategoryIcon } from "@/lib/icons";

interface DiagnosticData {
  totalSeconds: number;
  totalSessions: number;
  avgSessionDuration: number;
  longestSession: number;
  shortestSession: number;
  avgDailyTracked: number;
  totalDays: number;
  categoryTotals: Array<{
    categoryId: string;
    name: string;
    color: string;
    seconds: number;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{ month: string; seconds: number }>;
  dailyTrends: Array<{ date: string; seconds: number }>;
}

export default function DiagnosticPage() {
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/diagnostic")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function formatTime(s: number): string {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  function formatTimeFull(s: number): string {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
  }

  const COLORS = ["#ffffff", "#a1a1aa", "#71717a", "#52525b", "#3f3f46", "#27272a", "#18181b"];

  const pieData = data?.categoryTotals.map((ct) => ({
    name: ct.name,
    value: ct.seconds,
  })) || [];

  const monthlyChartData = data?.monthlyTrends.map((m) => ({
    name: m.month,
    hours: Math.round((m.seconds / 3600) * 10) / 10,
  })) || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Lifetime Diagnostic</h1>
        <p className="text-sm text-zinc-500">Objective analytics from your recorded data</p>
      </div>

      {loading ? (
        <div className="text-zinc-500 text-sm py-12 text-center">Loading...</div>
      ) : !data ? (
        <div className="text-zinc-500 text-sm py-12 text-center">No data available yet</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Tracked", value: formatTimeFull(data.totalSeconds) },
              { label: "Total Sessions", value: data.totalSessions.toString() },
              { label: "Avg Daily", value: formatTime(data.avgDailyTracked) },
              { label: "Total Days", value: data.totalDays.toString() },
            ].map((stat) => (
              <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{stat.label}</div>
                <div className="text-xl font-bold font-mono">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Avg Session", value: formatTime(data.avgSessionDuration) },
              { label: "Longest Session", value: formatTime(data.longestSession) },
              { label: "Shortest Session", value: formatTime(data.shortestSession) },
            ].map((stat) => (
              <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{stat.label}</div>
                <div className="text-lg font-bold font-mono">{stat.value}</div>
              </div>
            ))}
          </div>

          {data.categoryTotals.length > 0 && (
            <>
              <div>
                <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">Time Allocation</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
                  {data.categoryTotals.map((ct) => {
                    const CtIcon = getCategoryIcon(ct.name);
                    return (
                    <div key={ct.categoryId} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: ct.color + "20" }}
                        >
                          <CtIcon size={14} style={{ color: ct.color }} />
                        </div>
                        <div>
                          <span className="text-sm">{ct.name}</span>
                          <span className="text-xs text-zinc-500 ml-2">({ct.count} sessions)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-zinc-500">{ct.percentage.toFixed(1)}%</span>
                        <span className="text-sm font-mono text-zinc-300">{formatTime(ct.seconds)}</span>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wide">Category Distribution</h3>
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="50%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(value) => [formatTime(Number(value))]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {data.categoryTotals.map((ct, i) => (
                      <div key={ct.categoryId} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm">{ct.name}</span>
                        <span className="text-sm text-zinc-400 font-mono ml-auto">{formatTime(ct.seconds)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {monthlyChartData.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wide">Monthly Trends</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value) => [`${value}h`, "Hours"]}
                  />
                  <Bar dataKey="hours" fill="#ffffff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
