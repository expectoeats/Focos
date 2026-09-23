import mongoose, { Schema, Document } from "mongoose";

export interface IAnalysisReport extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
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
  totalSessionsAnalyzed: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisReportSchema = new Schema<IAnalysisReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timelineA: {
      timeframe6m: { type: String, default: "" },
      timeframe2y: { type: String, default: "" },
      darkFate: { type: String, default: "" },
    },
    timelineB: {
      targetVision: { type: String, default: "" },
      expectedReality: { type: String, default: "" },
    },
    rootCauseDiagnosis: {
      coreMistake: { type: String, default: "" },
      notesEvidence: { type: String, default: "" },
      psychologicalTrigger: { type: String, default: "" },
    },
    psychologicalTruthBomb: {
      conceptTitle: { type: String, default: "" },
      explanation: { type: String, default: "" },
    },
    emergencyProtocol: [{ type: String }],
    futureSelfMessage: { type: String, default: "" },
    driftScore: { type: Number, default: 50 },
    totalSessionsAnalyzed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AnalysisReportSchema.index({ userId: 1, createdAt: -1 });

const AnalysisReport =
  mongoose.models.AnalysisReport ||
  mongoose.model<IAnalysisReport>("AnalysisReport", AnalysisReportSchema);

export default AnalysisReport;
