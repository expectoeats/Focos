"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getCategoryIcon } from "@/lib/icons";

interface WeeklyData {
  weekStart: string;
  weekEnd: string;
  totalSeconds: number;
  totalSessions: number;
  dailyTotals: Array<{
    date: string;
    totalSeconds: number;
    categories: Array<{ categoryId: string; seconds: number }>;
  }>;
  categoryTotals: Array<{
    categoryId: string;
    name: string;
    color: string;
    seconds: number;
  }>;
}

export default function WeeklyReportPage() {
  const [data, setData] = useState<WeeklyData | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/weekly?date=${selectedDate}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

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

  function changeDate(delta: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta * 7);
    setSelectedDate(d.toISOString().split("T")[0]);
  }

  const chartData = data?.dailyTotals.map((d) => ({
    name: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" }),
    hours: Math.round((d.totalSeconds / 3600) * 10) / 10,
    date: d.date,
  })) || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Weekly Report</h1>
          <p className="text-sm text-zinc-500">
            {data ? `${data.weekStart} to ${data.weekEnd}` : ""}
          </p>
        </div>
        <Link href="/reports/monthly" className="text-sm text-zinc-400 hover:text-white transition-colors">
          Monthly →
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => changeDate(-1)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800 transition-colors">← Prev Week</button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-zinc-600"
        />
        <button onClick={() => changeDate(1)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800 transition-colors">Next Week →</button>
        <button onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])} className="px-3 py-1.5 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700 transition-colors">This Week</button>
      </div>

      {loading ? (
        <div className="text-zinc-500 text-sm py-12 text-center">Loading...</div>
      ) : !data ? (
        <div className="text-zinc-500 text-sm py-12 text-center">No data</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Week Total</div>
            <div className="text-3xl font-bold font-mono">{formatTimeFull(data.totalSeconds)}</div>
            <div className="text-sm text-zinc-400 mt-1">{data.totalSessions} sessions</div>
          </div>

          {chartData.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wide">Daily Hours</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(value) => [`${value}h`, "Hours"]}
                  />
                  <Bar dataKey="hours" fill="#ffffff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {data.categoryTotals.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">Category Totals</h2>
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
                      <span className="text-sm">{ct.name}</span>
                    </div>
                    <span className="text-sm font-mono text-zinc-300">{formatTime(ct.seconds)}</span>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">Daily Breakdown</h2>
            <div className="space-y-2">
              {data.dailyTotals.map((day) => {
                const dayName = new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
                return (
                  <div key={day.date} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{dayName}</span>
                      <span className="text-sm font-mono text-zinc-300">{formatTime(day.totalSeconds)}</span>
                    </div>
                    {day.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {day.categories.map((c) => {
                          const cat = data.categoryTotals.find((ct) => ct.categoryId === c.categoryId);
                          return (
                            <span key={c.categoryId} className="text-xs bg-zinc-800 px-2 py-0.5 rounded">
                              {cat?.name}: {formatTime(c.seconds)}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
