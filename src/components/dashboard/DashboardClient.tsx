"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Briefcase,
  Building2,
  Search,
  Code2,
  GraduationCap,
  PhoneCall,
  Coffee,
  Tv,
  ClipboardList,
  Footprints,
  Droplets,
  Sparkles,
  Bath,
  Moon,
  HelpCircle,
  Zap,
  Target,
  Heart,
  Music,
  Dumbbell,
  Utensils,
  Car,
  Home,
  Users,
  Star,
  Play,
  Square,
  Flame,
  Award,
  Clock,
  Activity,
  ArrowRight,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "job 1": Briefcase,
  "job 2": Building2,
  "client hunting": Search,
  "agency project development": Code2,
  "skill learning": GraduationCap,
  "lead follow-up": PhoneCall,
  break: Coffee,
  entertainment: Tv,
  "regular tasks": ClipboardList,
  walking: Footprints,
  bathing: Droplets,
  brushing: Sparkles,
  toilet: Bath,
  sleep: Moon,
  other: HelpCircle,
  focus: Zap,
  goals: Target,
  health: Heart,
  music: Music,
  exercise: Dumbbell,
  food: Utensils,
  commute: Car,
  home: Home,
  meetings: Users,
  priority: Star,
};

function getCategoryIcon(categoryName: string): LucideIcon {
  return ICON_MAP[categoryName.toLowerCase()] || HelpCircle;
}

interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
}

interface Session {
  _id: string;
  categoryId: { _id: string; name: string; icon: string; color: string };
  startedAt: string;
  status: string;
}

interface CategoryTime {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  seconds: number;
}

