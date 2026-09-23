"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getCategoryIcon } from "@/lib/icons";

interface DailyData {
  date: string;
  totalSeconds: number;
  totalSessions: number;
  longestSession: number;
  avgSessionDuration: number;
  categoryTotals: Array<{
    categoryId: string;
    name: string;
    color: string;
    icon: string;
    seconds: number;
  }>;
  timeline: Array<{
    category: string;
    color: string;
    start: string;
    end: string;
    durationSeconds: number;
  }>;
}

export default function DailyReportPage() {
  const [data, setData] = useState<DailyData | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/daily?date=${selectedDate}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  function formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  function formatTimeFull(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
  }

  function formatTimeOnly(isoString: string): string {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function changeDate(delta: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  }

  const displayDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Daily Report</h1>
          <p className="text-sm text-zinc-500">{displayDate}</p>
        </div>
        <Link href="/reports/weekly" className="text-sm text-zinc-400 hover:text-white transition-colors">
          Weekly →
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4 mb-6 flex-wrap">
        <button onClick={() => changeDate(-1)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800 transition-colors">← Prev</button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-zinc-600"
        />
        <button onClick={() => changeDate(1)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800 transition-colors">Next →</button>
        <button onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])} className="px-3 py-1.5 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700 transition-colors">Today</button>
      </div>

      {loading ? (
        <div className="text-zinc-500 text-sm py-12 text-center">Loading...</div>
      ) : !data ? (
        <div className="text-zinc-500 text-sm py-12 text-center">No data available</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Tracked</div>
            <div className="text-3xl font-bold font-mono">{formatTimeFull(data.totalSeconds)}</div>
            <div className="text-sm text-zinc-400 mt-1">
              {data.totalSessions} session{data.totalSessions !== 1 ? "s" : ""}
              {data.longestSession > 0 && ` · Longest: ${formatTime(data.longestSession)}`}
            </div>
          </div>

          {data.categoryTotals.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">Category Breakdown</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
                {data.categoryTotals.map((ct) => {
                  const CatIcon = getCategoryIcon(ct.name);
                  return (
                  <div key={ct.categoryId} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: ct.color + "20" }}
                      >
                        <CatIcon size={14} style={{ color: ct.color }} />
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

          {data.timeline.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">Timeline</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
                {data.timeline.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <div className="w-20 text-xs text-zinc-500 font-mono">
                      {formatTimeOnly(item.start)}
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="flex-1">
                      <span className="text-sm">{item.category}</span>
                    </div>
                    <span className="text-sm font-mono text-zinc-300">{formatTime(item.durationSeconds)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
