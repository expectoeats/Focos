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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-500 animate-spin blur-md opacity-70" />
          <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center absolute inset-0 m-auto border border-zinc-800">
            <Zap className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
        </div>
        <p className="text-zinc-400 text-sm font-medium tracking-wide animate-pulse">
          Syncing your focus command center...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-xl px-4 py-3 flex items-center justify-between shadow-lg shadow-rose-950/40">
          <div className="flex items-center gap-2.5">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-200 text-lg leading-none px-1">
            ✕
          </button>
        </div>
      )}

      {/* TOP HERO & PLAYFUL MOMENTUM HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        {/* Ambient glow orbs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border bg-gradient-to-r ${greeting.badgeColor}">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{greeting.badge}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              {greeting.title}
            </h1>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
              {greeting.subtitle}
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 flex-shrink-0">
            {/* Total Today */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-inner flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider">Today&apos;s Focus</span>
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <div className="text-2xl font-black font-mono tracking-tight text-white">
                {formatTime(totalToday)}
              </div>
              <div className="mt-2 w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${targetPercent}%` }}
                />
              </div>
            </div>

            {/* Target Gauge */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-inner flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider">Daily Goal</span>
                <Target className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-black font-mono tracking-tight text-amber-300">
                {targetPercent}%
              </div>
              <span className="text-[11px] text-zinc-500 truncate mt-1">Target: 6h Deep Work</span>
            </div>

            {/* Active Streak / State */}
            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-inner flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider">Status</span>
                <Flame className={`w-4 h-4 ${activeSession ? "text-rose-500 animate-pulse" : "text-zinc-600"}`} />
              </div>
              <div className="text-lg font-bold truncate text-white">
                {activeSession ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    In Flow
                  </span>
                ) : (
                  <span className="text-zinc-400">Idle / Ready</span>
                )}
              </div>
              <span className="text-[11px] text-zinc-500 mt-1">
                {activeSession ? "Timer ticking live" : "Pick a category below"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE TRACKING HERO WIDGET (Pulsating Command Deck) */}
      {activeSession && ActiveIcon && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-rose-500/40 bg-gradient-to-r from-zinc-900 via-rose-950/20 to-zinc-900 p-5 md:p-6 shadow-[0_0_50px_rgba(225,29,72,0.15)] animate-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Active Category Details */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg relative"
                style={{
                  backgroundColor: `${activeSession.categoryId?.color || "#e11d48"}25`,
                  border: `1.5px solid ${activeSession.categoryId?.color || "#e11d48"}50`,
                }}
              >
                <ActiveIcon size={26} style={{ color: activeSession.categoryId?.color || "#e11d48" }} />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Live Session Active
                  </span>
                  {/* Playful Animated Equalizer Bars */}
                  <div className="flex items-end gap-0.5 h-3.5">
                    <span className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:0ms] h-full" />
                    <span className="w-1 bg-amber-500 rounded-full animate-bounce [animation-delay:150ms] h-2/3" />
                    <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:300ms] h-4/5" />
                  </div>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-white mt-0.5">
                  {activeSession.categoryId?.name || "Unknown"}
                </h2>

                <p className="text-xs text-zinc-400">
                  Started at {new Date(activeSession.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Right: Giant Stopwatch & Stop Button */}
            <div className="flex items-center justify-between md:justify-end gap-5 sm:gap-8 border-t md:border-t-0 border-zinc-800/80 pt-4 md:pt-0">
              <div className="text-left md:text-right">
                <div className="text-xs text-zinc-400 uppercase tracking-widest font-mono">
                  Elapsed Time
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-rose-200 drop-shadow-md">
                  {formatTimer(elapsedSeconds)}
                </div>
              </div>

              <button
                onClick={() => handleStop(activeSession._id)}
                disabled={stoppingId === activeSession._id}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-rose-950/60 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>{stoppingId === activeSession._id ? "Finalizing..." : "STOP & LOG"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES GRID (Playful Tactile Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Focus Categories
            </h2>
          </div>
          <span className="text-xs text-zinc-500">Click any card to start flow</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {categories.map((cat) => {
            const isActive = activeSession?.categoryId?._id === cat._id;
            const time = getCategoryTime(cat._id);
            const isStarting = startingId === cat._id;
            const Icon = getCategoryIcon(cat.name);
            const percentageOfTotal = totalToday > 0 ? Math.round((time / totalToday) * 100) : 0;

            return (
              <div
                key={cat._id}
                className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between ${
                  isActive
                    ? "bg-zinc-900 border-2 border-rose-500/80 shadow-[0_0_25px_rgba(225,29,72,0.25)] ring-2 ring-rose-500/20 scale-[1.02]"
                    : "bg-zinc-900/80 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                {/* Background subtle tint */}
                <div
                  className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
                  style={{ backgroundColor: cat.color }}
                />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${cat.color}20`,
                        border: `1px solid ${cat.color}40`,
                      }}
                    >
                      <Icon size={20} style={{ color: cat.color }} />
                    </div>

                    {percentageOfTotal > 0 && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-800/90 text-zinc-300 border border-zinc-700/60">
                        {percentageOfTotal}%
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white truncate group-hover:text-zinc-100">
                    {cat.name}
                  </h3>

                  <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{formatTime(time)}</span>
                  </div>

                  {isActive && activeSession && (
                    <div className="mt-2.5 p-2 rounded-lg bg-black/60 border border-rose-500/30 text-center">
                      <div className="text-xs text-rose-400 font-bold uppercase tracking-wider">
                        Running
                      </div>
                      <div className="text-base font-black font-mono text-white">
                        {formatTimer(elapsedSeconds)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60">
                  <button
                    onClick={() => (isActive ? handleStop(activeSession!._id) : handleStart(cat._id))}
                    disabled={isStarting || (stoppingId === activeSession?._id && isActive)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                      isActive
                        ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white"
                    } disabled:opacity-50`}
                  >
                    {isStarting ? (
                      <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : isActive ? (
                      <>
                        <Square className="w-3 h-3 fill-white" />
                        <span>STOP</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>START</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TODAY'S TIME DISTRIBUTION VISUAL TIMELINE */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 md:p-7 space-y-5 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Today&apos;s Focus Breakdown
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Visualize how your energy is allocated across work, skills, and breaks.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-zinc-500 uppercase tracking-widest block">Total Tracked</span>
            <span className="text-lg font-black font-mono text-emerald-400">{formatTime(totalToday)}</span>
          </div>
        </div>

        {totalToday > 0 ? (
          <div className="space-y-4">
            {/* Multi-segment distribution bar */}
            <div className="w-full h-4 bg-zinc-950 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-zinc-800 shadow-inner">
              {categoryTimes.map((ct) => {
                const widthPercent = (ct.seconds / totalToday) * 100;
                if (widthPercent < 0.5) return null;
                return (
                  <div
                    key={ct.categoryId}
                    className="h-full rounded-sm transition-all duration-700 hover:brightness-125 cursor-pointer relative group"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: ct.color || "#64748B",
                    }}
                    title={`${ct.name}: ${formatTime(ct.seconds)} (${Math.round(widthPercent)}%)`}
                  />
                );
              })}
            </div>

            {/* List breakdown pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
              {categoryTimes.map((ct) => {
                const SumIcon = getCategoryIcon(ct.name);
                const percent = Math.round((ct.seconds / totalToday) * 100);
                return (
                  <div
                    key={ct.categoryId}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${ct.color}20` }}
                      >
                        <SumIcon size={14} style={{ color: ct.color }} />
                      </div>
                      <span className="text-xs font-medium text-zinc-200 truncate">{ct.name}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs flex-shrink-0">
                      <span className="text-zinc-400">{formatTime(ct.seconds)}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Playful Empty State SVG */
          <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/40 flex items-center justify-center text-3xl shadow-inner">
              🚀
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-sm font-bold text-white">Abhi tak koi session track nahi hua</h3>
              <p className="text-xs text-zinc-400">
                Upar di gayi categories me se kisi ek ka <span className="text-amber-400 font-semibold">START</span> button dabayein aur apna flow shuru karein!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* GAMIFIED MILESTONES & QUICK WINS */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/60 to-zinc-950 p-6 md:p-7 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Today&apos;s Focus Achievements
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              title: "Spark Starter",
              desc: "First 30m logged",
              unlocked: totalToday >= 1800,
              icon: "⚡",
              color: "amber",
            },
            {
              title: "Deep Worker",
              desc: "2 hours completed",
              unlocked: totalToday >= 7200,
              icon: "🛡️",
              color: "blue",
            },
            {
              title: "Beast Mode",
              desc: "4 hours milestone",
              unlocked: totalToday >= 14400,
              icon: "🔥",
              color: "rose",
            },
            {
              title: "Legendary Day",
              desc: "6+ hours crushed",
              unlocked: totalToday >= 21600,
              icon: "👑",
              color: "emerald",
            },
          ].map((milestone, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all ${
                milestone.unlocked
                  ? "bg-zinc-950 border-amber-500/40 shadow-lg shadow-amber-950/20"
                  : "bg-zinc-950/40 border-zinc-800/60 opacity-50 grayscale"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl">{milestone.icon}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    milestone.unlocked
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {milestone.unlocked ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
              <div className="text-xs font-bold text-white">{milestone.title}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">{milestone.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SWITCH SESSION MODAL */}
      {switchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">
                🔄
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Switch Active Session?</h3>
                <p className="text-xs text-zinc-400">Smooth transition between focus tracks</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
              <span className="text-amber-400 font-semibold">{activeSession?.categoryId?.name}</span> stop hokar{" "}
              <span className="text-emerald-400 font-semibold">{switchModal.targetCategoryName}</span> turant shuru ho jayega.
            </p>

            <div className="flex gap-2.5 justify-end pt-2">
              <button
                onClick={() => setSwitchModal(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSwitch}
                className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black rounded-xl transition-all shadow-lg shadow-amber-950/50"
              >
                Confirm & Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SESSION COMPLETE NOTE MODAL */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 md:p-7 w-full max-w-lg shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
                📝
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Session Completed
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{noteModal.categoryName}</h3>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Aapne is session me kya accomplish kiya? (Task Note):
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-2xl p-3.5 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none h-28 leading-relaxed placeholder:text-zinc-600 shadow-inner"
                placeholder="e.g. Fixed Next.js route API, finished 3 client calls, solved authentication token bug..."
                autoFocus
              />
              <p className="text-[11px] text-zinc-500 mt-1.5">
                💡 Yeh notes aapke &quot;Goals & Reality&quot; AI Engine me analyze hote hain.
              </p>
            </div>

            <div className="flex gap-2.5 justify-end pt-1">
              <button
                onClick={() => {
                  setNoteModal(null);
                  setNoteText("");
                  fetchData();
                }}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Skip For Now
              </button>
              <button
                onClick={handleSaveNote}
                disabled={noteSaving}
                className="px-6 py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black rounded-xl shadow-lg shadow-emerald-950/50 disabled:opacity-50 transition-all"
              >
                {noteSaving ? "Saving..." : "Save Session Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