export default function DashboardClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [categoryTimes, setCategoryTimes] = useState<CategoryTime[]>([]);
  const [totalToday, setTotalToday] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [noteModal, setNoteModal] = useState<{ sessionId: string; categoryName: string } | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [switchModal, setSwitchModal] = useState<{ targetCategoryId: string; targetCategoryName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stoppingId, setStoppingId] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [catRes, activeRes, reportRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/sessions/active"),
        fetch("/api/reports/daily"),
      ]);

      const catData = await catRes.json();
      const activeData = await activeRes.json();
      const reportData = await reportRes.json();

      if (catData.success) setCategories(catData.data.categories);
      if (activeData.success) setActiveSession(activeData.data.session);
      if (reportData.success) {
        setCategoryTimes(reportData.data.categoryTotals);
        setTotalToday(reportData.data.totalSeconds);
      }
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const startedAt = new Date(activeSession.startedAt).getTime();

    function tick() {
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - startedAt) / 1000));
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    if (!activeSession) return;

    function handleVisibility() {
      if (document.visibilityState === "visible" && activeSession) {
        const startedAt = new Date(activeSession.startedAt).getTime();
        const now = Date.now();
        setElapsedSeconds(Math.floor((now - startedAt) / 1000));
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [activeSession]);

  async function handleStart(categoryId: string) {
    if (startingId) return;

    if (activeSession) {
      setSwitchModal({ targetCategoryId: categoryId, targetCategoryName: categories.find((c) => c._id === categoryId)?.name || "" });
      return;
    }

    setStartingId(categoryId);
    setError("");

    try {
      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.error.code === "ACTIVE_SESSION_EXISTS") {
          fetchData();
          return;
        }
        setError(data.error.message);
        return;
      }

      setActiveSession(data.data.session);
      setElapsedSeconds(0);
    } catch {
      setError("Failed to start session. Check your connection.");
    } finally {
      setStartingId(null);
    }
  }

  async function handleStop(sessionId: string) {
    if (stoppingId) return;

    setStoppingId(sessionId);
    setError("");

    try {
      const res = await fetch(`/api/sessions/${sessionId}/stop`, { method: "POST" });
      const data = await res.json();

      if (!data.success) {
        setError(data.error.message);
        return;
      }

      const stoppedCategory = activeSession?.categoryId?.name || "Session";
      setActiveSession(null);
      setElapsedSeconds(0);

      setNoteModal({ sessionId: data.data.session._id, categoryName: stoppedCategory });
    } catch {
      setError("Failed to stop session. Check your connection.");
    } finally {
      setStoppingId(null);
    }
  }

  async function handleSaveNote() {
    if (!noteModal || noteSaving) return;

    setNoteSaving(true);

    try {
      const res = await fetch(`/api/sessions/${noteModal.sessionId}/note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText }),
      });

      const data = await res.json();
      if (data.success) {
        setNoteModal(null);
        setNoteText("");
        fetchData();
      } else {
        setError("Failed to save note. Session is saved without note.");
        setNoteModal(null);
        setNoteText("");
        fetchData();
      }
    } catch {
      setError("Failed to save note. Session is preserved.");
      setNoteModal(null);
      setNoteText("");
      fetchData();
    } finally {
      setNoteSaving(false);
    }
  }

  async function handleConfirmSwitch() {
    if (!switchModal || !activeSession) return;

    const currentSessionId = activeSession._id;
    setSwitchModal(null);

    try {
      const stopRes = await fetch(`/api/sessions/${currentSessionId}/stop`, { method: "POST" });
      const stopData = await stopRes.json();

      if (!stopData.success) {
        setError(stopData.error.message);
        return;
      }

      setActiveSession(null);
      setElapsedSeconds(0);

      const currentCategoryName = activeSession.categoryId?.name || "Session";
      setNoteModal({
        sessionId: stopData.data.session._id,
        categoryName: currentCategoryName,
      });

      setStartingId(switchModal.targetCategoryId);
      const startRes = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: switchModal.targetCategoryId }),
      });
      const startData = await startRes.json();

      if (startData.success) {
        setActiveSession(startData.data.session);
        setElapsedSeconds(0);
      }
    } catch {
      setError("Failed to switch sessions");
    } finally {
      setStartingId(null);
    }
  }

  function formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
  }

  function formatTimer(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function getCategoryTime(categoryId: string): number {
    return categoryTimes.find((ct) => ct.categoryId === categoryId)?.seconds || 0;
  }

  const ActiveIcon = activeSession ? getCategoryIcon(activeSession.categoryId?.name || "") : null;

  // Dynamic greeting based on current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      return {
        title: "Good Morning, Achiever! 🌅",
        subtitle: "Ek naya din, naye opportunities. Aaj ka pehla deep focus shuru karein!",
        badge: "Morning Clarity Mode",
        badgeColor: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        title: "Power Afternoon! ⚡",
        subtitle: "Distractions hatao aur continuous flow state maintain karo.",
        badge: "Peak Momentum Zone",
        badgeColor: "from-rose-500/20 to-purple-500/20 text-rose-400 border-rose-500/30",
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        title: "Evening Grind! 🔥",
        subtitle: "Consistency hi winner aur quitter me farq banati hai.",
        badge: "Deep Execution Hours",
        badgeColor: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30",
      };
    } else {
      return {
        title: "Midnight Mastery 🌙",
        subtitle: "Jab poori duniya so rahi hoti hai, legends apna future craft karte hain.",
        badge: "Stealth Focus Engine",
        badgeColor: "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
      };
    }
  }, []);

  // Goal benchmark: default 6 hours (21600 seconds) target
  const dailyTargetSeconds = 6 * 3600;
  const targetPercent = Math.min(100, Math.round((totalToday / dailyTargetSeconds) * 100));

  // ─── LOADING STATE ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
        </div>
        <p className="text-zinc-500 text-sm">Syncing your focus data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

      {/* ── ERROR BANNER ──────────────────────────────────────────────────── */}
      {error && (
        <div className="border-l-4 border-red-600 bg-zinc-900 text-zinc-200 text-sm px-4 py-3 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-zinc-500 hover:text-zinc-200 ml-4 leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── HERO HEADER ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 min-h-[180px]">
        {/* Real Unsplash background photo — subtle dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80')" }}
        />
        {/* Dark overlay on top of photo */}
        <div className="absolute inset-0 bg-zinc-950/80 pointer-events-none" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: greeting */}
          <div className="space-y-1.5">
            <span className="inline-block text-xs font-medium text-amber-500 border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 rounded-md">
              {greeting.badge}
            </span>
            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              {greeting.title}
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              {greeting.subtitle}
            </p>
          </div>

          {/* Right: quick stats — three bordered boxes */}
          <div className="flex flex-row gap-0 flex-shrink-0 border border-zinc-800 rounded-lg overflow-hidden divide-x divide-zinc-800">
            {/* Today's Focus */}
            <div className="px-5 py-4 bg-zinc-900 flex flex-col gap-0.5 min-w-[110px]">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Today&apos;s Focus</span>
              <span className="text-xl font-semibold font-mono text-white tabular-nums">
                {formatTime(totalToday)}
              </span>
              <div className="mt-1.5 w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${targetPercent}%`, backgroundColor: "#F5A623" }}
                />
              </div>
            </div>

            {/* Daily Goal */}
            <div className="px-5 py-4 bg-zinc-900 flex flex-col gap-0.5 min-w-[100px]">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Daily Goal</span>
              <span className="text-xl font-semibold font-mono tabular-nums" style={{ color: "#F5A623" }}>
                {targetPercent}%
              </span>
              <span className="text-[11px] text-zinc-600 mt-1">Target: 6h</span>
            </div>

            {/* Status */}
            <div className="px-5 py-4 bg-zinc-900 flex flex-col gap-0.5 min-w-[100px]">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Status</span>
              {activeSession ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  In Flow
                </span>
              ) : (
                <span className="text-sm font-semibold text-zinc-500">Idle</span>
              )}
              <span className="text-[11px] text-zinc-600 mt-1">
                {activeSession ? "Timer running" : "Pick a category"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIVE SESSION BANNER ─────────────────────────────────────────── */}
      {activeSession && ActiveIcon && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 border-l-4 overflow-hidden"
          style={{ borderLeftColor: activeSession.categoryId?.color || "#E54B4B" }}
        >
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: icon + name + start time */}
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${activeSession.categoryId?.color || "#E54B4B"}18`,
                  border: `1px solid ${activeSession.categoryId?.color || "#E54B4B"}40`,
                }}
              >
                <ActiveIcon size={18} style={{ color: activeSession.categoryId?.color || "#E54B4B" }} />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Live Session
                  </span>
                </div>
                <h2 className="text-base font-semibold text-white">
                  {activeSession.categoryId?.name || "Unknown"}
                </h2>
                <p className="text-xs text-zinc-500">
                  Started at {new Date(activeSession.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Right: timer + stop button */}
            <div className="flex items-center gap-5 border-t md:border-t-0 border-zinc-800 pt-4 md:pt-0">
              <div>
                <div className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono mb-0.5">Elapsed</div>
                <div className="text-3xl font-mono font-semibold tabular-nums text-white tracking-tight">
                  {formatTimer(elapsedSeconds)}
                </div>
              </div>

              <button
                onClick={() => handleStop(activeSession._id)}
                disabled={stoppingId === activeSession._id}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#E54B4B" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#c93d3d"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#E54B4B"; }}
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>{stoppingId === activeSession._id ? "Stopping..." : "Stop & Log"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORIES GRID ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white border-l-2 border-amber-500 pl-3">
            Focus Categories
          </h2>
          <span className="text-xs text-zinc-600">Select to start tracking</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {categories.map((cat) => {
            const isActive = activeSession?.categoryId?._id === cat._id;
            const time = getCategoryTime(cat._id);
            const isStarting = startingId === cat._id;
            const Icon = getCategoryIcon(cat.name);
            const percentageOfTotal = totalToday > 0 ? Math.round((time / totalToday) * 100) : 0;

            return (
              <div
                key={cat._id}
                className={`relative rounded-lg border bg-zinc-900 flex flex-col justify-between transition-colors ${
                  isActive
                    ? "border-zinc-600"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
                style={isActive ? { borderLeftColor: cat.color, borderLeftWidth: "3px" } : {}}
              >
                <div className="p-4">
                  {/* Icon row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${cat.color}18`,
                        border: `1px solid ${cat.color}35`,
                      }}
                    >
                      <Icon size={16} style={{ color: cat.color }} />
                    </div>

                    {percentageOfTotal > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {percentageOfTotal}%
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-medium text-white truncate leading-tight">
                    {cat.name}
                  </h3>

                  <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(time)}</span>
                  </div>

                  {isActive && activeSession && (
                    <div className="mt-2 p-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-center">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Running</div>
                      <div className="text-sm font-mono font-semibold text-white tabular-nums">
                        {formatTimer(elapsedSeconds)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Button */}
                <div className="px-4 pb-4 pt-0">
                  <button
                    onClick={() => (isActive ? handleStop(activeSession!._id) : handleStart(cat._id))}
                    disabled={isStarting || (stoppingId === activeSession?._id && isActive)}
                    className={`w-full py-1.5 px-3 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                      isActive
                        ? "text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    }`}
                    style={isActive ? { backgroundColor: "#E54B4B" } : {}}
                    onMouseEnter={(e) => {
                      if (isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#c93d3d";
                    }}
                    onMouseLeave={(e) => {
                      if (isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#E54B4B";
                    }}
                  >
                    {isStarting ? (
                      <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : isActive ? (
                      <>
                        <Square className="w-3 h-3 fill-white" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Start</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TODAY'S TIME BREAKDOWN ────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white border-l-2 border-amber-500 pl-3">
              Today&apos;s Focus Breakdown
            </h2>
            <p className="text-xs text-zinc-500 mt-1 pl-3">
              How your time is distributed across categories.
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-[11px] text-zinc-600 uppercase tracking-wider block">Total tracked</span>
            <span className="text-base font-semibold font-mono text-white">{formatTime(totalToday)}</span>
          </div>
        </div>

        {totalToday > 0 ? (
          <div className="space-y-4">
            {/* Horizontal segmented bar */}
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden flex gap-px">
              {categoryTimes.map((ct) => {
                const widthPercent = (ct.seconds / totalToday) * 100;
                if (widthPercent < 0.5) return null;
                return (
                  <div
                    key={ct.categoryId}
                    className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: ct.color || "#52525b",
                    }}
                    title={`${ct.name}: ${formatTime(ct.seconds)} (${Math.round(widthPercent)}%)`}
                  />
                );
              })}
            </div>

            {/* Flat list breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
              {categoryTimes.map((ct) => {
                const SumIcon = getCategoryIcon(ct.name);
                const percent = Math.round((ct.seconds / totalToday) * 100);
                return (
                  <div
                    key={ct.categoryId}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${ct.color}18` }}
                      >
                        <SumIcon size={12} style={{ color: ct.color }} />
                      </div>
                      <span className="text-xs text-zinc-300 truncate">{ct.name}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs flex-shrink-0 ml-2">
                      <span className="text-zinc-500">{formatTime(ct.seconds)}</span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px]">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="py-10 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl">
              🚀
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">No sessions logged yet</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Start a category above to begin tracking your focus.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── ACHIEVEMENTS ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm font-semibold text-white border-l-2 border-amber-500 pl-3 mb-4">
          Today&apos;s Milestones
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            {
              title: "Spark Starter",
              desc: "First 30m logged",
              unlocked: totalToday >= 1800,
              icon: "⚡",
            },
            {
              title: "Deep Worker",
              desc: "2 hours completed",
              unlocked: totalToday >= 7200,
              icon: "🛡️",
            },
            {
              title: "Beast Mode",
              desc: "4 hours milestone",
              unlocked: totalToday >= 14400,
              icon: "🔥",
            },
            {
              title: "Legendary Day",
              desc: "6+ hours crushed",
              unlocked: totalToday >= 21600,
              icon: "👑",
            },
          ].map((milestone, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border transition-colors ${
                milestone.unlocked
                  ? "bg-zinc-950 border-amber-500/30"
                  : "bg-zinc-950 border-zinc-800 opacity-40 grayscale"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{milestone.icon}</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    milestone.unlocked
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                      : "bg-zinc-800 text-zinc-600"
                  }`}
                >
                  {milestone.unlocked ? "✓ Done" : "Locked"}
                </span>
              </div>
              <div className="text-xs font-semibold text-white">{milestone.title}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">{milestone.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SWITCH SESSION MODAL ─────────────────────────────────────────── */}
      {switchModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-semibold text-white">Switch active session?</h3>
              <p className="text-xs text-zinc-500 mt-0.5">The current session will be stopped first.</p>
            </div>

            <div className="text-sm text-zinc-300 bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 leading-relaxed">
              <span className="font-semibold" style={{ color: "#F5A623" }}>{activeSession?.categoryId?.name}</span>
              {" "}will stop, and{" "}
              <span className="font-semibold text-emerald-400">{switchModal.targetCategoryName}</span>
              {" "}will start immediately.
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setSwitchModal(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSwitch}
                className="px-5 py-2 text-xs font-semibold text-white rounded-md transition-colors"
                style={{ backgroundColor: "#F5A623", color: "#000" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#d98f1a"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F5A623"; }}
              >
                Confirm & Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTE MODAL ───────────────────────────────────────────────────── */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Session Completed
              </span>
              <h3 className="text-base font-semibold text-white mt-1.5">{noteModal.categoryName}</h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                What did you accomplish? (optional note)
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-zinc-500 resize-none h-28 leading-relaxed placeholder:text-zinc-600"
                placeholder="e.g. Fixed the auth bug, finished 3 client calls..."
                autoFocus
              />
              <p className="text-[11px] text-zinc-600 mt-1">
                Notes are analyzed by the Goals & Reality AI engine.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => {
                  setNoteModal(null);
                  setNoteText("");
                  fetchData();
                }}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Skip for Now
              </button>
              <button
                onClick={handleSaveNote}
                disabled={noteSaving}
                className="px-5 py-2 text-xs font-semibold text-white rounded-md transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#E54B4B" }}
                onMouseEnter={(e) => { if (!noteSaving) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#c93d3d"; }}
                onMouseLeave={(e) => { if (!noteSaving) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#E54B4B"; }}
              >
                {noteSaving ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
