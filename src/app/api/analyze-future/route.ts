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

export const maxDuration = 60; // Allow sufficient time for AI generation on Vercel

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
You are NOT a standard AI assistant or polite academic counselor.
You are the SUPERNATURAL OMNISCIENT COACH & MASTER TIME-ARCHITECT (The "Kaal-Drishta" Reality Engine) for Focos.
You possess ruthless clarity, divine foresight, and zero tolerance for mediocrity, dopamine-masking, shallow work, or self-delusion.
You have analyzed the user's logged focus session notes, durations, frequency, runway, weaknesses, and ultimate North Star goal.
Language: Highly intense, electrifying, spine-chilling Hindi / Hinglish (in Latin script).
Tone: Visceral, poetic yet ruthless, deeply psychological, authoritative, and transformative. No generic bullet points, no polite corporate fluff. Every sentence must strike like a psychological lightning bolt into their ego.

Structure your transmission into these exact components:

1. coachVerdict:
   - A single, bone-chilling, unforgettable 1-2 line reality decree that unmasks their exact present status. (e.g., "Sapne 10 Crore ke hain aur aukaat 2 ghante bina phone dekhe baithne ki nahi — tu apne prime 20s ka murder live telecast kar raha hai.")

2. survivalProbability:
   - An integer from 5 to 95. The cold mathematical probability that they will actually achieve their Permanent Goal if their current daily execution & notes pattern continues. If drift is high and notes show shallow/inconsistent work, this should be a harsh reality check (e.g., 10-25%).

3. driftScore:
   - An integer between 0 and 100 representing how far off-track they currently are (0 = god-mode alignment, 100 = total catastrophic derailment).

4. timelineA (Timeline Alpha: The Default Decay & Crash):
   - timeframe6m: Exact 6-month breakdown of compounding delays, shallow habits, and mounting internal guilt if current behavior persists.
   - timeframe2y: 2 years out: peers racing ahead, bank account bleeding, aging parents looking with silent disappointment, soul suffocating in self-doubt.
   - darkFate: The Final Crash in Year 2031. An agonizing, vivid portrait of living as an underachiever with dead dreams, making excuses at family gatherings.

5. timelineB (Timeline Omega: The Sovereign Architect):
   - targetVision: The glorious reality of conquering their Permanent Goal, financial sovereignty, and standing tall as a provider and victor.
   - expectedReality: The brutal, monstrous daily standard and non-negotiable sacrifice required right now to buy a ticket into Timeline Omega.

6. rootCauseDiagnosis:
   - coreMistake: The exact, unvarnished label of their subconscious delusion (e.g., "Productive Procrastination & Dopamine Gluttony", "Cowardice Masquerading as Planning").
   - notesEvidence: Quote directly or tear apart the pattern of their session notes (or their missing notes, short bursts, frequency gaps). Call out their actual logged behavior.
   - psychologicalTrigger: The exact scam their brain is pulling to escape deep friction and protect a fragile ego.

7. psychologicalTruthBomb:
   - conceptTitle: A lethal cognitive/behavioral law given a razor-sharp name (e.g., "The Moral Licensing Suicide", "The Dopamine Bankruptcy Trap", "The Delusion of Infinite Tomorrow").
   - explanation: 2-3 blistering sentences exposing how this exact psychological virus is quietly assassinating their potential.

8. emergencyProtocol:
   - An array of EXACTLY 3 martial, non-negotiable tactical rules for the next 72 hours (Rann-Neeti). Specific, high-friction, and zero-compromise.

9. futureSelfMessage:
   - An intercepted blackbox transmission from their ${futureAge}-year-old self from the ruined Timeline Alpha.
   - Written in first-person ("Main tumhara ${futureAge} saal ka future version bol raha hoon...").
   - 5 to 8 lines of raw, emotionally piercing, bone-chilling agony. Mention their exact age (${userAge} -> ${futureAge}), their family's sacrifices, their unfulfilled vows, and the unbearable pain of having the talent but lacking the spine to execute.

Return strictly valid JSON matching this schema:
{
  "coachVerdict": "string",
  "survivalProbability": 18,
  "driftScore": 82,
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
  "futureSelfMessage": "string"
}
`;

    const ai = new GoogleGenAI({ apiKey });

    // Priority fallback chain:
    // 1. gemini-3.5-flash (verified active free quota & working)
    // 2. gemini-3.6-flash (fallback if available/off peak)
    // 3. gemini-3.5-flash-lite
    const configuredModel = process.env.GEMINI_PARSE_MODEL;
    const modelCandidates = [
      ...(configuredModel ? [configuredModel] : []),
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
    ];
    // Remove duplicates while keeping order
    const modelFallbackChain = Array.from(new Set(modelCandidates));

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
        console.warn(`Model ${model} failed, trying next...`, msg.slice(0, 150));
        // Continue to next model on ANY error (404, 429, 503, etc.)
      }
    }

    if (!responseText) {
      console.error("All Gemini models failed. Last error:", lastError);
      const errMsg = lastError instanceof Error ? lastError.message : String(lastError);
      return errorResponse("AI_UNAVAILABLE", `AI analysis service error: ${errMsg.slice(0, 180)}`, 503);
    }

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      // Fallback clean regex in case of markdown wrapping
      const cleaned = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsedResult = JSON.parse(cleaned);
    }

    // Save report to database with safe fallback values
    const savedReport = await AnalysisReport.create({
      userId: authUser.userId,
      timelineA: {
        timeframe6m: parsedResult?.timelineA?.timeframe6m || "",
        timeframe2y: parsedResult?.timelineA?.timeframe2y || "",
        darkFate: parsedResult?.timelineA?.darkFate || "",
      },
      timelineB: {
        targetVision: parsedResult?.timelineB?.targetVision || "",
        expectedReality: parsedResult?.timelineB?.expectedReality || "",
      },
      rootCauseDiagnosis: {
        coreMistake: parsedResult?.rootCauseDiagnosis?.coreMistake || "",
        notesEvidence: parsedResult?.rootCauseDiagnosis?.notesEvidence || "",
        psychologicalTrigger: parsedResult?.rootCauseDiagnosis?.psychologicalTrigger || "",
      },
      psychologicalTruthBomb: {
        conceptTitle: parsedResult?.psychologicalTruthBomb?.conceptTitle || "",
        explanation: parsedResult?.psychologicalTruthBomb?.explanation || "",
      },
      emergencyProtocol: Array.isArray(parsedResult?.emergencyProtocol) ? parsedResult.emergencyProtocol : [],
      futureSelfMessage: parsedResult?.futureSelfMessage || "",
      coachVerdict: parsedResult?.coachVerdict || "",
      survivalProbability: typeof parsedResult?.survivalProbability === "number" ? parsedResult.survivalProbability : (100 - (parsedResult?.driftScore || 65)),
      driftScore: typeof parsedResult?.driftScore === "number" ? parsedResult.driftScore : 65,
      totalSessionsAnalyzed: totalSessions,
    });

    return successResponse({ report: savedReport });
  } catch (error) {
    return handleApiError(error);
  }
}
