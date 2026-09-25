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
  ShieldCheck,
  Compass,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Hourglass,
  Brain,
  Zap,
  Radio,
  Settings,
  ShieldAlert,
  HelpCircle,
  Eye,
  Rocket,
  Check,
  Swords,
  Activity,
  Terminal,
  Volume2,
  Lock,
  Crosshair,
  TrendingDown,
  TrendingUp,
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

      {/* SECTION 4: ANALYSIS REPORT */}
      {report && (
        <div id="analysis-report-section" className="space-y-6 pt-2">

          {/* 1. HERO REALITY DECREE & TELEMETRY COMMAND BAR */}
          <div className="relative overflow-hidden rounded-xl border border-rose-500/40 bg-gradient-to-b from-rose-950/40 via-zinc-900 to-zinc-950 p-6 md:p-8 shadow-2xl shadow-rose-950/40">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            
            <div className="relative z-10 flex flex-col gap-6">
              {/* Top Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-rose-400 flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Omniscient Time-Architect // Strict Reality Verdict</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${defconStatus.badge}`}>
                    {defconStatus.label}
                  </span>
                  {report.totalSessionsAnalyzed !== undefined && (
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700">
                      {report.totalSessionsAnalyzed} SESSIONS SCANNED
                    </span>
                  )}
                </div>
              </div>

              {/* Coach Verdict Decree */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-semibold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  <span>The Unfiltered Reality Decree</span>
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
                  &ldquo;{report.coachVerdict || report.rootCauseDiagnosis.coreMistake}&rdquo;
                </h2>
              </div>

              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {/* Survival Probability */}
                <div className={`p-4 rounded-lg border ${survivalColor.border} bg-zinc-950/80 flex items-center justify-between`}>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                      Survival Probability
                    </span>
                    <span className={`text-xs font-semibold ${survivalColor.text} block mt-0.5`}>
                      {survivalColor.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-black font-mono ${survivalColor.text}`}>
                      {survival}%
                    </span>
                  </div>
                </div>

                {/* Goal Drift Gauge */}
                <div className={`p-4 rounded-lg border ${driftColor.border} bg-zinc-950/80 flex items-center justify-between`}>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                      Timeline Drift Index
                    </span>
                    <span className={`text-xs font-semibold ${driftColor.text} block mt-0.5`}>
                      {driftColor.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-black font-mono ${driftColor.text}`}>
                      {drift}%
                    </span>
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-zinc-800"
                          strokeWidth="4"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          stroke={driftColor.stroke}
                          strokeDasharray={`${drift}, 100`}
                          strokeLinecap="round"
                          strokeWidth="4"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Trajectory Vector */}
                <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950/80 flex items-center justify-between sm:col-span-2 lg:col-span-1">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                      Trajectory Vector
                    </span>
                    <span className="text-xs font-semibold text-zinc-300 block mt-0.5">
                      {drift > 50 ? "Decaying to Timeline Alpha" : "Climbing to Timeline Omega"}
                    </span>
                  </div>
                  <div>
                    {drift > 50 ? (
                      <TrendingDown className="w-6 h-6 text-rose-500" />
                    ) : (
                      <TrendingUp className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. DUAL TIMELINE: MULTIVERSE DIVERGENCE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* TIMELINE ALPHA: THE DEFAULT CRASH */}
            <div className="rounded-xl border-l-4 border-rose-600 border-t border-r border-b border-rose-900/40 bg-gradient-to-b from-rose-950/20 via-zinc-950 to-zinc-950 p-5 md:p-6 space-y-5 shadow-lg shadow-rose-950/20">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Skull className="w-5 h-5 text-rose-500" />
                  <div>
                    <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wide">
                      Timeline Alpha // Default Entropy
                    </h3>
                    <span className="text-[11px] text-zinc-500">Agar daily excuses aur comfort nahi chhute</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase font-semibold">
                  Maut Ka Rasta
                </span>
              </div>

              <div className="space-y-4 text-sm text-zinc-300">
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-rose-400">
                    <Hourglass className="w-3.5 h-3.5" />
                    <span>T + 6 MONTHS (Compounding Stagnation)</span>
                  </div>
                  <p className="leading-relaxed text-zinc-300 text-xs md:text-sm pl-5">
                    {report.timelineA.timeframe6m}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>T + 2–3 YEARS (The Divergence Trap)</span>
                  </div>
                  <p className="leading-relaxed text-zinc-300 text-xs md:text-sm pl-5">
                    {report.timelineA.timeframe2y}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-900/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-400 uppercase tracking-wide">
                    <Skull className="w-4 h-4 text-rose-500" />
                    <span>YEAR 2031: THE FINAL CRASH</span>
                  </div>
                  <p className="leading-relaxed text-rose-200 text-xs md:text-sm font-medium">
                    {report.timelineA.darkFate}
                  </p>
                </div>
              </div>
            </div>

            {/* TIMELINE OMEGA: SOVEREIGN VICTORY */}
            <div className="rounded-xl border-l-4 border-emerald-500 border-t border-r border-b border-emerald-900/40 bg-gradient-to-b from-emerald-950/20 via-zinc-950 to-zinc-950 p-5 md:p-6 space-y-5 shadow-lg shadow-emerald-950/20">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
                      Timeline Omega // Sovereign Architect
                    </h3>
                    <span className="text-[11px] text-zinc-500">The realized potential &amp; conquered empire</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase font-semibold">
                  Vijayi Rasta
                </span>
              </div>

              <div className="space-y-4 text-sm text-zinc-300">
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>THE REALIZED NORTH STAR</span>
                  </div>
                  <p className="leading-relaxed text-zinc-200 text-xs md:text-sm pl-5">
                    {report.timelineB.targetVision}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-900/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                    <Swords className="w-4 h-4 text-emerald-400" />
                    <span>THE DAILY BLOOD PRICE &amp; REALITY GAP</span>
                  </div>
                  <p className="leading-relaxed text-emerald-200 text-xs md:text-sm">
                    {report.timelineB.expectedReality}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ROOT CAUSE FORENSIC DIAGNOSIS */}
          <div className="rounded-xl border border-amber-500/30 bg-zinc-900/90 p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="border-l-2 border-amber-500 pl-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Forensic Behavioral Diagnosis // Dhoke Ka Post-Mortem
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">Pichle sessions aur task notes se nikla direct saboot</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                EVIDENCE UNMASKED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  01 // Core Delusion Pattern
                </span>
                <p className="text-white font-bold text-sm leading-snug">
                  {report.rootCauseDiagnosis.coreMistake}
                </p>
              </div>

              <div className="bg-zinc-950 rounded-lg border border-amber-500/30 p-4 space-y-2 md:col-span-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  02 // Black &amp; White Notes Evidence
                </span>
                <blockquote className="border-l-2 border-amber-500 pl-3 text-amber-200/90 italic text-xs md:text-sm leading-relaxed">
                  &ldquo;{report.rootCauseDiagnosis.notesEvidence}&rdquo;
                </blockquote>
                <div className="pt-2 border-t border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                    Subconscious Ego Shield:
                  </span>
                  <p className="text-zinc-300 text-xs leading-relaxed mt-0.5">
                    {report.rootCauseDiagnosis.psychologicalTrigger}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. PSYCHOLOGICAL TRUTH BOMB */}
          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-zinc-900 to-zinc-900 p-5 md:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="border-l-2 border-purple-500 pl-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Cognitive Depth Charge // Psychological Truth Bomb
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-semibold">
                UNIVERSAL LAW
              </span>
            </div>

            <div className="bg-zinc-950/80 rounded-lg border border-zinc-800 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wide block">
                {report.psychologicalTruthBomb.conceptTitle}
              </span>
              <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                {report.psychologicalTruthBomb.explanation}
              </p>
            </div>
          </div>

          {/* 5. 72-HOUR WAR PROTOCOL */}
          <div className="rounded-xl border border-rose-500/40 bg-zinc-900 p-5 md:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div className="border-l-2 border-rose-500 pl-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    72-Hour War Protocol // Non-Negotiable Martial Law
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Ye suggestions nahi hain — agle 3 din ka execution contract hai.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-zinc-950 text-rose-400 border border-zinc-800">
                  {Object.values(checkedRules).filter(Boolean).length} / {report.emergencyProtocol.length} Executed
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {report.emergencyProtocol.map((rule, idx) => {
                const isChecked = !!checkedRules[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => setCheckedRules((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className={`flex items-start gap-3.5 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isChecked
                        ? "bg-zinc-950/60 border-emerald-600/40 opacity-70"
                        : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 shadow-md"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? "bg-emerald-500 border-emerald-400"
                          : "border-zinc-600 bg-zinc-900"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isChecked ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                          STRIKE {String(idx + 1).padStart(2, "0")}
                        </span>
                        {isChecked && (
                          <span className="text-[10px] font-mono text-emerald-400 uppercase">
                            // STAMPED
                          </span>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${isChecked ? "text-zinc-500 line-through" : "text-zinc-200 font-medium"}`}>
                        {rule}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. INTERCEPTED BLACKBOX TRANSMISSION FROM YEAR 2031 */}
          <div className="relative overflow-hidden rounded-xl border border-rose-900/60 bg-gradient-to-b from-rose-950/30 via-zinc-950 to-black p-6 md:p-7 space-y-5 shadow-2xl shadow-rose-950/30">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <Radio className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                    [CLASSIFIED AUDIO-LOG FREQUENCY // YEAR 2031]
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500">TIMELINE ALPHA // RECOVERED BLACKBOX</span>
                </div>
              </div>

              {/* Audio Waveform Effect */}
              <div className="flex items-center gap-1 h-5 px-3 py-1 rounded bg-zinc-900/80 border border-zinc-800">
                <Volume2 className="w-3.5 h-3.5 text-rose-500 mr-1" />
                {[4, 14, 8, 18, 10, 16, 6, 20, 12, 8, 15, 6].map((h, i) => (
                  <span
                    key={i}
                    className="w-0.5 bg-rose-500 rounded-full animate-pulse"
                    style={{ height: `${h}px`, animationDelay: `${i * 90}ms` }}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 md:p-5 rounded-lg bg-zinc-950/80 border border-rose-950/60">
              <p className="text-zinc-200 text-sm md:text-base leading-relaxed whitespace-pre-line font-serif italic selection:bg-rose-900">
                {report.futureSelfMessage}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-600 gap-2 font-mono pt-1 border-t border-zinc-900">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Har ek unrecorded session aur comfort excuse is timeline ko confirm kar raha hai.</span>
              </span>
              <span className="text-rose-500 font-bold uppercase tracking-wider">
                Focos Time-Mirror
              </span>
            </div>
          </div>

          {/* 7. THE COMMITMENT SEAL: ENTER WAR MODE */}
          <div className="p-6 md:p-8 rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 text-center space-y-4">
            {warModePledged ? (
              <div className="space-y-2 py-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>WAR PROTOCOL LOCKED IN // EXCUSES ARE DEAD</span>
                </div>
                <p className="text-zinc-300 text-sm max-w-md mx-auto">
                  Aapne War Protocol accept kar liya hai. Agle 72 ghante sirf cold, focused execution. Shut down notifications and begin.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center justify-center gap-2">
                    <Swords className="w-4 h-4 text-amber-500" />
                    <span>Seal The Truth &amp; Enter War Mode</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                    Is report ko scroll karke bhool mat jaao. Apna commitment seal karo aur agle 72-Hour Non-Negotiable Protocol ko swear karo.
                  </p>
                </div>
                <button
                  onClick={() => setWarModePledged(true)}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-black font-black text-xs uppercase tracking-wider transition-all transform active:scale-95 shadow-xl shadow-rose-950/40"
                >
                  <Zap className="w-4 h-4 text-black fill-current" />
                  <span>I Accept The Brutal Truth &amp; Enter War Mode</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
