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
    setAnalyzingStage("Pichle sessions aur task notes scan ho rahe hain...");

    const stageTimer1 = setTimeout(() => {
      setAnalyzingStage("Personal profile context & runway evaluate ho raha hai...");
    }, 1500);

    const stageTimer2 = setTimeout(() => {
      setAnalyzingStage("5-saal ka timeline divergence simulate ho raha hai...");
    }, 3200);

    const stageTimer3 = setTimeout(() => {
      setAnalyzingStage("Strict truth report synthesize ho rahi hai...");
    }, 5500);

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
      <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 animate-spin blur-md opacity-75" />
          <div className="w-16 h-16 rounded-3xl bg-zinc-950 flex items-center justify-center absolute inset-0 m-auto border border-zinc-800">
            <Compass className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
        </div>
        <p className="text-zinc-400 text-sm font-medium tracking-wide animate-pulse">
          Loading Goals & Quantum Reality Engine...
        </p>
      </div>
    );
  }

  const drift = report?.driftScore ?? 65;
  const driftColor =
    drift > 65
      ? { stroke: "#f43f5e", text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", label: "Critical Drift Warning" }
      : drift > 35
      ? { stroke: "#f59e0b", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "Moderate Deviation" }
      : { stroke: "#10b981", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Target Aligned" };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* TOP HERO & QUANTUM ENGINE BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Future Reality Engine & North Star</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Goals & Future Reality
            </h1>
            <p className="text-sm md:text-base text-zinc-400 max-w-xl leading-relaxed">
              Apne ultimate targets set karein aur dekhein ki aapke actual daily task notes aapko kis 5-saal ke anjaam ki taraf le ja rahe hain.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold border border-zinc-700/80 shadow-lg transition-all hover:scale-105"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Edit Reality Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-700 text-emerald-300 text-xs font-semibold rounded-2xl flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveMessage}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-950/70 border border-rose-700 text-rose-300 text-xs font-semibold rounded-2xl flex items-center gap-2 shadow-lg animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: PERMANENT SUCCESS GOAL (NORTH STAR) */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-amber-950/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  North Star
                </span>
                <span className="text-xs text-zinc-500 font-mono">Non-Negotiable</span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight mt-0.5">
                Permanent Success Goal
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              if (editingPermanent) {
                setPermanentForm(vision.permanentGoal);
              }
              setEditingPermanent(!editingPermanent);
            }}
            className="text-xs font-bold text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 transition-all shadow-sm"
          >
            {editingPermanent ? "Cancel" : "Edit Goal"}
          </button>
        </div>

        {editingPermanent ? (
          <div className="space-y-4 pt-2 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ultimate Target Title</span>
                </label>
                <input
                  value={permanentForm.title}
                  onChange={(e) => setPermanentForm({ ...permanentForm, title: e.target.value })}
                  placeholder="e.g. Build ₹40 Lakhs/month Software Company, BMW Supercar, Financial Freedom"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target Deadline / Age</span>
                </label>
                <input
                  value={permanentForm.targetDeadline}
                  onChange={(e) => setPermanentForm({ ...permanentForm, targetDeadline: e.target.value })}
                  placeholder="e.g. September 2027 / Age 26"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kyu Chahiye? (Purpose & Family Dreams)</span>
                </label>
                <textarea
                  value={permanentForm.whyItMatters}
                  onChange={(e) => setPermanentForm({ ...permanentForm, whyItMatters: e.target.value })}
                  rows={3}
                  placeholder="e.g. Mummy papa ke saare sapne pure karne hain, beheno ki shadi apne paiso se karni hai, gareebi se bahar aana hai..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400 resize-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-300 mb-1.5 flex items-center gap-1.5">
                  <Skull className="w-3.5 h-3.5 text-rose-400" />
                  <span>The High Stakes (Fail hone par kya anjaam hoga?)</span>
                </label>
                <textarea
                  value={permanentForm.stakes}
                  onChange={(e) => setPermanentForm({ ...permanentForm, stakes: e.target.value })}
                  rows={3}
                  placeholder="e.g. Compelled to do a low paying dead-end job, relatives ki baatein, family dreams crash..."
                  className="w-full bg-zinc-950 border border-rose-950/80 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500 resize-none shadow-inner"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSavePermanentGoal}
                disabled={savingGoals || !permanentForm.title.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-950/50 transition-all disabled:opacity-50"
              >
                {savingGoals ? "Saving..." : "Save Permanent Goal ✨"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            {vision.permanentGoal.title ? (
              <>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-white">
                    {vision.permanentGoal.title}
                  </h3>
                  {vision.permanentGoal.targetDeadline && (
                    <span className="text-xs px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 font-mono font-bold border border-amber-500/30 flex items-center gap-1.5">
                      <Hourglass className="w-3.5 h-3.5" />
                      <span>{vision.permanentGoal.targetDeadline}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {vision.permanentGoal.whyItMatters && (
                    <div className="p-4 rounded-2xl bg-zinc-950/80 border border-amber-500/20 shadow-md">
                      <div className="flex items-center gap-2 mb-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Kyu Chahiye (Purpose & Vision):</span>
                      </div>
                      <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                        {vision.permanentGoal.whyItMatters}
                      </p>
                    </div>
                  )}

                  {vision.permanentGoal.stakes && (
                    <div className="p-4 rounded-2xl bg-zinc-950/80 border border-rose-900/40 shadow-md">
                      <div className="flex items-center gap-2 mb-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>High Stakes (Fail hone par nuksaan):</span>
                      </div>
                      <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                        {vision.permanentGoal.stakes}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-sm text-zinc-400">
                  Aapne abhi tak apna Permanent Success Goal set nahi kiya hai. Ek clear North Star hona mandatory hai.
                </p>
                <button
                  onClick={() => setEditingPermanent(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-amber-950/50"
                >
                  + Add Permanent Goal
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: PERIOD TARGETS (DAILY / WEEKLY / MONTHLY / YEARLY) */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 md:p-7 space-y-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-rose-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Execution Targets
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{savingGoals ? "Auto-saving..." : "Targets are in sync"}</span>
          </span>
        </div>

        {/* Playful Tab Switcher */}
        <div className="flex border-b border-zinc-800/80 gap-2 pb-1 overflow-x-auto">
          {[
            { id: "daily", label: "Daily Blitz", icon: "⚡", activeBorder: "border-amber-400 text-amber-300" },
            { id: "weekly", label: "Weekly Sprint", icon: "🚀", activeBorder: "border-blue-400 text-blue-300" },
            { id: "monthly", label: "Monthly Siege", icon: "🎯", activeBorder: "border-purple-400 text-purple-300" },
            { id: "yearly", label: "Yearly Crown", icon: "👑", activeBorder: "border-emerald-400 text-emerald-300" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab.id
                  ? `bg-zinc-800/90 text-white shadow-md border-b-2 ${tab.activeBorder}`
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-2 capitalize">
            {activeTab} Target Description & Non-Negotiable Key Focus:
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
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-zinc-500 leading-relaxed shadow-inner"
          />
          <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Text box ke bahar click karne par target automatically sync ho jata hai.</span>
          </p>
        </div>
      </div>

      {/* SECTION 3: THE ACTION TRIGGER (Vibrant Radiant Button) */}
      <div className="text-center py-6">
        <button
          onClick={handleTriggerAnalysis}
          disabled={analyzing}
          className="relative inline-flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-sm md:text-base tracking-wider text-white transition-all transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:scale-100 shadow-[0_0_50px_rgba(225,29,72,0.3)] overflow-hidden group bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 border border-rose-300/40"
        >
          {/* Animated beam */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          {analyzing ? (
            <span className="flex items-center gap-3">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Task Notes & Future Divergence...</span>
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-amber-300 animate-pulse fill-amber-300" />
              <span>Analyze Future & Reality (Strict Mode)</span>
            </span>
          )}
        </button>

        {analyzing && (
          <p className="text-xs text-rose-400 mt-3 font-mono animate-pulse">
            ⚡ {analyzingStage}
          </p>
        )}
      </div>

      {/* SECTION 4: THE BRUTAL REALITY & FUTURE REPORT */}
      {report && (
        <div id="analysis-report-section" className="space-y-7 pt-4 animate-in fade-in duration-700">
          {/* Report Top Meta & Circular Drift Gauge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="text-sm font-black uppercase tracking-wider text-rose-400">
                  Reality & Future Projection Report
                </h2>
              </div>
              <p className="text-xs text-zinc-400 max-w-md">
                Synthesized by analyzing your logged task notes, durations, profile context, and daily targets.
              </p>
            </div>

            {/* Circular Drift Score Gauge */}
            <div className={`flex items-center gap-4 p-3.5 px-5 rounded-2xl border ${driftColor.bg} ${driftColor.border} shadow-lg`}>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
                  Goal Drift Index
                </span>
                <span className={`text-xs font-extrabold ${driftColor.text}`}>
                  {driftColor.label}
                </span>
              </div>

              <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-zinc-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    stroke={driftColor.stroke}
                    strokeDasharray={`${drift}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-xs font-black font-mono ${driftColor.text}`}>
                  {drift}%
                </span>
              </div>
            </div>
          </div>

          {/* BLOCK A: DUAL TIMELINE PROJECTION (Cinematic Contrast) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Timeline A: Dark Fate */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-rose-900/80 bg-gradient-to-b from-rose-950/30 via-zinc-900 to-zinc-950 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-600/40 flex items-center justify-center text-rose-400">
                    <Skull className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-rose-300">
                      Timeline A: The Default Crash
                    </h3>
                    <span className="text-[10px] text-rose-400/80 font-mono">Agar aadat nahi badli</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                  Dystopian
                </span>
              </div>

              <div className="space-y-3 text-xs text-zinc-300">
                <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-rose-950 space-y-1">
                  <span className="font-bold text-rose-400 block text-[11px] uppercase tracking-wider">
                    📅 Next 6 Months:
                  </span>
                  <p className="leading-relaxed">{report.timelineA.timeframe6m}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-rose-950 space-y-1">
                  <span className="font-bold text-rose-400 block text-[11px] uppercase tracking-wider">
                    ⏳ Next 2 to 3 Years:
                  </span>
                  <p className="leading-relaxed">{report.timelineA.timeframe2y}</p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-900/60 text-rose-100 space-y-1 shadow-inner">
                  <span className="font-bold text-rose-300 block text-[11px] uppercase tracking-wider">
                    💀 The Final Crash (Dark Fate):
                  </span>
                  <p className="leading-relaxed font-medium">{report.timelineA.darkFate}</p>
                </div>
              </div>
            </div>

            {/* Timeline B: Target Reality */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-900/80 bg-gradient-to-b from-emerald-950/30 via-zinc-900 to-zinc-950 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-emerald-300">
                      Timeline B: Permanent Goal Reality
                    </h3>
                    <span className="text-[10px] text-emerald-400/80 font-mono">Actual Potential</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Ascension
                </span>
              </div>

              <div className="space-y-3 text-xs text-zinc-300">
                <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-emerald-950 space-y-1">
                  <span className="font-bold text-emerald-400 block text-[11px] uppercase tracking-wider">
                    🏆 The Realized Vision:
                  </span>
                  <p className="leading-relaxed">{report.timelineB.targetVision}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-emerald-950 space-y-1">
                  <span className="font-bold text-emerald-400 block text-[11px] uppercase tracking-wider">
                    ⚡ The Effort vs Reality Gap:
                  </span>
                  <p className="leading-relaxed">{report.timelineB.expectedReality}</p>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK B: ROOT CAUSE DIAGNOSIS (Detective Evidence Card) */}
          <div className="rounded-3xl border border-amber-900/50 bg-zinc-900/90 p-6 md:p-7 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-300">
                    Block B: Root Cause Diagnosis (Notes Se Asli Saboot)
                  </h3>
                  <p className="text-[11px] text-zinc-500">Forensic behavioral breakdown</p>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Behavioral Leak
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">
                  Core Pattern Mistake:
                </span>
                <p className="text-white font-bold text-sm mt-0.5">
                  {report.rootCauseDiagnosis.coreMistake}
                </p>
              </div>

              <div className="pt-2.5 border-t border-zinc-800/80">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">
                  Notes Se Evidence (Aapke Likhe Gaye Notes Ka Sach):
                </span>
                <p className="text-amber-200 leading-relaxed mt-1 italic bg-amber-950/20 p-2.5 rounded-xl border border-amber-950">
                  &ldquo;{report.rootCauseDiagnosis.notesEvidence}&rdquo;
                </p>
              </div>

              <div className="pt-2.5 border-t border-zinc-800/80">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">
                  Psychological Trigger (Dimag Yeh Chalaki Kyu Kar Raha Hai?):
                </span>
                <p className="text-zinc-300 leading-relaxed mt-1">
                  {report.rootCauseDiagnosis.psychologicalTrigger}
                </p>
              </div>
            </div>
          </div>

          {/* BLOCK C: PSYCHOLOGICAL TRUTH BOMB */}
          <div className="rounded-3xl border border-indigo-900/50 bg-gradient-to-r from-indigo-950/30 via-zinc-900 to-zinc-900 p-6 md:p-7 space-y-3 shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-indigo-300">
                Block C: Psychological Fact / Truth Bomb
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-indigo-950/60 space-y-2">
              <h4 className="text-sm md:text-base font-black text-indigo-200">
                {report.psychologicalTruthBomb.conceptTitle}
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {report.psychologicalTruthBomb.explanation}
              </p>
            </div>
          </div>

          {/* BLOCK D: 72-HOUR EMERGENCY PROTOCOL (Interactive Quest Style) */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 md:p-7 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Block D: 72-Hour Emergency Action Plan
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Agle 3 din me is trajectory ko break karne ke 3 non-negotiable rules:
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Interactive Check-list
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.emergencyProtocol.map((rule, idx) => {
                const isChecked = !!checkedRules[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => setCheckedRules((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-3 ${
                      isChecked
                        ? "bg-emerald-950/30 border-emerald-600/50 shadow-lg shadow-emerald-950/20"
                        : "bg-zinc-950 border-zinc-800/90 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-black ${isChecked ? "text-emerald-400" : "text-rose-400"}`}>
                        Rule 0{idx + 1}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-emerald-500 border-emerald-400 text-black"
                            : "border-zinc-700 bg-zinc-900"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p
                      className={`text-xs leading-relaxed font-medium transition-colors ${
                        isChecked ? "text-zinc-400 line-through" : "text-zinc-200"
                      }`}
                    >
                      {rule}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BLOCK E: TRANSMISSION FROM 5-YEAR OLDER SELF (Hologram Console) */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-rose-600/60 bg-gradient-to-b from-rose-950/40 via-zinc-950 to-zinc-950 p-6 md:p-8 shadow-[0_0_50px_rgba(225,29,72,0.2)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
                  <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-rose-300">
                    Block E: Incoming Hologram from Year 2031
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Unfiltered Regret Letter
                </span>
              </div>

              <div className="relative p-5 md:p-7 rounded-2xl bg-black/70 border border-rose-900/40 shadow-inner">
                <span className="text-4xl text-rose-500/30 font-serif leading-none select-none block -mb-2">
                  &ldquo;
                </span>
                <p className="text-sm md:text-base text-rose-100 font-sans leading-relaxed tracking-wide whitespace-pre-line italic">
                  {report.futureSelfMessage}
                </p>
                <span className="text-4xl text-rose-500/30 font-serif leading-none select-none block text-right -mt-2">
                  &rdquo;
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 gap-2 pt-1 font-mono">
                <span>⚠️ Reality Warning: This timeline is currently actively assembling from your daily habits.</span>
                <span className="text-rose-400 font-bold">Focos Future Mirror</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
