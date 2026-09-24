/**
 * Central model registry - import this file to ensure all Mongoose models
 * are registered before any populate() call.
 *
 * In Next.js App Router (serverless), each route bundle is isolated.
 * Mongoose's populate() looks up models by name in its internal registry.
 * If a model's file was never imported in the current bundle, populate() throws
 * MissingSchemaError even if the model exists in another bundle/module.
 *
 * Solution: Import ALL models here, and import this file in connectDB or
 * any route that uses populate().
 */

import "@/models/User";
import "@/models/Category";
import "@/models/Session";
import "@/models/Goal";
import "@/models/VisionGoal";
import "@/models/AnalysisReport";
