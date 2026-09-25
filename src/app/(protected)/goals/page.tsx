"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  Sparkles,
  Flame,
  AlertTriangle,
  Trophy,
  Crown,
  Skull,
  CheckCircle2,
  Calendar,
  Hourglass,
  Settings,
  ShieldAlert,
  Check,
} from "lucide-react";

interface PermanentGoal {
  title: string;
  targetDeadline: string;
  whyItMatters: string;
  stakes: string;
}

interface VisionData {
  permanentGoal: PermanentGoal;
  dailyTarget: string;
  weeklyTarget: string;
  monthlyTarget: string;
  yearlyTarget: string;
}

interface AnalysisReport {
  timelineA: {
    timeframe6m: string;
    timeframe2y: string;
    darkFate: string;
  };
  timelineB: {
    targetVision: string;
    expectedReality: string;
  };
  rootCauseDiagnosis: {
    coreMistake: string;
    notesEvidence: string;
    psychologicalTrigger: string;
  };
  psychologicalTruthBomb: {
    conceptTitle: string;
    explanation: string;
  };
  emergencyProtocol: string[];
  futureSelfMessage: string;
  coachVerdict?: string;
  survivalProbability?: number;
  driftScore?: number;
  totalSessionsAnalyzed?: number;
  createdAt?: string;
}

