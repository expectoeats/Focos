import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Session from "@/models/Session";
import Category from "@/models/Category"; // Required for populate("categoryId") to work
import VisionGoal from "@/models/VisionGoal";
import AnalysisReport from "@/models/AnalysisReport";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-handler";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    await connectDB();

    const report = await AnalysisReport.findOne({ userId: authUser.userId })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({ report: report || null });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return errorResponse("CONFIG_ERROR", "Gemini API key is not configured in environment.", 500);
    }

    await connectDB();

    // 1. Fetch user profile context
    const user = await User.findById(authUser.userId).lean();
    if (!user) return errorResponse("USER_NOT_FOUND", "User not found", 404);

    // 2. Fetch vision goals
    const vision = await VisionGoal.findOne({ userId: authUser.userId }).lean();

    // 3. Fetch past sessions with notes
    const sessions = await Session.find({ userId: authUser.userId })
      .sort({ startedAt: -1 })
      .limit(60)
      .populate("categoryId", "name")
      .lean();

    const totalSessions = sessions.length;
    const totalMinutes = Math.round(
      sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60
    );

    // Filter sessions with notes or completed tasks
    const sessionLogs = sessions.map((s, idx) => ({
      index: idx + 1,
      category: (s.categoryId as any)?.name || "General",
      durationMinutes: Math.round((s.durationSeconds || 0) / 60),
      startedAt: s.startedAt,
      status: s.status,
      note: s.note ? s.note.trim() : "(No note provided)",
    }));

    const userAge = user.profileContext?.age || 24;
    const futureAge = Number(userAge) + 5;

    const promptContext = {
      userProfile: {
        name: user.name,
        currentAge: userAge,
        projectedFutureAge: futureAge,
        runway: user.profileContext?.runway || "Not specified",
        currentSituation: user.profileContext?.currentSituation || "Not specified",
        coreWeaknesses: user.profileContext?.coreWeaknesses || "Not specified",
        worstCaseFear: user.profileContext?.worstCaseFear || "Not specified",
      },
      visionGoals: {
        permanentSuccessGoal: vision?.permanentGoal?.title
          ? {
              title: vision.permanentGoal.title,
              targetDeadline: vision.permanentGoal.targetDeadline,
              whyItMatters: vision.permanentGoal.whyItMatters,
              stakes: vision.permanentGoal.stakes,
            }
          : "Not set yet (User lacks a clear North Star)",
        dailyTarget: vision?.dailyTarget || "None",
        weeklyTarget: vision?.weeklyTarget || "None",
        monthlyTarget: vision?.monthlyTarget || "None",
        yearlyTarget: vision?.yearlyTarget || "None",
      },
      analytics: {
        totalSessionsTracked: totalSessions,
        totalMinutesFocused: totalMinutes,
        recentSessions: sessionLogs.slice(0, 30),
      },
    };

    const systemInstruction = `
You are the "Strict & Truth Mode" AI Reality Engine for Focos (a high-performance focus tracker).
Your job is NOT to be a polite cheerleader. Your role is to be a brutal, deeply analytical truth-mirror.
You analyze the user's logged task notes, durations, focus patterns, and their personal profile context.
Language: Natural, impactful Hindi / Hinglish (Latin script) that feels visceral, authentic, and emotionally arresting.

Structure your analysis into these 5 strict sections:

1. Block A: Dual Timeline Projection
   - timelineA.timeframe6m: Realistic stagnation, project delays, or compounding bad habits over next 6 months if current habits & notes continue.
   - timelineA.timeframe2y: Hard consequences 2-3 years out (financial insecurity, career gap, peer divergence).
   - timelineA.darkFate: Summary of the default crash if zero change happens.
   - timelineB.targetVision: The reality of achieving their Permanent Goal.
   - timelineB.expectedReality: The stark contrast between their actual daily execution vs what is needed to reach Timeline B.

2. Block B: Root Cause Diagnosis (Galtiyan & Evidence)
   - coreMistake: The exact bad behavioral habit (e.g., "Productive Procrastination / Shallow Fake Work", "Task Switching Friction", "Consistent Avoidance of Hard Coding").
   - notesEvidence: Quote or reference direct patterns from their actual session notes (e.g. citing what they wrote, short durations, frequent gaps, or missing notes).
   - psychologicalTrigger: Why their brain is falling into this trap.

3. Block C: Psychological Fact / Truth Bomb
   - conceptTitle: Name of an established behavioral science/psychology law (e.g., "The Illusion of Tomorrow", "Parkinson's Law of Shallow Effort", "Hyperbolic Discounting").
   - explanation: 2-3 punchy sentences explaining how this psychological flaw is silently ruining them.

4. Block D: 72-Hour Emergency Action Plan
   - emergencyProtocol: An array of exactly 3 concrete, non-negotiable rules for the next 72 hours to break this trajectory.

5. Block E: A Message From Your ${futureAge}-Year-Old Self (Future Regret Letter)
   - futureSelfMessage: Exactly 4 to 7 lines written in first-person ("Main tumhara ${futureAge} saal ka future version bol raha hoon...").
   - It must be deeply emotional, raw, painful, and realistic.
   - Weave in their exact age (${userAge} -> ${futureAge}), their family/parents' expectations, financial stakes, and cite their specific weaknesses and excuses from their notes.
   - It should address how their laziness, avoidance, or time-wasting right now created a miserable, regret-filled reality for their future self.

6. driftScore: An integer between 0 and 100 representing how far off-track they currently are (0 = zero drift/perfect alignment, 100 = completely derailed).

Return strictly valid JSON matching this schema:
{
  "timelineA": {
    "timeframe6m": "string",
    "timeframe2y": "string",
    "darkFate": "string"
  },
  "timelineB": {
    "targetVision": "string",
    "expectedReality": "string"
  },
  "rootCauseDiagnosis": {
    "coreMistake": "string",
    "notesEvidence": "string",
    "psychologicalTrigger": "string"
  },
  "psychologicalTruthBomb": {
    "conceptTitle": "string",
    "explanation": "string"
  },
  "emergencyProtocol": ["string", "string", "string"],
  "futureSelfMessage": "string",
  "driftScore": 75
}
`;

    const ai = new GoogleGenAI({ apiKey });

    // Priority fallback chain (as per Google API recommendation)
    const configuredModel = process.env.GEMINI_PARSE_MODEL;
    const modelFallbackChain = [
      ...(configuredModel ? [configuredModel] : []),
      "gemini-3.6-flash",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
    ];

    const promptPayload = {
      contents: [
        {
          role: "user" as const,
          parts: [
            {
              text: `${systemInstruction}\n\nHere is the user's data to analyze:\n${JSON.stringify(
                promptContext,
                null,
                2
              )}`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    };

    let responseText = "";
    let lastError: unknown = null;

    for (const model of modelFallbackChain) {
      try {
        const response = await ai.models.generateContent({ model, ...promptPayload });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: unknown) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        // Only retry on 404 (deprecated/not found) or 503 (overloaded)
        if (!msg.includes('"code":404') && !msg.includes('"code":503')) {
          throw err;
        }
        console.warn(`Model ${model} unavailable, trying next...`, msg.slice(0, 120));
      }
    }

    if (!responseText) {
      console.error("All Gemini models failed. Last error:", lastError);
      return errorResponse("AI_UNAVAILABLE", "AI analysis service is temporarily unavailable. Please try again in a few minutes.", 503);
    }
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      // Fallback clean regex in case of markdown wrapping
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedResult = JSON.parse(cleaned);
    }

    // Save report to database
    const savedReport = await AnalysisReport.create({
      userId: authUser.userId,
      timelineA: parsedResult.timelineA,
      timelineB: parsedResult.timelineB,
      rootCauseDiagnosis: parsedResult.rootCauseDiagnosis,
      psychologicalTruthBomb: parsedResult.psychologicalTruthBomb,
      emergencyProtocol: parsedResult.emergencyProtocol || [],
      futureSelfMessage: parsedResult.futureSelfMessage,
      driftScore: parsedResult.driftScore ?? 65,
      totalSessionsAnalyzed: totalSessions,
    });

    return successResponse({ report: savedReport });
  } catch (error) {
    return handleApiError(error);
  }
}
