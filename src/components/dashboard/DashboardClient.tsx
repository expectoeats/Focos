"use client";

import { useState, useEffect, useCallback } from "react";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
          <button onClick={() => setError("")} className="ml-2 text-red-300 hover:text-red-200">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-zinc-500">Where did you spend your time today?</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-500 uppercase tracking-wide">Today&apos;s Total</div>
          <div className="text-2xl font-bold font-mono tabular-nums">{formatTime(totalToday)}</div>
        </div>
      </div>

      {activeSession && ActiveIcon && (
        <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: (activeSession.categoryId?.color || "#64748B") + "20" }}
              >
                <ActiveIcon size={20} style={{ color: activeSession.categoryId?.color || "#64748B" }} />
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide">Now Tracking</div>
                <div className="text-lg font-semibold">{activeSession.categoryId?.name || "Unknown"}</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-3xl font-bold font-mono tabular-nums text-white">
                  {formatTimer(elapsedSeconds)}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Started {new Date(activeSession.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <button
                onClick={() => handleStop(activeSession._id)}
                disabled={stoppingId === activeSession._id}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {stoppingId === activeSession._id ? "Stopping..." : "STOP"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const isActive = activeSession?.categoryId?._id === cat._id;
            const time = getCategoryTime(cat._id);
            const isStarting = startingId === cat._id;
            const Icon = getCategoryIcon(cat.name);

            return (
              <div
                key={cat._id}
                className={`bg-zinc-900 border rounded-xl p-4 transition-all ${
                  isActive ? "border-red-600/50 ring-1 ring-red-600/20" : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cat.color + "20" }}
                  >
                    <Icon size={18} style={{ color: cat.color }} />
                  </div>
                  <span className="text-sm font-medium truncate">{cat.name}</span>
                </div>

                <div className="text-xs text-zinc-500 mb-1">
                  Today: <span className="text-zinc-300 font-mono">{formatTime(time)}</span>
                </div>

                {isActive && activeSession && (
                  <div className="text-lg font-bold font-mono tabular-nums text-white mb-2">
                    {formatTimer(elapsedSeconds)}
                  </div>
                )}

                <button
                  onClick={() => (isActive ? handleStop(activeSession!._id) : handleStart(cat._id))}
                  disabled={isStarting || (stoppingId === activeSession?._id && isActive)}
                  className={`w-full mt-1 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50 ${
                    isActive
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-600/30"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {isStarting ? "Starting..." : isActive ? "STOP" : "START"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {categoryTimes.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">Today&apos;s Summary</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {categoryTimes.map((ct) => {
              const SumIcon = getCategoryIcon(ct.name);
              return (
                <div key={ct.categoryId} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: ct.color + "20" }}
                    >
                      <SumIcon size={14} style={{ color: ct.color }} />
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

      {switchModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Switch Session</h3>
            <p className="text-sm text-zinc-400 mb-4">
              {activeSession?.categoryId?.name} is currently running. Stop it and start {switchModal.targetCategoryName}?
            </p>
            <p className="text-xs text-zinc-500 mb-4">
              The current session will be finalized and you&apos;ll be asked to add a note.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSwitchModal(null)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSwitch}
                className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {noteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-1">Session Complete</h3>
            <p className="text-sm text-zinc-400 mb-4">{noteModal.categoryName}</p>

            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              What did you do during this session?
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-500 resize-none h-24"
              placeholder="Describe what you accomplished..."
            />

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => {
                  setNoteModal(null);
                  setNoteText("");
                  fetchData();
                }}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSaveNote}
                disabled={noteSaving}
                className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-colors"
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