export default function GoalsPage() {
  const [vision, setVision] = useState<VisionData>({
    permanentGoal: {
      title: "",
      targetDeadline: "",
      whyItMatters: "",
      stakes: "",
    },
    dailyTarget: "",
    weeklyTarget: "",
    monthlyTarget: "",
    yearlyTarget: "",
  });

  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [editingPermanent, setEditingPermanent] = useState(false);
  const [permanentForm, setPermanentForm] = useState<PermanentGoal>({
    title: "",
    targetDeadline: "",
    whyItMatters: "",
    stakes: "",
  });

  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingStage, setAnalyzingStage] = useState("");
  const [savingGoals, setSavingGoals] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [checkedRules, setCheckedRules] = useState<Record<number, boolean>>({});
  const [warModePledged, setWarModePledged] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [visionRes, reportRes] = await Promise.all([
          fetch("/api/vision-goals").then((r) => r.json()),
          fetch("/api/analyze-future").then((r) => r.json()),
        ]);

        if (visionRes.success && visionRes.data?.vision) {
          const v = visionRes.data.vision;
          const loadedVision: VisionData = {
            permanentGoal: {
              title: v.permanentGoal?.title || "",
              targetDeadline: v.permanentGoal?.targetDeadline || "",
              whyItMatters: v.permanentGoal?.whyItMatters || "",
              stakes: v.permanentGoal?.stakes || "",
            },
            dailyTarget: v.dailyTarget || "",
            weeklyTarget: v.weeklyTarget || "",
            monthlyTarget: v.monthlyTarget || "",
            yearlyTarget: v.yearlyTarget || "",
          };
          setVision(loadedVision);
          setPermanentForm(loadedVision.permanentGoal);
          if (!loadedVision.permanentGoal.title) {
            setEditingPermanent(true);
          }
        }

        if (reportRes.success && reportRes.data?.report) {
          setReport(reportRes.data.report);
        }
      } catch (err) {
        console.error("Failed to load goals data:", err);
      } finally {
        setLoadingInitial(false);
      }
    }

    loadData();
  }, []);

  async function handleSavePermanentGoal() {
    setSavingGoals(true);
    setErrorMsg("");
    try {
      const updatedVision = {
        ...vision,
        permanentGoal: permanentForm,
      };
      const res = await fetch("/api/vision-goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedVision),
      });
      const data = await res.json();
      if (data.success) {
        setVision(updatedVision);
        setEditingPermanent(false);
        setSaveMessage("Permanent Goal saved successfully! ✨");
        setTimeout(() => setSaveMessage(""), 3500);
      } else {
        setErrorMsg(data.error?.message || "Failed to save goal");
      }
    } catch {
      setErrorMsg("Network error saving permanent goal");
    } finally {
      setSavingGoals(false);
    }
  }

  async function handleSavePeriodTarget(value: string) {
    setSavingGoals(true);
    try {
      const fieldMap = {
        daily: "dailyTarget",
        weekly: "weeklyTarget",
        monthly: "monthlyTarget",
        yearly: "yearlyTarget",
      } as const;

      const updated = {
        ...vision,
        [fieldMap[activeTab]]: value,
      };
      setVision(updated);

      await fetch("/api/vision-goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("Error auto-saving target:", err);
    } finally {
      setSavingGoals(false);
    }
  }

  async function handleTriggerAnalysis() {
    setAnalyzing(true);
    setErrorMsg("");
    setWarModePledged(false);
    setAnalyzingStage("⚡ Pichle unedited sessions aur task notes scan ho rahe hain...");

    const stageTimer1 = setTimeout(() => {
      setAnalyzingStage("🔍 Subconscious rationalizations aur fake productivity unmask ho rahi hai...");
    }, 1500);

    const stageTimer2 = setTimeout(() => {
      setAnalyzingStage("⏳ 5-Saal ka Multiverse Divergence simulate ho raha hai (Timeline Alpha vs Omega)...");
    }, 3200);

    const stageTimer3 = setTimeout(() => {
      setAnalyzingStage("📡 Year 2031 se blackbox distress frequency intercept ho rahi hai...");
    }, 5200);

    try {
      const res = await fetch("/api/analyze-future", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success && data.data?.report) {
        setReport(data.data.report);
        // Smooth scroll to the results
        setTimeout(() => {
          document.getElementById("analysis-report-section")?.scrollIntoView({ behavior: "smooth" });
        }, 200);
      } else {
        setErrorMsg(data.error?.message || "Failed to generate AI analysis");
      }
    } catch {
      setErrorMsg("Network error during analysis. Check Gemini configuration.");
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setAnalyzing(false);
      setAnalyzingStage("");
    }
  }

  if (loadingInitial) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading goals...</p>
      </div>
    );
  }

  const drift = report?.driftScore ?? 65;
  const survival = report?.survivalProbability ?? Math.max(5, Math.min(95, 100 - drift));

  const driftColor =
    drift > 65
      ? { stroke: "#f43f5e", text: "text-rose-400", border: "border-rose-500/40", label: "Critical Drift" }
      : drift > 35
      ? { stroke: "#f59e0b", text: "text-amber-400", border: "border-amber-500/40", label: "Moderate Deviation" }
      : { stroke: "#10b981", text: "text-emerald-400", border: "border-emerald-500/40", label: "Target Aligned" };

  const survivalColor =
    survival < 30
      ? { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", label: "Critical Mortality" }
      : survival < 65
      ? { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "Borderline Survival" }
      : { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Dominant Victor" };

  const defconStatus =
    drift >= 70
      ? { label: "DEFCON 1: CRITICAL DELUSION", badge: "bg-rose-500/15 border-rose-500/40 text-rose-400" }
      : drift >= 40
      ? { label: "DEFCON 2: MODERATE DRIFT", badge: "bg-amber-500/15 border-amber-500/40 text-amber-400" }
      : { label: "DEFCON 3: SOVEREIGN ALIGNMENT", badge: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">

      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 h-48 md:h-56">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
          alt="Mountain — Goal & Aspiration"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-zinc-950/70" />
        <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-md">
              Future Reality Engine
            </span>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-700 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Goals &amp; North Star
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-lg">
              Set your ultimate targets and see where your daily habits are actually taking you.
            </p>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {saveMessage && (
        <div className="p-3 bg-zinc-900 border border-emerald-700/60 text-emerald-300 text-xs rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-zinc-900 border border-rose-700/60 text-rose-300 text-xs rounded-md flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: PERMANENT SUCCESS GOAL (NORTH STAR) */}
      <div className="rounded-lg border border-amber-500/30 bg-zinc-900 p-6 md:p-7">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">North Star</span>
              <span className="text-xs text-zinc-600">·</span>
              <span className="text-xs text-zinc-500">Non-Negotiable</span>
            </div>
            <h2 className="text-base font-semibold text-white">Permanent Success Goal</h2>
          </div>

          <button
            onClick={() => {
              if (editingPermanent) {
                setPermanentForm(vision.permanentGoal);
              }
              setEditingPermanent(!editingPermanent);
            }}
            className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors shrink-0"
          >
            {editingPermanent ? "Cancel" : "Edit Goal"}
          </button>
        </div>

        {editingPermanent ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ultimate Target Title</span>
                </label>
                <input
                  value={permanentForm.title}
                  onChange={(e) => setPermanentForm({ ...permanentForm, title: e.target.value })}
                  placeholder="e.g. Build ₹40 Lakhs/month Software Company, BMW Supercar, Financial Freedom"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Target Deadline / Age</span>
                </label>
                <input
                  value={permanentForm.targetDeadline}
                  onChange={(e) => setPermanentForm({ ...permanentForm, targetDeadline: e.target.value })}
                  placeholder="e.g. September 2027 / Age 26"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Kyu Chahiye? (Purpose &amp; Family Dreams)</span>
                </label>
                <textarea
                  value={permanentForm.whyItMatters}
                  onChange={(e) => setPermanentForm({ ...permanentForm, whyItMatters: e.target.value })}
                  rows={3}
                  placeholder="e.g. Mummy papa ke saare sapne pure karne hain, beheno ki shadi apne paiso se karni hai, gareebi se bahar aana hai..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 resize-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-rose-400 mb-1.5 flex items-center gap-1.5">
                  <Skull className="w-3.5 h-3.5 text-rose-500" />
                  <span>The High Stakes (Fail hone par kya anjaam hoga?)</span>
                </label>
                <textarea
                  value={permanentForm.stakes}
                  onChange={(e) => setPermanentForm({ ...permanentForm, stakes: e.target.value })}
                  rows={3}
                  placeholder="e.g. Compelled to do a low paying dead-end job, relatives ki baatein, family dreams crash..."
                  className="w-full bg-zinc-950 border border-rose-900/50 rounded-md p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500 resize-none transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleSavePermanentGoal}
                disabled={savingGoals || !permanentForm.title.trim()}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingGoals ? "Saving..." : "Save Permanent Goal"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {vision.permanentGoal.title ? (
              <>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {vision.permanentGoal.title}
                  </h3>
                  {vision.permanentGoal.targetDeadline && (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 text-amber-400 font-mono border border-zinc-700 flex items-center gap-1.5 shrink-0">
                      <Hourglass className="w-3 h-3" />
                      <span>{vision.permanentGoal.targetDeadline}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {vision.permanentGoal.whyItMatters && (
                    <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-500">Kyu Chahiye — Purpose</span>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                        {vision.permanentGoal.whyItMatters}
                      </p>
                    </div>
                  )}

                  {vision.permanentGoal.stakes && (
                    <div className="p-4 rounded-lg bg-zinc-950 border border-rose-900/40">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-xs font-semibold text-rose-500">High Stakes — Fail hone par</span>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                        {vision.permanentGoal.stakes}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-8 text-center space-y-3 border border-dashed border-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-500">
                  No permanent goal set yet. A clear North Star is mandatory.
                </p>
                <button
                  onClick={() => setEditingPermanent(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-md transition-colors"
                >
                  + Add Permanent Goal
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: PERIOD TARGETS */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 md:p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 border-l-2 border-amber-500 pl-3">
            <Target className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">Execution Targets</h2>
          </div>
          <span className="text-xs text-zinc-500 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${savingGoals ? "bg-amber-500" : "bg-emerald-500"}`} />
            <span>{savingGoals ? "Saving..." : "In sync"}</span>
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 gap-1 overflow-x-auto">
          {[
            { id: "daily", label: "Daily" },
            { id: "weekly", label: "Weekly" },
            { id: "monthly", label: "Monthly" },
            { id: "yearly", label: "Yearly" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2 capitalize">
            {activeTab} target &amp; non-negotiable focus:
          </label>
          <textarea
            key={activeTab}
            defaultValue={
              activeTab === "daily"
                ? vision.dailyTarget
                : activeTab === "weekly"
                ? vision.weeklyTarget
                : activeTab === "monthly"
                ? vision.monthlyTarget
                : vision.yearlyTarget
            }
            onBlur={(e) => handleSavePeriodTarget(e.target.value)}
            rows={3}
            placeholder={
              activeTab === "daily"
                ? "Aaj ke non-negotiable tasks: (e.g. Finish auth API & fix database queries, 4 hours deep work)"
                : activeTab === "weekly"
                ? "Is hafte ka bada milestone: (e.g. Complete core engine and test end-to-end flow)"
                : activeTab === "monthly"
                ? "Is mahine ka objective: (e.g. Launch beta version and get first 10 active users)"
                : "Is saal ka milestone: (e.g. Reach ₹50k MRR and quit freelancing)"
            }
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none transition-colors leading-relaxed"
          />
          <p className="text-xs text-zinc-600 mt-1.5 flex items-center gap-1.5">
            <Check className="w-3 h-3 text-emerald-500" />
            <span>Auto-saves when you click outside.</span>
          </p>
        </div>
      </div>

      {/* SECTION 3: ANALYZE BUTTON */}
      <div className="flex flex-col items-center gap-3 py-4">
        <button
          onClick={handleTriggerAnalysis}
          disabled={analyzing}
          className="inline-flex items-center gap-2.5 px-7 py-3 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Task Notes &amp; Future Divergence...</span>
            </>
          ) : (
            <>
              <Flame className="w-4 h-4" />
              <span>Analyze Future &amp; Reality (Strict Mode)</span>
            </>
          )}
        </button>

        {analyzing && (
          <p className="text-xs text-zinc-500 font-mono">
            {analyzingStage}
          </p>
        )}
      </div>

      {/* SECTION 4: ANALYSIS REPORT (MINIMALIST LUXURY ARCHITECTURE) */}
      {report && (
        <div id="analysis-report-section" className="space-y-6 pt-4">

          {/* 1. HERO REALITY DECREE & EXECUTIVE TELEMETRY */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6">
            {/* Minimalist Top Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 text-xs font-mono text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="tracking-wider uppercase font-medium text-zinc-400">
                  Reality Engine // Strict Mode Audit
                </span>
              </div>
              <div className="flex items-center gap-3">
                {report.totalSessionsAnalyzed !== undefined && (
                  <span>{report.totalSessionsAnalyzed} sessions audited</span>
                )}
                <span>·</span>
                <span className={drift > 65 ? "text-rose-400" : drift > 35 ? "text-amber-400" : "text-emerald-400"}>
                  {defconStatus.label}
                </span>
              </div>
            </div>

            {/* The Unflinching Reality Decree */}
            <div className="space-y-2 max-w-3xl">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 block">
                The Core Verdict
              </span>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white tracking-tight leading-snug">
                {report.coachVerdict || report.rootCauseDiagnosis.coreMistake}
              </h2>
            </div>

            {/* Minimal Executive Ledger Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-800/80 rounded-lg overflow-hidden border border-zinc-800/80">
              <div className="bg-zinc-950 p-4 space-y-1">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                  Survival Probability
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-mono font-bold ${survival < 35 ? "text-rose-400" : survival < 65 ? "text-amber-400" : "text-emerald-400"}`}>
                    {survival}%
                  </span>
                  <span className="text-xs text-zinc-500">
                    {survival < 35 ? "Critical risk" : survival < 65 ? "Borderline" : "Aligned"}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-950 p-4 space-y-1">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                  Habit Drift Index
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-mono font-bold ${drift > 65 ? "text-rose-400" : drift > 35 ? "text-amber-400" : "text-emerald-400"}`}>
                    {drift}%
                  </span>
                  <span className="text-xs text-zinc-500">
                    {drift > 65 ? "Severe deviation" : drift > 35 ? "Moderate" : "On track"}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-950 p-4 space-y-1">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                  Trajectory Vector
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-zinc-200">
                    {drift > 50 ? "Default Collapse (Timeline A)" : "Sovereign Target (Timeline B)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. DUAL TIMELINE: COMPARATIVE LEDGER */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* TIMELINE A: THE DEFAULT DRIFT */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <h3 className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                    Timeline A — The Default Drift
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-rose-400/90">
                  Zero habit change
                </span>
              </div>

              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">
                    Next 6 Months
                  </span>
                  <p className="text-zinc-300 leading-relaxed text-sm">
                    {report.timelineA.timeframe6m}
                  </p>
                </div>

                <div className="space-y-1 pt-3 border-t border-zinc-800/60">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">
                    Next 2–3 Years
                  </span>
                  <p className="text-zinc-300 leading-relaxed text-sm">
                    {report.timelineA.timeframe2y}
                  </p>
                </div>

                <div className="space-y-1 pt-3 border-t border-zinc-800/60">
                  <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wide">
                    Year 2031 — The Terminal State
                  </span>
                  <p className="text-zinc-300 leading-relaxed text-sm">
                    {report.timelineA.darkFate}
                  </p>
                </div>
              </div>
            </div>

            {/* TIMELINE B: THE SOVEREIGN POTENTIAL */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                    Timeline B — The Sovereign Target
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-400/90">
                  Full potential realized
                </span>
              </div>

              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">
                    The Realized Vision
                  </span>
                  <p className="text-zinc-300 leading-relaxed text-sm">
                    {report.timelineB.targetVision}
                  </p>
                </div>

                <div className="space-y-1 pt-3 border-t border-zinc-800/60">
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wide">
                    The Daily Standard Required
                  </span>
                  <p className="text-zinc-300 leading-relaxed text-sm">
                    {report.timelineB.expectedReality}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* 3. FORENSIC DIAGNOSIS & PSYCHOLOGICAL INSIGHT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Forensic Root Cause */}
            <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h3 className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                  Behavioral Forensic Audit
                </h3>
                <span className="text-[11px] font-mono text-zinc-500">
                  From logged task notes
                </span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">
                    Primary Behavioral Trap
                  </span>
                  <p className="text-white font-medium text-sm">
                    {report.rootCauseDiagnosis.coreMistake}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/60">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1.5">
                    Evidence From Notes
                  </span>
                  <p className="text-zinc-300 text-sm italic pl-3 border-l border-zinc-700 leading-relaxed">
                    &ldquo;{report.rootCauseDiagnosis.notesEvidence}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/60">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">
                    Subconscious Ego Defense
                  </span>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {report.rootCauseDiagnosis.psychologicalTrigger}
                  </p>
                </div>
              </div>
            </div>

            {/* Truth Bomb */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="border-b border-zinc-800/80 pb-3">
                  <h3 className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                    Cognitive Principle
                  </h3>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-white block">
                    {report.psychologicalTruthBomb.conceptTitle}
                  </span>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {report.psychologicalTruthBomb.explanation}
                  </p>
                </div>
              </div>

              <div className="text-[11px] font-mono text-zinc-600 pt-3 border-t border-zinc-800/60">
                Behavioral Science Principle
              </div>
            </div>

          </div>

          {/* 4. 72-HOUR WAR PROTOCOL */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                  72-Hour Non-Negotiable Protocol
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Mandatory execution contract for the next 3 days.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {Object.values(checkedRules).filter(Boolean).length} of {report.emergencyProtocol.length} completed
              </span>
            </div>

            <div className="space-y-2.5">
              {report.emergencyProtocol.map((rule, idx) => {
                const isChecked = !!checkedRules[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => setCheckedRules((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className={`flex items-start gap-3.5 p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isChecked
                        ? "bg-zinc-900/40 border-zinc-800/50 opacity-60"
                        : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? "bg-zinc-200 border-zinc-200 text-black"
                          : "border-zinc-700 bg-zinc-900"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-black stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-zinc-500 block mb-0.5">
                        Protocol 0{idx + 1}
                      </span>
                      <p className={`text-sm leading-relaxed ${isChecked ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                        {rule}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. A LETTER FROM YEAR 2031 (INTIMATE, UNBROKEN DOCUMENT) */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-5">
            <div className="border-b border-zinc-800/80 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  A Letter from Year 2031
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Written from the default timeline you are assembling right now.
                </p>
              </div>
              <span className="text-[11px] font-mono text-zinc-600">
                Timeline Alpha
              </span>
            </div>

            <div className="max-w-2xl py-2">
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed whitespace-pre-line font-normal">
                {report.futureSelfMessage}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-600">
              <span>Every session you skip or fake confirms this trajectory.</span>
              <span className="text-zinc-500">Focos Reality Mirror</span>
            </div>
          </div>

          {/* 6. COMMITMENT SEAL */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-center space-y-3">
            {warModePledged ? (
              <div className="space-y-1.5 py-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Protocol Active · Excuses Suspended</span>
                </span>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Aapne protocol commit kar liya hai. Agle 72 hours cold execution.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Report padhna asaan hai, follow karna mushkil. Commit to the 72-hour protocol now.
                </p>
                <button
                  onClick={() => setWarModePledged(true)}
                  className="px-5 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all shadow-sm active:scale-98"
                >
                  Commit to 72-Hour Protocol
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
