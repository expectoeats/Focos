"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
        setSaveMessage("Permanent Goal saved!");
        setTimeout(() => setSaveMessage(""), 3000);
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
    setAnalyzingStage("Pichle sessions aur task notes read ho rahe hain...");

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
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-500 text-sm animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          Loading Goals & Reality Engine...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎯</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Goals & Future Reality
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Apne targets set karein aur dekhein ki aapke actual task notes aapko kis future ki taraf le ja rahe hain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="text-xs px-3 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>⚙</span> Reality Profile Edit karein
          </Link>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs rounded-lg animate-in fade-in">
          {saveMessage}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs rounded-lg animate-in fade-in">
          {errorMsg}
        </div>
      )}

      {/* SECTION 1: PERMANENT SUCCESS GOAL (NORTH STAR) */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/20 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
              North Star
            </span>
            <h2 className="text-base font-bold text-white tracking-wide">
              Permanent Success Goal
            </h2>
          </div>

          <button
            onClick={() => {
              if (editingPermanent) {
                setPermanentForm(vision.permanentGoal);
              }
              setEditingPermanent(!editingPermanent);
            }}
            className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
          >
            {editingPermanent ? "Cancel" : "Edit Goal"}
          </button>
        </div>

        {editingPermanent ? (
          <div className="space-y-4 pt-2 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Ultimate Target Title
                </label>
                <input
                  value={permanentForm.title}
                  onChange={(e) =>
                    setPermanentForm({ ...permanentForm, title: e.target.value })
                  }
                  placeholder="e.g. Build ₹15 Lakhs/year Solo Product, Crack L5 Software Engineer"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Target Deadline / Age
                </label>
                <input
                  value={permanentForm.targetDeadline}
                  onChange={(e) =>
                    setPermanentForm({ ...permanentForm, targetDeadline: e.target.value })
                  }
                  placeholder="e.g. By Age 26 / Dec 2026"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Kyu Zaroori Hai? (Why It Matters)
                </label>
                <textarea
                  value={permanentForm.whyItMatters}
                  onChange={(e) =>
                    setPermanentForm({ ...permanentForm, whyItMatters: e.target.value })
                  }
                  rows={2}
                  placeholder="e.g. Mummy-papa ko tension-free life deni hai, financially independent banna hai"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  The Stakes (Agar yeh fail hua toh kya anjaam hoga?)
                </label>
                <textarea
                  value={permanentForm.stakes}
                  onChange={(e) =>
                    setPermanentForm({ ...permanentForm, stakes: e.target.value })
                  }
                  rows={2}
                  placeholder="e.g. Compelled to do a low-paying dead end job, losing self-respect and family dreams"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSavePermanentGoal}
                disabled={savingGoals || !permanentForm.title.trim()}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {savingGoals ? "Saving..." : "Save Permanent Goal"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 relative z-10">
            {vision.permanentGoal.title ? (
              <>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="text-xl md:text-2xl font-extrabold text-amber-200">
                    {vision.permanentGoal.title}
                  </h3>
                  {vision.permanentGoal.targetDeadline && (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 font-mono border border-zinc-700">
                      🎯 {vision.permanentGoal.targetDeadline}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                  {vision.permanentGoal.whyItMatters && (
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3">
                      <span className="font-semibold text-zinc-400 block mb-1">
                        Kyu Chahiye (Purpose):
                      </span>
                      <p className="text-zinc-300 leading-relaxed">
                        {vision.permanentGoal.whyItMatters}
                      </p>
                    </div>
                  )}

                  {vision.permanentGoal.stakes && (
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3">
                      <span className="font-semibold text-rose-400 block mb-1">
                        High Stakes (Fail hone par nuksaan):
                      </span>
                      <p className="text-zinc-300 leading-relaxed">
                        {vision.permanentGoal.stakes}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-zinc-400 mb-2">
                  Aapne abhi tak apna Permanent Success Goal set nahi kiya hai.
                </p>
                <button
                  onClick={() => setEditingPermanent(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium text-xs rounded-lg transition-colors"
                >
                  + Add Permanent Goal
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: PERIOD TARGETS (DAILY / WEEKLY / MONTHLY / YEARLY) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Period Targets
          </h2>
          <span className="text-xs text-zinc-500">
            {savingGoals ? "Auto-saving..." : "Targets are synced"}
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-800 gap-1 pb-1 overflow-x-auto">
          {(["daily", "weekly", "monthly", "yearly"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? "bg-zinc-800 text-white border-b-2 border-amber-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              {tab} Target
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2 capitalize">
            {activeTab} Target Description & Key Focus:
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
                ? "Aaj ke non-negotiable tasks: (e.g. Finish auth API & fix database queries, 4 hours focus)"
                : activeTab === "weekly"
                ? "Is hafte ka bada milestone: (e.g. Complete core engine and test end-to-end flow)"
                : activeTab === "monthly"
                ? "Is mahine ka objective: (e.g. Launch beta version and get first 10 active users)"
                : "Is saal ka milestone: (e.g. Reach ₹50k MRR and quit freelancing)"
            }
            className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-zinc-500 leading-relaxed"
          />
          <p className="text-[11px] text-zinc-500 mt-1.5">
            Tip: Text box ke bahar click karne par target automatically save ho jata hai.
          </p>
        </div>
      </div>

      {/* SECTION 3: THE ACTION TRIGGER */}
      <div className="text-center py-6">
        <button
          onClick={handleTriggerAnalysis}
          disabled={analyzing}
          className="relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm md:text-base tracking-wide text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-2xl overflow-hidden group bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 border border-rose-400/40"
        >
          {/* Subtle animated shine */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          {analyzing ? (
            <span className="flex items-center gap-3">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Task Notes & Future...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2.5">
              <span className="text-lg">🔥</span>
              <span>Analyze Future & Reality (Strict Mode)</span>
            </span>
          )}
        </button>

        {analyzing && (
          <p className="text-xs text-rose-400 mt-3 font-mono animate-pulse">
            {analyzingStage}
          </p>
        )}
      </div>

      {/* SECTION 4: THE BRUTAL REALITY & FUTURE REPORT */}
      {report && (
        <div id="analysis-report-section" className="space-y-6 pt-4 animate-in fade-in duration-500">
          {/* Report Top Meta & Drift Gauge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400">
                  Reality & Future Projection Report
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Analyzed from your tracked sessions, notes, and profile context.
              </p>
            </div>

            {report.driftScore !== undefined && (
              <div className="flex items-center gap-4 bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800">
                <div className="text-right">
                  <span className="text-[11px] text-zinc-400 block">Goal Drift Index</span>
                  <span className="text-xs font-semibold text-zinc-300">
                    {report.driftScore > 65
                      ? "Critical Deviation"
                      : report.driftScore > 35
                      ? "Moderate Deviation"
                      : "On Track"}
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-rose-400">
                  {report.driftScore}%
                </div>
              </div>
            )}
          </div>

          {/* BLOCK A: THE DUAL TIMELINE PROJECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timeline A: Dark Fate */}
            <div className="rounded-2xl border border-rose-900/60 bg-gradient-to-b from-rose-950/20 via-zinc-900 to-zinc-950 p-6 space-y-4 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.8)]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-300">
                  Timeline A: The Default Crash
                </h3>
              </div>
              <p className="text-xs text-rose-200/70 font-mono">
                Agar pichle task notes aur aadat continue rahi toh:
              </p>

              <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
                <div className="p-3 rounded-lg bg-zinc-900/90 border border-rose-950">
                  <span className="font-semibold text-rose-400 block mb-1">
                    📅 Next 6 Months:
                  </span>
                  {report.timelineA.timeframe6m}
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/90 border border-rose-950">
                  <span className="font-semibold text-rose-400 block mb-1">
                    ⏳ Next 2 to 3 Years:
                  </span>
                  {report.timelineA.timeframe2y}
                </div>

                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-200">
                  <span className="font-semibold block mb-1">
                    💀 The Dark Fate:
                  </span>
                  {report.timelineA.darkFate}
                </div>
              </div>
            </div>

            {/* Timeline B: Target Reality */}
            <div className="rounded-2xl border border-emerald-900/60 bg-gradient-to-b from-emerald-950/20 via-zinc-900 to-zinc-950 p-6 space-y-4 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                  Timeline B: Permanent Goal Reality
                </h3>
              </div>
              <p className="text-xs text-emerald-200/70 font-mono">
                Aapka actual potential aur expected target:
              </p>

              <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
                <div className="p-3 rounded-lg bg-zinc-900/90 border border-emerald-950">
                  <span className="font-semibold text-emerald-400 block mb-1">
                    🏆 The Realized Vision:
                  </span>
                  {report.timelineB.targetVision}
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/90 border border-emerald-950">
                  <span className="font-semibold text-emerald-400 block mb-1">
                    ⚡ The Effort vs Reality Gap:
                  </span>
                  {report.timelineB.expectedReality}
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK B: ROOT CAUSE DIAGNOSIS (Galtiyan & Notes Evidence) */}
          <div className="rounded-2xl border border-amber-900/40 bg-zinc-900 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🔍</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">
                  Block B: Root Cause Diagnosis (Notes Se Asli Galti)
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Behavioral Leak
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs">
              <div>
                <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px] block">
                  Core Pattern Mistake:
                </span>
                <p className="text-white font-medium text-sm mt-0.5">
                  {report.rootCauseDiagnosis.coreMistake}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px] block">
                  Notes Se Evidence (Aapke Likhe Gaye Notes Ka Sach):
                </span>
                <p className="text-amber-200/90 leading-relaxed mt-0.5 italic">
                  &ldquo;{report.rootCauseDiagnosis.notesEvidence}&rdquo;
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px] block">
                  Psychological Trigger (Dimag Yeh Chalaki Kyu Kar Raha Hai?):
                </span>
                <p className="text-zinc-300 leading-relaxed mt-0.5">
                  {report.rootCauseDiagnosis.psychologicalTrigger}
                </p>
              </div>
            </div>
          </div>

          {/* BLOCK C: PSYCHOLOGICAL FACT / TRUTH BOMB */}
          <div className="rounded-2xl border border-indigo-900/40 bg-gradient-to-r from-indigo-950/20 via-zinc-900 to-zinc-900 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🧠</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
                Block C: Psychological Fact / Truth Bomb
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-indigo-950/50 space-y-1.5">
              <h4 className="text-sm font-bold text-indigo-200">
                {report.psychologicalTruthBomb.conceptTitle}
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {report.psychologicalTruthBomb.explanation}
              </p>
            </div>
          </div>

          {/* BLOCK D: 72-HOUR EMERGENCY PROTOCOL */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Block D: 72-Hour Emergency Action Plan
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Trajectory sudharne ke liye agle 3 din ke non-negotiable rules:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.emergencyProtocol.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-2 hover:border-zinc-700 transition-colors"
                >
                  <span className="text-xs font-mono font-bold text-rose-400">
                    Rule 0{idx + 1}
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* BLOCK E: A MESSAGE FROM YOUR 5-YEAR OLDER SELF */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-rose-600/50 bg-gradient-to-b from-rose-950/40 via-zinc-950 to-zinc-950 p-6 md:p-8 shadow-2xl">
            {/* Ambient Red Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🪞</span>
                  <h3 className="text-sm md:text-base font-extrabold uppercase tracking-widest text-rose-300">
                    Block E: A Message From Your 5-Year Older Self
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Unfiltered Regret Mirror
                </span>
              </div>

              <div className="relative p-4 md:p-6 rounded-xl bg-black/60 border border-rose-900/30">
                <span className="text-3xl text-rose-500/30 font-serif leading-none select-none block -mb-2">
                  &ldquo;
                </span>
                <p className="text-sm md:text-base text-rose-100 font-sans leading-relaxed tracking-wide whitespace-pre-line italic">
                  {report.futureSelfMessage}
                </p>
                <span className="text-3xl text-rose-500/30 font-serif leading-none select-none block text-right -mt-2">
                  &rdquo;
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span>⚠️ Reality Warning: This future is automatically being constructed by your daily inaction.</span>
                <span>Focos Mirror</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
